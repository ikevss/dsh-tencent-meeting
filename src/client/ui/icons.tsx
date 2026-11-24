/**
 * 内联图标：全部 stroke="currentColor"、strokeWidth 1.6，无 emoji。
 * 自己画而不是引图标库：宿主只提供 react / react-dom 两个模块，图标库要打进包里；
 * 需要的样子只有十几个，手写反而更可控（尺寸、线宽、对齐一致）。
 */
import * as React from 'react'

export interface IconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

const BASE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: 'false' as const
}

function Svg(props: IconProps & { viewBox?: string; children: React.ReactNode }): React.ReactElement {
  const size = props.size ?? 16
  // children 在调用处是「多个 <path/>」→ 传进来是一个数组；
  // 数组当单个子节点传会给每个 path 报「缺 key」，toArray 顺手补上。
  const inner = React.Children.toArray(props.children)
  return (
    <svg
      width={size}
      height={size}
      viewBox={props.viewBox ?? '0 0 16 16'}
      {...BASE}
      className={props.className}
      style={props.style}
    >
      {inner}
    </svg>
  )
}

/** 侧边栏入口图标：会议屏 + 声波。接收宿主传的 props.size / props.active。 */
export function MeetingIcon(props: IconProps & { active?: boolean }): React.ReactElement {
  const size = props.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...BASE} className={props.className} style={props.style}>
      <rect x="1.6" y="3.2" width="9.2" height="9.6" rx="1.6" />
      <path d="M10.8 7.1l3.6-1.9v5.6l-3.6-1.9" />
    </svg>
  )
}

export function Plus(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M8 3.2v9.6M3.2 8h9.6" />
    </Svg>
  )
}

export function ChevronRight(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M6.2 3.6L10.6 8l-4.4 4.4" />
    </Svg>
  )
}

export function ChevronLeft(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M9.8 3.6L5.4 8l4.4 4.4" />
    </Svg>
  )
}

export function ChevronDown(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M3.6 6.2L8 10.6l4.4-4.4" />
    </Svg>
  )
}

export function X(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </Svg>
  )
}

export function Check(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M3 8.6l3.2 3.2L13 4.6" />
    </Svg>
  )
}

export function Refresh(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M13.2 8a5.2 5.2 0 1 1-1.7-3.9" />
      <path d="M13.4 2.2v3.2h-3.2" />
    </Svg>
  )
}

export function Filter(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M2.4 3.6h11.2l-4.2 4.6v4.4l-2.8-1.6V8.2z" />
    </Svg>
  )
}

export function Search(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <circle cx="7.2" cy="7.2" r="4.4" />
      <path d="M10.6 10.6l2.8 2.8" />
    </Svg>
  )
}

export function ArrowRight(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M2.8 8h10M9.2 4.4L12.8 8l-3.6 3.6" />
    </Svg>
  )
}

export function Clock(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <circle cx="8" cy="8" r="5.8" />
      <path d="M8 4.6V8l2.4 1.6" />
    </Svg>
  )
}

export function Alert(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M8 2.6l6 10.4H2z" />
      <path d="M8 6.6v3" />
      <path d="M8 11.4v.6" />
    </Svg>
  )
}

export function Download(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M8 2.4v7.2M5 6.8l3 3 3-3" />
      <path d="M2.8 11.6v1.6h10.4v-1.6" />
    </Svg>
  )
}

export function ExternalLink(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M6.4 3.2H3.4v9.6h9.4V9.6" />
      <path d="M9.4 2.8h3.8v3.8M13 3l-5.2 5.2" />
    </Svg>
  )
}

export function Copy(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <rect x="5.2" y="5.2" width="8" height="8" rx="1.4" />
      <path d="M10.8 5.2V3.8a1.4 1.4 0 0 0-1.4-1.4H3.8a1.4 1.4 0 0 0-1.4 1.4v5.6a1.4 1.4 0 0 0 1.4 1.4h1.4" />
    </Svg>
  )
}

export function Users(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <circle cx="6" cy="5.4" r="2.4" />
      <path d="M1.8 13.2c0-2.2 1.9-3.6 4.2-3.6s4.2 1.4 4.2 3.6" />
      <path d="M10.6 3.4a2.2 2.2 0 0 1 0 4.2M11.8 13.2c0-1.4-.4-2.4-1.2-3" />
    </Svg>
  )
}

