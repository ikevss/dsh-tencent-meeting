/**
 * 会议服务：列表快照、详情、建会/改会/取消、受邀人。
 *
 * 取数纪律（照 superIR 的教训）：
 *  - 列表读本地快照，只有 refresh / 首次进面板才真取；
 *  - 建会/改会后必须 `meeting get` 回读，因为企业策略会覆盖你提交的录制设置；
 *  - 时间窗一律钳到 ≤31 天。
 */
import type {
  MeetingBrief,
  MeetingDetailView,
  MeetingListPayload,
  MeetingRecordRef,
  MeetingSettings
} from '../shared/types.js'
import {
  cancelMeeting,
  createMeeting,
  getMeeting,
  listEnded,
  listInvitees,
  listUpcoming,
  mutateInvitees,
  searchMeetings,
  updateMeeting,
  type CreateInput,
  type RawMeeting,
  type UpdateInput
} from '../cli/commands.js'
import type { ExecOptions } from '../cli/exec.js'
import { clampWindow, isoLocal } from '../cli/exec.js'
import type { TmeetError } from '../cli/errors.js'
import { readStore, transcriptReadySet, writeStore } from './store.js'
import { content as fetchContent } from './records.js'
import { diskGet, diskPut, diskDropPrefix, diskRemove } from './content-cache.js'

export interface Ctx {
  binary: string
  timeoutMs: number
}

function opts(ctx: Ctx, signal?: AbortSignal): ExecOptions {
  return { binary: ctx.binary, timeoutMs: ctx.timeoutMs, signal }
}

function recordsOf(raw: RawMeeting): MeetingRecordRef[] {
  const list = Array.isArray(raw.records) ? raw.records : []
  return list.map((r: any) => ({
    recordFileId: r?.record_file_id ? String(r.record_file_id) : undefined,
    meetingRecordId: r?.meeting_record_id ? String(r.meeting_record_id) : undefined,
    duration: r?.duration ? String(r.duration) : undefined,
    type: r?.type ? String(r.type) : undefined,
    state: r?.state ? String(r.state) : undefined,
    permissionStatus: r?.permission_status ? String(r.permission_status) : undefined,
    url: r?.url ? String(r.url) : undefined,
    subject: r?.subject ? String(r.subject) : undefined
  }))
}

/**
 * 把一场会插进本地快照（同 id 覆盖），按开始时间倒序。
 * 写操作成功后用它就地更新列表——不再二次拉取腾讯接口，省额度也更快。
 */
export function upsertSnapshot(scope: 'upcoming' | 'ended', brief: MeetingBrief): void {
  if (!brief.meetingId) return
  writeStore((d) => {
    const list = scope === 'ended' ? d.snapshot.history : d.snapshot.upcoming
    const next = [brief, ...list.filter((m) => m.meetingId !== brief.meetingId)]
    // 进行中/即将开始按开始时间正序（最近的在前）；已结束按倒序
    next.sort((a, b) => {
      const ta = Date.parse(a.startTime) || 0
      const tb = Date.parse(b.startTime) || 0
      return scope === 'ended' ? tb - ta : ta - tb
    })
    if (scope === 'ended') d.snapshot.history = next
    else d.snapshot.upcoming = next
  })
}

/** 从快照里移除一场会（取消会议后列表要立刻不再显示它） */
function removeFromSnapshot(meetingId: string): void {
  if (!meetingId) return
  writeStore((d) => {
    d.snapshot.upcoming = d.snapshot.upcoming.filter((m) => m.meetingId !== meetingId)
    d.snapshot.history = d.snapshot.history.filter((m) => m.meetingId !== meetingId)
  })
}

