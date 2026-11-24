/**
 * 两端共用的类型（Host 与 Client 都 import，只放类型与纯函数，不 import 任何运行时）。
 * 与 SPEC.md §4.6 一一对应；改这里必须同步改 spec。
 */

export type ReplayState = 'ready' | 'waiting' | 'none' | 'denied' | 'approving' | 'rejected'
export type TranscriptState = 'ready' | 'waiting' | 'none' | 'denied'
export type TimelineState = 'ready' | 'waiting'
export type GenState = 'idle' | 'queued' | 'generating' | 'done' | 'failed'

export type OutputKind = 'insight' | 'minutes-company' | 'minutes-investor' | 'review' | 'qa'
/** 会议洞察分析放第一项 */
export const OUTPUT_KINDS: OutputKind[] = ['insight', 'minutes-company', 'minutes-investor', 'review', 'qa']

export const OUTPUT_LABELS: Record<OutputKind, string> = {
  insight: '会议洞察分析',
  'minutes-company': '公司视角纪要',
  'minutes-investor': '投资人视角纪要',
  review: '复盘报告',
  qa: '问答清单'
}

export interface ContentStates {
  replay: ReplayState
  transcript: TranscriptState
  minutes: TimelineState
  timeline: TimelineState
  meetingRecordId?: string
  permissionStatus?: string
  gen: { insight: GenState; company: GenState; investor: GenState; review: GenState; qa: GenState }
  tabs: { transcriptDisabled: boolean; minutesDisabled: boolean; qaDisabled: boolean }
  tabReasons: { transcript: string; minutes: string; qa: string }
  disabledReason: string
  blocker: { text: string; action?: string; pane?: 'transcript' | 'minutes' } | null
}

export function emptyStates(): ContentStates {
  return {
    replay: 'none',
    transcript: 'none',
    minutes: 'waiting',
    timeline: 'waiting',
    gen: { insight: 'idle', company: 'idle', investor: 'idle', review: 'idle', qa: 'idle' },
    tabs: { transcriptDisabled: false, minutesDisabled: false, qaDisabled: false },
    tabReasons: { transcript: '', minutes: '', qa: '' },
    disabledReason: '',
    blocker: null
  }
}

export type AuthState =
  | 'connected'
  | 'connected-empty'
  | 'none'
  | 'expiring'
  | 'expired'
  | 'version-mismatch'
  | 'not-installed'
  | 'operation-failed'

export interface PluginStatus {
  /** 二进制是否找到 */
  cli: 'missing' | 'ready'
  /** 探测到的版本（形如 1.1.0，失败为空串） */
  version: string
  /** 期望版本 */
  expectedVersion: string
  /** 是否支持 record content / meeting search 等 v1.1.0 能力 */
  modern: boolean
  auth: 'logged-in' | 'not-logged-in' | 'expired' | 'unknown'
  account: string
  binary: string
  state: AuthState
  /** 需要用户看到的下一步（中文一句话） */
  hint: string
  checkedAt: number
  /** 安装进行中 */
  installing?: boolean
}

export interface MeetingRecordRef {
  recordFileId?: string
  meetingRecordId?: string
  duration?: string
  type?: string
  state?: string
  permissionStatus?: string
  url?: string
  subject?: string
}

export interface MeetingBrief {
  meetingId: string
  meetingCode: string
  subject: string
  startTime: string
  endTime: string
  meetingType: string
  joinUrl?: string
  subMeetingId?: string
  records: MeetingRecordRef[]
  recordsTotal?: number
  minuteTotal?: number
  /** 本机是否已取回非空逐字稿（列表标签与筛选共用这一个判据） */
  hasTranscript: boolean
  /** SuperIR 侧手工补充的本地元数据 */
  note?: string
  typeId?: string
  /** 本机记下的入会密码（只有在本插件建会/改会时填过才有；腾讯不回传） */
  localPassword?: string
}

export interface MeetingSettings {
  autoRecordType: 'none' | 'local' | 'cloud' | null
  autoAsr: boolean | null
  passwordRequired: boolean | null
  joinType: number | null
  waitingRoom: boolean | null
  /** 企业策略覆盖了提交值时为 true，并给出被覆盖的字段名 */
  overridden: boolean
  overriddenFields: string[]
}

export interface MeetingDetailView {
  brief: MeetingBrief
  /** 真实生效设置（create/update 后回读的值） */
  settings: MeetingSettings
  hostName?: string
  /** 腾讯侧受邀人（按 open_id） */
  invitees: Array<{ openId: string; nickname?: string }>
}

export interface PersonRow {
  key: string
  openId?: string
  nickname: string
  joinTime?: string
  leftTime?: string
  fromLocal: boolean
  company?: string
  title?: string
  source?: 'tencent' | 'manual' | 'ai'
  /** AI 认人概括的这个人在这场会的观点（≤60 字） */
  view?: string
}

