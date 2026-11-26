/**
 * HTTP 路由：/tmeet/api/*
 *
 * 为什么走 webServer 而不是 connection.fetch.register：
 *   `connection.fetch.register` 只接受精确路径，而这里要的是一棵子树（/tmeet/api/... 十几条）；
 *   webServer.register({kind:'prefix'}) 直接给一棵子树，鉴权自己调 connection.requestRejection，
 *   与宿主自带路由同一条围栏。superIR 版踩过 connection.rpc.handle 的坑（外部插件必抛），这里不用它。
 *
 * 响应纪律：永不返回堆栈；错误统一 { error, code }，4xx 用对状态码。
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import fs from 'node:fs'
import nodePath from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type {
  CatalogPayload,
  ContentStates,
  MeetingListPayload,
  PersonRow,
  PluginStatus,
  PrefsView
} from './shared/types.js'
import { OUTPUT_KINDS, OUTPUT_LABELS, emptyStates, type OutputKind } from './shared/types.js'
import { readPrefs, writePrefs } from './prefs.js'
import { readStatus, startLogin, pollLogin, cancelLogin, logout, disposeAuth } from './services/auth.js'
import * as meetings from './services/meetings.js'
import * as records from './services/records.js'
import * as participants from './services/participants.js'
import * as outputs from './services/outputs.js'
import { prepareChatSession, collectMaterial, writeMaterialFiles, meetingDir, materialSummary, seedMeetingChat } from './services/chat-session.js'
import { catalog, type ModelRef } from './services/agent-run.js'
import { runInstall } from './cli/locate.js'
import { getDailyBudget } from './cli/exec.js'
import { readQuota, resetQuota } from './cli/quota.js'
import { readStore, purgeAccount, writeStore } from './services/store.js'
import { PASTED_KINDS, deletePasted, getPasted, listPasted, pastedAsText, savePasted, type PastedKind } from './services/pasted.js'
import {
  emitLocal,
  eventStatus,
  isDegraded,
  refreshMeeting,
  startEventConsumers,
  stopEventConsumers,
  subscribe as subscribeEvents,
  type EventDeps
} from './services/events.js'
import { collectSignals, deriveContentStates, localContentSignals, mergeLocalReady } from './services/signals.js'
import { planReview, typeById, REVIEW_TYPES } from './services/review-plan.js'
import { analyzeParticipation } from './services/review-participation.js'
import { diskPeekChars, diskPeekView } from './services/content-cache.js'

export const ROUTE_PREFIX = '/tmeet/api'

export interface RouteDeps {
  ctx: Context
  getConfig: () => { binary: string; timeoutMs: number; expectedVersion: string }
}

/* ── 复盘洞察：本机参与度（只读本地，不打腾讯接口）── */

function localParticipation(id: string): ReturnType<typeof analyzeParticipation> {
  const st = readStore()
  const pasted = getPasted(id, 'transcript')
  const view = (diskPeekView(`${id}:transcript`) ?? {}) as { chunks?: Array<{ text: string; speaker?: string }> }
  const chunks = pasted ? [{ text: pasted.text }] : Array.isArray(view.chunks) ? view.chunks : []
  const roster = (st.localParticipants[`people:${id}`] ?? []).map((n) => ({
    key: `local:${n}`,
    nickname: n,
    fromLocal: true
  }))
  return analyzeParticipation(chunks, roster)
}

/** 规则层算好的贡献段落：数字必须准，所以不让模型算，直接拼到报告末尾 */
function participationSection(p: ReturnType<typeof localParticipation>): string {
  if (!p.totalChunks) return ''
  const lines = ['', '## 参与者贡献（本机统计，非模型推断）', '']
  if (p.rosterMissing) {
    lines.push('说明：本机没有参会人名单，只能按逐字稿里出现的发言人统计；名单缺失不影响发言分布。', '')
  }
  for (const r of p.rows) {
    lines.push(`- ${r.speaker}：${r.chunks} 段 · ${r.chars} 字 · 占比 ${Math.round(r.share * 100)}%`)
  }
  if (p.silent.length) lines.push('', `名单内未发声：${p.silent.join('、')}`)
  return lines.join('\n')
}

/* ── 后台生成：点一下就走，结果稍后落盘 ── */

interface GenerationTask {
  meetingId: string
  kind: OutputKind
  status: 'running' | 'done' | 'error'
  message: string
  at: number
  ctrl: AbortController
}

/**
 * 真正跑一次生成（素材 → 模型 → 落盘）。
 * 与 HTTP 请求解耦：调用方不 await，进度写进 task，结果写进 store。
 * 关面板、断网都不影响它继续跑；取消走 task.ctrl。
 */
