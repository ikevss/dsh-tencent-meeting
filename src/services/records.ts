/**
 * 录制内容服务：回放地址 / 逐字稿 / 时间轴 / 纪要 / 待办 / 权限申请。
 *
 * 关键实测结论（决定这里的实现）：
 *  - 云录制 state: 1 录制中 / 2 转码中 / 3 转码完成；**只有完成才返回文件列表**，
 *    所以「刚结束就能看回放」不成立。
 *  - 无转写有三种信号：500260、HTTP 500 + 30002、paragraphs 成功但 total=0。
 *  - 取录制内容要先有 record_file_id；权限类错误（500249/500282）是终态，要置 denied。
 */
import type { ContentStates, ContentView } from '../shared/types.js'
import {
  permissionApply,
  recordAddress,
  recordContent,
  searchRecords,
  yuanbaoMinutes,
  type ContentAction
} from '../cli/commands.js'
import type { ExecOptions } from '../cli/exec.js'
import type { TmeetError } from '../cli/errors.js'
import { readStore, markTranscriptReady, writeStore } from './store.js'
import { diskGet, diskPut, diskDrop } from './content-cache.js'

export interface Ctx {
  binary: string
  timeoutMs: number
  signal?: AbortSignal
}

function opts(ctx: Ctx): ExecOptions {
  return { binary: ctx.binary, timeoutMs: ctx.timeoutMs, signal: ctx.signal }
}

/**
 * 正文三层缓存：内存（会话内秒回）→ 磁盘（重启/隔天仍然秒回，见 content-cache.ts）
 * → 腾讯接口（真的没有或已过期才打）。失效入口统一是 clearContentCache。
 */
const CONTENT_TTL_MS = 15 * 60 * 1000
const CONTENT_DISK_TTL_MS = 72 * 60 * 60 * 1000
const contentCache = new Map<string, { at: number; view: ContentView }>()

export function clearContentCache(meetingId?: string): void {
  if (!meetingId) {
    contentCache.clear()
    diskDrop()
    return
  }
  for (const k of [...contentCache.keys()]) {
    if (k.startsWith(`${meetingId}:`)) contentCache.delete(k)
  }
  diskDrop(meetingId)
}

export interface RecordRefs {
  /** 取正文用的文件 id */
  recordFileId: string
  /** 申请权限/取地址用的录制条目 id */
  meetingRecordId: string
  state: string
  permissionStatus: string
}

/**
 * 从会议详情/列表的 records 里挑出可用引用（可能分散在不同条目上）。
 * 两种键名都要认：CLI 原始返回是 snake_case，本插件转成 MeetingBrief 后是 camelCase。
 */
export function pickRecordRefs(records: Array<Record<string, unknown>> | undefined): RecordRefs {
  const list = Array.isArray(records) ? records : []
  const read = (r: any, ...keys: string[]): string => {
    for (const k of keys) {
      const v = r?.[k]
      if (v !== undefined && v !== null && v !== '') return String(v)
    }
    return ''
  }
  let recordFileId = ''
  let meetingRecordId = ''
  let state = ''
  let permissionStatus = ''
  for (const raw of list) {
    const r = raw as any
    if (!recordFileId) recordFileId = read(r, 'record_file_id', 'recordFileId')
    if (!meetingRecordId) meetingRecordId = read(r, 'meeting_record_id', 'meetingRecordId')
    if (!state) state = read(r, 'state')
    if (!permissionStatus) permissionStatus = read(r, 'permission_status', 'permissionStatus')
    if (recordFileId && meetingRecordId) break
  }
  return { recordFileId, meetingRecordId, state, permissionStatus }
}

/** 直接问一次 record search，补上列表里没有的录制引用 */
export async function lookupRecordRefs(
  ctx: Ctx,
  args: { meetingId?: string; meetingCode?: string }
): Promise<RecordRefs | null> {
  const r = await searchRecords(
    { meetingId: args.meetingId, meetingCode: args.meetingCode },
    opts(ctx)
  )
  if (!r.ok) return null
  const refs = pickRecordRefs(r.data as Array<Record<string, unknown>>)
  return refs.recordFileId || refs.meetingRecordId ? refs : null
}