export interface ContentView {
  kind: 'transcript' | 'timeline' | 'minutes' | 'todos'
  chunks: Array<{ text: string; speaker?: string; time?: string }>
  plain: string
  empty: boolean
  fetchedAt: string
  /** 内容来自哪里：腾讯云（cloud）还是用户自己粘的（pasted） */
  source?: 'cloud' | 'pasted'
  /** 粘贴来源描述，例如「手机录音转文字」 */
  pastedSource?: string
}

export interface OutputView {
  kind: OutputKind
  text: string
  source: 'transcript' | 'minutes'
  generatedAt: string
  /** 生成时用的模型，便于复现与排错 */
  model: string
  /** 素材被截断时为 true，正文里也会注明 */
  truncated: boolean
  /** 复盘报告生成时用的类型（如 customer-success），便于界面回显与复现 */
  reviewType?: string
  /** 复盘报告是否为降级版（素材不足） */
  reviewDegraded?: boolean
}

export interface MeetingListPayload {
  auth: PluginStatus['auth']
  meetings: MeetingBrief[]
  hasMore: boolean
  nextCursor?: string
  syncedAt: string | null
  partial?: boolean
  error?: string
}

export interface PrefsView {
  provider: string
  model: string
  agentPreset: string
  outputSkills: OutputKind[]
  notifyOnReady: boolean
  /** 严格限额：默认关（本地上限只是估计值，不拦用户尝试） */
  quotaStrict: boolean
}

export interface CatalogModel {
  provider: string
  providerName: string
  models: Array<{ id: string; name: string }>
}

export interface CatalogAgent {
  id: string
  name: string
  description: string
  isDefault: boolean
}

export interface CatalogPayload {
  models: CatalogModel[]
  agents: CatalogAgent[]
  defaultProvider: string
  defaultModel: string
}

export interface ApiError {
  error: string
  code: string
}

/* ── 纯函数：两端共用 ── */

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function parseDate(iso: string | undefined | null): Date | null {
  if (!iso) return null
  const t = Date.parse(iso)
  return Number.isNaN(t) ? null : new Date(t)
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** 相对时间标签：今天 / 明天 / 昨天 / MM-DD 周X + 起止时分 */
export function formatRelativeRange(
  startIso: string,
  endIso: string,
  now: Date = new Date()
): string {
  const s = parseDate(startIso)
  const e = parseDate(endIso)
  if (!s) return startIso || ''
  const hm = `${pad(s.getHours())}:${pad(s.getMinutes())}`
  const endHm = e ? ` – ${pad(e.getHours())}:${pad(e.getMinutes())}` : ''
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dayKey(s) === dayKey(now)) return `今天 ${hm}${endHm}`
  if (dayKey(s) === dayKey(tomorrow)) return `明天 ${hm}${endHm}`
  if (dayKey(s) === dayKey(yesterday)) return `昨天 ${hm}${endHm}`
  const md = `${pad(s.getMonth() + 1)}-${pad(s.getDate())}`
  if (s.getFullYear() === now.getFullYear() && Math.abs(s.getTime() - now.getTime()) < 7 * 864e5) {
    return `${md} ${WEEKDAYS[s.getDay()]} ${hm}${endHm}`
  }
  return `${md} ${hm}${endHm}`
}

/** 绝对时间标签：复制邀请必须给绝对日期 */
export function formatAbsoluteRange(startIso: string, endIso: string): string {
  const s = parseDate(startIso)
  const e = parseDate(endIso)
  if (!s) return `${startIso || ''} – ${endIso || ''}`
  const so = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())} ${pad(s.getHours())}:${pad(s.getMinutes())}`
  if (!e) return so
  const sameDay = dayKey(s) === dayKey(e)
  const eo = sameDay
    ? `${pad(e.getHours())}:${pad(e.getMinutes())}`
    : `${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())} ${pad(e.getHours())}:${pad(e.getMinutes())}`
  return `${so} – ${eo}`
}

export function isLive(m: { startTime: string; endTime: string }, now = Date.now()): boolean {
  const s = Date.parse(m.startTime)
  const e = Date.parse(m.endTime)
  if (Number.isNaN(s) || Number.isNaN(e)) return false
  return now >= s && now < e
}

export function isEnded(m: { endTime: string }, now = Date.now()): boolean {
  const e = Date.parse(m.endTime)
  return !Number.isNaN(e) && now >= e
}

/** 同一场会被重复建多次时，展示层按「主题+起止」去重，只留第一条 */
export function dedupeBySlot<T extends { subject: string; startTime: string; endTime: string }>(
  list: T[]
): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const m of list) {
    const key = `${m.subject}|${m.startTime}|${m.endTime}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(m)
  }
  return out
}

/** 「已等待 X 分 YY 秒」：等待态只说已等待，不给预计 */
export function formatWaited(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `已等待 ${m} 分 ${pad(s)} 秒` : `已等待 ${s} 秒`
}

/** 会议号格式：腾讯是 9 位数字，3-3-3 分组更易读 */
export function formatMeetingCode(code: string): string {
  const c = String(code || '').replace(/\D/g, '')
  if (c.length !== 9) return code || ''
  return `${c.slice(0, 3)} ${c.slice(3, 6)} ${c.slice(6)}`
}