export function Play(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <circle cx="8" cy="8" r="5.8" />
      <path d="M6.6 5.6l4 2.4-4 2.4z" />
    </Svg>
  )
}

export function Shield(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M8 2l4.6 1.8v3.6c0 2.8-1.9 4.7-4.6 5.6-2.7-.9-4.6-2.8-4.6-5.6V3.8z" />
    </Svg>
  )
}

export function Link(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M6.6 9.4a2.6 2.6 0 0 0 3.7 0l2-2a2.6 2.6 0 0 0-3.7-3.7l-1 1" />
      <path d="M9.4 6.6a2.6 2.6 0 0 0-3.7 0l-2 2a2.6 2.6 0 0 0 3.7 3.7l1-1" />
    </Svg>
  )
}

export function Maximize(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M8 3.2h2.8M8 3.2v2.8M8 3.2L3.2 8M8 12.8H5.2M8 12.8v-2.8M8 12.8l4.8-4.8M12.8 8V5.2M12.8 8h-2.8" />
      <path d="M3.2 8V5.2A2 2 0 0 1 5.2 3.2H8M12.8 8v2.8a2 2 0 0 1-2 2H8" />
    </Svg>
  )
}

export function Settings(p: IconProps): React.ReactElement {
  return (
    <Svg {...p} viewBox="0 0 24 24">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

export function MoreHorizontal(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M3.4 8h.02M8 8h.02M12.6 8h.02" />
    </Svg>
  )
}

export function Doc(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M9 2.2H4.4a1.2 1.2 0 0 0-1.2 1.2v9.2a1.2 1.2 0 0 0 1.2 1.2h7.2a1.2 1.2 0 0 0 1.2-1.2V6z" />
      <path d="M9 2.2V6h3.8M5.6 8.6h4.8M5.6 11h3.2" />
    </Svg>
  )
}

export function ListCheck(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M2.6 4.2l1.2 1.2 2-2.2M2.6 10l1.2 1.2 2-2.2" />
      <path d="M8.6 4.8h5M8.6 10.4h5" />
    </Svg>
  )
}

export function Trash(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M2.8 4.4h10.4M6.2 4.4V3a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1v1.4" />
      <path d="M4.2 4.4l.6 8.2a1 1 0 0 0 1 .9h4.4a1 1 0 0 0 1-.9l.6-8.2" />
    </Svg>
  )
}

export function Calendar(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <rect x="2.4" y="3.6" width="11.2" height="10" rx="1.4" />
      <path d="M5.6 2.2v2.6M10.4 2.2v2.6M2.4 6.6h11.2" />
    </Svg>
  )
}

export function Video(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <rect x="1.8" y="4" width="8.4" height="8" rx="1.4" />
      <path d="M10.2 7.4l4-2.2v5.6l-4-2.2" />
    </Svg>
  )
}

export function Microphone(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <rect x="6" y="1.8" width="4" height="7" rx="2" />
      <path d="M3.8 7.4a4.2 4.2 0 0 0 8.4 0M8 11.6v2.6" />
    </Svg>
  )
}

/** AI 生成中的笔：class="tm-pen" 驱动描边动画（静态就是 BUG）。 */
export function Pen(p: IconProps): React.ReactElement {
  return (
    <Svg {...p} className={[p.className, 'tm-pen'].filter(Boolean).join(' ')}>
      <path d="M2.6 13.4l.9-3.2 6.7-6.7a1.6 1.6 0 0 1 2.3 2.3l-6.7 6.7z" />
      <path d="M9.4 3.8l2.8 2.8" />
    </Svg>
  )
}

export function Wand(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M2.4 13.6l7.4-7.4" />
      <path d="M10.4 2.2v2.4M9.2 3.4h2.4M13.2 6.2v2M12.2 7.2h2" />
    </Svg>
  )
}

/** 发送：纸飞机（对话输入框的右下角按钮） */
export function Send(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M2.5 8.4 13.5 2.8 8.8 13.6 6.9 9.4z" />
      <path d="M6.9 9.4 13.5 2.8" />
    </Svg>
  )
}

export function Logout(p: IconProps): React.ReactElement {
  return (
    <Svg {...p}>
      <path d="M6 2.6H3.4a1.2 1.2 0 0 0-1.2 1.2v8.4a1.2 1.2 0 0 0 1.2 1.2H6" />
      <path d="M10.4 11l3-3-3-3M13.4 8H6" />
    </Svg>
  )
}