/* ── 正文三类 + 待办 ── */

export type ContentKind = ContentView['kind']

const ACTION_OF: Record<ContentKind, ContentAction> = {
  // 逐字稿取 transcript(details)：它返回带 sentences/words 的完整正文。
  // paragraphs 只返回 pid 与起止时间（没有文字），拿它当正文会得到一片空白。
  transcript: 'transcript',
  timeline: 'timeline',
  minutes: 'minutes',
  todos: 'todos'
}

/** 把 CLI 返回的段落结构压成统一的 chunks + plain */
function normalizeContent(kind: ContentKind, data: any): ContentView {
  const fetchedAt = new Date().toISOString()
  const chunks: Array<{ text: string; speaker?: string; time?: string }> = []

  const pushLine = (text: string, speaker?: string, time?: string) => {
    const t = String(text ?? '').trim()
    if (t) chunks.push({ text: t, speaker, time })
  }

  /** transcript 的段落里文字在 sentences[].words[].text，要拼起来 */
  const sentenceText = (p: any): string => {
    const sents = p?.sentences ?? p?.sentence_list
    if (!Array.isArray(sents)) return String(p?.text ?? p?.content ?? '')
    return sents
      .map((s: any) => {
        if (Array.isArray(s?.words)) return s.words.map((w: any) => String(w?.text ?? '')).join('')
        return String(s?.text ?? '')
      })
      .join('')
  }

  /** 说话人：speaker 可能是字符串，也可能是 { user_name, user_id } 对象（实测形态） */
  const speakerOf = (p: any): string | undefined => {
    const s = p?.speaker_name ?? p?.speaker ?? p?.nickname
    if (typeof s === 'string' && s.trim()) return s.trim()
    if (s && typeof s === 'object') {
      const name = (s as any).user_name ?? (s as any).nickname ?? (s as any).name
      if (typeof name === 'string' && name.trim()) return name.trim()
      const uid = (s as any).user_id
      if (uid) return String(uid)
    }
    return undefined
  }

  // transcript: { code, minutes: { paragraphs: [...] } } 实测形态
  const txParagraphs = data?.minutes?.paragraphs ?? data?.transcript?.paragraphs ?? data?.paragraph_list
  if (Array.isArray(txParagraphs)) {
    for (const p of txParagraphs) {
      pushLine(sentenceText(p), speakerOf(p), formatTime(p?.start_time ?? p?.startTime ?? p?.time))
    }
  }

  // 其它形态：paragraph_list / paragraphs / transcript 数组
  if (!chunks.length) {
    const paragraphs = data?.paragraph_list ?? data?.paragraphs ?? data?.paragraphs_list
    if (Array.isArray(paragraphs)) {
      for (const p of paragraphs) {
        pushLine(sentenceText(p), speakerOf(p), formatTime(p?.start_time ?? p?.startTime ?? p?.time))
      }
    }
  }
  if (!chunks.length && Array.isArray(data?.transcript)) {
    for (const s of data.transcript) {
      pushLine(
        s?.text ?? s?.sentence ?? s?.content,
        speakerOf(s),
        formatTime(s?.start_time ?? s?.time ?? s?.startTime)
      )
    }
  }

  // minutes: 实测形态 { minutes: [{ overview, summary_points(字符串), todos: [] }] }
  if (!chunks.length && kind === 'minutes') {
    const arr = Array.isArray(data?.minutes) ? data.minutes : []
    for (const m of arr) {
      const overview = m?.overview ?? m?.summary
      if (typeof overview === 'string' && overview.trim()) pushLine(overview, '概览')
      const points = m?.summary_points ?? m?.summaryPoints
      if (typeof points === 'string' && points.trim()) pushLine(points, '要点')
      else if (Array.isArray(points)) {
        for (const p of points) pushLine(typeof p === 'string' ? p : p?.text ?? p?.content ?? p?.point, '要点')
      }
      const todos = m?.todos ?? m?.todo_list
      if (Array.isArray(todos)) {
        for (const t of todos) {
          const text = typeof t === 'string' ? t : t?.content ?? t?.text ?? t?.title
          const owner = typeof t === 'object' && t ? (t as any)?.owner ?? (t as any)?.assignee : ''
          pushLine(text, owner ? `待办 · ${owner}` : '待办')
        }
      }
    }
  }
  // minutes 的兜底：扁平字段形态
  if (!chunks.length && kind === 'minutes') {
    const overview = data?.overview ?? data?.summary
    if (typeof overview === 'string' && overview.trim()) pushLine(overview, '概览')
    const points = data?.summary_points ?? data?.summaryPoints
    if (typeof points === 'string' && points.trim()) pushLine(points, '要点')
    else if (Array.isArray(points)) {
      for (const p of points) pushLine(typeof p === 'string' ? p : p?.text ?? p?.content ?? p?.point, '要点')
    }
  }

  // todos: { todo_list: [...] }
  if (!chunks.length && kind === 'todos') {
    const todos = data?.todo_list ?? data?.todos
    if (Array.isArray(todos)) {
      for (const t of todos) {
        const text = typeof t === 'string' ? t : t?.content ?? t?.text ?? t?.title
        const owner = typeof t === 'object' && t ? t?.owner ?? t?.assignee : ''
        pushLine(text, owner ? `待办 · ${owner}` : '待办')
      }
    }
  }

  // timeline: { timeline: [{ time, content }] }
  if (!chunks.length && kind === 'timeline') {
    const tl = data?.timeline ?? data?.timeline_list
    if (Array.isArray(tl)) {
      for (const t of tl) {
        pushLine(t?.content ?? t?.text ?? t?.title, t?.speaker_name, formatTime(t?.time ?? t?.start_time))
      }
    }
  }

  // 兜底：整包里的纯文本字段
  if (!chunks.length) {
    const flat = typeof data === 'string' ? data : data?.text ?? data?.content ?? data?.plain
    if (typeof flat === 'string' && flat.trim()) pushLine(flat)
  }

  const plain = chunks.map((c) => (c.speaker ? `${c.speaker}${c.time ? ` ${c.time}` : ''}：${c.text}` : c.text)).join('\n')
  return { kind, chunks, plain, empty: chunks.length === 0, fetchedAt }
}

