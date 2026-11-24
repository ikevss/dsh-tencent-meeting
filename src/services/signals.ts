/**
 * 内容信号层（移植 superIR `tmeetState.ts` 的实测结论）。
 *
 * 三条铁律，全部来自 superIR 的实测陷阱：
 *  1. 就绪只认「真的取到了内容」，不认腾讯的标记字段（has_transcript_content 实测不可信）。
 *  2. 500260 / 30002 都是「还没转完」，不是取数失败；判成终态会让用户永远等不到页签打开。
 *  3. timeline 有 status 不代表有内容，必须判数组非空。
 *
 * 事件只当触发器：收到事件后一律回读本文件的结果再改界面，绝不拿 payload 更新状态。
 */
import type {
  ContentStates,
  GenState,
  ReplayState,
  TimelineState,
  TranscriptState
} from '../shared/types.js'
import {
  recordAddress,
  recordContent,
  reportParticipants,
  searchRecords,
  yuanbaoMinutes,
  type ContentAction
} from '../cli/commands.js'
import type { ExecOptions } from '../cli/exec.js'
import type { TmeetError } from '../cli/errors.js'
import { readStore } from './store.js'

export interface Ctx {
  binary: string
  timeoutMs: number
  signal?: AbortSignal
}

function opts(ctx: Ctx): ExecOptions {
  return { binary: ctx.binary, timeoutMs: ctx.timeoutMs, signal: ctx.signal }
}

/** 一条录制（v1.1.0 结构：注意 record search 没有 state 字段） */
export interface RecordItem {
  meeting_record_id?: string
  record_file_id?: string
  file_type?: string
  duration_seconds?: number
  /** 实测不可信：为 true 时转写可能仍为空，禁止用作就绪判据 */
  has_transcript_content?: boolean
  has_smart_minutes?: boolean
  permission_status?: string
  state?: string
}

export interface ContentSignals {
  /** 会前设置读回值（以 meeting get 的 settings 为准，不是建会提交值） */
  autoRecordType?: 'none' | 'local' | 'cloud'
  autoAsr?: boolean
  /** 是否真的存在录制文件（会中手动开录也算） */
  hasRecord?: boolean
  /** 录制是否已可看（record access 能取到非空地址） */
  recordPlayable?: boolean
  /** 转写段落总数 */
  transcriptTotal?: number
  /** 转写业务错误码：'500260' | '30002' */
  transcriptErrorCode?: string
  /** 转写取数本身失败（网络/权限/CLI 坏了），与「云端还没转完」分开 */
  transcriptQueryFailed?: boolean
  /** 正文是否真的取到且界面能渲染 */
  transcriptBodyReady?: boolean
  timelineLength?: number
  minutesLength?: number
  /** record search 的 has_smart_minutes 标记，作为纪要就绪的辅助信号 */
  minutesFlag?: boolean
  /** 录制访问权限 */
  permission?: 'granted' | 'denied' | 'approving' | 'rejected'
  /** 录制条目标识（提交查看申请的两步 CLI 依赖它） */
  meetingRecordId?: string
  /** 腾讯原始 permission_status */
  permissionStatus?: string
  /** 参会人是否可见（对方组织的会取不到） */
  participantsVisible?: boolean
  gen?: Partial<ContentStates['gen']>
}

export const DEFAULT_GEN: ContentStates['gen'] = {
  insight: 'idle',
  company: 'idle',
  investor: 'idle',
  review: 'idle',
  qa: 'idle'
}

/* ── 采集：全部来自回读，不来自事件 payload ── */

function codeOfTranscriptError(e: TmeetError | undefined): string | undefined {
  const raw = e?.raw ?? e?.message ?? ''
  const m = /(500260|30002|500249|500282)/.exec(raw)
  return m ? m[1] : undefined
}

/** 取录制引用（文件 id / 录制条目 id / 权限形态），两种键名都认 */
function pickRefs(records: RecordItem[] | undefined) {
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
  let permissionStatus = ''
  for (const raw of list) {
    const r = raw as any
    if (!recordFileId) recordFileId = read(r, 'record_file_id', 'recordFileId')
    if (!meetingRecordId) meetingRecordId = read(r, 'meeting_record_id', 'meetingRecordId')
    if (!permissionStatus) permissionStatus = read(r, 'permission_status', 'permissionStatus')
    if (recordFileId && meetingRecordId && permissionStatus) break
  }
  return { recordFileId, meetingRecordId, permissionStatus }
}