async function runGenerate(
  deps: RouteDeps,
  id: string,
  kind: OutputKind,
  review: outputs.ReviewContext | undefined,
  task: GenerationTask
): Promise<void> {
  const { ctx } = deps
  const cfg = deps.getConfig()
  try {
    // 会议信息本地优先：快照里有就用快照，尽量不打腾讯接口（生成类操作最容易烧额度）
    const st = readStore()
    const brief = [...st.snapshot.upcoming, ...st.snapshot.history].find((m) => m.meetingId === id)
    // 素材优先级：用户粘的（他确认过的原文）> 本机磁盘缓存 > 云逐字稿 > 腾讯纪要
    let materialText = ''
    let source: 'transcript' | 'minutes' = 'transcript'
    const manual = pastedAsText(id)
    if (manual.transcript) {
      materialText = manual.transcript
      source = 'transcript'
    } else if (manual.minutes) {
      materialText = manual.minutes
      source = 'minutes'
    } else if (manual.todos) {
      // 连逐字稿、纪要都没有时，用户粘的待办也能撑起一份产出
      materialText = manual.todos
      source = 'minutes'
    }
    if (!materialText) {
      const cachedTx = diskPeekView(`${id}:transcript`) as { plain?: string } | null
      if (cachedTx?.plain) {
        materialText = cachedTx.plain
        source = 'transcript'
      }
    }
    if (!materialText) {
      const tx = await records.content({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id, kind: 'transcript' })
      if (tx.ok && tx.view && !tx.view.empty) {
        materialText = tx.view.plain
        source = 'transcript'
      } else {
        const mn = await records.content({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id, kind: 'minutes' })
        if (mn.ok && mn.view && !mn.view.empty) {
          materialText = mn.view.plain
          source = 'minutes'
        }
      }
    }
    if (!materialText.trim()) {
      task.status = 'error'
      task.message = '这场会没有可用的素材。它可能是别人开的会（拿不到录制与转写）——可以在「逐字稿」页签粘贴一份原文，再回来生成。'
      return
    }
    let subject = brief?.subject ?? ''
    let people = (st.localParticipants[`people:${id}`] ?? []).slice(0, 20)
    let timeRange = brief ? `${brief.startTime} – ${brief.endTime}` : ''
    if (!subject) {
      const detail = await meetings.detail({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id })
      if (!detail.ok || !detail.detail) {
        task.status = 'error'
        task.message = detail.error?.message ?? '取不到会议信息'
        return
      }
      subject = detail.detail.brief.subject
      timeRange = `${detail.detail.brief.startTime} – ${detail.detail.brief.endTime}`
      people = detail.detail.invitees.map((x) => x.nickname || x.openId).slice(0, 20)
    }
    const prefs = readPrefs()
    const material = outputs.trimMaterial(materialText, source)
    if (manual.transcript || manual.minutes) {
      material.providedByUser = true
      const src = manual.transcript ? getPasted(id, 'transcript') : getPasted(id, 'minutes')
      material.providedSource = src?.source
    }
    const r = await outputs.generateOutput({
      ctx,
      meetingId: id,
      kind,
      meeting: { subject, timeRange, participants: people },
      material,
      ref: { provider: prefs.provider, model: prefs.model },
      agentPreset: prefs.agentPreset,
      review,
      signal: task.ctrl.signal
    })
    if (!r.ok) {
      task.status = 'error'
      task.message = r.message || '生成失败'
      return
    }
    // 复盘 / 洞察的参与者贡献用本机统计拼进去：数字必须准，不让模型算
    if ((kind === 'review' || kind === 'insight') && r.output) {
      const section = participationSection(localParticipation(id))
      if (section) r.output = { ...r.output, text: `${r.output.text}${section}` }
      // 参与度段落是生成之后才拼的，必须回写，否则只在内存里、重启就丢
      writeStore((d) => {
        d.outputs[`${id}:${kind}`] = r.output!
      })
    }
    task.status = 'done'
    task.message = r.message || '已生成'
  } catch (e) {
    task.status = 'error'
    task.message = task.ctrl.signal.aborted ? '已取消生成。' : ((e as Error)?.message?.slice(0, 200) || '生成失败')
  } finally {
    task.at = Date.now()
  }
}

/* ── 基础工具 ── */
const MAX_BODY = 256 * 1024

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    size += buf.length
    if (size > MAX_BODY) throw new Error('too-large')
    chunks.push(buf)
  }
  if (!chunks.length) return {}
  const text = Buffer.concat(chunks).toString('utf8').trim()
  if (!text) return {}
  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    throw new Error('bad-json')
  }
}

function send(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(text)
  })
  res.end(text)
}

function fail(res: ServerResponse, status: number, error: string, code: string): void {
  send(res, status, { error, code })
}

function query(url: string): Record<string, string> {
  const i = url.indexOf('?')
  if (i < 0) return {}
  const out: Record<string, string> = {}
  for (const part of url.slice(i + 1).split('&')) {
    if (!part) continue
    const [k, v = ''] = part.split('=')
    out[decodeURIComponent(k)] = decodeURIComponent(v)
  }
  return out
}

/* ── 安装进度（内存态，不落盘） ── */

let installState: { installing: boolean; lastMessage: string } = { installing: false, lastMessage: '' }

export function installStatus(): { installing: boolean; lastMessage: string } {
  return { ...installState }
}

/* ── 最新版本探测（只读，失败静默） ── */

/**
 * 查 npm 上 @tencentcloud/tmeet 的最新版本，用于设置页提示「可升级」。
 * 内存缓存 10 分钟；查不到就返回 null，界面不显示升级入口——不打扰人。
 */
let latestCache: { at: number; version: string | null } = { at: 0, version: null }
async function fetchLatestCliVersion(): Promise<string | null> {
  if (Date.now() - latestCache.at < 10 * 60_000) return latestCache.version
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 5000)
  try {
    const res = await fetch('https://registry.npmjs.org/@tencentcloud/tmeet/latest', {
      signal: ctrl.signal,
      headers: { accept: 'application/json' }
    })
    if (!res.ok) throw new Error(`http ${res.status}`)
    const data = (await res.json()) as { version?: unknown }
    const version = typeof data.version === 'string' && data.version.trim() ? data.version.trim() : null
    latestCache = { at: Date.now(), version }
    return version
  } catch {
    // 没网、被墙、限流：沿用上次结果，没有就当作没有新版
    return latestCache.version
  } finally {
    clearTimeout(timer)
  }
}

async function doInstall(version?: string): Promise<{ ok: boolean; message: string }> {
  if (installState.installing) return { ok: false, message: '已经在装了，请稍等。' }
  installState = { installing: true, lastMessage: '正在安装会议组件…' }
  try {
    const r = await runInstall(version)
    installState = { installing: false, lastMessage: r.message }
    return { ok: r.ok, message: r.message }
  } catch (e) {
    const message = `安装失败：${(e as Error)?.message ?? String(e)}`
    installState = { installing: false, lastMessage: message }
    return { ok: false, message }
  }
}

/* ── 主注册 ── */

