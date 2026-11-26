/**
 * /tmeet/api 客户端封装。
 *
 * 纪律：
 *  - 只走 HTTP，浏览器里不调 tmeet、不读文件（凭证与进程都在 Node 半）；
 *  - 失败一律抛 ApiError，带服务端那句人话 + code；调用方负责把它显示出来，
 *    不存在「静默失败」这条路径；
 *  - 4xx 带 { error, code } 时优先用服务端文案，网络层失败给一句自己能解释的。
 */
import type {
  ApiError as ApiErrorPayload,
  CatalogPayload,
  ContentStates,
  ContentView,
  MeetingDetailView,
  MeetingListPayload,
  OutputKind,
  OutputView,
  PersonRow,
  PluginStatus,
  PrefsView
} from '../../shared/types'

export const API_BASE = '/tmeet/api'

export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export function errorText(e: unknown): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error && e.message) return e.message
  return typeof e === 'string' && e ? e : '请求没成功，稍后再点一次。'
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
  /** 超时毫秒；默认 12s。到点就中止，避免面板一直转圈 */
  timeoutMs?: number
}

/** 合并「调用方取消」和「超时取消」两个信号 */
function mergeSignal(a?: AbortSignal, b?: AbortSignal): AbortSignal | undefined {
  if (!a) return b
  if (!b) return a
  const ctrl = new AbortController()
  const on = () => ctrl.abort()
  if (a.aborted || b.aborted) ctrl.abort()
  else {
    a.addEventListener('abort', on, { once: true })
    b.addEventListener('abort', on, { once: true })
  }
  return ctrl.signal
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.query)
  const timeoutMs = opts.timeoutMs ?? 30000
  const timeoutCtrl = new AbortController()
  const timer = setTimeout(() => timeoutCtrl.abort(), timeoutMs)
  const signal = mergeSignal(opts.signal, timeoutCtrl.signal)
  let res: Response
  try {
    res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers: opts.body === undefined ? undefined : { 'content-type': 'application/json' },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      credentials: 'same-origin',
      signal
    })
  } catch (e) {
    // 用户主动取消原样抛出；超时则给一句能看懂的提示，绝不留在加载态
    if ((e as Error)?.name === 'AbortError') {
      if (opts.signal?.aborted) throw e
      throw new ApiError('这个请求等得太久，没等到回话。可以再试一次。', 'timeout', 0)
    }
    throw new ApiError('连不上面板的本地服务，确认 DSH 还在运行。', 'network', 0)
  } finally {
    clearTimeout(timer)
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const payload = (data ?? {}) as Partial<ApiErrorPayload>
    const message = typeof payload.error === 'string' && payload.error ? payload.error : `请求失败（HTTP ${res.status}）`
    const code = typeof payload.code === 'string' && payload.code ? payload.code : `http-${res.status}`
    throw new ApiError(message, code, res.status)
  }

  return data as T
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_BASE}${path}`
  if (!query) return url
  const parts: string[] = []
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  }
  return parts.length ? `${url}?${parts.join('&')}` : url
}

/* ── 状态与授权 ── */

export interface InstallStatusPayload {
  installing: boolean
  lastMessage: string
}

export interface OkMessage {
  ok: boolean
  message: string
}

export interface AuthPollPayload {
  state: 'idle' | 'waiting' | 'failed' | 'done'
  url?: string
  reason?: string
  waitedMs?: number
  authState?: string
  account?: string
}

export interface StartAuthPayload {
  ok: boolean
  url?: string | null
  opened?: boolean
  message?: string
}

export function getStatus(signal?: AbortSignal): Promise<PluginStatus> {
  return request<PluginStatus>('/status', { signal })
}

/** 安装或升级：不传 version 时装配置里的期望版本；传了就装那一版 */
export function installCli(version?: string, signal?: AbortSignal): Promise<OkMessage> {
  return request<OkMessage>('/setup/install', {
    method: 'POST',
    body: { confirm: true, ...(version ? { version } : {}) },
    signal
  })
}

export function getInstallStatus(signal?: AbortSignal): Promise<InstallStatusPayload> {
  return request<InstallStatusPayload>('/setup/install-status', { signal })
}

/** npm 上的最新版本；查不到为 null（界面就不显示升级入口） */
export function getCliLatestVersion(signal?: AbortSignal): Promise<{ latest: string | null; at: number }> {
  return request<{ latest: string | null; at: number }>('/setup/cli-version', { signal })
}

export function startAuth(switchAccount = false, signal?: AbortSignal): Promise<StartAuthPayload> {
  return request<StartAuthPayload>('/auth/start', {
    method: 'POST',
    body: switchAccount ? { switchAccount: true } : {},
    signal
  })
}

export function pollAuth(signal?: AbortSignal): Promise<AuthPollPayload> {
  return request<AuthPollPayload>('/auth/poll', { signal })
}

/** 用户主动放弃等待授权：停掉后台授权进程，回到可再试的状态 */
export function cancelAuth(): Promise<{ ok: boolean; message: string }> {
  return request<{ ok: boolean; message: string }>('/auth/cancel', { method: 'POST', body: {} })
}

export function logout(purgeLocal: boolean, signal?: AbortSignal): Promise<{ ok: boolean; message?: string }> {
  return request<{ ok: boolean; message?: string }>('/auth/logout', {
    method: 'POST',
    body: { confirm: true, purgeLocal },
    signal
  })
}

/* ── 会议列表与详情 ── */

export interface ListQuery {
  scope?: 'upcoming' | 'ended'
  limit?: number
  q?: string
  onlyTranscript?: boolean
  refresh?: boolean
  before?: string
}

export function listMeetings(query: ListQuery, signal?: AbortSignal): Promise<MeetingListPayload> {
  return request<MeetingListPayload>('/meetings', {
    query: {
      scope: query.scope ?? 'ended',
      limit: query.limit,
      q: query.q,
      onlyTranscript: query.onlyTranscript ? 1 : undefined,
      refresh: query.refresh ? 1 : undefined,
      before: query.before
    },
    signal
  })
}

/**
 * 会话内只读缓存：切页签 / 切会议再回来时先拿已有内容顶上，
 * 后台再静默更新。用户抱怨「每次点击都重新加载、干等」的根因就在这里。
 * 只存内存，面板一关就没了；服务端还有一层缓存兜底。
 */
const detailMemo = new Map<string, MeetingDetailView>()
const contentMemo = new Map<string, ContentView>()

export function cachedMeeting(id: string): MeetingDetailView | null {
  return detailMemo.get(id) ?? null
}

export function cachedContent(id: string, kind: ContentView['kind']): ContentView | null {
  return contentMemo.get(`${id}:${kind}`) ?? null
}

export function getMeeting(id: string, signal?: AbortSignal): Promise<MeetingDetailView> {
  return request<MeetingDetailView>('/meeting', { query: { id }, signal }).then((d) => {
    detailMemo.set(id, d)
    return d
  })
}

export function getStates(id: string, signal?: AbortSignal): Promise<ContentStates> {
  return request<ContentStates>('/meeting/states', { query: { id }, signal })
}

export function getContent(
  id: string,
  kind: 'transcript' | 'timeline' | 'minutes' | 'todos',
  force = false,
  signal?: AbortSignal
): Promise<ContentView> {
  return request<ContentView>('/meeting/content', {
    query: { id, kind, force: force ? 1 : undefined },
    signal
  }).then((v) => {
    if (!v.empty) contentMemo.set(`${id}:${kind}`, v)
    return v
  })
}

export function getParticipants(
  id: string,
  signal?: AbortSignal
): Promise<{ rows: PersonRow[]; warning?: string }> {
  return request<{ rows: PersonRow[]; warning?: string }>('/meeting/participants', { query: { id }, signal })
}

export function mutateParticipants(
  id: string,
  action: 'add' | 'remove',
  names: string[]
): Promise<{ rows: PersonRow[]; warning?: string }> {
  return request<{ rows: PersonRow[]; warning?: string }>('/meeting/participants', {
    method: 'POST',
    body: { id, action, names }
  })
}

export function recognizeParticipants(
  id: string
): Promise<{ rows: PersonRow[]; added?: number; matched?: number; message?: string }> {
  return request<{ rows: PersonRow[]; added?: number; matched?: number; message?: string }>(
    '/meeting/participants/recognize',
    { method: 'POST', body: { id }, timeoutMs: 180000 }
  )
}

export function getOutputs(id: string, signal?: AbortSignal): Promise<Partial<Record<OutputKind, OutputView>>> {
  return request<Partial<Record<OutputKind, OutputView>>>('/meeting/outputs', { query: { id }, signal })
}

/* 后台生成：点一下立刻返回，结果由宿主跑完写进 store，客户端轮询状态。 */

export interface GenerationTaskView {
  kind: OutputKind
  status: 'running' | 'done' | 'error'
  message: string
  at: number
}

/** 起一次生成（已在跑就返回 started=false），立刻返回 */
export function generateOutput(
  id: string,
  kind: OutputKind,
  opts?: { type?: string }
): Promise<{ started: boolean; task: GenerationTaskView }> {
  return request<{ started: boolean; task: GenerationTaskView }>('/meeting/output', {
    method: 'POST',
    body: { id, kind, action: 'generate', type: opts?.type },
    timeoutMs: 30000
  })
}

/** 取消一次后台生成 */
export function cancelOutput(id: string, kind: OutputKind): Promise<{ cancelled: boolean }> {
  return request<{ cancelled: boolean }>('/meeting/output', {
    method: 'POST',
    body: { id, kind, action: 'cancel' },
    timeoutMs: 15000
  })
}

export function deleteOutput(id: string, kind: OutputKind): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>('/meeting/output', {
    method: 'POST',
    body: { id, kind, action: 'delete' },
    timeoutMs: 15000
  })
}

/** 查这场会现在有哪些产出在后台跑/跑完 */
export function outputStatus(id: string, signal?: AbortSignal): Promise<{ tasks: GenerationTaskView[] }> {
  return request<{ tasks: GenerationTaskView[] }>('/meeting/output-status', { query: { id }, signal })
}

/* ── AI 对话：把这场会交给 DSH 自己的完整对话功能 ── */

export interface ChatSessionPayload {
  /** 该会专属工作区：交给 DSH 自己开它的完整对话 */
  workspaceId: string
  dir: string
}

/** 准备这场会的 DSH 工作区（素材落盘），返回 workspaceId 供 DSH 打开它自己的完整对话 */
export function prepareChatSession(id: string): Promise<ChatSessionPayload> {
  return request<ChatSessionPayload>('/meeting/chat-session', { method: 'POST', body: { id } })
}

/** 会话打开后，把这场会的资料投进去；sessionId 是宿主刚建好的那个会话 */
export function seedChat(id: string, sessionId?: string): Promise<{ seeded: boolean; sessionId?: string; message?: string }> {
  return request<{ seeded: boolean; sessionId?: string; message?: string }>('/meeting/chat-seed', {
    method: 'POST',
    body: { id, sessionId }
  })
}

/* ── 复盘洞察 ── */

export interface ReviewCandidate {
  id: string
  name: string
}
export interface ReviewMissing {
  what: string
  why: string
  how: string
}
export interface ReviewPlanPayload {
  type: string
  typeName: string
  confidence: 'high' | 'medium' | 'low'
  reason: string
  candidates: ReviewCandidate[]
  frame: string[]
  insight: string
  available: string[]
  missing: ReviewMissing[]
  degraded: boolean
  degradeReason?: string
  /** 全部可选类型，给「换类型」用 */
  types: ReviewCandidate[]
}
export interface ParticipationRow {
  speaker: string
  chunks: number
  chars: number
  share: number
}
export interface ParticipationPayload {
  rows: ParticipationRow[]
  silent: string[]
  totalChunks: number
  totalChars: number
  speakerAvailable: boolean
  rosterMissing: boolean
}

/** 类型判定：只读本地，不打腾讯接口 */
export function getReviewPlan(id: string, type?: string, signal?: AbortSignal): Promise<ReviewPlanPayload> {
  return request<ReviewPlanPayload>('/meeting/review-plan', { query: { id, type }, signal })
}

export function getParticipation(id: string, signal?: AbortSignal): Promise<ParticipationPayload> {
  return request<ParticipationPayload>('/meeting/participation', { query: { id }, signal })
}

export function getInviteText(id: string, signal?: AbortSignal): Promise<{ text: string }> {
  return request<{ text: string }>('/meeting/invite-text', { query: { id }, signal })
}

/* ── 受邀人 ── */

export interface InviteeRow {
  openId: string
  nickname?: string
}

export function getInvitees(id: string, signal?: AbortSignal): Promise<{ invitees: InviteeRow[] }> {
  return request<{ invitees: InviteeRow[] }>('/meeting/invitees', { query: { id }, signal })
}

/** 改受邀人是写操作：必须带 confirm:true（界面上先确认一次） */
export function mutateInvitees(
  id: string,
  action: 'add' | 'remove' | 'replace',
  openIds: string[]
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/meeting/invitees', {
    method: 'POST',
    body: { confirm: true, id, action, openIds }
  })
}

/* ── 改会（两阶段） ── */

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

export type UpdateResponse =
  | { stage: 'preview'; fields: PreviewField[]; text: string }
  | {
      stage: 'updated'
      meeting?: MeetingListPayload['meetings'][number]
      detail?: MeetingDetailView
      message?: string
      overridden?: string[]
    }

export function updateMeeting(id: string, patch: UpdatePatch, confirm: boolean): Promise<UpdateResponse> {
  return request<UpdateResponse>('/meeting/update', { method: 'POST', body: { confirm, id, patch } })
}

/** 修改标题：已结束的会只改本机，未结束的同步腾讯 */
export function saveSubject(id: string, subject: string): Promise<{ mode: 'local' | 'cloud'; message?: string }> {
  return request<{ mode: 'local' | 'cloud'; message?: string }>('/meeting/subject', { method: 'POST', body: { id, subject } })
}

export function openReplay(id: string): Promise<{ opened: boolean; message: string }> {
  return request<{ opened: boolean; message: string }>('/meeting/replay', { method: 'POST', body: { id } })
}

/* ── 写操作（两阶段） ── */

export interface PreviewField {
  label: string
  value: string
}

export interface CreateFormBody {
  subject: string
  date: string
  startTime: string
  durationMinutes?: number
  start?: string
  end?: string
  passwordEnabled?: boolean
  password?: string
  recurring?: boolean
  joinLimit?: 1 | 2 | 3
  cloudRecord?: boolean
  autoTranscribe?: boolean
  waitingRoom?: boolean
  inviteeOpenIds?: string[]
  note?: string
  typeId?: string
  timezone?: string
}

export type CreateResponse =
  | { stage: 'preview'; fields: PreviewField[]; text: string }
  | {
      stage: 'created'
      meeting?: MeetingListPayload['meetings'][number]
      detail?: MeetingDetailView
      message?: string
      overridden?: string[]
    }

export function createMeeting(form: CreateFormBody, confirm: boolean): Promise<CreateResponse> {
  return request<CreateResponse>('/meeting/create', { method: 'POST', body: { form, confirm } })
}

export function cancelMeeting(id: string, confirm: boolean): Promise<{ stage: string; message?: string; text?: string }> {
  return request<{ stage: string; message?: string; text?: string }>('/meeting/cancel', {
    method: 'POST',
    body: { id, confirm }
  })
}

/* ── 设置 ── */

export interface SettingsPayload {
  prefs: PrefsView
  catalog: CatalogPayload
}

export function getSettings(signal?: AbortSignal): Promise<SettingsPayload> {
  return request<SettingsPayload>('/settings', { signal })
}

export function saveSettings(patch: Partial<PrefsView>): Promise<{ prefs: PrefsView }> {
  return request<{ prefs: PrefsView }>('/settings', { method: 'POST', body: patch })
}

export function clearCache(): Promise<{ cleared?: number | boolean }> {
  return request<{ cleared?: number | boolean }>('/cache/clear', { method: 'POST', body: {} })
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* 退回 execCommand */
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

/* ── 实时同步 ── */

/* ── 今日接口用量（本地闸门） ── */

export interface QuotaPayload {
  date: string
  used: number
  budget: number
  remaining: number
  exhausted: boolean
}

export function getQuota(signal?: AbortSignal): Promise<QuotaPayload> {
  return request<QuotaPayload>('/quota', { signal })
}

/** 手动重置本地计数（用户明确点了「重置计数」才调） */
export function resetQuota(): Promise<QuotaPayload> {
  return request<QuotaPayload>('/quota/reset', { method: 'POST', body: {} })
}

/** 用户自己粘贴的会后素材（逐字稿/纪要/待办） */
export interface PastedMeta {
  kind: 'transcript' | 'minutes' | 'todos'
  at: string
  source: string
  chars: number
}

export function listPasted(id: string): Promise<{ items: PastedMeta[] }> {
  return request<{ items: PastedMeta[] }>('/meeting/pasted', { query: { id } })
}

export function savePasted(input: {
  id: string
  kind: PastedMeta['kind']
  text: string
  source?: string
  overwrite?: boolean
}): Promise<{ ok: boolean; message: string; replaced: boolean }> {
  return request<{ ok: boolean; message: string; replaced: boolean }>('/meeting/pasted', {
    method: 'POST',
    body: input
  })
}

export function deletePasted(id: string, kind: PastedMeta['kind']): Promise<{ ok: boolean; message: string }> {
  return request<{ ok: boolean; message: string }>('/meeting/pasted/delete', {
    method: 'POST',
    body: { id, kind }
  })
}

/** 提交录制查看申请（两阶段：commit=false 预览，true 提交） */
export function applyPermission(
  meetingRecordId: string,
  commit: boolean,
  meetingId?: string
): Promise<{ ok: boolean; message: string }> {
  return request<{ ok: boolean; message: string }>('/meeting/permission', {
    method: 'POST',
    body: { meetingRecordId, commit, confirm: true, id: meetingId }
  })
}

export interface EventStatus {  running: boolean
  consumers: number
  degraded: boolean
  failures: number
}

export interface PushEvent {
  meetingId: string
  eventKey: string
  at: string
  states?: ContentStates
  degraded?: boolean
}

export function getEventStatus(signal?: AbortSignal): Promise<EventStatus> {
  return request<EventStatus>('/events/status', { signal })
}

/** 手动回读一场会议的真实状态（用户点「刷新状态」） */
export function refreshMeeting(id: string): Promise<{ states?: ContentStates }> {
  return request<{ states?: ContentStates }>('/events/refresh', { method: 'POST', body: { id } })
}

/**
 * 订阅实时事件流。返回取消函数。
 * 服务端只推 meetingId + 事件类型 + 回读后的状态，不含任何个人信息。
 */
export function subscribeEvents(
  onEvent: (e: PushEvent) => void,
  onOpen?: () => void,
  onError?: () => void
): () => void {
  const es = new EventSource(`${API_BASE}/events/stream`, { withCredentials: true })
  es.addEventListener('hello', () => onOpen?.())
  const known = ['meeting.started', 'meeting.end', 'meeting.canceled', 'recording.completed', 'smart.transcripts', 'smart.minutes', 'manual.refresh', 'meeting.created', 'meeting.updated']
  for (const key of known) {
    es.addEventListener(key, (ev) => {
      try {
        onEvent(JSON.parse((ev as MessageEvent).data))
      } catch {
        /* 脏数据丢弃 */
      }
    })
  }
  es.onerror = () => onError?.()
  return () => es.close()
}