export interface CollectOptions {
  /** 只回读指定维度（事件触发时用，省额度） */
  only?: SignalDimension[]
}

export type SignalDimension = 'record' | 'transcript' | 'timeline' | 'minutes' | 'participants' | 'settings'

/**
 * 回读一场会议的真实内容信号。
 * 只在「事件触发 / 用户点刷新 / 打开详情页」时调用，不在面板每次渲染时调用（额度纪律）。
 */
export async function collectSignals(ctx: Ctx, meetingId: string, options: CollectOptions = {}): Promise<{ ok: boolean; data?: ContentSignals; error?: TmeetError }> {
  const only = options.only ? new Set(options.only) : null
  const want = (k: SignalDimension): boolean => !only || only.has(k)

  const signals: ContentSignals = {}
  const refs = pickRefs(undefined)

  // 1) 录制列表（有录制 + 权限形态）
  if (want('record')) {
    const r = await searchRecords({ meetingId }, opts(ctx))
    if (r.ok) {
      const list = (r.data ?? []) as RecordItem[]
      const p = pickRefs(list)
      signals.hasRecord = list.length > 0
      signals.meetingRecordId = p.meetingRecordId || undefined
      signals.permissionStatus = p.permissionStatus || undefined
      signals.minutesFlag = list.some((x) => x.has_smart_minutes === true)
      // 录制可看：record access 能取到非空地址
      if (p.meetingRecordId) {
        const addr = await recordAddress({ meetingRecordId: p.meetingRecordId }, opts(ctx))
        if (addr.ok) {
          const first = (addr.data ?? [])[0] as any
          signals.recordPlayable = Boolean(first?.view_address ?? first?.download_address ?? first?.url)
        }
      }
    }
  }

  // 2) 转写：取段落，total>0 才算就绪
  if (want('transcript')) {
    const recordFileId = refs.recordFileId || (await firstRecordFileId(ctx, meetingId))
    if (recordFileId) {
      const r = await recordContent({ action: 'transcript', recordFileId, meetingId }, opts(ctx))
      if (r.ok) {
        const paragraphs = (r.data as any)?.minutes?.paragraphs ?? (r.data as any)?.paragraph_list
        const total = Array.isArray(paragraphs) ? paragraphs.length : Number((r.data as any)?.total ?? 0)
        signals.transcriptTotal = Number.isFinite(total) ? total : 0
        signals.transcriptBodyReady = signals.transcriptTotal > 0
      } else {
        // 500260 / 30002 是「还没转完」，不是失败
        const code = codeOfTranscriptError(r.error)
        if (code === '500260' || code === '30002') {
          signals.transcriptErrorCode = code
        } else {
          signals.transcriptQueryFailed = true
        }
      }
    }
  }

  // 3) 时间轴：数组非空才算就绪
  if (want('timeline')) {
    const recordFileId = refs.recordFileId || (await firstRecordFileId(ctx, meetingId))
    if (recordFileId) {
      const r = await recordContent({ action: 'timeline', recordFileId }, opts(ctx))
      if (r.ok) {
        const tl = (r.data as any)?.timeline
        signals.timelineLength = Array.isArray(tl) ? tl.length : 0
      }
    }
  }

  // 4) 纪要：独立信号，不许拿转写冒充
  if (want('minutes')) {
    const viaMinutes = await yuanbaoMinutes({ meetingId }, opts(ctx))
    if (viaMinutes.ok && viaMinutes.data) {
      const arr = (viaMinutes.data as any)?.minutes
      if (Array.isArray(arr) && arr.length) {
        const text = arr.map((m: any) => String(m?.summary_points ?? m?.overview ?? '')).join('')
        signals.minutesLength = text.length
      }
    } else {
      const recordFileId = refs.recordFileId || (await firstRecordFileId(ctx, meetingId))
      if (recordFileId) {
        const r = await recordContent({ action: 'minutes', recordFileId, meetingId }, opts(ctx))
        if (r.ok) signals.minutesLength = JSON.stringify(r.data ?? '').length
      }
    }
  }

  // 5) 参会人可见性
  if (want('participants')) {
    const r = await reportParticipants({ meetingId, limit: 100 }, opts(ctx))
    signals.participantsVisible = r.ok
  }

  // 6) 会前设置（meeting get 的 settings）
  if (want('settings')) {
    const r = await searchRecords({ meetingId }, opts(ctx))
    void r
    // settings 由调用方从 meeting get 注入；这里不重复打
  }

  return { ok: true, data: signals }
}

