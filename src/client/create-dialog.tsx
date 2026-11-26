/**
 * 建会弹窗：三步 —— 选类型 → 填表 → 预览确认。
 *
 * 两阶段提交（硬约束）：点「预览」只调 confirm:false 拿回将要提交的字段；
 * 用户在预览页点「确认创建」才调 confirm:true。不做这一步就等于替用户签了字。
 *
 * 类型只带默认口径，不改接口形状：v1 先四类常用 + 自定义，typeId 只做本地留档。
 */
import * as React from 'react'
import type { PreviewField } from './lib/api'
import * as api from './lib/api'
import { errorText } from './lib/api'
import { AutoTextarea, Banner, Button, Field, IconButton, Input } from './ui/base'
import { Dialog, Select, Switch } from './ui/radix'
import { Alert, ArrowRight, Calendar, Check, ChevronLeft, Users, Video, X } from './ui/icons'
import type { ToastApi } from './ui/toast'

export interface CreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  toast: ToastApi
  /** 创建成功：把新会 id 交回上层，由它决定跳详情还是刷列表 */
  onCreated: (meetingId?: string) => void
}

type Stage = 'form' | 'preview'

interface MeetingTypeDef {
  id: string
  label: string
  desc: string
  icon: React.ReactNode
  /** 该类型的默认口径：只是把演示值填进表单，用户随时可改 */
  defaults: { subjectHint: string; durationMinutes: number; cloudRecord: boolean; autoTranscribe: boolean; note: string }
}

const TYPES: MeetingTypeDef[] = [
  {
    id: 'general',
    label: '通用会议',
    desc: '不预设口径，字段全按默认值',
    icon: <Video size={16} />,
    defaults: { subjectHint: '', durationMinutes: 60, cloudRecord: true, autoTranscribe: true, note: '' }
  },
  {
    id: 'client',
    label: '客户沟通',
    desc: '带云录制与逐字稿，会后可出纪要',
    icon: <Users size={16} />,
    defaults: {
      subjectHint: '',
      durationMinutes: 45,
      cloudRecord: true,
      autoTranscribe: true,
      note: '客户沟通'
    }
  },
  {
    id: 'review',
    label: '内部评审',
    desc: '默认 90 分钟，开等候室',
    icon: <Check size={16} />,
    defaults: { subjectHint: '', durationMinutes: 90, cloudRecord: true, autoTranscribe: true, note: '内部评审' }
  },
  {
    id: 'weekly',
    label: '周会',
    desc: '默认周期性会议，30 分钟',
    icon: <Calendar size={16} />,
    defaults: { subjectHint: '', durationMinutes: 30, cloudRecord: true, autoTranscribe: true, note: '周会' }
  },
  {
    id: 'custom',
    label: '自定义',
    desc: '完全不预设，从空白填起',
    icon: <ArrowRight size={16} />,
    defaults: { subjectHint: '', durationMinutes: 60, cloudRecord: false, autoTranscribe: false, note: '' }
  }
]

