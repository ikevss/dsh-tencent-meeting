/**
 * 未就绪引导屏：未安装 / 未登录 / 版本过低 / 已过期 四档。
 *
 * 共同纪律：
 *  - 每一档只给一个主按钮，其余是兜底（手动命令、换个账号）；
 *  - 等待态只说「已等待 N 秒」，不给预计剩余 —— 猜不准的进度提示等于说谎；
 *  - 每档都要能说清「现在卡在哪、点哪个能过去」，绝不白屏。
 */
import * as React from 'react'
import type { PluginStatus } from '../shared/types'
import { formatWaited } from '../shared/types'
import * as api from './lib/api'
import { errorText } from './lib/api'
import { useAuthPoll, useInstallProgress } from './lib/hooks'
import { Banner, Button, Spinner } from './ui/base'
import { Alert, Check, ExternalLink, Refresh, Shield, Video } from './ui/icons'
import type { ToastApi } from './ui/toast'

const MANUAL_COMMAND = 'npm i -g @tencentcloud/tmeet@1.1.0'

export interface GuideProps {
  status: PluginStatus
  toast: ToastApi
  onRefresh: () => Promise<void>
  onSwitchAccount: () => void
}

export function Guide(props: GuideProps): React.ReactElement {
  const state = props.status.state
  if (state === 'not-installed') return <NotInstalled {...props} />
  if (state === 'version-mismatch') return <VersionMismatch {...props} />
  if (state === 'expired') return <Expired {...props} />
  return <NotAuthorized {...props} />
}

/* ── 骨架 ── */

function Shell(props: {
  warnIcon?: boolean
  icon?: React.ReactNode
  title: string
  lines: string[]
  children?: React.ReactNode
}): React.ReactElement {
  return (
    <div className="tm-guide">
      <div className="tm-guide-inner">
        <div className={`tm-guide-ico${props.warnIcon ? ' is-warn' : ''}`}>
          {props.icon ?? <Video size={26} />}
        </div>
        <h1 className="tm-guide-title">{props.title}</h1>
        {props.lines.map((line) => (
          <p className="tm-guide-desc" key={line}>
            {line}
          </p>
        ))}
        {props.children}
      </div>
    </div>
  )
}

/* ── 未安装 ── */

