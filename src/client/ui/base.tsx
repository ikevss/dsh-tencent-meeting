/**
 * 基础件：按钮 / 输入 / 文本域 / 徽标 / 卡片 / 提示条 / 空态 / 加载。
 *
 * 全部是薄壳：样式在 styles.css，这里只管结构与可访问性属性。
 * 可点元素一定带 type="button"（否则落在表单里会变成提交按钮）。
 */
import * as React from 'react'

type Variant = 'primary' | 'ghost' | 'subtle' | 'text' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  icon?: React.ReactNode
}

export function Button(props: ButtonProps): React.ReactElement {
  const { variant = 'ghost', size = 'md', block, icon, className, children, type, ...rest } = props
  const cls = [
    'tm-btn',
    `is-${variant}`,
    size === 'sm' ? 'is-sm' : size === 'lg' ? 'is-lg' : '',
    block ? 'is-block' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button {...rest} type={type ?? 'button'} className={cls}>
      {icon}
      {children}
    </button>
  )
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

/** 图标按钮：label 变成 aria-label 与 title，不靠图形单独承载语义。 */
export function IconButton(props: IconButtonProps): React.ReactElement {
  const { label, className, children, type, ...rest } = props
  return (
    <button
      {...rest}
      type={type ?? 'button'}
      className={['tm-iconbtn', className ?? ''].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  )
}

export interface FieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: string
  hintTone?: 'warn' | 'err'
  children: React.ReactNode
}

export function Field(props: FieldProps): React.ReactElement {
  return (
    <div className="tm-field">
      <label className="tm-label" htmlFor={props.htmlFor}>
        {props.label}
        {props.required ? <span className="tm-req">*</span> : null}
      </label>
      {props.children}
      {props.hint ? (
        <span className={`tm-hint${props.hintTone === 'warn' ? ' is-warn' : props.hintTone === 'err' ? ' is-err' : ''}`}>
          {props.hint}
        </span>
      ) : null}
    </div>
  )
}

/** forwardRef 是必需的：建会弹窗要用 ref 把焦点送到主题输入框 */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    const { className, ...rest } = props
    return <input {...rest} ref={ref} className={['tm-input', className ?? ''].filter(Boolean).join(' ')} />
  }
)

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>): React.ReactElement {
  const { className, ...rest } = props
  return <textarea {...rest} className={['tm-textarea', className ?? ''].filter(Boolean).join(' ')} />
}

/**
 * 会自己长高、也会自己缩回去的多行输入。
 *
 * 为什么不用 rows：rows 是固定行高，用户删完内容框还顶着一大块空白；
 * 而单纯设 min-height 又解决不了「长到看不见」。这里每次输入把 height 归零再量
 * scrollHeight —— 这是唯一能让框「内容清空后收回去」的做法。
 */
export function AutoTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number; maxPx?: number }
): React.ReactElement {
  const { className, minRows = 2, maxPx = 220, value, onChange, ...rest } = props
  const ref = React.useRef<HTMLTextAreaElement | null>(null)

  const resize = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const next = Math.min(el.scrollHeight, maxPx)
    el.style.height = `${next}px`
  }, [maxPx])

  React.useEffect(() => {
    resize()
  }, [value, resize])

  return (
    <textarea
      {...rest}
      ref={ref}
      rows={minRows}
      value={value}
      onChange={(e) => {
        onChange?.(e)
        resize()
      }}
      className={['tm-textarea', 'is-auto', className ?? ''].filter(Boolean).join(' ')}
    />
  )
}

type BadgeTone = 'muted' | 'brand' | 'ok' | 'warn' | 'err'

export function Badge(props: { tone?: BadgeTone; children: React.ReactNode; title?: string }): React.ReactElement {
  return (
    <span className={`tm-badge is-${props.tone ?? 'muted'}`} title={props.title}>
      {props.children}
    </span>
  )
}

export function Card(props: { children: React.ReactNode; className?: string }): React.ReactElement {
  return <div className={['tm-card', props.className ?? ''].filter(Boolean).join(' ')}>{props.children}</div>
}

export function CardHeader(props: {
  title: React.ReactNode
  sub?: React.ReactNode
  extra?: React.ReactNode
}): React.ReactElement {
  return (
    <div className="tm-card-h">
      <div className="tm-grow tm-stack" style={{ gap: 0 }}>
        <span className="tm-strong" style={{ fontSize: 13 }}>
          {props.title}
        </span>
        {props.sub ? <span className="tm-caption">{props.sub}</span> : null}
      </div>
      {props.extra ? <div className="tm-shrink0">{props.extra}</div> : null}
    </div>
  )
}

