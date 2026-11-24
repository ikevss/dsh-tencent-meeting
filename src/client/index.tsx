/**
 * 浏览器半入口。
 *
 * 形态（与已装机的插件同源写法）：
 *   window.__ModuleLoader__.load({ id, factory: (require) => { ...; return module.exports } })
 * bun 打出 CJS，外层信封由 scripts/build-client.mjs 套上；这里只导出 inject / apply / default。
 *
 * 三个插槽（SPEC §5.2）：
 *   sidebar.panellist  id='dsh-tencent-meeting'          order 45  只放图标
 *   main              key='dsh-tencent-meeting'         整页应用
 *   settings.section   id='dsh-tencent-meeting-settings' order 62  设置页里那一节
 *
 * 样式：styles.css 由打包器以 text 形式内联成字符串，apply 里插一个 <style>，
 * 卸载时移除（ctx.effect 的返回函数就是反注册）。
 */
import * as React from 'react'
import STYLE_TEXT from './styles.css'
import { App } from './app'
import { SettingsView } from './settings'
import { MeetingIcon } from './ui/icons'
import { useToast, ToastHost } from './ui/toast'

export const inject = ['slots', 'uiWorkspace', 'layout']

/**
 * 三个插槽（SPEC §5.2）。
 * 键名刻意用包名而不是 'tmeet'：本机 profile 里还 link 着上一轮调研的半成品
 * `tmeet-dsh-plugin`，它已经占了 'tmeet' 这个 key。新插件用独立 id，
 * 两个插件同时装着也不会互相顶掉主面板（main 是 keyed slot，同 key 必互相覆盖）。
 */
const PANEL_ID = 'dsh-tencent-meeting'
const STYLE_ID = 'dsh-tencent-meeting-style'

interface SlotCtx {
  slots?: { inject: (name: string, fn: () => unknown) => void; register: (def: unknown, comp: unknown) => unknown }
  effect?: (fn: () => unknown, label?: string) => void
}

interface ErrorState {
  error: null | { message: string; stack?: string }
}

/**
 * 渲染错误兜底：面板一旦抛错，把错误显示出来 + 上报给主机端存盘。
 * 没有它，面板就是「一片空白」——用户看不到、我们也查不到。
 */
class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, ErrorState> {
  constructor(props: { children?: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: unknown): ErrorState {
    const e = error as Error
    return { error: { message: String(e?.message ?? error), stack: String(e?.stack ?? '') } }
  }

  componentDidCatch(error: unknown): void {
    try {
      const e = error as Error
      const body = JSON.stringify({
        message: String(e?.message ?? error),
        stack: String(e?.stack ?? ''),
        at: new Date().toISOString()
      })
      void fetch('/tmeet/api/debug/error', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body
      }).catch(() => {})
    } catch {
      /* 上报失败不影响显示 */
    }
  }

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 20,
            color: '#b91c1c',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 13,
            lineHeight: 1.6
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>面板渲染出错了</div>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error.message}</div>
          {this.state.error.stack ? (
            <div
              style={{
                marginTop: 10,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                opacity: 0.7
              }}
            >
              {this.state.error.stack}
            </div>
          ) : null}
        </div>
      )
    }
    return this.props.children ?? null
  }
}

/** 主面板：用 ErrorBoundary 包一层，出错时显示而不是空白。 */
function MainPanel(props: {
  nav?: {
    openMeetingWorkspace?: (
      workspaceId: string,
      onSessionOpened?: (sessionId: string) => void
    ) => Promise<boolean>
  } | null
}): React.ReactElement {
  return <ErrorBoundary><App {...props} /></ErrorBoundary>
}

/** 设置页那一节：同样兜底。 */
function SettingsPanel(): React.ReactElement {
  return <ErrorBoundary><SettingsSection /></ErrorBoundary>
}

/** 侧边栏图标：宿主传 { size, active }；描边走 currentColor，选中态自动跟着变。 */
function SidebarIcon(props: { size?: number; active?: boolean }): React.ReactElement {
  return <MeetingIcon size={props.size ?? 16} active={props.active} />
}

/** 设置页里那一节：同一个设置页组件，窄排布。 */
function SettingsSection(): React.ReactElement {
  const toast = useToast()
  return (
    <div className="tm-surface">
      <div className="tm-pad">
        <SettingsView toast={toast} compact />
      </div>
      <ToastHost api={toast} />
    </div>
  )
}

