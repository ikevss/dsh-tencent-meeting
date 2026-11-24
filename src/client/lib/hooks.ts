/**
 * 数据钩子：useAsync / useStatus / useMeetings。
 *
 * 为什么自己写而不是引第三方：宿主只提供 react 与 react-dom 两个模块，
 * 任何状态库都要打进包里；这里的需求只有「取一次 / 重取 / 轮询」，几十行就够。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MeetingListPayload, MeetingBrief, PluginStatus } from '../../shared/types'
import { isLive, isEnded } from '../../shared/types'
import * as api from './api'
import { errorText } from './api'

export interface AsyncState<T> {
  data: T | null
  error: string | null
  loading: boolean
  /** 手动重取；返回是否成功，调用方据此决定要不要弹提示 */
  reload: () => Promise<boolean>
}

/**
 * 取一次数据，并在 deps 变化时重取。
 * 失败不吞：错误文本留在 state 里，由界面负责显示。
 */
export function useAsync<T>(
  run: (signal: AbortSignal) => Promise<T>,
  deps: ReadonlyArray<unknown>,
  options: { enabled?: boolean } = {}
): AsyncState<T> {
  const enabled = options.enabled !== false
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(enabled)
  const [tick, setTick] = useState(0)
  const runRef = useRef(run)
  runRef.current = run

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    const ctrl = new AbortController()
    let alive = true
    setLoading(true)
    runRef
      .current(ctrl.signal)
      .then((value) => {
        if (!alive) return
        setData(value)
        setError(null)
      })
      .catch((e) => {
        if (!alive || (e as Error)?.name === 'AbortError') return
        setError(errorText(e))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
      ctrl.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled])

  const reload = useCallback(async (): Promise<boolean> => {
    setTick((n) => n + 1)
    return true
  }, [])

  return { data, error, loading, reload }
}

/* ── 状态 ── */

export interface StatusState {
  status: PluginStatus | null
  error: string | null
  loading: boolean
  refresh: () => Promise<void>
}

/**
 * 插件状态（CLI / 版本 / 登录）。
 * 刻意不轮询：状态检查要跑 CLI，轮询会把日调用额度吃光；改为显式刷新与授权轮询成功后刷新。
 */
export function useStatus(): StatusState {
  const [status, setStatus] = useState<PluginStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const aliveRef = useRef(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      // 兜底超时：状态探测只是跑一次 CLI，正常几百毫秒就回来。
      // 超过 25 秒还没回，说明请求卡住了（宿主服务忙/网络断了），
      // 与其让面板一直转圈，不如明确报错给「重试」——「一直加载」本身就是故障。
      const next = await api.getStatus(AbortSignal.timeout(25_000))
      if (!aliveRef.current) return
      setStatus(next)
      setError(null)
    } catch (e) {
      if (!aliveRef.current) return
      setError(errorText(e))
    } finally {
      if (aliveRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    aliveRef.current = true
    void refresh()
    return () => {
      aliveRef.current = false
    }
  }, [refresh])

  return { status, error, loading, refresh }
}

/* ── 会议列表 ── */

export interface MeetingsState {
  history: MeetingBrief[]
  upcoming: MeetingBrief[]
  live: MeetingBrief[]
  hasMore: boolean
  syncedAt: string | null
  loading: boolean
  loadingMore: boolean
  error: string | null
  /** 被 onlyTranscript 筛掉的数量，用于空态说清楚 */
  hiddenByFilter: number
  sync: () => Promise<void>
  loadEarlier: () => Promise<void>
  reload: () => Promise<void>
}

const HISTORY_LIMIT = 30

function split(meetings: MeetingBrief[]): { live: MeetingBrief[]; upcoming: MeetingBrief[]; ended: MeetingBrief[] } {
  const live: MeetingBrief[] = []
  const upcoming: MeetingBrief[] = []
  const ended: MeetingBrief[] = []
  const now = Date.now()
  for (const m of meetings) {
    if (isLive(m, now)) live.push(m)
    else if (isEnded(m, now)) ended.push(m)
    else upcoming.push(m)
  }
  return { live, upcoming, ended }
}

/**
 * 会议列表：历史（已结束，右栏）+ 进行中/即将开始（左栏，单独取一次）。
 * 「加载更早」把历史窗再往前推 30 天，走接口的 before 参数，不猜时间。
 */