function NotInstalled(props: GuideProps): React.ReactElement {
  const [installing, setInstalling] = React.useState(Boolean(props.status.installing))
  const [error, setError] = React.useState('')
  const [showManual, setShowManual] = React.useState(false)
  const progress = useInstallProgress(installing)

  React.useEffect(() => {
    // 自动安装是后台跑的：它失败时面板可能刚打开，得把失败原因取回来显示，
    // 否则用户只看到一个按钮，不知道刚才发生了什么。
    let alive = true
    void api
      .getInstallStatus()
      .then((s) => {
        if (!alive || s.installing || !s.lastMessage) return
        setError(s.lastMessage)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  React.useEffect(() => {
    if (!installing || !progress.done) return
    let alive = true
    const timer = setTimeout(() => {
      if (!alive) return
      setInstalling(false)
      void props.onRefresh()
    }, 900)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [installing, progress.done, props])

  const start = async (): Promise<void> => {
    setError('')
    setInstalling(true)
    try {
      const r = await api.installCli()
      if (!r.ok) {
        setError(r.message || '安装没成功，可以按下面的命令自己装一次。')
        setInstalling(false)
        setShowManual(true)
        return
      }
      props.toast.push('ok', r.message || '会议组件装好了。')
      setInstalling(false)
      await props.onRefresh()
    } catch (e) {
      setError(errorText(e))
      setInstalling(false)
      setShowManual(true)
    }
  }

  return (
    <Shell
      title="还没有安装会议组件"
      lines={['插件本身很小，真正跟腾讯会议通信用的是一个命令行组件。', '点下面的按钮装一次就够，之后不用再管。']}
    >
      {error ? (
        <div style={{ marginTop: 16, width: '100%' }}>
          <Banner tone="err" icon={<Alert size={14} />}>
            {error}
          </Banner>
        </div>
      ) : null}

      <div className="tm-guide-acts">
        <Button
          variant="primary"
          size="lg"
          onClick={() => void start()}
          disabled={installing}
          icon={installing ? <Spinner /> : <ExternalLink size={14} />}
        >
          {installing ? '正在安装…' : '安装会议组件'}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => setShowManual((v) => !v)}>
          {showManual ? '收起手动方式' : '我自己装'}
        </Button>
      </div>

      {installing ? (
        <p className="tm-hint" style={{ marginTop: 12 }} role="status">
          {progress.message || '正在安装，通常几十秒。装完这里会自动刷新。'}
        </p>
      ) : null}

      {showManual ? (
        <div className="tm-guide-code">
          <span className="tm-caption">在这台机器的命令行里运行：</span>
          <code>{MANUAL_COMMAND}</code>
          <span className="tm-caption">装完回来点「重新检测」，或者重开面板。</span>
          <div className="tm-row" style={{ marginTop: 4 }}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                void api.copyText(MANUAL_COMMAND).then((ok) => {
                  props.toast.push(ok ? 'ok' : 'err', ok ? '命令已复制。' : '复制没成功，手动选中再复制。')
                })
              }}
            >
              复制命令
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void props.onRefresh()}>
              重新检测
            </Button>
          </div>
        </div>
      ) : null}
    </Shell>
  )
}

/* ── 版本过低 ── */

function VersionMismatch(props: GuideProps): React.ReactElement {
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const have = props.status.version || '没读到版本'
  const need = props.status.expectedVersion || '1.1.0'

  const upgrade = async (): Promise<void> => {
    setError('')
    setBusy(true)
    try {
      const r = await api.installCli()
      if (!r.ok) {
        setError(r.message || '升级没成功，可以按下面的命令自己升一次。')
        return
      }
      props.toast.push('ok', r.message || '会议组件已升级。')
      await props.onRefresh()
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell
      warnIcon
      icon={<Refresh size={24} />}
      title="会议组件版本太低"
      lines={['老版本读不到逐字稿和纪要，待办与会后产出都用不了。', '升级一次就好，会议记录不受影响。']}
    >
      <div className="tm-version-row">
        <span>当前</span>
        <span className="tm-version-num">{have}</span>
        <span>需要</span>
        <span className="tm-version-num">{need}</span>
      </div>

      {error ? (
        <div style={{ marginTop: 14, width: '100%' }}>
          <Banner tone="err" icon={<Alert size={14} />}>
            {error}
          </Banner>
        </div>
      ) : null}

      <div className="tm-guide-acts">
        <Button variant="primary" size="lg" onClick={() => void upgrade()} disabled={busy} icon={busy ? <Spinner /> : <Refresh size={14} />}>
          {busy ? '正在升级…' : '升级会议组件'}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => void props.onRefresh()}>
          重新检测
        </Button>
      </div>

      <div className="tm-guide-code">
        <span className="tm-caption">也可以用命令行：</span>
        <code>{MANUAL_COMMAND}</code>
      </div>
    </Shell>
  )
}

/* ── 已过期 ── */

function Expired(props: GuideProps): React.ReactElement {
  return (
    <Shell
      warnIcon
      icon={<Alert size={24} />}
      title="登录已过期"
      lines={['本机还留着上次的会议记录，重新登录一次就能继续。', '会议号、逐字稿与产出一份都不会丢。']}
    >
      <AuthActions {...props} switchable />
    </Shell>
  )
}

/* ── 未登录 ── */

function NotAuthorized(props: GuideProps): React.ReactElement {
  const [pending, setPending] = React.useState(false)
  const poll = useAuthPoll(pending)

  React.useEffect(() => {
    if (poll.phase !== 'done') return
    let alive = true
    void props.onRefresh().then(() => {
      if (!alive) return
      setPending(false)
      props.toast.push('ok', '授权完成了。')
    })
    return () => {
      alive = false
    }
  }, [poll.phase, props])

  if (pending) {
    return (
      <Shell
        icon={<Shield size={24} />}
        title="等待授权中"
        lines={['浏览器里确认授权，这里会自动接上。', '没看到页面就点下面的「重新生成链接」。']}
      >
        <div className="tm-version-row">
          <Spinner />
          <span role="status">{formatWaited(poll.waitedSeconds)}</span>
        </div>
        {poll.phase === 'failed' ? (
          <div style={{ marginTop: 14, width: '100%' }}>
            <Banner tone="err" icon={<Alert size={14} />}>
              {poll.reason}
            </Banner>
          </div>
        ) : null}
        <div className="tm-guide-acts">
          <Button
            variant="primary"
            size="lg"
            icon={<ExternalLink size={14} />}
            onClick={() => {
              void regenerate(poll.url, props, setPending)
            }}
          >
            重新生成链接
          </Button>
          <Button variant="ghost" size="lg" onClick={() => setPending(false)}>
            取消等待
          </Button>
        </div>
        <p className="tm-hint" style={{ marginTop: 12 }}>
          授权链接只在浏览器里打开，插件不读、不保存腾讯会议的任何凭证文件。
        </p>
      </Shell>
    )
  }

  return (
    <Shell
      icon={<Video size={26} />}
      title="连接你的腾讯会议"
      lines={['连上之后可以建会、读逐字稿与纪要。', '只访问你自己账号下的会议，随时可以断开。']}
    >
      <AuthActions {...props} onPending={() => setPending(true)} />
      <p className="tm-hint" style={{ marginTop: 14 }}>
        授权在浏览器里完成，插件只转发那一条链接。
      </p>
    </Shell>
  )
}

async function regenerate(url: string, props: GuideProps, setPending: (v: boolean) => void): Promise<void> {
  try {
    // 链接直接开浏览器；本地没有现成链接就重新起一次（renew 语义在 auth/start）
    if (url && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
      props.toast.push('info', '已重新打开授权页。')
      return
    }
    const r = await api.startAuth(true)
    if (r.url && typeof window !== 'undefined') window.open(r.url, '_blank', 'noopener,noreferrer')
    props.toast.push(r.ok ? 'info' : 'err', r.message || (r.ok ? '已重新生成授权链接。' : '链接没生成出来，稍后再试。'))
    setPending(true)
  } catch (e) {
    props.toast.push('err', errorText(e))
    setPending(true)
  }
}

function AuthActions(props: GuideProps & { switchable?: boolean; onPending?: () => void }): React.ReactElement {
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const start = async (switchAccount: boolean): Promise<void> => {
    setError('')
    setBusy(true)
    try {
      const r = await api.startAuth(switchAccount)
      if (r.url && typeof window !== 'undefined') {
        window.open(r.url, '_blank', 'noopener,noreferrer')
      }
      if (!r.ok && !r.url) {
        setError(r.message || '授权没起来，稍后再点一次。')
        return
      }
      props.toast.push('info', r.opened ? '授权页已打开，确认后这里会自动接上。' : '复制下面的链接在浏览器里打开。')
      props.onPending?.()
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {error ? (
        <div style={{ marginTop: 14, width: '100%' }}>
          <Banner tone="err" icon={<Alert size={14} />}>
            {error}
          </Banner>
        </div>
      ) : null}
      <div className="tm-guide-acts">
        <Button
          variant="primary"
          size="lg"
          onClick={() => void start(false)}
          disabled={busy}
          icon={busy ? <Spinner /> : <ExternalLink size={14} />}
        >
          {busy ? '正在打开授权页…' : '去授权'}
        </Button>
        {props.switchable ? (
          <Button variant="ghost" size="lg" onClick={() => void start(true)} disabled={busy}>
            换个账号
          </Button>
        ) : (
          <Button variant="ghost" size="lg" onClick={props.onSwitchAccount} disabled={busy}>
            换个账号
          </Button>
        )}
      </div>
    </>
  )
}

/* ── 操作失败（状态检查本身挂了） ── */

export function OperationFailed(props: { message: string; onRetry: () => void }): React.ReactElement {
  return (
    <Shell
      warnIcon
      icon={<Alert size={24} />}
      title="没读到腾讯会议的状态"
      lines={[props.message || '状态检查失败了一次。', '再检测一次；还不行就确认这台机器的命令行能跑 tmeet。']}
    >
      <div className="tm-guide-acts">
        <Button variant="primary" size="lg" onClick={props.onRetry} icon={<Refresh size={14} />}>
          重新检测
        </Button>
      </div>
    </Shell>
  )
}

/* ── 已连接但账号下没有会议（不是错误，是空态） ── */

export function ConnectedEmpty(): React.ReactElement {
  return (
    <Shell icon={<Check size={24} />} title="连上了，这个账号下还没有会议" lines={['新建一场会议，或者回列表同步一次历史。']} />
  )
}
