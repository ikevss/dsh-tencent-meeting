/**
 * 实时同步钩子。
 *
 * 设计要点（来自 superIR 的实测约束）：
 *  - 事件只当触发器：收到事件后回读真实状态再刷新界面，绝不拿 payload 直接改状态；
 *  - 降级可见：连续失败后服务端会标记 degraded，界面必须显示「实时同步已断开，改为手动刷新」，
 *    不许静默（静默 = 用户以为在自动更新，其实已经不动了）；
 *  - 重连：EventSource 自带重连，但服务端降级后重连也没用，所以降级态要一直显示到手动刷新。
 */
import { useEffect, useRef, useState } from 'react'
import type { ContentStates } from '../../shared/types'
import * as api from './api'

export type SyncState = 'connecting' | 'live' | 'degraded' | 'off'

export interface LiveSync {
  state: SyncState
  /** 最近一次事件时间（用于显示「刚刚更新」） */
  lastAt: string | null
  /** 最近一次事件的会议 id 与回读状态 */
  lastMeetingId: string | null
  lastStates: ContentStates | null
}

export function useLiveSync(options: {
  enabled: boolean
  onEvent: (e: api.PushEvent) => void
}): LiveSync {
  const [state, setState] = useState<SyncState>('off')
  const [lastAt, setLastAt] = useState<string | null>(null)
  const [lastMeetingId, setLastMeetingId] = useState<string | null>(null)
  const [lastStates, setLastStates] = useState<ContentStates | null>(null)
  const handlerRef = useRef(options.onEvent)
  handlerRef.current = options.onEvent
  const enabled = options.enabled

  useEffect(() => {
    if (!enabled) {
      setState('off')
      return
    }
    setState('connecting')
    const close = api.subscribeEvents(
      (e) => {
        if (e.degraded) {
          setState('degraded')
          return
        }
        setState('live')
        setLastAt(e.at)
        setLastMeetingId(e.meetingId || null)
        setLastStates(e.states ?? null)
        handlerRef.current(e)
      },
      () => setState('live'),
      () => setState((s) => (s === 'degraded' ? s : 'degraded'))
    )
    return close
  }, [enabled])

  return { state, lastAt, lastMeetingId, lastStates }
}