function toBrief(raw: RawMeeting, ready: Set<string>): MeetingBrief {
  const meetingId = String(raw.meeting_id ?? '')
  const records = recordsOf(raw)
  const localMeta = readStore()
  return {
    meetingId,
    meetingCode: String(raw.meeting_code ?? ''),
    subject: String(raw.subject ?? '').trim() || '（无主题会议）',
    // 搜索接口的时间字段叫 scheduled_*_time，列表接口叫 start_time / end_time，两种都认
    startTime: String(raw.start_time ?? raw.scheduled_start_time ?? ''),
    endTime: String(raw.end_time ?? raw.scheduled_end_time ?? ''),
    meetingType: String(raw.meeting_type ?? ''),
    joinUrl: raw.join_url ? String(raw.join_url) : undefined,
    subMeetingId: raw.sub_meeting_id ? String(raw.sub_meeting_id) : undefined,
    records,
    recordsTotal: typeof raw.records_total_count === 'number' ? raw.records_total_count : undefined,
    minuteTotal: typeof raw.minute_total_count === 'number' ? raw.minute_total_count : undefined,
    // 「有内容」的判据：本机取回过逐字稿，**或者**腾讯列表里明确有录制条数。
    // 只信本机缓存会让「有录制但从没打开过」的会永远不显示标记（实测：列表有录制却不标）。
    hasTranscript:
      ready.has(meetingId) ||
      (typeof raw.records_total_count === 'number' ? raw.records_total_count > 0 : records.length > 0),
    note: localMeta.localParticipants[`${meetingId}:note`]?.[0],
    typeId: localMeta.localParticipants[`${meetingId}:type`]?.[0]
  }
}

