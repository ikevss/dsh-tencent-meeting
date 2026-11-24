/**
 * 面板内右上角工具条：设置 / 助手。
 *
 * AI 对话直接用 DSH 原生会话窗（模型选择、历史、工具都由 DSH 提供）。
 * 放在面板自己的顶栏，不碰 DSH 窗口标题栏（避免被窗控压住）。
 */
import * as React from 'react'
import { Send, Settings as SettingsIcon } from './ui/icons'
import { Spinner } from './ui/base'
import type { ToastApi } from './ui/toast'

export interface TopBarProps {
  toast: ToastApi
  /** 打开设置页（复用现有设置视图） */
  onOpenSettings: () => void
  /** 打开当前这场会的 DSH 原生 AI 对话 */
  onOpenAssistant: () => void
  /** 正在准备会话（打开中） */
  busy?: boolean
}

export function TopBar(props: TopBarProps): React.ReactElement {
  return (
    <div className="tm-topbar-tools">
      <button
        type="button"
        className="tm-topbar-btn"
        onClick={props.onOpenSettings}
        title="设置"
        aria-label="设置"
      >
        <SettingsIcon size={16} />
      </button>
      <button
        type="button"
        className="tm-topbar-btn tm-topbar-assistant"
        onClick={props.onOpenAssistant}
        disabled={props.busy}
        title="AI 对话"
        aria-label="打开 AI 对话"
      >
        {props.busy ? <Spinner /> : <Send size={14} />}
        <span>{props.busy ? '正在打开…' : 'AI 对话'}</span>
      </button>
    </div>
  )
}