function formatTime(raw: unknown): string | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  if (typeof raw === 'number') {
    const total = Math.floor(raw > 10_000 ? raw / 1000 : raw)
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  const str = String(raw)
  const m = /^(\d+):(\d+)(?::(\d+))?$/.exec(str)
  if (m) return m[3] ? `${m[1]}:${m[2]}:${m[3]}` : `${m[1]}:${m[2]}`
  const d = Date.parse(str)
  if (!Number.isNaN(d)) {
    const dt = new Date(d)
    return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
  }
  return undefined
}

export interface ContentResult {
  ok: boolean
  view?: ContentView
  error?: TmeetError
}

/**
 * 并发去重：进详情的后台预热和用户点开页签几乎同时打同一份正文时，
 * 只允许一次真实取数，另一条等同样的结果——额度只花一遍。
 */
const contentInflight = new Map<string, Promise<ContentResult>>()

export function content(
  ctx: Ctx,
  args: { meetingId: string; kind: ContentKind; recordFileId?: string; force?: boolean }
): Promise<ContentResult> {
  const key = `${args.meetingId}:${args.kind}`
  if (args.force) return contentRun(ctx, args)
  const running = contentInflight.get(key)
  if (running) return running
  const task = contentRun(ctx, args)
  contentInflight.set(key, task)
  void task.finally(() => {
    if (contentInflight.get(key) === task) contentInflight.delete(key)
  })
  return task
}