function injectStyles(): () => void {
  if (typeof document === 'undefined') return () => {}
  const existing = document.getElementById(STYLE_ID)
  if (existing) {
    existing.textContent = STYLE_TEXT
    return () => {}
  }
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = STYLE_TEXT
  document.head.appendChild(el)
  return () => {
    el.remove()
  }
}

export function apply(ctx: SlotCtx): void {
  if (!ctx || !ctx.slots || typeof ctx.slots.inject !== 'function' || typeof ctx.slots.register !== 'function') {
    // 宿主版本太老，插槽扩展点不存在。显式打日志，不静默吞掉。
    console.error('[tmeet] 客户端插槽不可用：请确认 DSH 版本并已启用 client 模块运行时')
    return
  }

  const effect = typeof ctx.effect === 'function' ? ctx.effect : (fn: () => unknown) => void fn()
  const slots = ctx.slots

  // 宿主服务：让 DSH 在该工作区开它自己的会话（客户端认识，不会 unknown session），
  // 并打开右侧栏——DSH 的完整对话窗就在右侧面板里。
  const get = (ctx as unknown as { get?: (n: string) => unknown }).get
  const callGet = (name: string): unknown => {
    try {
      return typeof get === 'function' ? get.call(ctx, name) : null
    } catch {
      return null
    }
  }
  const nav = {
    // 设置不再走插件自己的整页：直接打开 DSH 左下角的设置面板，并停在「腾讯会议」这一节。
    // 设置面板的开关状态由 DSH 设置壳自己拥有，这里只借它声明的 store 触发 openSection。
    openSettings: (): void => {
      const slots = callGet('slots') as
        | { entries?: (key: string) => readonly { store?: { create?: () => { actions?: Record<string, (id: string) => void> } } }[] }
        | null
      try {
        const entry = slots?.entries?.('sidebar.settings')?.[0]
        const actions = entry?.store?.create?.()?.actions
        actions?.openSection?.('dsh-tencent-meeting-settings')
      } catch {
        /* 设置壳还没挂载时静默忽略 */
      }
    },
    /**
     * 打开该工作区并在会话建好后立刻回调（beforeOpen 钩子）。
     * 用 openWorkspace 而不是 startSession：只有它能给出刚建好的 sessionId，
     * 引导消息才能准确投进这个会话——按 cwd 反查是之前失效的根因。
     */
    openMeetingWorkspace: async (
      workspaceId: string,
      onSessionOpened?: (sessionId: string) => void
    ): Promise<boolean> => {
      const ui = callGet('uiWorkspace') as
        | { openWorkspace?: (id: string, beforeOpen?: (sid: string) => void) => Promise<void> }
        | null
      const layout = callGet('layout') as { openRightbar?: (t: boolean, f: boolean) => void } | null
      if (typeof ui?.openWorkspace !== 'function') {
        layout?.openRightbar?.(true, false)
        return false
      }
      try {
        await ui.openWorkspace(workspaceId, (sid) => {
          try {
            onSessionOpened?.(String(sid))
          } catch {
            /* 投放失败不影响会话打开 */
          }
        })
        layout?.openRightbar?.(true, false)
        return true
      } catch {
        return false
      }
    }
  }

  effect(() => injectStyles(), 'tmeet: styles')

  effect(
    () =>
      slots.inject('main', () =>
        slots.register({ name: 'main', key: PANEL_ID }, () => <MainPanel nav={nav} />)
      ),
    'tmeet: main'
  )

  effect(
    () =>
      slots.inject('sidebar.panellist', () =>
        slots.register(
          { name: 'sidebar.panellist', id: PANEL_ID, order: 45, label: () => '腾讯会议' },
          SidebarIcon
        )
      ),
    'tmeet: sidebar.panellist'
  )

  effect(
    () =>
      slots.inject('settings.section', () =>
        slots.register(
          { name: 'settings.section', id: `${PANEL_ID}-settings`, order: 62, label: () => '腾讯会议' },
          SettingsPanel
        )
      ),
    'tmeet: settings.section'
  )
}

export default { inject, apply, App, SettingsSection }