/**
 * 列表模块级备忘录：客户端页面切走再回来、或组件重挂载时，第一帧直接用它渲染，
 * 后台再静默刷新。验收意见 3 里「点一下就重新加载」的观感，根源就是每次都要等新请求。
 */
const listMemo: { history: MeetingBrief[]; near: MeetingBrief[]; syncedAt: string | null; seeded: boolean } = {
  history: [],
  near: [],
  syncedAt: null,
  seeded: false
}
export function useMeetings(onlyTranscript: boolean): MeetingsState {
  const [history, setHistory] = useState<MeetingBrief[]>(() => listMemo.history)
  const [near, setNear] = useState<MeetingBrief[]>(() => listMemo.near)
  const [hasMore, setHasMore] = useState(false)
  const [syncedAt, setSyncedAt] = useState<string | null>(() => listMemo.syncedAt)
  const [loading, setLoading] = useState(!listMemo.seeded)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hiddenByFilter, setHiddenByFilter] = useState(0)
  const aliveRef = useRef(true)
  /** 「已完成更早加载」的标志；接口给出的 hasMore 不够，自己记一份 */
  const exhaustedRef = useRef(false)
  /** 每天一次的自动同步只试一次，失败也不反复重试（不烧额度） */
  const daySyncTriedRef = useRef(false)

  const load = useCallback(
    async (mode: 'initial' | 'refresh' | 'earlier') => {
      if (mode === 'earlier') setLoadingMore(true)
      // 已有内容时的刷新不再抬 loading：先留着旧列表，回来了再替换。
      // 否则每次进面板都先白屏一轮，用户会以为插件在重新学一遍数据。
      // 有模块级种子（listMemo）时连 initial 都不抬骨架——验收意见 3。
      else if (!history.length && !near.length) setLoading(true)
      try {
        const [endedPayload, nearPayload] = await Promise.all([
          api.listMeetings({
            scope: 'ended',
            limit: HISTORY_LIMIT,
            onlyTranscript: onlyTranscript || undefined,
            refresh: mode === 'refresh',
            before: mode === 'earlier' ? earliest(history) : undefined
          }),
          mode === 'earlier'
            ? Promise.resolve(null)
            : api.listMeetings({ scope: 'upcoming', limit: 20, refresh: mode === 'refresh' })
        ])
        if (!aliveRef.current) return

        const endedList = endedPayload.meetings ?? []
        // 拉取失败时绝不把旧列表清空：网络断了、额度满了，用户看的还是上一次的内容 + 错误条。
        // （实测事故：一次失败的刷新把满页会议列表清成了 0 行，用户看到的就是「什么都没了」。）
        const wiped = Boolean(endedPayload.error) && endedList.length === 0
        if (mode === 'earlier') {
          if (!wiped) {
            const merged = mergeById(history, endedList)
            setHistory(merged)
          Object.assign(listMemo, { history: merged, seeded: true })
            if (endedList.length === 0) exhaustedRef.current = true
            setHasMore(!exhaustedRef.current && endedList.length >= HISTORY_LIMIT)
          }
        } else if (!wiped) {
          exhaustedRef.current = false
          setHistory(endedList)
          Object.assign(listMemo, { history: endedList, seeded: true })
          setHasMore(Boolean(endedPayload.hasMore) || endedList.length >= HISTORY_LIMIT)
        }
        if (!wiped) setSyncedAt(endedPayload.syncedAt ?? null)
        if (!wiped && endedPayload.syncedAt) listMemo.syncedAt = endedPayload.syncedAt

        // 今天还没同步过 → 自动真同步一次（用户要求「进来前就同步好」）。
        // 判断放在这里而不是挂载 effect：挂载时 syncedAt 还没读出来，永远判成「不用同步」。
        if (mode === 'initial' && !daySyncTriedRef.current) {
          daySyncTriedRef.current = true
          const synced = endedPayload.syncedAt
          const sameDay = Boolean(synced) && new Date(String(synced)).toDateString() === new Date().toDateString()
          if (!sameDay) void load('refresh')
        }

        if (nearPayload && !nearPayload.error) {
          setNear(nearPayload.meetings ?? [])
          Object.assign(listMemo, { near: nearPayload.meetings ?? [], seeded: true })
        }

        if (onlyTranscript) {
          const all = await api.listMeetings({ scope: 'ended', limit: HISTORY_LIMIT })
          if (!aliveRef.current) return
          const total = (all.meetings ?? []).length
          setHiddenByFilter(Math.max(0, total - endedList.length))
        } else {
          setHiddenByFilter(0)
        }

        const errText = endedPayload.error || endedPayload.partial ? endedPayload.error ?? '' : ''
        setError(errText || null)
      } catch (e) {
        if (!aliveRef.current) return
        setError(errorText(e))
      } finally {
        if (aliveRef.current) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [history, onlyTranscript]
  )

  useEffect(() => {
    aliveRef.current = true
    void load('initial')
    return () => {
      aliveRef.current = false
    }
    // 只在筛选变化时重取；load 依赖 history 是有意的（加载更早要用最早时间）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyTranscript])

  const sync = useCallback(async () => {
    await load('refresh')
  }, [load])

  const loadEarlier = useCallback(async () => {
    await load('earlier')
  }, [load])

  const reload = useCallback(async () => {
    await load('initial')
  }, [load])

  const { live, upcoming } = split(near)

  return {
    history,
    upcoming,
    live,
    hasMore,
    syncedAt,
    loading,
    loadingMore,
    error,
    hiddenByFilter,
    sync,
    loadEarlier,
    reload
  }
}

function earliest(list: MeetingBrief[]): string | undefined {
  let min: number | null = null
  for (const m of list) {
    const t = Date.parse(m.startTime)
    if (Number.isNaN(t)) continue
    if (min === null || t < min) min = t
  }
  return min === null ? undefined : new Date(min).toISOString()
}

function mergeById(base: MeetingBrief[], extra: MeetingBrief[]): MeetingBrief[] {
  const seen = new Set(base.map((m) => m.meetingId))
  const out = [...base]
  for (const m of extra) {
    if (seen.has(m.meetingId)) continue
    seen.add(m.meetingId)
    out.push(m)
  }
  return out.sort((a, b) => (Date.parse(b.startTime) || 0) - (Date.parse(a.startTime) || 0))
}

/* ── 小工具：轮询授权 ── */

export interface LoginPollState {
  phase: 'idle' | 'waiting' | 'done' | 'failed'
  waitedSeconds: number
  reason: string
  url: string
}

/**
 * 授权轮询：本地起子进程后每 2 秒问一次。
 * 只说「已等待 N 秒」，不给预计剩余（猜不准的进度条等于说谎）。
 */
export function useAuthPoll(active: boolean): LoginPollState & { restart: () => void } {
  const [phase, setPhase] = useState<LoginPollState['phase']>('idle')
  const [waitedSeconds, setWaited] = useState(0)
  const [reason, setReason] = useState('')
  const [url, setUrl] = useState('')
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    if (!active) {
      setPhase('idle')
      setWaited(0)
      setReason('')
      setUrl('')
      return
    }
    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null
    const started = Date.now()
    setPhase('waiting')
    setWaited(0)

    const poll = async (): Promise<void> => {
      try {
        const p = await api.pollAuth()
        if (!alive) return
        if (p.url) setUrl(p.url)
        const secs = Math.max(0, Math.floor((p.waitedMs ?? Date.now() - started) / 1000))
        setWaited(secs)
        if (p.state === 'done') {
          setPhase('done')
          return
        }
        if (p.state === 'failed') {
          setPhase('failed')
          setReason(p.reason || '授权没走完就断了，可以重新生成链接再试。')
          return
        }
        timer = setTimeout(() => void poll(), 2000)
      } catch (e) {
        if (!alive) return
        setPhase('failed')
        setReason(errorText(e))
      }
    }

    void poll()
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
    }
  }, [active, nonce])

  return {
    phase,
    waitedSeconds,
    reason,
    url,
    restart: () => setNonce((n) => n + 1)
  }
}

/** 安装进度轮询：CLI 安装是 npm 全局装，可能几十秒 */
export function useInstallProgress(active: boolean): { message: string; done: boolean } {
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) {
      setMessage('')
      setDone(false)
      return
    }
    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null

    const poll = async (): Promise<void> => {
      try {
        const s = await api.getInstallStatus()
        if (!alive) return
        setMessage(s.lastMessage || '')
        if (!s.installing) {
          setDone(Boolean(s.lastMessage))
          return
        }
      } catch {
        /* 安装状态取不到不影响主流程，下一次再问 */
      }
      timer = setTimeout(() => void poll(), 1500)
    }

    void poll()
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
    }
  }, [active])

  return { message, done }
}