/** 去重：同一场会被重复建多次时，按「主题+起止」只留一条 */
function dedupe(list: MeetingBrief[]): MeetingBrief[] {
  const seen = new Set<string>()
  const out: MeetingBrief[] = []
  for (const m of list) {
    const key = `${m.subject}|${m.startTime}|${m.endTime}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(m)
  }
  return out
}

export interface ListArgs {
  scope?: 'upcoming' | 'ended'
  limit?: number
  cursor?: string
  query?: string
  onlyTranscript?: boolean
  refresh?: boolean
  /** 「加载更早」用的起点（ISO）；不传就用快照里记录的最早时间 */
  before?: string
}

export type ListResult = MeetingListPayload & { error?: string }

/**
 * 列表。三种模式：
 *  1. 读快照（默认，0 次调用）
 *  2. refresh=true：真取一次 upcoming + ended，写快照
 *  3. before=...：把历史窗再往前推 30 天（追加，不覆盖）
 */
export async function list(ctx: Ctx, args: ListArgs, signal?: AbortSignal): Promise<ListResult> {
  const store = readStore()
  const ready = transcriptReadySet()
  const scope = args.scope === 'ended' ? 'ended' : 'upcoming'

  if (!args.refresh && !args.before) {
    const snap = store.snapshot
    const source = scope === 'ended' ? snap.history : snap.upcoming
    // 与 toBrief 同一判据：本机取回过逐字稿，或腾讯列表明确有录制条数
    let meetings = source.map((m) => ({
      ...m,
      hasTranscript: ready.has(m.meetingId) || (m.recordsTotal ?? (m.records?.length ?? 0)) > 0
    }))
    if (args.query) meetings = filterByKeyword(meetings, args.query)
    if (args.onlyTranscript) meetings = meetings.filter((m) => m.hasTranscript)
    return {
      auth: 'logged-in',
      meetings,
      hasMore: snap.syncedAt ? !snap.noMoreHistory : false,
      nextCursor: undefined,
      syncedAt: snap.syncedAt,
      error: undefined
    }
  }

  if (args.before) {
    const end = args.before || store.snapshot.historyFrom || isoLocal(new Date())
    const endDate = new Date(end)
    const startDate = new Date((Number.isNaN(endDate.getTime()) ? Date.now() : endDate.getTime()) - 30 * 864e5)
    const w = clampWindow(isoLocal(startDate), isoLocal(endDate))
    const r = await listEnded({ limit: args.limit ?? 30, start: w.start, end: w.end }, opts(ctx, signal))
    if (!r.ok) return failure(r.error, store.snapshot.syncedAt)
    const more = (r.data ?? []).map((x) => toBrief(x, ready))
    const merged = dedupe([...store.snapshot.history, ...more]).sort(byStartDesc)
    writeStore((d) => {
      d.snapshot.history = merged
      d.snapshot.historyFrom = w.start
      if (more.length === 0) d.snapshot.noMoreHistory = true
    })
    return {
      auth: 'logged-in',
      meetings: merged,
      hasMore: !(more.length === 0),
      syncedAt: store.snapshot.syncedAt
    }
  }

  // refresh：两条并发取，按 meeting_id 去重（两条各自都不完整，这是实测结论）
  const now = new Date()
  const windowNow = clampWindow(isoLocal(new Date(now.getTime() - 30 * 864e5)), isoLocal(now))
  const [up, ended] = await Promise.all([
    listUpcoming({ limit: args.limit ?? 20, days: 7 }, opts(ctx, signal)),
    listEnded({ limit: args.limit ?? 30, start: windowNow.start, end: windowNow.end }, opts(ctx, signal))
  ])

  if (!up.ok && !ended.ok) {
    return failure(up.error ?? ended.error, store.snapshot.syncedAt)
  }

  // 任何一边失败，就保留本机对应的旧数据：同步「部分成功」绝不能把另一边清成空。
  // （实测踩中：额度打满时 upcoming 被闸门拦下 → 接口返回空数组且不带 error → 客户端列表 0 行）
  const upcoming = up.ok ? dedupe((up.data ?? []).map((x) => toBrief(x, ready))) : store.snapshot.upcoming
  const history = ended.ok
    ? dedupe((ended.data ?? []).map((x) => toBrief(x, ready))).sort(byStartDesc)
    : store.snapshot.history
  const fetchedAt = new Date().toISOString()
  writeStore((d) => {
    if (up.ok) {
      d.snapshot.upcoming = upcoming
      d.snapshot.upcomingFetchedAt = fetchedAt
    }
    if (ended.ok) {
      // 同步一次＝从最近 30 天重来，翻页状态归零
      d.snapshot.history = history
      d.snapshot.syncedAt = fetchedAt
      d.snapshot.historyFrom = windowNow.start
      d.snapshot.noMoreHistory = false
    }
  })

  if (ended.ok && up.ok && args.refresh) {
    // 完整同步成功 → 详情缓存（含磁盘）整体作废：会议信息可能被腾讯侧改过
    invalidateDetail()
  }
  if (ended.ok && args.refresh) {
    // 同步成功 → 后台把最近几场的正文提前烘进缓存（不阻塞本次返回）
    void prefetchContents(ctx, signal)
  }
  let meetings = scope === 'ended' ? history : upcoming
  if (args.query) meetings = filterByKeyword(meetings, args.query)
  if (args.onlyTranscript) meetings = meetings.filter((m) => m.hasTranscript)
  return {
    auth: 'logged-in',
    meetings,
    hasMore: scope === 'ended' ? ended.ok : false,
    syncedAt: ended.ok ? fetchedAt : store.snapshot.syncedAt,
    partial: !ended.ok || !up.ok
  }
}


/**
 * 同步后的正文预取：把最近几场有录制的会议的逐字稿/纪要提前取回落盘。
 * 这样用户点开详情是"直接就有"，而不是"进来才开始取"——正是验收意见 2/3 要的形态。
 * 省额度的三道闸：
 *  1) 只预取最近 4 场（历史久远的等用户真点开再说）；
 *  2) content() 自带内存+磁盘两层，新鲜的根本不碰接口；
 *  3) 撞到本地额度闸门立刻停手，绝不硬刷。
 */
async function prefetchContents(ctx: Ctx, signal?: AbortSignal): Promise<void> {
  const st = readStore()
  const candidates = [...st.snapshot.history]
    .sort(byStartDesc)
    .filter((x) => x.hasTranscript || (x.recordsTotal ?? 0) > 0 || (x.records?.length ?? 0) > 0)
    .slice(0, 4)
  for (const c of candidates) {
    for (const kind of ['transcript', 'minutes'] as const) {
      if (signal?.aborted) return
      try {
        const r = await fetchContent(ctx, { meetingId: c.meetingId, kind })
        if (!r.ok && r.error?.code === 'local-quota') return
      } catch {
        return
      }
    }
  }
}

function byStartDesc(a: MeetingBrief, b: MeetingBrief): number {
  return Date.parse(b.startTime || '') - Date.parse(a.startTime || '')
}

function filterByKeyword(list: MeetingBrief[], q: string): MeetingBrief[] {
  const key = q.trim().toLowerCase()
  if (!key) return list
  return list.filter(
    (m) => m.subject.toLowerCase().includes(key) || m.meetingCode.includes(key)
  )
}

function failure(error: TmeetError | undefined, syncedAt: string | null): ListResult {
  const code = error?.code ?? 'unknown'
  const message = error?.message ?? '取不到会议列表'
  const soft = code === 'not-logged-in' || code === 'expired'
  return {
    auth: soft ? (code === 'expired' ? 'expired' : 'not-logged-in') : 'logged-in',
    meetings: [],
    hasMore: false,
    syncedAt,
    error: message
  }
}

/** 关键词搜索：CLI 有时间窗限制，这里自动钳到 31 天并合并 list/list-ended 的结果 */
export async function search(ctx: Ctx, args: { query: string; start?: string; end?: string; limit?: number }, signal?: AbortSignal) {
  const now = new Date()
  const w = clampWindow(
    args.start || isoLocal(new Date(now.getTime() - 30 * 864e5)),
    args.end || isoLocal(now)
  )
  const r = await searchMeetings({ query: args.query, limit: args.limit ?? 30, start: w.start, end: w.end }, opts(ctx, signal))
  if (!r.ok) return { ok: false as const, error: r.error }
  const ready = transcriptReadySet()
  return { ok: true as const, meetings: (r.data ?? []).map((x) => toBrief(x, ready)).sort(byStartDesc) }
}

/** 从设置对象里读回真实生效值（键名以实测的 meeting get 返回为准） */
export function settingsOf(raw: RawMeeting): MeetingSettings {
  const s = (raw.settings ?? {}) as Record<string, unknown>
  const pick = <T>(...keys: string[]): T | undefined => {
    for (const k of keys) {
      if (s[k] !== undefined && s[k] !== null) return s[k] as T
    }
    return undefined
  }
  const autoRecord = pick<string>('auto_record_type', 'autoRecordType')
  // 入会限制：CLI 给的是 only_user_join_type（1=所有人 2=仅受邀 3=仅内部）
  const joinRaw = pick<number>('only_user_join_type', 'join_type', 'joinType')
  const joinType =
    joinRaw === 2 ? 2 : joinRaw === 3 ? 3 : joinRaw === 1 ? 1 : null
  return {
    autoRecordType:
      autoRecord === 'cloud' || autoRecord === 'local' || autoRecord === 'none'
        ? (autoRecord as 'none' | 'local' | 'cloud')
        : null,
    autoAsr: pick<boolean>('auto_asr', 'autoAsr') ?? null,
    // 腾讯接口不返回「是否要密码」，只返回有没有密码校验的结果字段；拿不到就留 null，不猜
    passwordRequired: null,
    joinType,
    waitingRoom: pick<boolean>('auto_in_waiting_room', 'waiting_room', 'waitingRoom') ?? null,
    overridden: false,
    overriddenFields: []
  }
}

export interface DetailResult {
  ok: boolean
  detail?: MeetingDetailView
  error?: TmeetError
}

/** 只取详情本身，不额外打受邀人接口（额度稀缺：superIR 实测 48 条命令/次会烧光日配额） */
/**
 * 会话内详情缓存：切走再切回同一场会不该重新打接口（详情一次就是 2 条调用）。
 * 只在内存里，重启即失效；写操作（建/改/取消）会主动失效对应场次。
 */
const detailCache = new Map<string, { at: number; detail: DetailResult['detail'] }>()
const DETAIL_TTL_MS = 10 * 60 * 1000
const DETAIL_DISK_TTL_MS = 24 * 60 * 60 * 1000

export function invalidateDetail(meetingId?: string): void {
  if (!meetingId) {
    detailCache.clear()
    diskDropPrefix("detail:")
    return
  }
  for (const k of [...detailCache.keys()]) {
    if (k.startsWith(`${meetingId}:`)) detailCache.delete(k)
  }
  // 详情落盘的键是 detail:<meetingId>:<code>，按会议前缀清
  diskDropPrefix(`detail:${meetingId}`)
}

export async function detail(
  ctx: Ctx,
  args: { meetingId?: string; meetingCode?: string },
  signal?: AbortSignal
): Promise<DetailResult> {
  const cacheKey = `${args.meetingId ?? ''}:${args.meetingCode ?? ''}`
  const hit = detailCache.get(cacheKey)
  if (hit && Date.now() - hit.at < DETAIL_TTL_MS && !signal?.aborted) {
    return { ok: true, detail: hit.detail }
  }
  // 内存没有再看磁盘：当天同步过、第二天第一次点开也不该重新打接口等两秒
  const disk = diskGet(`detail:${cacheKey}`, DETAIL_DISK_TTL_MS)
  if (disk && disk.view) {
    detailCache.set(cacheKey, { at: Date.now(), detail: disk.view as DetailResult["detail"] })
    return { ok: true, detail: disk.view as DetailResult["detail"] }
  }
  const r = await getMeeting({ meetingId: args.meetingId, meetingCode: args.meetingCode }, opts(ctx, signal))
  if (!r.ok || !r.data) return { ok: false, error: r.error }
  const ready = transcriptReadySet()
  const brief = toBrief(r.data, ready)
  const store = readStore()
  const detail: DetailResult['detail'] = {
    brief: {
      ...brief,
      note: store.localParticipants[`${brief.meetingId}:note`]?.[0],
      typeId: store.localParticipants[`${brief.meetingId}:type`]?.[0],
      localPassword: store.localPasswords[brief.meetingId] || undefined
    },
    settings: settingsOf(r.data),
    hostName: (r.data as any)?.host_name ? String((r.data as any).host_name) : undefined,
    invitees: []
  }
  detailCache.set(cacheKey, { at: Date.now(), detail })
  diskPut(`detail:${cacheKey}`, detail)
  return { ok: true, detail }
}

/** 需要受邀人时单独调（用在 `/meeting/invitees` 路由，不在每次详情里隐式触发） */
export async function detailWithInvitees(
  ctx: Ctx,
  args: { meetingId?: string; meetingCode?: string },
  signal?: AbortSignal
): Promise<DetailResult> {
  const base = await detail(ctx, args, signal)
  if (!base.ok || !base.detail || !base.detail.brief.meetingId) return base
  const inv = await listInvitees({ meetingId: base.detail.brief.meetingId }, opts(ctx, signal))
  if (inv.ok) base.detail.invitees = inv.data ?? []
  return base
}

/* ── 写操作：两阶段 ── */

export interface CreateForm {
  subject: string
  date: string
  startTime: string
  start?: string
  end?: string
  durationMinutes?: number
  passwordEnabled?: boolean
  password?: string
  recurring?: boolean
  joinLimit?: 1 | 2 | 3
  cloudRecord?: boolean
  autoTranscribe?: boolean
  waitingRoom?: boolean
  inviteeOpenIds?: string[]
  /** 仅本地留档：备注与类型不进腾讯请求 */
  note?: string
  typeId?: string
  timezone?: string
}

const ISO_TZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.[\d]+)?(Z|[+-]\d{2}:\d{2})$/

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** 从「日期 + 开始时间 + 时长」推出起止 ISO（带本地时区偏移） */
export function resolveRange(form: CreateForm): { start: string; end: string } | { error: string } {
  if (form.start && form.end) {
    if (!ISO_TZ.test(form.start) || !ISO_TZ.test(form.end)) {
      return { error: '时间要写成带时区的 ISO 格式，例如 2026-03-12T14:00+08:00。' }
    }
    const s = Date.parse(form.start)
    const e = Date.parse(form.end)
    if (Number.isNaN(s) || Number.isNaN(e)) return { error: '时间无法解析，请检查日期是否存在。' }
    if (e <= s) return { error: '结束时间必须晚于开始时间。' }
    return { start: form.start, end: form.end }
  }
  if (!form.date || !form.startTime) return { error: '日期和开始时间必填。' }
  const minutes = Math.max(15, Number(form.durationMinutes) || 60)
  const [y, mo, d] = form.date.split('-').map(Number)
  const [hh, mm] = form.startTime.split(':').map(Number)
  if (!y || !mo || !d || Number.isNaN(hh) || Number.isNaN(mm)) return { error: '日期或时间格式不对。' }
  const startDate = new Date(y, mo - 1, d, hh, mm, 0, 0)
  const endDate = new Date(startDate.getTime() + minutes * 60000)
  const iso = (dt: Date) => {
    const off = -dt.getTimezoneOffset()
    const sign = off >= 0 ? '+' : '-'
    const oh = pad(Math.floor(Math.abs(off) / 60))
    const om = pad(Math.abs(off) % 60)
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:00${sign}${oh}:${om}`
  }
  return { start: iso(startDate), end: iso(endDate) }
}

