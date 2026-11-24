/**
 * Radix 底座：Dialog / Tabs / Select / DropdownMenu / Switch。
 *
 * 为什么必须用 Radix（不许手写）：键盘漫游、Home/End、焦点归还、
 * aria-selected / aria-expanded 跟随面板，这些手写一遍就是一天，写错还看不出来。
 * 这些库打进 bundle，不走 require（宿主模块表只有 react / react-dom）。
 */
import * as React from 'react'
import * as RDialog from '@radix-ui/react-dialog'
import * as RTabs from '@radix-ui/react-tabs'
import * as RSelect from '@radix-ui/react-select'
import * as RMenu from '@radix-ui/react-dropdown-menu'
import * as RSwitch from '@radix-ui/react-switch'
import { Check, ChevronDown, X } from './icons'

/* ── Dialog ── */

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** 反馈动作进行中时禁止关闭（Esc / 遮罩 / 关闭按钮一起禁） */
  dismissable?: boolean
  wide?: boolean
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Dialog(props: DialogProps): React.ReactElement {
  const dismissable = props.dismissable !== false
  return (
    <RDialog.Root
      open={props.open}
      onOpenChange={(next) => {
        if (!dismissable && !next) return
        props.onOpenChange(next)
      }}
    >
      <RDialog.Portal>
        <RDialog.Overlay className="tm-overlay" />
        <RDialog.Content
          className={`tm-dialog${props.wide ? ' is-wide' : ''}`}
          onEscapeKeyDown={(e) => {
            if (!dismissable) e.preventDefault()
          }}
          onPointerDownOutside={(e) => {
            if (!dismissable) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (!dismissable) e.preventDefault()
          }}
        >
          <div className="tm-dialog-h">
            <div className="tm-grow tm-stack" style={{ gap: 0 }}>
              <RDialog.Title className="tm-dialog-title">{props.title}</RDialog.Title>
              {props.description ? (
                <RDialog.Description className="tm-dialog-desc">{props.description}</RDialog.Description>
              ) : null}
            </div>
            <RDialog.Close asChild>
              <button type="button" className="tm-iconbtn" aria-label="关闭" disabled={!dismissable}>
                <X size={15} />
              </button>
            </RDialog.Close>
          </div>
          <div className="tm-dialog-b">{props.children}</div>
          {props.footer ? <div className="tm-dialog-f">{props.footer}</div> : null}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  )
}

/* ── Tabs ── */

export interface TabItem {
  value: string
  label: string
  disabled?: boolean
  /** 禁用原因：不放 title 就是「点了没反应也说不清」 */
  reason?: string
}

export const TabsRoot = RTabs.Root
export const TabsContent = RTabs.Content

export function TabList(props: {
  items: TabItem[]
  value: string
  onValueChange: (v: string) => void
  label?: string
}): React.ReactElement {
  return (
    <RTabs.List className="tm-tablist" aria-label={props.label ?? '会议内容'}>
      {props.items.map((t) => (
        <RTabs.Trigger
          key={t.value}
          value={t.value}
          disabled={t.disabled}
          className="tm-tab"
          title={t.disabled ? t.reason || '这个页签现在不可用' : undefined}
        >
          {t.label}
        </RTabs.Trigger>
      ))}
    </RTabs.List>
  )
}

/* ── Select ── */

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export function Select(props: {
  value: string
  onValueChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  ariaLabel: string
  id?: string
}): React.ReactElement {
  const current = props.options.find((o) => o.value === props.value)
  return (
    <RSelect.Root value={props.value} onValueChange={props.onValueChange} disabled={props.disabled}>
      <RSelect.Trigger className="tm-sel-trigger" aria-label={props.ariaLabel} id={props.id}>
        <span className="tm-sel-value">
          <RSelect.Value placeholder={props.placeholder ?? '请选择'}>{current ? current.label : undefined}</RSelect.Value>
        </span>
        <RSelect.Icon>
          <ChevronDown size={13} />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content className="tm-sel-content" position="popper" sideOffset={4}>
          <RSelect.Viewport className="tm-sel-viewport">
            {props.options.map((o) => (
              <RSelect.Item key={o.value} value={o.value} disabled={o.disabled} className="tm-sel-item">
                <span style={{ width: 12, display: 'inline-flex', flex: 'none' }}>
                  <RSelect.ItemIndicator>
                    <Check size={12} />
                  </RSelect.ItemIndicator>
                </span>
                <RSelect.ItemText>
                  <span className="tm-sel-item-text">{o.label}</span>
                </RSelect.ItemText>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  )
}

/* ── DropdownMenu ── */

export const MenuRoot = RMenu.Root
export const MenuTrigger = RMenu.Trigger
export const MenuSeparator = (): React.ReactElement => <RMenu.Separator className="tm-menu-sep" />

export function MenuContent(props: { children: React.ReactNode; align?: 'start' | 'end' }): React.ReactElement {
  return (
    <RMenu.Portal>
      <RMenu.Content className="tm-menu-content" align={props.align ?? 'end'} sideOffset={4}>
        {props.children}
      </RMenu.Content>
    </RMenu.Portal>
  )
}

export function MenuItem(props: {
  onSelect?: () => void
  children: React.ReactNode
  danger?: boolean
  disabled?: boolean
}): React.ReactElement {
  return (
    <RMenu.Item
      className={`tm-menu-item${props.danger ? ' is-danger' : ''}`}
      disabled={props.disabled}
      onSelect={() => props.onSelect?.()}
    >
      {props.children}
    </RMenu.Item>
  )
}

export function MenuLabel(props: { children: React.ReactNode }): React.ReactElement {
  return <RMenu.Label className="tm-menu-label">{props.children}</RMenu.Label>
}

/* ── Switch ── */

export function Switch(props: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  label: string
}): React.ReactElement {
  return (
    <RSwitch.Root
      checked={props.checked}
      onCheckedChange={props.onCheckedChange}
      disabled={props.disabled}
      className="tm-switch"
      aria-label={props.label}
    >
      <RSwitch.Thumb className="tm-switch-thumb" />
    </RSwitch.Root>
  )
}