export function registerRoutes(deps: RouteDeps): () => void {
  const { ctx } = deps
  const webServer = (ctx as any).get?.('webServer') as any
  if (!webServer || typeof webServer.register !== 'function') {
    console.warn('[tmeet] 没有 webServer，面板数据通道不可用')
    return () => {}
  }
  const connection = (ctx as any).get?.('connection') as any

  // 后台生成任务：键为 `${meetingId}:${kind}`。
  // 存在路由进程里，关面板/断网都不影响它跑完；客户端靠状态接口轮询。
  const generationTasks = new Map<string, GenerationTask>()
  const generationKey = (meetingId: string, kind: OutputKind): string => `${meetingId}:${kind}`
  const taskView = (t: GenerationTask): { kind: OutputKind; status: string; message: string; at: number } => ({
    kind: t.kind,
    status: t.status,
    message: t.message,
    at: t.at
  })

  // 实时事件依赖：ctx 每次取配置，广播只发 meetingId + 事件类型（不含个人信息）
  const eventDeps: EventDeps = {
    ctx: { binary: deps.getConfig().binary, timeoutMs: deps.getConfig().timeoutMs },
    broadcast: () => {
      /* 实际广播由 events.ts 的 listeners 承担；这里留空避免重复 */
    }
  }
  // ctx.binary 会在运行中变化（用户改了配置），每次事件回读时重取
  const refreshCtx = (): void => {
    eventDeps.ctx = { binary: deps.getConfig().binary, timeoutMs: deps.getConfig().timeoutMs }
  }

  const handler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    // 鉴权：与宿主自带 /api 同一条围栏
    if (connection && typeof connection.requestRejection === 'function') {
      try {
        const rejection = connection.requestRejection({ headers: req.headers as any })
        if (rejection === 401 || rejection === 403) {
          fail(res, rejection, rejection === 401 ? '未登录或凭据无效。' : '没有访问权限。', 'unauthorized')
          return
        }
      } catch {
        fail(res, 401, '请求校验失败。', 'unauthorized')
        return
      }
    }

    const url = req.url || ''
    const path = url.split('?')[0].replace(ROUTE_PREFIX, '') || '/'
    const q = query(url)
    const method = (req.method || 'GET').toUpperCase()
    const cfg = deps.getConfig()

    // ── 实时事件流（SSE）：必须在任何 JSON 处理之前接管，且不能 end ──
    if (method === 'GET' && path === '/events/stream') {
      refreshCtx()
      startEventConsumers(eventDeps)
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        'x-accel-buffering': 'no'
      })
      res.write(`event: hello\ndata: ${JSON.stringify({ at: new Date().toISOString(), degraded: isDegraded() })}\n\n`)
      const unsubscribe = subscribeEvents((e) => {
        res.write(`event: ${e.eventKey || 'message'}\ndata: ${JSON.stringify(e)}\n\n`)
      })
      // 心跳：避免代理与浏览器因空闲断开
      const beat = setInterval(() => {
        try {
          res.write(`: keep-alive ${Date.now()}\n\n`)
        } catch {
          /* 连接已断 */
        }
      }, 25_000)
      beat.unref?.()
      req.on('close', () => {
        clearInterval(beat)
        unsubscribe()
      })
      return
    }

    // ── 客户端渲染错误上报（诊断用，写到插件数据目录） ──
    if (method === 'POST' && path === '/debug/error') {
      const body = await readJson(req)
      try {
        const dir = nodePath.join(process.env.DSH_HOME || process.cwd(), 'plugin-data', 'dsh-tencent-meeting')
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(nodePath.join(dir, 'client-error.json'), JSON.stringify(body, null, 2), 'utf8')
      } catch {
        /* 写不了也不影响 */
      }
      send(res, 200, { ok: true })
      return
    }

    // ── 实时同步状态（是否在跑 / 是否降级） ──
    if (method === 'GET' && path === '/events/status') {
      send(res, 200, eventStatus())
      return
    }

    // ── 手动回读一场会议（用户点「刷新状态」） ──
    if (method === 'POST' && path === '/events/refresh') {
      const body = await readJson(req)
      const id = String(body.id || '')
      if (!id) {
        fail(res, 400, '要传会议 id。', 'invalid-args')
        return
      }
      const states = await refreshMeeting(eventDeps, id)
      send(res, states ? 200 : 400, states ? { states } : { error: '回读失败，稍后再试。', code: 'unknown' })
      return
    }

    try {
      // ── 状态 ──
      if (method === 'GET' && path === '/status') {
        const status = await readStatus({ binary: cfg.binary, expectedVersion: cfg.expectedVersion, timeoutMs: cfg.timeoutMs })
        send(res, 200, { ...status, installing: installState.installing } satisfies PluginStatus & { installing: boolean })
        return
      }

      if (method === 'GET' && path === '/setup/cli-version') {
        send(res, 200, { latest: await fetchLatestCliVersion(), at: Date.now() })
        return
      }

      // ── 安装 ──
      if (method === 'GET' && path === '/setup/install-status') {
        send(res, 200, installStatus())
        return
      }
      if (method === 'POST' && path === '/setup/install') {
        const body = await readJson(req)
        if (body.confirm !== true) {
          fail(res, 400, '安装需要在界面上点一次确认。', 'confirm-required')
          return
        }
        const wanted = typeof body.version === 'string' && body.version.trim() ? body.version.trim() : undefined
        const r = await doInstall(wanted)
        send(res, r.ok ? 200 : 500, r)
        return
      }

      if (method === 'POST' && path === '/auth/cancel') {
        send(res, 200, cancelLogin())
        return
      }

      // ── 授权 ──
      if (method === 'POST' && path === '/auth/start') {
        const body = await readJson(req)
        const switching = body.switchAccount === true
        if (switching) {
          // 换号必须先退出：已登录状态下 auth login 会被 CLI 直接拒
          await logout({ binary: cfg.binary, timeoutMs: cfg.timeoutMs, confirm: true })
        }
        const r = startLogin({ binary: cfg.binary, switchAccount: switching, timeoutMs: cfg.timeoutMs })
        send(res, r.ok ? 200 : 500, r)
        return
      }
      if (method === 'GET' && path === '/auth/poll') {
        const p = await pollLogin({ binary: cfg.binary, timeoutMs: cfg.timeoutMs })
        let status: PluginStatus | null = null
        if (p.state === 'done') {
          status = await readStatus({ binary: cfg.binary, expectedVersion: cfg.expectedVersion, timeoutMs: cfg.timeoutMs })
        }
        send(res, 200, {
          state: p.state,
          url: p.url,
          reason: p.reason,
          waitedMs: p.waitedMs,
          authState: status?.state ?? '',
          account: status?.account ?? ''
        })
        return
      }
      if (method === 'POST' && path === '/auth/logout') {
        const body = await readJson(req)
        const r = await logout({ binary: cfg.binary, timeoutMs: cfg.timeoutMs, confirm: body.confirm === true })
        const purge = body.purgeLocal === true
        if (r.ok && purge) {
          const cleared = purgeAccount()
          send(res, 200, { ...r, purged: cleared })
          return
        }
        // 退出失败是「业务结果」，不是 HTTP 错误：一律 200，把原因原样带回界面，
        // 否则客户端只能显示「请求失败（HTTP 400）」，用户看不到为什么。
        send(res, 200, r.ok ? r : { ...r, error: r.message, code: 'logout-failed' })
        return
      }

      // ── 今日接口用量（本地闸门） ──
      if (method === 'GET' && path === '/quota') {
        send(res, 200, { ...readQuota(getDailyBudget()), budget: getDailyBudget() })
        return
      }
      if (method === 'POST' && path === '/quota/reset') {
        send(res, 200, resetQuota(getDailyBudget()))
        return
      }

      // ── 会议列表 ──
      if (method === 'GET' && path === '/meetings') {
        const store = readStore()
        const scope = q.scope === 'ended' ? 'ended' : 'upcoming'
        // 首屏要「立刻出现」：普通加载先回本机快照，后台再刷新，绝不阻塞用户。
        // 用户手动同步（refresh=1）才走真实接口。
        if (q.refresh !== '1') {
          const snap = store.snapshot
          const list = scope === 'ended' ? snap.history : snap.upcoming
          const limit = Number(q.limit) || (scope === 'ended' ? 30 : 20)
          const onlyTx = q.onlyTranscript === '1'
          const visible = onlyTx ? list.filter((m) => m.hasTranscript) : list
          send(res, 200, {
            auth: 'unknown',
            meetings: visible.slice(0, limit),
            syncedAt: (store as any).syncedAt ?? null,
            hasMore: false,
            partial: false
          } satisfies MeetingListPayload)
          // 后台刷新：写回快照，下次进来就是新的（用户无感知）
          void meetings
            .list(
              { binary: cfg.binary, timeoutMs: cfg.timeoutMs },
              { scope, limit, onlyTranscript: onlyTx || undefined, refresh: false }
            )
            .then((p) => {
              if (p?.meetings?.length) {
                writeStore((s) => {
                  if (scope === 'ended') s.snapshot.history = p.meetings as typeof s.snapshot.history
                  else s.snapshot.upcoming = p.meetings as typeof s.snapshot.upcoming
                  ;(s as any).syncedAt = p.syncedAt ?? (s as any).syncedAt
                })
              }
            })
            .catch(() => {
              /* 后台刷新失败不影响已显示的内容 */
            })
          return
        }
        const payload = await meetings.list(
          { binary: cfg.binary, timeoutMs: cfg.timeoutMs },
          {
            scope,
            limit: Number(q.limit) || (scope === 'ended' ? 30 : 20),
            cursor: q.cursor || undefined,
            query: q.q || undefined,
            onlyTranscript: q.onlyTranscript === '1',
            refresh: true,
            before: q.before || undefined
          }
        )
        send(res, 200, payload satisfies MeetingListPayload)
        return
      }

      // ── 会议详情 ──
      // 额度纪律：详情只回读一次 meeting get，不隐式打受邀人接口。
      if (method === 'GET' && path === '/meeting') {
        const id = q.id || ''
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        const r = await meetings.detail({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id })
        if (!r.ok || !r.detail) {
          const code = r.error?.code ?? 'unknown'
          const status = code === 'not-logged-in' || code === 'expired' ? 401 : 400
          // 额度用尽时降级读本地快照，别让整页白屏
          if (code === 'rate-limited') {
            const snap = readStore().snapshot
            const cached = [...snap.upcoming, ...snap.history].find((m) => m.meetingId === id)
            if (cached) {
              send(res, 200, {
                brief: cached,
                settings: {
                  autoRecordType: null,
                  autoAsr: null,
                  passwordRequired: null,
                  joinType: null,
                  waitingRoom: null,
                  overridden: false,
                  overriddenFields: []
                },
                invitees: [],
                warning: '组件今天的调用次数用完了，这里显示的是本机上次同步的快照。'
              })
              return
            }
          }
          fail(res, status, r.error?.message ?? '取不到会议详情', code)
          return
        }
        send(res, 200, r.detail)
        return
      }

      // ── 建会（两阶段） ──
      if (method === 'POST' && path === '/meeting/create') {
        const body = await readJson(req)
        const form = body.form as meetings.CreateForm | undefined
        if (!form) {
          fail(res, 400, '缺少表单内容。', 'invalid-args')
          return
        }
        if (body.confirm !== true) {
          const preview = meetings.previewCreate(form)
          if (!preview.ok) {
            fail(res, 400, preview.error || '参数不对', 'invalid-args')
            return
          }
          send(res, 200, { stage: 'preview', fields: preview.fields, text: preview.text })
          return
        }
        const r = await meetings.create({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, form)
        if (!r.ok) {
          fail(res, 400, r.error?.message ?? '建会失败', r.error?.code ?? 'unknown')
          return
        }
        emitLocal(String(r.meeting?.meetingId ?? ''), 'meeting.created')
        send(res, 200, { stage: 'created', meeting: r.meeting, detail: r.detail, message: r.message, overridden: r.overridden })
        return
      }

      // ── 改会（两阶段） ──
      if (method === 'POST' && path === '/meeting/update') {
        const body = await readJson(req)
        const id = String(body.id || '')
        const patch = (body.patch ?? {}) as meetings.UpdatePatch
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        if (body.confirm !== true) {
          const before = await meetings.detail({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id })
          if (!before.ok || !before.detail) {
            fail(res, 400, before.error?.message ?? '取不到当前设置', before.error?.code ?? 'unknown')
            return
          }
          const preview = meetings.previewUpdate(before.detail, patch)
          send(res, 200, { stage: 'preview', fields: preview.fields, text: preview.text })
          return
        }
        const r = await meetings.update({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id, patch })
        if (!r.ok) {
          fail(res, 400, r.error?.message ?? '修改失败', r.error?.code ?? 'unknown')
          return
        }
        emitLocal(id, 'meeting.updated')
        send(res, 200, { stage: 'updated', meeting: r.meeting, detail: r.detail, message: r.message, overridden: r.overridden })
        return
      }

      // ── 修改标题：已结束的会只改本机，未结束的同步腾讯 ──
      if (method === 'POST' && path === '/meeting/subject') {
        const body = await readJson(req)
        const id = String(body.id || '')
        const subject = String(body.subject || '').trim()
        if (!id || !subject) {
          fail(res, 400, '要传会议 id 与标题。', 'invalid-args')
          return
        }
        const st = readStore()
        const inHistory = st.snapshot.history.some((m) => m.meetingId === id)
        const inUpcoming = st.snapshot.upcoming.some((m) => m.meetingId === id)
        if (!inHistory && !inUpcoming) {
          fail(res, 400, '本机没找到这场会。', 'not-found')
          return
        }
        if (inHistory) {
          // 历史会议：只改本机快照
          writeStore((d) => {
            for (const m of d.snapshot.history) if (m.meetingId === id) m.subject = subject
          })
          send(res, 200, { mode: 'local' })
          return
        }
        // 即将开始/进行中：同步腾讯
        const r = await meetings.update({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id, patch: { subject } })
        if (!r.ok) {
          fail(res, 400, r.error?.message ?? '修改失败', r.error?.code ?? 'unknown')
          return
        }
        emitLocal(id, 'meeting.updated')
        send(res, 200, { mode: 'cloud', message: r.message })
        return
      }

      // ── 取消（两阶段） ──
      if (method === 'POST' && path === '/meeting/cancel') {
        const body = await readJson(req)
        const id = String(body.id || '')
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        if (body.confirm !== true) {
          send(res, 200, { stage: 'preview', text: '确认要取消这场会议吗？取消后参与者会收到通知，且不可恢复。' })
          return
        }
        const r = await meetings.cancel({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id })
        if (!r.ok) {
          fail(res, 400, r.error?.message ?? '取消失败', r.error?.code ?? 'unknown')
          return
        }
        emitLocal(id, 'meeting.canceled')
        send(res, 200, { stage: 'canceled', message: r.message })
        return
      }

      // ── 受邀人 ──
      if (method === 'GET' && path === '/meeting/invitees') {
        const id = q.id || ''
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        const r = await meetings.invitees({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, id)
        if (!r.ok) {
          const code = r.error?.code ?? 'unknown'
          if (code === 'rate-limited') {
            send(res, 200, { invitees: [], warning: '组件今天的调用次数用完了，受邀人列表明天再试。' })
            return
          }
          fail(res, 400, r.error?.message ?? '取不到受邀人', code)
          return
        }
        send(res, 200, { invitees: r.invitees })
        return
      }
      if (method === 'POST' && path === '/meeting/invitees') {
        const body = await readJson(req)
        if (body.confirm !== true) {
          fail(res, 400, '改受邀人需要在界面上确认一次。', 'confirm-required')
          return
        }
        const action = String(body.action || 'add') as 'add' | 'remove' | 'replace'
        const r = await meetings.mutate(
          { binary: cfg.binary, timeoutMs: cfg.timeoutMs },
          { meetingId: String(body.id || ''), action, openIds: Array.isArray(body.openIds) ? body.openIds.map(String) : [] }
        )
        if (!r.ok) {
          fail(res, 400, r.error?.message ?? '操作失败', r.error?.code ?? 'unknown')
          return
        }
        send(res, 200, { ok: true })
        return
      }

      // ── 参会人 ──
      if (method === 'GET' && path === '/meeting/participants') {
        const id = q.id || ''
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        const r = await participants.listParticipants(
          { binary: cfg.binary, timeoutMs: cfg.timeoutMs },
          { meetingId: id }
        )
        send(res, 200, { rows: r.rows, warning: r.warning })
        return
      }
      if (method === 'POST' && path === '/meeting/participants') {
        const body = await readJson(req)
        const id = String(body.id || '')
        const action = body.action === 'remove' ? 'remove' : 'add'
        const names = Array.isArray(body.names) ? body.names.map(String) : []
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        const r = participants.mutateLocal({ meetingId: id, action, names })
        if (!r.ok) {
          fail(res, 400, r.error || '操作失败', 'invalid-args')
          return
        }
        // 变更后回读完整名单，避免界面只看到本地那几条
        const full = await participants.listParticipants({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id })
        send(res, 200, { rows: full.rows, warning: full.warning })
        return
      }
      if (method === 'POST' && path === '/meeting/participants/recognize') {
        const body = await readJson(req)
        const id = String(body.id || '')
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        const prefs = readPrefs()
        const ref: ModelRef = { provider: prefs.provider, model: prefs.model }
        const r = await participants.recognizeParticipants(
          {
            binary: cfg.binary,
            timeoutMs: cfg.timeoutMs,
            readTranscript: async (meetingId: string) => {
              const c = await records.content(
                { binary: cfg.binary, timeoutMs: cfg.timeoutMs },
                { meetingId, kind: 'transcript' }
              )
              return c.ok && c.view ? c.view.plain : ''
            },
            recognize: async (transcript: string, known: string[]) => {
              const { generate } = await import('./services/agent-run.js')
              const res0 = await generate(ctx, {
                ref,
                agentPreset: prefs.agentPreset,
                system: '你只输出 JSON 数组，不要写解释。',
                prompt: [
                  '下面是一场腾讯会议的逐字稿。请找出里面真实出现的发言人，并给每个人一句他在这场会的核心观点（≤60 字）。',
                  known.length ? `已知名单：${known.join('、')}` : '已知名单：无',
                  '输出格式：[{"name":"姓名","view":"观点"}]，最多 20 条。没认出来就输出 []。',
                  '逐字稿：',
                  transcript.slice(0, 40000)
                ].join('\n'),
                maxTokens: 2000
              })
              if (!res0.ok) return []
              const json = /\[[\s\S]*\]/.exec(res0.text)?.[0] ?? '[]'
              try {
                const arr = JSON.parse(json)
                return Array.isArray(arr)
                  ? arr
                      .map((x: any) => ({ name: String(x?.name ?? '').trim(), view: String(x?.view ?? '').trim().slice(0, 60) }))
                      .filter((x) => x.name)
                  : []
              } catch {
                return []
              }
            }
          },
          { meetingId: id }
        )
        send(res, 200, { rows: r.rows, added: r.added, matched: r.matched, message: r.message })
        return
      }

      // ── 派生状态 ──
      if (method === 'GET' && path === '/meeting/states') {
        const id = q.id || ''
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        // 本地信号：0 次 CLI 调用，打开详情页即可渲染
        const detail = await meetings.detail({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id })
        if (!detail.ok || !detail.detail) {
          send(res, 200, emptyStates())
          return
        }
        const store = readStore()
        const endedAt = Date.parse(detail.detail.brief.endTime || '')
        const ended = Number.isNaN(endedAt) ? true : endedAt <= Date.now()
        const local = localContentSignals({
          records: detail.detail.brief.records as unknown as Array<Record<string, unknown>>,
          content: {
            transcript: { empty: !detail.detail.brief.hasTranscript },
            timeline: { empty: !store.contentIndex[`${id}:timeline`] },
            minutes: { empty: !store.contentIndex[`${id}:minutes`] }
          },
          ended,
          autoRecordType: detail.detail.settings.autoRecordType ?? undefined,
          autoAsr: detail.detail.settings.autoAsr ?? undefined
        })
        local.gen = genOf(id)
        const states = deriveContentStates(mergeLocalReady(local, id))
        send(res, 200, states)
        return
      }

      // ── 正文 ──
      if (method === 'GET' && path === '/meeting/content') {
        const id = q.id || ''
        const kind = (q.kind || 'transcript') as records.ContentKind
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        // 用户自己粘过的素材优先：那是他确认过的原文，比远端空结果有用
        const manual = PASTED_KINDS.includes(kind as any) ? getPasted(id, kind as any) : null
        if (manual && q.prefer !== 'cloud') {
          send(res, 200, {
            kind,
            source: 'pasted',
            pastedAt: manual.at,
            pastedSource: manual.source,
            chars: manual.chars,
            chunks: [{ speaker: '', time: '', text: manual.text }],
            empty: false,
            fetchedAt: manual.at
          })
          return
        }
        const r = await records.content({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id, kind, force: q.force === '1' })
        if (!r.ok || !r.view) {
          fail(res, 400, r.error?.message ?? '取不到内容', r.error?.code ?? 'unknown')
          return
        }
        send(res, 200, { ...r.view, source: 'cloud' })
        return
      }

      // ── 素材补录：用户自己粘的逐字稿 / 纪要 ──
      if (method === 'GET' && path === '/meeting/pasted') {
        const id = q.id || ''
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        send(res, 200, { items: listPasted(id) })
        return
      }
      if (method === 'POST' && path === '/meeting/pasted') {
        const body = await readJson(req)
        const id = String(body.id || '')
        const kind = String(body.kind || 'transcript') as PastedKind
        if (!id || !PASTED_KINDS.includes(kind)) {
          fail(res, 400, '要传会议 id 与素材类型（逐字稿/纪要/待办）。', 'invalid-args')
          return
        }
        const r = savePasted({
          meetingId: id,
          kind,
          text: String(body.text || ''),
          source: String(body.source || ''),
          overwrite: body.overwrite === true
        })
        send(res, r.ok ? 200 : 409, r)
        return
      }
      if (method === 'POST' && path === '/meeting/pasted/delete') {
        const body = await readJson(req)
        send(res, 200, deletePasted(String(body.id || ''), String(body.kind || 'transcript') as PastedKind))
        return
      }

      // ── 回放 ──
      if (method === 'POST' && path === '/meeting/replay') {
        const body = await readJson(req)
        const id = String(body.id || '')
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        const r = await records.replayAddress({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id })
        // 地址不落日志、不进历史；界面拿到后自己开浏览器
        send(res, r.ok ? 200 : 400, { opened: r.ok, url: r.ok ? r.url : null, message: r.message })
        return
      }

      // ── 权限申请 ──
      if (method === 'POST' && path === '/meeting/permission') {
        const body = await readJson(req)
        if (body.confirm !== true) {
          fail(res, 400, '提交申请需要在界面上确认一次。', 'confirm-required')
          return
        }
        const recordId = String(body.meetingRecordId || '')
        const commit = body.commit === true
        if (!recordId) {
          fail(res, 400, '缺少录制条目 id。', 'invalid-args')
          return
        }
        const r = await records.applyPermission({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingRecordId: recordId, commit })
        send(res, r.ok ? 200 : 400, r)
        return
      }

      // ── 复盘洞察：类型判定 + 贡献分析（只读本地，不打腾讯接口）──
      if (method === 'GET' && path === '/meeting/review-plan') {
        const id = q.id || ''
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        const st = readStore()
        const brief = [...st.snapshot.upcoming, ...st.snapshot.history].find((m) => m.meetingId === id)
        const pasted = PASTED_KINDS.map((k) => getPasted(id, k)).find((m) => m)
        const cloudChars = diskPeekChars(`${id}:transcript`) ?? 0
        const hasCloud = Boolean(st.contentIndex[`${id}:transcript`]) || brief?.hasTranscript === true
        const localPeople = (st.localParticipants[`people:${id}`] ?? []).length
        const plan = planReview({
          subject: String(q.subject ?? brief?.subject ?? ''),
          materialHead: '',
          hasTranscript: hasCloud || Boolean(pasted),
          transcriptChars: pasted ? pasted.chars : cloudChars,
          hasMinutes: Boolean(st.contentIndex[`${id}:minutes`]),
          participantCount: localPeople,
          hasTimeline: Boolean(st.contentIndex[`${id}:timeline`]),
          durationMin: brief
            ? Math.max(0, Math.round((Date.parse(brief.endTime) - Date.parse(brief.startTime)) / 60000))
            : undefined,
          providedByUser: Boolean(pasted),
          providedSource: pasted?.source
        })
        // 判定权在人：允许改选类型；改选后框架跟着换，完整度仍按真实素材算
        const chosen = String(q.type ?? plan.type)
        const def = typeById(chosen)
        send(res, 200, {
          ...plan,
          type: def.id,
          typeName: def.name,
          frame: def.frame,
          insight: def.insight,
          types: REVIEW_TYPES.map((t) => ({ id: t.id, name: t.name }))
        })
        return
      }
      if (method === 'GET' && path === '/meeting/participation') {
        const id = q.id || ''
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        send(res, 200, localParticipation(id))
        return
      }

      // ── 会后产出 ──
      if (method === 'GET' && path === '/meeting/outputs') {
        const id = q.id || ''
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        send(res, 200, outputs.listOutputs(id))
        return
      }
      if (method === 'GET' && path === '/meeting/output-status') {
        const id = q.id || ''
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        const tasks = [...generationTasks.values()]
          .filter((t) => t.meetingId === id)
          .map(taskView)
        send(res, 200, { tasks })
        return
      }
      if (method === 'POST' && path === '/meeting/output') {
        const body = await readJson(req)
        const id = String(body.id || '')
        const kind = String(body.kind || '') as OutputKind
        const action = body.action === 'delete' ? 'delete' : body.action === 'cancel' ? 'cancel' : 'generate'
        if (!id || !OUTPUT_KINDS.includes(kind)) {
          fail(res, 400, '会议 id 或产出类型不对。', 'invalid-args')
          return
        }
        if (action === 'delete') {
          const ok = outputs.deleteOutput(id, kind)
          send(res, ok ? 200 : 404, ok ? { deleted: true } : { error: '这份产出不存在。', code: 'not-found' })
          return
        }
        if (action === 'cancel') {
          const t = generationTasks.get(generationKey(id, kind))
          const ok = Boolean(t && t.status === 'running' && (t.ctrl.abort(), true))
          send(res, 200, { cancelled: ok })
          return
        }

        // 清掉半小时前的旧任务，别让内存一直涨
        for (const [k, t] of generationTasks) {
          if (t.status !== 'running' && Date.now() - t.at > 30 * 60_000) generationTasks.delete(k)
        }

        // 已经在跑就别再起一条：把当前状态返回，客户端接着轮询
        const running = generationTasks.get(generationKey(id, kind))
        if (running && running.status === 'running') {
          send(res, 200, { started: false, task: taskView(running) })
          return
        }

        // 复盘要先有判定：规则层只读本地（不打腾讯接口），判定权在用户——他可以在界面改选类型
        const st = readStore()
        const brief = [...st.snapshot.upcoming, ...st.snapshot.history].find((m) => m.meetingId === id)
        let review: outputs.ReviewContext | undefined
        if (kind === 'review') {
          const pasted = PASTED_KINDS.map((k) => getPasted(id, k)).find((m) => m)
          const cloudChars = diskPeekChars(`${id}:transcript`) ?? 0
          const hasCloud = Boolean(st.contentIndex[`${id}:transcript`]) || brief?.hasTranscript === true
          const plan = planReview({
            subject: brief?.subject ?? '',
            materialHead: '',
            hasTranscript: hasCloud || Boolean(pasted),
            transcriptChars: pasted ? pasted.chars : cloudChars,
            hasMinutes: Boolean(st.contentIndex[`${id}:minutes`]),
            participantCount: (st.localParticipants[`people:${id}`] ?? []).length,
            hasTimeline: Boolean(st.contentIndex[`${id}:timeline`]),
            durationMin: brief
              ? Math.max(0, Math.round((Date.parse(brief.endTime) - Date.parse(brief.startTime)) / 60000))
              : undefined,
            providedByUser: Boolean(pasted),
            providedSource: pasted?.source
          })
          const def = typeById(String(body.type ?? plan.type))
          review = {
            type: def.id,
            typeName: def.name,
            frame: def.frame,
            insight: def.insight,
            degraded: plan.degraded,
            available: plan.available,
            missing: plan.missing
          }
        }

        // 后台跑：立刻返回，客户端轮询状态；关面板不影响
        const task: GenerationTask = {
          meetingId: id,
          kind,
          status: 'running',
          message: '正在生成',
          at: Date.now(),
          ctrl: new AbortController()
        }
        generationTasks.set(generationKey(id, kind), task)
        void runGenerate(deps, id, kind, review, task)
        send(res, 200, { started: true, task: taskView(task) })
        return
      }

      // ── AI 对话：准备这场会的会话，交给 DSH 自己的完整对话功能打开 ──
      if (method === 'POST' && path === '/meeting/chat-session') {
        const body = await readJson(req)
        const id = String(body.id || '')
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        try {
          const st = readStore()
          const brief = [...st.snapshot.upcoming, ...st.snapshot.history].find((m) => m.meetingId === id)
          const r = await prepareChatSession(ctx, {
            meetingId: id,
            subject: brief?.subject || '未命名会议',
            timeRange: brief ? `${brief.startTime} – ${brief.endTime}` : undefined,
            meetingCode: brief?.meetingCode
          })
          send(res, 200, r)
        } catch (e) {
          fail(res, 400, (e as Error)?.message || '开不了 AI 对话。', 'chat-session-failed')
        }
        return
      }

      // 会话打开后，把这场会的资料投进去。sessionId 由客户端 openWorkspace 的钩子给出；
      // 没有就退回按工作区根目录找最近会话（旧宿主）。
      if (method === 'POST' && path === '/meeting/chat-seed') {
        const body = await readJson(req)
        const id = String(body.id || '')
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        try {
          const r = await seedMeetingChat(ctx, id, body.sessionId ? String(body.sessionId) : undefined)
          send(res, 200, r)
        } catch (e) {
          send(res, 200, { seeded: false, message: (e as Error)?.message || '投放失败' })
        }
        return
      }

      // ── 邀请文案 ──
      if (method === 'GET' && path === '/meeting/invite-text') {
        const id = q.id || ''
        if (!id) {
          fail(res, 400, '要传会议 id。', 'invalid-args')
          return
        }
        const detail = await meetings.detail({ binary: cfg.binary, timeoutMs: cfg.timeoutMs }, { meetingId: id })
        if (!detail.ok || !detail.detail) {
          fail(res, 400, detail.error?.message ?? '取不到会议信息', detail.error?.code ?? 'unknown')
          return
        }
        send(res, 200, { text: buildInviteText(detail.detail) })
        return
      }

      // ── 设置 ──
      if (method === 'GET' && path === '/settings') {
        send(res, 200, { prefs: toPrefsView(), catalog: await catalog(ctx) satisfies CatalogPayload })
        return
      }
      if (method === 'POST' && path === '/settings') {
        const body = await readJson(req)
        try {
          writePrefs({
            provider: typeof body.provider === 'string' ? body.provider : undefined,
            model: typeof body.model === 'string' ? body.model : undefined,
            agentPreset: typeof body.agentPreset === 'string' ? body.agentPreset : undefined,
            outputSkills: Array.isArray(body.outputSkills)
              ? (body.outputSkills as unknown[]).filter((k): k is OutputKind => OUTPUT_KINDS.includes(k as OutputKind))
              : undefined,
            notifyOnReady: typeof body.notifyOnReady === 'boolean' ? body.notifyOnReady : undefined,
            quotaStrict: typeof body.quotaStrict === 'boolean' ? body.quotaStrict : undefined
          })
        } catch (e) {
          fail(res, 500, (e as Error)?.message ?? '保存失败', 'save-failed')
          return
        }
        send(res, 200, { prefs: toPrefsView() })
        return
      }

      // ── 缓存清理 ──
      if (method === 'POST' && path === '/cache/clear') {
        const cleared = purgeAccount()
        send(res, 200, { cleared })
        return
      }

      fail(res, 404, '没有这个接口。', 'not-found')
    } catch (e) {
      const message = (e as Error)?.message ?? String(e)
      if (message === 'too-large') fail(res, 413, '请求内容过大。', 'too-large')
      else if (message === 'bad-json') fail(res, 400, '请求内容不是合法 JSON。', 'bad-json')
      else fail(res, 500, '服务内部错误，请稍后重试。', 'internal')
    }
  }

  const dispose = webServer.register({ kind: 'prefix', path: ROUTE_PREFIX, handler })
  return () => {
    disposeAuth()
    void stopEventConsumers()
    try {
      dispose?.()
    } catch {
      /* 已卸载 */
    }
  }
}