async function firstRecordFileId(ctx: Ctx, meetingId: string): Promise<string> {
  const r = await searchRecords({ meetingId }, opts(ctx))
  if (!r.ok) return ''
  const list = (r.data ?? []) as RecordItem[]
  const p = pickRefs(list)
  return p.recordFileId
}

/* ── 派生（与 superIR 同构） ── */

export function deriveContentStates(s: ContentSignals): ContentStates {
  const hasRecord =
    s.hasRecord === true ||
    s.recordPlayable === true ||
    (s.transcriptTotal ?? 0) > 0 ||
    (s.timelineLength ?? 0) > 0 ||
    (s.minutesLength ?? 0) > 0
  const noCloudRecord = !hasRecord && s.autoRecordType !== 'cloud'

  let replay: ReplayState
  if (s.permission === 'denied') replay = 'denied'
  else if (s.permission === 'approving') replay = 'approving'
  else if (s.permission === 'rejected') replay = 'rejected'
  else if (noCloudRecord) replay = 'none'
  else replay = s.recordPlayable ? 'ready' : 'waiting'

  let transcript: TranscriptState
  if (replay === 'denied' || replay === 'approving' || replay === 'rejected') transcript = 'denied'
  else if ((s.transcriptTotal ?? 0) > 0) transcript = 'ready'
  // 有录制就还有转写可取（用户可能在会中手动开了转写，会前设置不代表事实）。
  // 只有「确定没有云录制」才判 none，否则一律给 waiting，让人能点进去试。
  else if (noCloudRecord) transcript = 'none'
  else transcript = 'waiting'

  const minutes: TimelineState =
    (s.minutesLength ?? 0) > 0 || s.minutesFlag === true ? 'ready' : 'waiting'
  const timeline: TimelineState = (s.timelineLength ?? 0) > 0 ? 'ready' : 'waiting'

  const transcriptNotReadyReason =
    transcript === 'denied'
      ? '对方还没授权，转写取不到'
      : transcript === 'none'
        ? '这场会没有可取的转写'
        : s.transcriptQueryFailed
          ? '转写取数没成功，点「刷新」重试'
          : '转写还没取到，好了自动解锁'

  return {
    replay,
    transcript,
    minutes,
    timeline,
    meetingRecordId: s.meetingRecordId,
    permissionStatus: s.permissionStatus,
    gen: { ...DEFAULT_GEN, ...(s.gen ?? {}) },
    tabs: {
      // 只在「确定要授权」时禁用。其它情况一律可点：
      // 之前是「必须有正文才给点」，而正文只有点进去才取——死锁，逐字稿页签永远灰着（实测 bug）。
      transcriptDisabled: transcript === 'denied',
      minutesDisabled: false,
      qaDisabled: true
    },
    tabReasons: {
      transcript:
        transcript === 'denied'
          ? transcriptNotReadyReason
          : transcript === 'ready' && s.transcriptBodyReady !== true
            ? '正文这一版还没接通，点进去会自动取一次'
            : '',
      minutes: '',
      qa: '问答清单需要逐字稿，逐字稿就绪后自动解锁'
    },
    disabledReason: transcript === 'ready' ? '' : transcriptNotReadyReason,
    blocker: buildBlocker(replay, s.participantsVisible !== false)
  }
}

function buildBlocker(replay: ReplayState, participantsVisible: boolean): ContentStates['blocker'] {
  if (!participantsVisible) {
    return {
      text: '这场会由对方组织，参会名单要对方授权后才看得到',
      action: '去「逐字稿」页签提交查看申请',
      pane: 'transcript'
    }
  }
  switch (replay) {
    case 'denied':
      return {
        text: '这场会的录制由对方发起，还没授权给你',
        action: '去「逐字稿」页签提交查看申请',
        pane: 'transcript'
      }
    case 'approving':
      return {
        text: '查看申请已提交，等对方处理',
        action: '去「逐字稿」页签看审批进度',
        pane: 'transcript'
      }
    case 'rejected':
      return {
        text: '对方没通过这次的查看申请',
        action: '去「逐字稿」页签重新提交',
        pane: 'transcript'
      }
    case 'none':
      return { text: '这场会没有开启云录制', action: '会前没开，会后补不了' }
    default:
      return null
  }
}