async function contentRun(
  ctx: Ctx,
  args: { meetingId: string; kind: ContentKind; recordFileId?: string; force?: boolean }
): Promise<ContentResult> {
  const key = `${args.meetingId}:${args.kind}`
  // 命中缓存就直接回：切页签、切会议再切回来都不该重新打接口
  if (!args.force) {
    const hit = contentCache.get(key)
    if (hit && Date.now() - hit.at < CONTENT_TTL_MS) return { ok: true, view: hit.view }
    // 内存没有再看磁盘：重启/隔天进同一场会，正文不该重新打接口
    const disk = diskGet(key, CONTENT_DISK_TTL_MS)
    if (disk && disk.view) {
      contentCache.set(key, { at: Date.now(), view: disk.view as ContentView })
      return { ok: true, view: disk.view as ContentView }
    }
  }

  let recordFileId = args.recordFileId || ''
  let meetingRecordId = ''
  // 先吃本地快照里已有的录制引用（列表/详情回来时就带了 records），
  // 省一次 record search：既省额度，也修掉「明明有录制却说没有可读文件」。
  if (!recordFileId) {
    const store = readStore()
    const known = [...store.snapshot.upcoming, ...store.snapshot.history].find((m) => m.meetingId === args.meetingId)
    const local = pickRecordRefs(known?.records as Array<Record<string, unknown>> | undefined)
    recordFileId = local.recordFileId
    meetingRecordId = local.meetingRecordId
  }
  if (!recordFileId && !meetingRecordId) {
    const refs = await lookupRecordRefs(ctx, { meetingId: args.meetingId })
    recordFileId = refs?.recordFileId || ''
    meetingRecordId = refs?.meetingRecordId || ''
  }
  if (!recordFileId) {
    // 分三种情况说清楚，别一律「没有可读的录制文件」：
    //  1) 知道录制条目但没文件 id → 多半还在转码；
    //  2) 条目显示要授权 → 给出申请方向；
    //  3) 完全没有录制 → 直说没开云录制。
    if (meetingRecordId) {
      return {
        ok: false,
        error: { code: 'not-transcribed', message: '这场会的云录制还在转码，转完就能读（一般几分钟到半小时）。' }
      }
    }
    return {
      ok: false,
      error: { code: 'not-transcribed', message: '这场会没有云录制文件，所以没有逐字稿。可以在下面粘贴一份原文，照样能做会后产出。' }
    }
  }

  // minutes 优先走腾讯纪要接口（元宝纪要），失败再退回 record content
  let data: any = null
  let error: TmeetError | undefined

  if (args.kind === 'minutes') {
    const viaMinutes = await yuanbaoMinutes({ meetingId: args.meetingId }, opts(ctx))
    if (viaMinutes.ok && viaMinutes.data) data = viaMinutes.data
  }
  if (!data) {
    const r = await recordContent({ action: ACTION_OF[args.kind], recordFileId, meetingId: args.meetingId }, opts(ctx))
    if (r.ok) data = r.data
    else error = r.error
  }
  if (!data) return { ok: false, error }

  const view = normalizeContent(args.kind, data)
  if (args.kind === 'transcript') {
    // 逐字稿是否就绪是本机唯一的可信判据：取到非空正文才标记
    markTranscriptReady(args.meetingId, !view.empty)
  }
  if (!view.empty) {
    writeStore((d) => {
      d.contentIndex[key] = view.fetchedAt
    })
    contentCache.set(key, { at: Date.now(), view })
    diskPut(key, view)
  }
  return { ok: true, view }
}

/* ── 派生状态（与 superIR 同构，客户端不算） ── */

export interface StatesInput {
  meetingId: string
  records?: Array<Record<string, unknown>>
  ended: boolean
  hasTranscript: boolean
  hasTimeline: boolean
  hasMinutes: boolean
  gen: ContentStates['gen']
  errorCode?: string
}