function toPrefsView(): PrefsView {
  const p = readPrefs()
  return {
    provider: p.provider,
    model: p.model,
    agentPreset: p.agentPreset,
    outputSkills: p.outputSkills,
    notifyOnReady: p.notifyOnReady,
    quotaStrict: p.quotaStrict
  }
}

function genOf(meetingId: string): ContentStates['gen'] {
  const list = outputs.listOutputs(meetingId)
  return {
    insight: list.insight ? 'done' : 'idle',
    company: list['minutes-company'] ? 'done' : 'idle',
    investor: list['minutes-investor'] ? 'done' : 'idle',
    review: list.review ? 'done' : 'idle',
    qa: list.qa ? 'done' : 'idle'
  }
}

/** 邀请文案：必须给绝对时间，不许「今天/明天」 */
export function buildInviteText(detail: { brief: { subject: string; startTime: string; endTime: string; meetingCode: string; joinUrl?: string } }): string {
  const b = detail.brief
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const lines = [
    `【会议邀请】${b.subject}`,
    `时间：${fmt(b.startTime)} — ${fmt(b.endTime)}`,
    `会议号：${b.meetingCode}`
  ]
  if (b.joinUrl) lines.push(`入会链接：${b.joinUrl}`)
  lines.push('', '（如需密码，请向主办方索取）')
  return lines.join('\n')
}