/** 徽标颜色语义：橙=等待、蓝=可用、红=失败、灰=终态无内容 */
export function replayBadge(state: ReplayState, longWait = false): { text: string; tone: 'warn' | 'on' | 'fail' | 'term' } {
  switch (state) {
    case 'ready':
      return { text: '内容齐全', tone: 'on' }
    case 'waiting':
      return { text: longWait ? '等待较久' : '转码中', tone: 'warn' }
    case 'denied':
      return { text: '需授权', tone: 'term' }
    case 'approving':
      return { text: '审批中', tone: 'warn' }
    case 'rejected':
      return { text: '未通过', tone: 'term' }
    case 'none':
      return { text: '无回放', tone: 'term' }
  }
}

/** 事件只当触发器：把事件 key 映射到「该回读什么」 */
export function eventToRefetch(eventKey: string): {
  record: boolean
  transcript: boolean
  timeline: boolean
  participants: boolean
  minutes: boolean
} {
  switch (eventKey) {
    case 'meeting.started':
      return { record: false, transcript: false, timeline: false, participants: false, minutes: false }
    case 'meeting.end':
    case 'meeting.canceled':
      return { record: true, transcript: true, timeline: true, participants: true, minutes: true }
    case 'recording.completed':
      return { record: true, transcript: false, timeline: false, participants: false, minutes: false }
    case 'smart.transcripts':
      return { record: false, transcript: true, timeline: true, participants: false, minutes: false }
    case 'smart.minutes':
      return { record: false, transcript: false, timeline: true, participants: false, minutes: true }
    default:
      return { record: false, transcript: false, timeline: false, participants: false, minutes: false }
  }
}

/** 就绪态单调化：只允许 waiting → ready，禁止 ready 回退成 waiting */
export function enforceMonotonic(
  prev: ContentStates | undefined,
  next: ContentStates
): ContentStates {
  if (!prev) return next
  const keep = (a: string, b: string) => a === 'ready' && b === 'waiting'
  return {
    ...next,
    replay: keep(prev.replay, next.replay) ? prev.replay : next.replay,
    transcript: keep(prev.transcript, next.transcript) ? prev.transcript : next.transcript,
    minutes: keep(prev.minutes, next.minutes) ? prev.minutes : next.minutes,
    timeline: keep(prev.timeline, next.timeline) ? prev.timeline : next.timeline
  }
}

/** 本地信号：打开详情页即派生，0 次 CLI 调用 */
export function localContentSignals(input: {
  records?: Array<Record<string, unknown>>
  content: Record<string, { empty: boolean }>
  ended?: boolean
  autoRecordType?: 'none' | 'local' | 'cloud'
  autoAsr?: boolean
}): ContentSignals {
  const nonEmpty = (kind: string): boolean => {
    const v = input.content[kind]
    return Boolean(v && !v.empty)
  }
  const hasRecord = Array.isArray(input.records) && input.records.length > 0
  const knownType =
    input.autoRecordType === 'none' ||
    input.autoRecordType === 'local' ||
    input.autoRecordType === 'cloud'
  return {
    hasRecord,
    autoRecordType: knownType ? input.autoRecordType : input.ended === false ? 'cloud' : undefined,
    autoAsr: input.autoAsr,
    transcriptTotal: nonEmpty('transcript') ? 1 : 0,
    transcriptBodyReady: nonEmpty('transcript'),
    timelineLength: nonEmpty('timeline') ? 1 : 0,
    minutesLength: nonEmpty('minutes') ? 1 : 0
  }
}

/** 供事件服务使用：把 store 里的本机就绪标记并入信号 */
export function mergeLocalReady(signals: ContentSignals, meetingId: string): ContentSignals {
  const ready = readStore()
  if (ready.transcriptReady.includes(meetingId)) {
    signals.transcriptTotal = Math.max(signals.transcriptTotal ?? 0, 1)
    signals.transcriptBodyReady = true
  }
  if (ready.contentIndex[`${meetingId}:timeline`]) {
    signals.timelineLength = Math.max(signals.timelineLength ?? 0, 1)
  }
  if (ready.contentIndex[`${meetingId}:minutes`]) {
    signals.minutesLength = Math.max(signals.minutesLength ?? 0, 1)
  }
  return signals
}

export type { ContentAction }
