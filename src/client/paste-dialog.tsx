/**
 * 素材粘贴弹窗：把「录音转出来的文字」变成可用的会后素材。
 *
 * 设计要点：
 *  - 默认展开一个大输入框（用户是从别处复制来的，不要让他先点「新增」）。
 *  - 必须填来源（默认「手机录音转文字」），因为产出里会标注来源，不能伪装成腾讯数据。
 *  - 已有内容时覆盖要二次确认，避免误覆盖掉上一次粘的长文。
 */
import * as React from 'react'
import * as api from './lib/api'
import { errorText } from './lib/api'
import { Dialog } from './ui/radix'
import { Banner, Button, Field, Spinner, Textarea } from './ui/base'
import { Alert } from './ui/icons'
import type { ToastApi } from './ui/toast'

export function PasteDialog(props: {
  open: boolean
  onOpenChange: (v: boolean) => void
  meetingId: string
  kind: 'transcript' | 'minutes' | 'todos'
  toast: ToastApi
  onSaved: () => void
}): React.ReactElement {
  const [text, setText] = React.useState('')
  const [source, setSource] = React.useState('手机录音转文字')
  const [existing, setExisting] = React.useState<{ chars: number; at: string; source: string } | null>(null)
  const [confirmOverwrite, setConfirmOverwrite] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const label = props.kind === 'minutes' ? '纪要' : props.kind === 'todos' ? '待办' : '逐字稿'

  React.useEffect(() => {
    if (!props.open) {
      setText('')
      setSource('手机录音转文字')
      setConfirmOverwrite(false)
      setError('')
      setExisting(null)
      return
    }
    let alive = true
    void api
      .listPasted(props.meetingId)
      .then((r) => {
        if (!alive) return
        const hit = r.items.find((x) => x.kind === props.kind)
        setExisting(hit ? { chars: hit.chars, at: hit.at, source: hit.source } : null)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [props.open, props.meetingId, props.kind])

  const save = async (): Promise<void> => {
    setError('')
    setBusy(true)
    try {
      const r = await api.savePasted({
        id: props.meetingId,
        kind: props.kind,
        text,
        source,
        overwrite: confirmOverwrite
      })
      if (!r.ok) {
        setError(r.message)
        if (r.replaced) setConfirmOverwrite(true)
        return
      }
      props.toast.push('ok', r.message)
      props.onOpenChange(false)
      props.onSaved()
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const needOverwrite = Boolean(existing) && !confirmOverwrite

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={`粘贴${label}原文`}
      description="只存在这台机器上，不会上传。产出里会标明「据你提供的原文生成」。"
      footer={
        <>
          <span className="tm-grow tm-caption">
            {text.trim() ? `已输入 ${text.trim().length} 字` : '把文字粘到上面，越完整产出越好'}
          </span>
          <div className="tm-dialog-acts">
            <Button onClick={() => props.onOpenChange(false)} disabled={busy}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={() => void save()}
              disabled={busy || !text.trim() || needOverwrite}
              icon={busy ? <Spinner /> : undefined}
            >
              {busy ? '正在保存…' : needOverwrite ? '先勾选覆盖' : '保存'}
            </Button>
          </div>
        </>
      }
    >
      {error ? (
        <Banner tone="err" icon={<Alert size={14} />}>
          {error}
        </Banner>
      ) : null}

      {existing ? (
        <Banner
          tone="warn"
          icon={<Alert size={14} />}
          action={
            <label className="tm-row" style={{ gap: 6 }}>
              <input
                type="checkbox"
                checked={confirmOverwrite}
                onChange={(e) => setConfirmOverwrite(e.target.checked)}
              />
              <span className="tm-caption">覆盖</span>
            </label>
          }
        >
          这场会已有一份 {label}（{existing.chars} 字，{existing.at.slice(0, 10)}，来源：{existing.source}）。保存会把它替换掉。
        </Banner>
      ) : null}

      <Field label="原文" hint="支持长文，最多 40 万字；从会议软件或录音转写工具里复制即可。">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={'例：\n张三：今天主要过三件事……\n李四：第一件是……'}
        />
      </Field>

      <Field label="来源" hint="会写进产出，让人知道这段话是哪来的。">
        <input
          className="tm-input"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="手机录音转文字"
        />
      </Field>
    </Dialog>
  )
}