export interface PreviewField {
  label: string
  value: string
}

// 预览给人看，不给机器看：ISO 串要翻成人话（验收反馈：确认页里出现 2026-11-17T12:00:00+08:00 这种原始值）
const WEEK_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
function human(iso: string): string {
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return iso
  return `${dt.getMonth() + 1}-${pad(dt.getDate())} ${WEEK_CN[dt.getDay()]} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

/** 建会预览：只描述将要提交的内容，不发起任何调用 */
export function previewCreate(form: CreateForm): { ok: boolean; fields?: PreviewField[]; text?: string; error?: string } {
  if (!form.subject?.trim()) return { ok: false, error: '会议主题不能为空。' }
  const range = resolveRange(form)
  if ('error' in range) return { ok: false, error: range.error }
  const fields: PreviewField[] = [
    { label: '主题', value: form.subject.trim() },
    { label: '开始', value: human(range.start) },
    { label: '结束', value: human(range.end) },
    { label: '时区', value: form.timezone || 'Asia/Shanghai' },
    { label: '自动云录制', value: form.cloudRecord ? '开启（结束后转码，转码完成才有回放）' : '不录制' },
    { label: '自动转写', value: form.autoTranscribe ? '开启（要有云录制才生效）' : '关闭' },
    { label: '等候室', value: form.waitingRoom ? '开启' : '关闭' },
    { label: '入会限制', value: form.joinLimit === 2 ? '仅受邀人' : form.joinLimit === 3 ? '仅企业内部' : '所有人' },
    { label: '周期性会议', value: form.recurring ? '是' : '否' },
    { label: '入会密码', value: form.passwordEnabled && form.password ? '已设置（不回显）' : '不设置' }
  ]
  if (form.inviteeOpenIds?.length) fields.push({ label: '受邀人', value: `${form.inviteeOpenIds.length} 人` })
  if (form.note?.trim()) fields.push({ label: '备注（仅本地留档）', value: form.note.trim() })
  const text = fields.map((f) => `${f.label}：${f.value}`).join('\n')
  return { ok: true, fields, text }
}

export interface WriteResult {
  ok: boolean
  meeting?: MeetingBrief
  detail?: MeetingDetailView
  /** 被企业策略覆盖时，列出实际生效与提交不同的字段 */
  overridden?: string[]
  error?: TmeetError
  message?: string
}

export async function create(ctx: Ctx, form: CreateForm, signal?: AbortSignal): Promise<WriteResult> {
  const preview = previewCreate(form)
  if (!preview.ok) {
    return { ok: false, error: { code: 'invalid-args', message: preview.error || '参数不对' } }
  }
  const range = resolveRange(form) as { start: string; end: string }
  const input: CreateInput = {
    subject: form.subject.trim(),
    start: range.start,
    end: range.end,
    autoRecordType: form.cloudRecord ? 'cloud' : 'none',
    autoAsr: Boolean(form.autoTranscribe),
    joinType: form.joinLimit ?? 1,
    meetingType: form.recurring ? 1 : 0,
    waitingRoom: Boolean(form.waitingRoom),
    timezone: form.timezone || 'Asia/Shanghai'
  }
  if (form.passwordEnabled && form.password) input.password = form.password
  if (form.inviteeOpenIds?.length) input.inviteeOpenIds = form.inviteeOpenIds

  const r = await createMeeting(input, opts(ctx, signal))
  if (!r.ok || !r.data) return { ok: false, error: r.error }

  const created = r.data
  const meetingId = String(created.meeting_id ?? '')
  // 建会返回的 settings 只有部分字段，必须回读才拿到真实生效值
  const readBack = meetingId ? await getMeeting({ meetingId }, opts(ctx, signal)) : { ok: false as const, error: undefined }
  const raw = readBack.ok && readBack.data ? readBack.data : created
  const ready = transcriptReadySet()
  const brief = toBrief(raw, ready)

  if (form.note || form.typeId) {
    writeStore((d) => {
      if (form.note) d.localParticipants[`${meetingId}:note`] = [form.note]
      if (form.typeId) d.localParticipants[`${meetingId}:type`] = [form.typeId]
    })
  }
  // 入会密码只有本插件建会时用户填过才留得住（腾讯不回传），界面上直接显示用
  if (form.passwordEnabled && form.password) {
    const pwd = String(form.password)
    writeStore((d) => {
      d.localPasswords[meetingId] = pwd
    })
    brief.localPassword = pwd
  }

  const actual = settingsOf(raw)
  const overridden: string[] = []
  if (actual.autoRecordType && actual.autoRecordType !== input.autoRecordType) overridden.push('自动录制')
  if (actual.autoAsr !== null && actual.autoAsr !== input.autoAsr) overridden.push('自动转写')
  if (actual.waitingRoom !== null && actual.waitingRoom !== input.waitingRoom) overridden.push('等候室')
  if (actual.joinType !== null && actual.joinType !== input.joinType) overridden.push('入会限制')

  // 建完立刻写进本地快照：列表下次读快照就能看到它，不用再打一次腾讯接口
  //（之前是「客户端重新同步」，撞上每日上限就静默失败，用户以为没建成功）。
  upsertSnapshot('upcoming', { ...brief, note: form.note || undefined, typeId: form.typeId || undefined })
  invalidateDetail(meetingId)

  return {
    ok: true,
    meeting: { ...brief, note: form.note || undefined, typeId: form.typeId || undefined },
    detail: {
      brief,
      settings: { ...actual, overridden: overridden.length > 0, overriddenFields: overridden },
      invitees: []
    },
    overridden,
    message: overridden.length
      ? `会议已创建，但${overridden.join('、')}被企业策略改成了实际值，以回读结果为准。`
      : '会议已创建。'
  }
}

export interface UpdatePatch {
  subject?: string
  start?: string
  end?: string
  cloudRecord?: boolean
  autoTranscribe?: boolean
  waitingRoom?: boolean
  joinLimit?: 1 | 2 | 3
  passwordEnabled?: boolean
  password?: string
  note?: string
  typeId?: string
}

export function previewUpdate(before: MeetingDetailView, patch: UpdatePatch): { fields: PreviewField[]; text: string } {
  const fields: PreviewField[] = []
  if (patch.subject && patch.subject !== before.brief.subject) fields.push({ label: '主题', value: `${before.brief.subject} → ${patch.subject}` })
  if (patch.start && patch.start !== before.brief.startTime) fields.push({ label: '开始', value: `${human(before.brief.startTime)} → ${human(patch.start)}` })
  if (patch.end && patch.end !== before.brief.endTime) fields.push({ label: '结束', value: `${human(before.brief.endTime)} → ${human(patch.end)}` })
  if (patch.cloudRecord !== undefined) fields.push({ label: '自动录制', value: patch.cloudRecord ? '开启云录制' : '改为不录制' })
  if (patch.autoTranscribe !== undefined) fields.push({ label: '自动转写', value: patch.autoTranscribe ? '开启' : '关闭' })
  if (patch.waitingRoom !== undefined) fields.push({ label: '等候室', value: patch.waitingRoom ? '开启' : '关闭' })
  if (patch.joinLimit !== undefined) fields.push({ label: '入会限制', value: patch.joinLimit === 2 ? '仅受邀人' : patch.joinLimit === 3 ? '仅企业内部' : '所有人' })
  if (patch.passwordEnabled !== undefined) fields.push({ label: '入会密码', value: patch.passwordEnabled ? '重新设置（不回显）' : '取消密码' })
  if (patch.note !== undefined) fields.push({ label: '备注（仅本地）', value: patch.note || '清空' })
  if (patch.typeId !== undefined) fields.push({ label: '会议类型（仅本地）', value: patch.typeId || '清空' })
  return { fields, text: fields.length ? fields.map((f) => `${f.label}：${f.value}`).join('\n') : '没有要改的字段。' }
}

export async function update(
  ctx: Ctx,
  args: { meetingId: string; patch: UpdatePatch },
  signal?: AbortSignal
): Promise<WriteResult> {
  const before = await detail(ctx, { meetingId: args.meetingId }, signal)
  if (!before.ok || !before.detail) return { ok: false, error: before.error }
  const patch = args.patch

  const input: UpdateInput = { meetingId: args.meetingId }
  if (patch.subject) input.subject = patch.subject
  if (patch.start) input.start = patch.start
  if (patch.end) input.end = patch.end
  if (patch.cloudRecord !== undefined) input.autoRecordType = patch.cloudRecord ? 'cloud' : 'none'
  // 关键：没显式改录制/转写时，把当前生效值带上，避免被 CLI 默认值重置
  else if (before.detail.settings.autoRecordType) input.autoRecordType = before.detail.settings.autoRecordType
  if (patch.autoTranscribe !== undefined) input.autoAsr = patch.autoTranscribe
  if (patch.waitingRoom !== undefined) input.waitingRoom = patch.waitingRoom
  if (patch.joinLimit !== undefined) input.joinType = patch.joinLimit
  if (patch.passwordEnabled && patch.password) input.password = patch.password

  const r = await updateMeeting(input, opts(ctx, signal))
  if (!r.ok) return { ok: false, error: r.error }

  if (patch.note !== undefined || patch.typeId !== undefined) {
    writeStore((d) => {
      if (patch.note !== undefined) {
        if (patch.note) d.localParticipants[`${args.meetingId}:note`] = [patch.note]
        else delete d.localParticipants[`${args.meetingId}:note`]
      }
      if (patch.typeId !== undefined) {
        if (patch.typeId) d.localParticipants[`${args.meetingId}:type`] = [patch.typeId]
        else delete d.localParticipants[`${args.meetingId}:type`]
      }
    })
  }
  if (patch.passwordEnabled && patch.password) {
    writeStore((d) => {
      d.localPasswords[args.meetingId] = String(patch.password)
    })
  }

  const after = await detail(ctx, { meetingId: args.meetingId }, signal)
  const overridden: string[] = []
  if (after.ok && after.detail) {
    const s = after.detail.settings
    if (input.autoRecordType && s.autoRecordType && s.autoRecordType !== input.autoRecordType) overridden.push('自动录制')
    if (input.autoAsr !== undefined && s.autoAsr !== null && s.autoAsr !== input.autoAsr) overridden.push('自动转写')
    // 改完就地更新快照：列表立刻看到新主题/新时间，不必再同步一次
    upsertSnapshot('upcoming', after.detail.brief)
    upsertSnapshot('ended', after.detail.brief)
    invalidateDetail(args.meetingId)
  }
  return {
    ok: true,
    meeting: after.ok ? after.detail?.brief : undefined,
    detail: after.ok ? after.detail : undefined,
    overridden,
    message: overridden.length
      ? `已提交修改，但${overridden.join('、')}被企业策略覆盖，以回读结果为准。`
      : '修改已生效。'
  }
}

export async function cancel(ctx: Ctx, args: { meetingId: string; subMeetingId?: string }, signal?: AbortSignal): Promise<{ ok: boolean; error?: TmeetError; message?: string }> {
  const r = await cancelMeeting(
    { meetingId: args.meetingId, meetingType: 0, subMeetingId: args.subMeetingId },
    opts(ctx, signal)
  )
  if (!r.ok) return { ok: false, error: r.error }
  // 取消后本地快照里也要体现，否则列表还挂着这场会
  removeFromSnapshot(args.meetingId)
  invalidateDetail(args.meetingId)
  return { ok: true, message: '会议已取消。' }
}

/* ── 受邀人 ── */

export async function invitees(ctx: Ctx, meetingId: string, signal?: AbortSignal) {
  const r = await listInvitees({ meetingId }, opts(ctx, signal))
  return r.ok ? { ok: true as const, invitees: r.data ?? [] } : { ok: false as const, error: r.error }
}

export async function mutate(ctx: Ctx, args: { meetingId: string; action: 'add' | 'remove' | 'replace'; openIds: string[] }, signal?: AbortSignal) {
  if (!args.openIds?.length) return { ok: false as const, error: { code: 'invalid-args' as const, message: '要传至少一个 open_id。' } }
  const r = await mutateInvitees(args, opts(ctx, signal))
  return r.ok ? { ok: true as const } : { ok: false as const, error: r.error }
}
