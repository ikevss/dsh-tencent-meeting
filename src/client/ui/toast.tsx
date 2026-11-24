/**
 * 轻量提示条（Toast）。
 *
 * 为什么不用 Radix Toast：它不是焦点管理类组件（不含 modal / roving focus），
 * 这里要的只是「一条会自己消失的说明」，自己写反而更小；
 * Tabs / Dialog / Dropdown / Select 才是必须用 Radix 的那四个。
 * 关键点：容器带 aria-live="polite"，屏幕阅读器才会念出来 —— 视觉上的浮层对读屏是静默的。
 */
import * as React from 'react'
import { Alert, Check, X } from './icons'

export type ToastTone = 'info' | 'ok' | 'err'

export interface ToastItem {
  id: number
  tone: ToastTone
  text: string
}

export interface ToastApi {
  toasts: ToastItem[]
  push: (tone: ToastTone, text: string) => void
  dismiss: (id: number) => void
}

let seq = 1

export function useToast(): ToastApi {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = React.useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = React.useCallback(
    (tone: ToastTone, text: string) => {
      const id = seq++
      setToasts((list) => [...list.slice(-2), { id, tone, text }])
      const timer = setTimeout(() => dismiss(id), tone === 'err' ? 7000 : 4200)
      timers.current.set(id, timer)
    },
    [dismiss]
  )

  React.useEffect(() => {
    const map = timers.current
    return () => {
      for (const timer of map.values()) clearTimeout(timer)
      map.clear()
    }
  }, [])

  return { toasts, push, dismiss }
}

export function ToastHost(props: { api: ToastApi }): React.ReactElement {
  return (
    <div className="tm-toasts" aria-live="polite" aria-atomic="false">
      {props.api.toasts.map((t) => (
        <div key={t.id} className={`tm-toast${t.tone === 'err' ? ' is-err' : t.tone === 'ok' ? ' is-ok' : ''}`}>
          <span style={{ flex: 'none', marginTop: 1 }}>
            {t.tone === 'err' ? <Alert size={14} /> : t.tone === 'ok' ? <Check size={14} /> : <Alert size={14} />}
          </span>
          <span className="tm-grow">{t.text}</span>
          <button type="button" className="tm-iconbtn" aria-label="关闭提示" onClick={() => props.api.dismiss(t.id)}>
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