export function deriveStates(input: StatesInput): ContentStates {
  const refs = pickRecordRefs(input.records)
  const ready = readStore()
  const hasTranscript = input.hasTranscript || ready.transcriptReady.includes(input.meetingId)

  const denied = input.errorCode === 'permission' || input.errorCode === 'permission-password'
  const passwordBlocked = input.errorCode === 'permission-password' || refs.permissionStatus === 'password_required'
  const transcribing = refs.state === '2' || refs.state === '1'

  const replay: ContentStates['replay'] = denied
    ? 'denied'
    : refs.meetingRecordId
      ? transcribing
        ? 'waiting'
        : 'ready'
      : 'none'

  const transcriptState: ContentStates['transcript'] = denied
    ? 'denied'
    : hasTranscript
      ? 'ready'
      : input.ended
        ? refs.recordFileId
          ? 'none'
          : 'waiting'
        : 'waiting'

  const timelineState: ContentStates['timeline'] = input.hasTimeline ? 'ready' : 'waiting'
  const minutesState: ContentStates['timeline'] = input.hasMinutes ? 'ready' : 'waiting'

  const blocker =
    denied
      ? {
          text: passwordBlocked
            ? '这场录制设置了访问密码，无法直接查看转写。请向录制所有者索取密码。'
            : '这个录制需要录制所有者审批后才能查看转写。',
          action: passwordBlocked ? undefined : '提交申请',
          pane: 'transcript' as const
        }
      : !hasTranscript && input.ended && replay === 'waiting'
        ? { text: '云录制还在转码，转码完成后会自动出现转写。', pane: 'transcript' as const }
        : null

  const tabReasons = {
    transcript: denied
      ? passwordBlocked
        ? '该录制设置了访问密码，需要向录制所有者索取。'
        : '需要录制所有者审批。'
      : !hasTranscript && input.ended
        ? '这场会议还没有转写内容。'
        : '',
    minutes: !hasTranscript && !input.hasMinutes ? '智能纪要依赖转写内容。' : '',
    qa: !hasTranscript ? '生成问答清单需要逐字稿。' : ''
  }

  return {
    replay,
    transcript: transcriptState,
    minutes: minutesState,
    timeline: timelineState,
    meetingRecordId: refs.meetingRecordId || undefined,
    permissionStatus: passwordBlocked ? 'password_required' : refs.permissionStatus || undefined,
    gen: input.gen,
    tabs: {
      transcriptDisabled: denied && passwordBlocked,
      minutesDisabled: false,
      qaDisabled: !hasTranscript
    },
    tabReasons,
    disabledReason: denied ? tabReasons.transcript : '',
    blocker
  }
}

/* ── 回放地址 ── */

export interface ReplayResult {
  ok: boolean
  url?: string
  message: string
  error?: TmeetError
}

export async function replayAddress(ctx: Ctx, args: { meetingRecordId?: string; meetingId?: string }): Promise<ReplayResult> {
  let recordId = args.meetingRecordId || ''
  if (!recordId) {
    const refs = await lookupRecordRefs(ctx, { meetingId: args.meetingId })
    recordId = refs?.meetingRecordId || ''
  }
  if (!recordId) return { ok: false, message: '这场会没有可播放的录制文件。' }
  const r = await recordAddress({ meetingRecordId: recordId }, opts(ctx))
  if (!r.ok) return { ok: false, message: r.error?.message ?? '取不到回放地址', error: r.error }
  const first = (r.data ?? [])[0] as any
  const url = String(first?.view_address ?? first?.download_address ?? first?.url ?? '')
  if (!url) return { ok: false, message: '录制还在转码，暂时没有可播放的地址。' }
  return { ok: true, url, message: '已取到回放地址。' }
}

/* ── 权限申请（两步：prepare 预览 → commit 提交） ── */

export async function applyPermission(
  ctx: Ctx,
  args: { meetingRecordId: string; commit: boolean; meetingId?: string }
): Promise<{ ok: boolean; message: string; error?: TmeetError }> {
  const r = await permissionApply(args, opts(ctx))
  if (!r.ok) return { ok: false, message: r.error?.message ?? '申请失败', error: r.error }
  return {
    ok: true,
    message: args.commit ? '申请已提交，等录制所有者审批。' : '已预览申请内容。'
  }
}