export function Banner(props: {
  tone?: 'warn' | 'err'
  icon?: React.ReactNode
  children: React.ReactNode
  action?: React.ReactNode
}): React.ReactElement {
  // 额度用满不是「坏了」：全页面统一降级为琥珀提醒，红条只留给真错误。
  // （验收反馈：额度用完时到处红条 + 重置按钮错乱，观感像插件崩了）
  const quotaText = typeof props.children === 'string' && (props.children.includes('额度') || props.children.includes('已达上限'))
  const tone = quotaText ? 'warn' : props.tone ?? 'warn'
  const body = quotaText ? '今日额度已满，这次没拉到新数据；已有的内容照常能看。' : props.children
  return (
    <div className={`tm-banner is-${tone}`} role="status">
      {props.icon ? <span className="tm-shrink0 tm-banner-icon">{props.icon}</span> : null}
      <span className="tm-grow">{body}</span>
      {props.action ? <span className="tm-shrink0">{props.action}</span> : null}
    </div>
  )
}

/** 列表骨架：等待时先把「将要有几行、每行多高」画出来，比转圈更不让人焦虑。 */
export function SkeletonRows(props: { rows?: number }): React.ReactElement {
  const rows = props.rows ?? 4
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className="tm-skeleton-row" key={i}>
          <span className="tm-skeleton" style={{ width: 7, height: 7, borderRadius: 999 }} />
          <span className="tm-grow" style={{ display: 'grid', gap: 6 }}>
            <span className="tm-skeleton tm-skeleton-line" style={{ width: `${68 - i * 7}%` }} />
            <span className="tm-skeleton tm-skeleton-line" style={{ width: `${42 - i * 4}%`, height: 8 }} />
          </span>
        </div>
      ))}
    </div>
  )
}

/** 不确定时长的细进度条：贴在某块区域顶部，表示「这块在刷新」。 */
export function Progress(): React.ReactElement {
  return <div className="tm-progress" role="progressbar" aria-label="正在加载" />
}

export function Empty(props: {
  title: string
  desc?: string
  actions?: React.ReactNode
}): React.ReactElement {
  return (
    <div className="tm-empty">
      <p className="tm-empty-title">{props.title}</p>
      {props.desc ? <p className="tm-empty-desc">{props.desc}</p> : null}
      {props.actions ? <div className="tm-empty-acts">{props.actions}</div> : null}
    </div>
  )
}

export function Spinner(): React.ReactElement {
  return <span className="tm-spinner" role="status" aria-label="正在加载" />
}

export function LoadingRow(props: { text?: string }): React.ReactElement {
  return (
    <div className="tm-loading-row">
      <Spinner />
      <span>{props.text ?? '正在取回数据…'}</span>
    </div>
  )
}

/** 键值表：dt/dd 语义，屏幕阅读器能配对。 */
export function KeyValues(props: { rows: Array<{ label: string; value: React.ReactNode }> }): React.ReactElement {
  return (
    <dl className="tm-kv">
      {props.rows.map((r) => (
        <React.Fragment key={r.label}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

export function Separator(): React.ReactElement {
  return <hr className="tm-sep" />
}

/**
 * 长列表先只显示一页，其余折起来。
 *
 * 为什么必须有：一屏塞进几十行，读者看到的是一片灰，找不到自己要的那条；
 * 先给 8 条 + 「还有 N 条」，是让列表先可读，而不是把内容隐瞒。
 * 超过 8 条的所有 .map 都走它。
 */
export function useReveal<T>(items: T[], step = 8): {
  all: T[]
  shown: T[]
  hidden: number
  expanded: boolean
  reveal: () => void
  collapse: () => void
} {
  const [limit, setLimit] = React.useState(step)
  React.useEffect(() => {
    setLimit(step)
  }, [step, items.length === 0])
  const shown = items.length > limit ? items.slice(0, limit) : items
  return {
    all: items,
    shown,
    hidden: Math.max(0, items.length - shown.length),
    expanded: limit > step,
    reveal: () => setLimit((n) => n + step),
    collapse: () => setLimit(step)
  }
}

export function RevealMore(props: {
  hidden: number
  total: number
  onReveal: () => void
  onCollapse?: () => void
  expanded?: boolean
  noun?: string
}): React.ReactElement | null {
  if (!props.hidden && !props.expanded) return null
  const noun = props.noun ?? '条'
  return (
    <div className="tm-reveal">
      {props.hidden ? (
        <Button size="sm" variant="text" onClick={props.onReveal}>
          展开其余 {props.hidden} {noun}（共 {props.total} {noun}）
        </Button>
      ) : null}
      {props.expanded && props.onCollapse ? (
        <Button size="sm" variant="text" onClick={props.onCollapse}>
          收起
        </Button>
      ) : null}
    </div>
  )
}