const DURATIONS = [
  { value: '30', label: '30 分钟' },
  { value: '45', label: '45 分钟' },
  { value: '60', label: '1 小时' },
  { value: '90', label: '1.5 小时' },
  { value: '120', label: '2 小时' },
  { value: '180', label: '3 小时' },
  { value: 'custom', label: '指定结束时间' }
]

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** 默认开始时间：下一个整点（23 点后滚到次日 00:00，不产生「今天 00:00 已过去」） */
function nextWholeHour(): { date: string; time: string } {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:00`
  }
}

function addMinutes(date: string, time: string, minutes: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const base = new Date(y || 1970, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0)
  base.setMinutes(base.getMinutes() + minutes)
  return `${pad(base.getHours())}:${pad(base.getMinutes())}`
}

interface FormState {
  subject: string
  date: string
  startTime: string
  duration: string
  endTime: string
  passwordEnabled: boolean
  password: string
  recurring: boolean
  joinLimit: '1' | '2' | '3'
  cloudRecord: boolean
  autoTranscribe: boolean
  waitingRoom: boolean
  note: string
  tags: string[]
}

function initialForm(type: MeetingTypeDef): FormState {
  const start = nextWholeHour()
  return {
    subject: type.defaults.subjectHint,
    date: start.date,
    startTime: start.time,
    duration: String(type.defaults.durationMinutes),
    endTime: addMinutes(start.date, start.time, type.defaults.durationMinutes),
    passwordEnabled: false,
    password: '',
    recurring: type.id === 'weekly',
    joinLimit: '1',
    cloudRecord: type.defaults.cloudRecord,
    autoTranscribe: type.defaults.autoTranscribe,
    waitingRoom: type.id === 'review',
    note: type.defaults.note,
    tags: []
  }
}

export function CreateDialog(props: CreateDialogProps): React.ReactElement {
  const [stage, setStage] = React.useState<Stage>('form')
  const [form, setForm] = React.useState<FormState>(() => initialForm(TYPES[0]))
  const [preview, setPreview] = React.useState<PreviewField[]>([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [tagDraft, setTagDraft] = React.useState('')
  const [showMore, setShowMore] = React.useState(false)
  const subjectRef = React.useRef<HTMLInputElement | null>(null)

  // 每次重新打开都回到表单（否则会带着上次的残留状态提交）
  React.useEffect(() => {
    if (!props.open) return
    setStage('form')
    setForm(initialForm(TYPES[0]))
    setPreview([])
    setError('')
    setBusy(false)
    setTagDraft('')
    setShowMore(false)
  }, [props.open])

  React.useEffect(() => {
    if (stage !== 'form') return
    const timer = setTimeout(() => subjectRef.current?.focus(), 30)
    return () => clearTimeout(timer)
  }, [stage])

  const patch = (next: Partial<FormState>): void => setForm((f) => ({ ...f, ...next }))

  const commitTag = (): void => {
    const raw = tagDraft.trim()
    if (!raw) return
    const parts = raw
      .split(/[,，、;；]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!parts.length) return
    setForm((f) => {
      const next = [...f.tags]
      for (const p of parts) if (!next.includes(p)) next.push(p)
      return { ...f, tags: next }
    })
    setTagDraft('')
  }

  const buildBody = (): api.CreateFormBody => {
    const durationMinutes = Number(form.duration) || 60
    const body: api.CreateFormBody = {
      subject: form.subject.trim(),
      date: form.date,
      startTime: form.startTime,
      durationMinutes,
      passwordEnabled: form.passwordEnabled,
      recurring: form.recurring,
      joinLimit: Number(form.joinLimit) as 1 | 2 | 3,
      cloudRecord: form.cloudRecord,
      autoTranscribe: form.autoTranscribe,
      waitingRoom: form.waitingRoom,
      note: form.note.trim(),
      typeId: 'general'
    }
    if (form.passwordEnabled && form.password) body.password = form.password
    if (form.duration === 'custom') body.durationMinutes = undefined
    return body
  }

  const goPreview = async (): Promise<void> => {
    setError('')
    if (!form.subject.trim()) {
      setError('先填会议主题，不填的主题在腾讯侧也建不出来。')
      return
    }
    if (form.passwordEnabled && !/^\d{4,6}$/.test(form.password)) {
      setError('入会密码要 4 到 6 位数字。')
      return
    }
    setBusy(true)
    try {
      const r = await api.createMeeting(buildBody(), false)
      if (r.stage !== 'preview') {
        setError('预览没拿到，先别提交。稍后再点一次。')
        return
      }
      setPreview(r.fields)
      setStage('preview')
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const doCreate = async (): Promise<void> => {
    setError('')
    setBusy(true)
    try {
      const r = await api.createMeeting(buildBody(), true)
      if (r.stage === 'created') {
        const overridden = r.overridden ?? []
        props.toast.push(
          'ok',
          overridden.length
            ? `会议建好了，但企业策略覆盖了这些设置：${overridden.join('、')}`
            : r.message || '会议建好了。'
        )
        props.onCreated(r.detail?.brief.meetingId ?? r.meeting?.meetingId)
        props.onOpenChange(false)
      } else {
        setError('提交后没收到创建结果，去列表同步一次确认。')
      }
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const title = '新建会议'
  const desc = '主题、时间、录制是必填；其余在「更多选项」里。点「提交」直接创建。'

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={title}
      description={desc}
      wide
      dismissable={!busy}
      footer={
        <>
          <div className="tm-grow">
            <Steps stage={stage} />
          </div>
          <div className="tm-dialog-acts">
            {stage === 'form' ? (
              <>
                <Button onClick={() => props.onOpenChange(false)}>取消</Button>
                <Button variant="primary" onClick={() => void goPreview()} disabled={busy}>
                  {busy ? '正在生成预览…' : '下一步'}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setStage('form')} disabled={busy} icon={<ChevronLeft size={13} />}>
                  回去改
                </Button>
                <Button variant="primary" onClick={() => void doCreate()} disabled={busy}>
                  {busy ? '正在创建…' : '确认创建'}
                </Button>
              </>
            )}
          </div>
        </>
      }
    >
      {error ? (
        <Banner tone="err" icon={<Alert size={14} />}>
          {error}
        </Banner>
      ) : null}

      {stage === 'form' ? (
        <>
          <Field label="会议主题" htmlFor="tm-create-subject" required>
            <Input
              id="tm-create-subject"
              ref={subjectRef}
              value={form.subject}
              placeholder="例如：与南向基金王京一对一沟通"
              onChange={(e) => patch({ subject: e.target.value })}
            />
          </Field>

          <div className="tm-grid3">
            <Field label="日期" htmlFor="tm-create-date" required>
              <Input
                id="tm-create-date"
                type="date"
                value={form.date}
                onChange={(e) => patch({ date: e.target.value })}
              />
            </Field>
            <Field label="开始时间" htmlFor="tm-create-start" required>
              <Input
                id="tm-create-start"
                type="time"
                value={form.startTime}
                onChange={(e) => patch({ startTime: e.target.value })}
              />
            </Field>
            <Field label="时长" htmlFor="tm-create-duration" required>
              <Select
                id="tm-create-duration"
                ariaLabel="会议时长"
                value={form.duration}
                onValueChange={(v) => patch({ duration: v })}
                options={DURATIONS}
              />
            </Field>
          </div>

          {form.duration === 'custom' ? (
            <Field label="结束时间" htmlFor="tm-create-end" required>
              <Input
                id="tm-create-end"
                type="time"
                value={form.endTime}
                onChange={(e) => patch({ endTime: e.target.value })}
              />
            </Field>
          ) : null}

          <div className="tm-switch-row">
            <div className="tm-switch-text">
              <div className="tm-switch-title">入会密码</div>
              <div className="tm-switch-desc">默认不开。开了要填 4 到 6 位数字。</div>
            </div>
            <Switch
              checked={form.passwordEnabled}
              onCheckedChange={(v) => patch({ passwordEnabled: v })}
              label="入会密码"
            />
          </div>

          {form.passwordEnabled ? (
            <Field label="密码（4 到 6 位数字）" htmlFor="tm-create-pwd" required>
              <Input
                id="tm-create-pwd"
                inputMode="numeric"
                maxLength={6}
                value={form.password}
                onChange={(e) => patch({ password: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              />
            </Field>
          ) : null}



          <Field
            label="参会人标签"
            htmlFor="tm-create-tags"
          >
            <div className="tm-tagbox">
              {form.tags.map((tag) => (
                <span className="tm-tag-chip" key={tag}>
                  <span>{tag}</span>
                  <button
                    type="button"
                    className="tm-tag-x"
                    aria-label={`移除标签 ${tag}`}
                    onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                id="tm-create-tags"
                value={tagDraft}
                placeholder={form.tags.length ? '继续添加' : '输入姓名后回车'}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
                    e.preventDefault()
                    commitTag()
                  } else if (e.key === 'Backspace' && !tagDraft && form.tags.length) {
                    setForm((f) => ({ ...f, tags: f.tags.slice(0, -1) }))
                  }
                }}
                onBlur={commitTag}
              />
            </div>
          </Field>

          <Field label="备注" htmlFor="tm-create-note">
            <AutoTextarea
              id="tm-create-note"
              minRows={2}
              value={form.note}
              placeholder="这场会要谈什么，会后对照着看"
              onChange={(e) => patch({ note: e.target.value })}
            />
          </Field>
          <div className="tm-more">
            <button
              type="button"
              className="tm-more-toggle"
              aria-expanded={showMore}
              onClick={() => setShowMore((v) => !v)}
            >
              <span className="tm-more-label">{showMore ? '收起更多选项' : '更多选项'}</span>
            </button>
            {showMore ? (
              <div className="tm-more-body">
                <div className="tm-grid2">
                  <Field label="会议形式" htmlFor="tm-create-recurring">
                    <Select
                      id="tm-create-recurring"
                      ariaLabel="会议形式"
                      value={form.recurring ? '1' : '0'}
                      onValueChange={(v) => patch({ recurring: v === '1' })}
                      options={[
                        { value: '0', label: '单次会议' },
                        { value: '1', label: '周期性会议' }
                      ]}
                    />
                  </Field>
                  <Field label="入会限制" htmlFor="tm-create-join">
                    <Select
                      id="tm-create-join"
                      ariaLabel="入会限制"
                      value={form.joinLimit}
                      onValueChange={(v) => patch({ joinLimit: v as '1' | '2' | '3' })}
                      options={[
                        { value: '1', label: '所有人可入会' },
                        { value: '2', label: '仅受邀成员' },
                        { value: '3', label: '仅企业内部' }
                      ]}
                    />
                  </Field>
                </div>

                <div>
                  <div className="tm-switch-row">
                    <div className="tm-switch-text">
                      <div className="tm-switch-title">云录制</div>
                      <div className="tm-switch-desc">会后能不能拿到逐字稿与纪要，就看这一条。</div>
                    </div>
                    <Switch checked={form.cloudRecord} onCheckedChange={(v) => patch({ cloudRecord: v })} label="云录制" />
                  </div>
                  <div className="tm-switch-row">
                    <div className="tm-switch-text">
                      <div className="tm-switch-title">自动转写</div>
                      <div className="tm-switch-desc">要有云录制才生效。关掉就只有视频没有文字。</div>
                    </div>
                    <Switch
                      checked={form.autoTranscribe}
                      onCheckedChange={(v) => patch({ autoTranscribe: v })}
                      label="自动转写"
                    />
                  </div>
                  <div className="tm-switch-row">
                    <div className="tm-switch-text">
                      <div className="tm-switch-title">等候室</div>
                      <div className="tm-switch-desc">开启后由主持人在腾讯客户端放行。</div>
                    </div>
                    <Switch checked={form.waitingRoom} onCheckedChange={(v) => patch({ waitingRoom: v })} label="等候室" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {stage === 'preview' ? (
        <>
          <dl className="tm-preview">
            {preview.map((f) => (
              <div className="tm-preview-row" key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          {form.tags.length ? (
            <p className="tm-hint">本地标签：{form.tags.join('、')}</p>
          ) : null}
          <p className="tm-hint">点「确认创建」才会提交到腾讯会议；这一步之前什么都没发出去。</p>
        </>
      ) : null}
    </Dialog>
  )
}

function Steps(props: { stage: Stage }): React.ReactElement {
  const order: Array<{ key: Stage; label: string }> = [
    { key: 'form', label: '填内容' },
    { key: 'preview', label: '确认' }
  ]
  const index = order.findIndex((s) => s.key === props.stage)
  return (
    <div className="tm-steps">
      {order.map((s, i) => (
        <span
          key={s.key}
          className={`tm-step${i === index ? ' is-on' : ''}${i < index ? ' is-done' : ''}`}
          aria-current={i === index ? 'step' : undefined}
        >
          <span className="tm-step-num">{i < index ? <Check size={9} /> : i + 1}</span>
          {s.label}
        </span>
      ))}
    </div>
  )
}

export { IconButton }