/** 供工具层复用的「会议 + 状态 + 产出」组合读取 */
export async function readMeetingBundle(deps: { binary: string; timeoutMs: number }, meetingId: string): Promise<{
  detail?: meetings.DetailResult['detail']
  states?: ContentStates
  outputs?: Partial<Record<OutputKind, unknown>>
  rows?: PersonRow[]
  error?: string
}> {
  const detail = await meetings.detail({ binary: deps.binary, timeoutMs: deps.timeoutMs }, { meetingId })
  if (!detail.ok || !detail.detail) return { error: detail.error?.message ?? '取不到会议详情' }
  const store = readStore()
  const endedAt = Date.parse(detail.detail.brief.endTime || '')
  const states = records.deriveStates({
    meetingId,
    records: detail.detail.brief.records as unknown as Array<Record<string, unknown>>,
    ended: Number.isNaN(endedAt) ? true : endedAt <= Date.now(),
    hasTranscript: detail.detail.brief.hasTranscript,
    hasTimeline: Boolean(store.contentIndex[`${meetingId}:timeline`]),
    hasMinutes: Boolean(store.contentIndex[`${meetingId}:minutes`]),
    gen: genOf(meetingId)
  })
  const people = await participants.listParticipants({ binary: deps.binary, timeoutMs: deps.timeoutMs }, { meetingId })
  return { detail: detail.detail, states, outputs: outputs.listOutputs(meetingId), rows: people.rows }
}



