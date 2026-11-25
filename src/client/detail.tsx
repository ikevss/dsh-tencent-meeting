/**
 * 会议详情页。
 *
 * 结构：标题行（返回 + 标题 + 状态徽标 + 操作菜单）→ 页签 → 右侧目录。
 * 纪律：
 *  - 真实生效设置要标出「被企业策略覆盖」的字段，不能让用户以为自己设的生效了；
 *  - 禁用页签必须给原因（title + 屏内一行说明），不能点了没反应；
 *  - 右侧目录是常驻窄栏 + 悬停提高不透明度，键盘 Tab 进去也会亮；它不覆盖正文。
 */
import * as React from 'react'
import type {
  ContentStates,
  ContentView,
  MeetingBrief,
  MeetingDetailView,
  OutputKind,
  OutputView,
  PersonRow
} from '../shared/types'
import { OUTPUT_KINDS, OUTPUT_LABELS, emptyStates, formatAbsoluteRange, formatMeetingCode, isEnded, isLive } from '../shared/types'
import * as api from './lib/api'
import { errorText } from './lib/api'
import { markdownToHtmlDocument, renderMarkdown } from './lib/markdown'
import { PasteDialog } from './paste-dialog'
import { AutoTextarea, Banner, Badge, Button, Card, CardHeader, Empty, Field, IconButton, Input, KeyValues, LoadingRow, RevealMore, SkeletonRows, Spinner, useReveal } from './ui/base'
import { Dialog, Select, Switch, TabList, TabsContent, TabsRoot } from './ui/radix'
import {
  Alert,
  ChevronLeft,
  ChevronRight,
  Copy,
  Doc,
  ExternalLink,
  ListCheck,
  Microphone,
  MoreHorizontal,
  Maximize,
  Pen,
  Play,
  Plus,
  Refresh,
  Search,
  Send,
  Trash,
  Users,
  Video,
  Wand,
  X
} from './ui/icons'
import type { ToastApi } from './ui/toast'

export interface DetailProps {
  meetingId: string
  /** 独立页才需要返回；嵌入右侧大区域时不用 */
  onBack?: () => void
  toast: ToastApi
  /** 列表里的简报：详情还在取时先用它把标题画出来，避免整屏空白 */
  brief?: MeetingBrief
  onChanged: () => void
  /** 实时事件：服务端回读后的真实状态，直接用来刷新页签与徽标 */
  liveEvent?: api.PushEvent | null
  /** 实时同步档位：连接中 / 实时 / 已断开 */
  syncState?: 'connecting' | 'live' | 'degraded' | 'off'
  /** 嵌入右侧大区域：隐藏返回按钮（左侧列表负责切换） */
  embedded?: boolean
}

type Pane = 'overview' | 'transcript' | 'minutes' | 'todos' | 'outputs'

/** 页签记忆：切走再回来停在原来的页签（每场会各记一个） */
const paneMemo = new Map<string, Pane>()

function rememberPane(meetingId: string, pane: Pane): void {
  paneMemo.set(meetingId, pane)
}

const PANES: Array<{ value: Pane; label: string }> = [
  { value: 'overview', label: '概览' },
  { value: 'transcript', label: '逐字稿' },
  { value: 'minutes', label: '纪要' },
  { value: 'todos', label: '待办' },
  { value: 'outputs', label: '会后产出' }
]

/* ── 会议详情 · 组件级缓存（切走再回来先顶上旧内容，不重新转圈） ── */

const peopleMemo = new Map<string, { rows: PersonRow[]; warning: string }>()

/** 用户偏好：完成后是否在面板内弹提示（关掉也会刷新出结果，只是不弹） */
function useNotifyOnReady(): boolean {
  const [on, setOn] = React.useState(true)
  React.useEffect(() => {
    void api.getSettings().then((s) => setOn(Boolean(s.prefs.notifyOnReady))).catch(() => {})
  }, [])
  return on
}

export function Detail(props: DetailProps): React.ReactElement {
  // 先拿本机已有内容顶上（切走再回来不该再等一次），后台静默更新
  const [detail, setDetail] = React.useState<MeetingDetailView | null>(() => api.cachedMeeting(props.meetingId))
  const [detailError, setDetailError] = React.useState('')
  const [detailLoading, setDetailLoading] = React.useState(() => !api.cachedMeeting(props.meetingId))
  const [states, setStates] = React.useState<ContentStates>(() => emptyStates())
  const [pane, setPaneState] = React.useState<Pane>(() => paneMemo.get(props.meetingId) ?? 'overview')

  const setPane = (v: Pane): void => {
    rememberPane(props.meetingId, v)
    setPaneState(v)
  }
  const [participants, setParticipants] = React.useState<PersonRow[]>(() => peopleMemo.get(props.meetingId)?.rows ?? [])
  const [peopleWarning, setPeopleWarning] = React.useState(() => peopleMemo.get(props.meetingId)?.warning ?? '')
  const [peopleLoading, setPeopleLoading] = React.useState(() => !peopleMemo.has(props.meetingId))
  /** 录制查看申请：两步（预览 → 提交），提交前必须让用户看清楚这一步会发给谁 */
  const [permOpen, setPermOpen] = React.useState(false)
  const [permPreview, setPermPreview] = React.useState('')
  const [permBusy, setPermBusy] = React.useState(false)
  const [permError, setPermError] = React.useState('')
  const [recognizing, setRecognizing] = React.useState(false)
  const [confirmCancel, setConfirmCancel] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [invitees, setInvitees] = React.useState<api.InviteeRow[]>([])
  const [inviteesError, setInviteesError] = React.useState('')
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  /** 邀请文案回显弹窗 */
  const [inviteTextOpen, setInviteTextOpen] = React.useState(false)
  const [inviteText, setInviteText] = React.useState('')
  /** 标题修改 */
  const [titleOpen, setTitleOpen] = React.useState(false)
  const [titleDraft, setTitleDraft] = React.useState('')
  const [titleBusy, setTitleBusy] = React.useState(false)
  const [titleError, setTitleError] = React.useState('')

  // 自建弹层必须自己管这两条：点外面关、Esc 关——否则用户觉得界面卡住（验收意见 8 的教训）
  React.useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent): void => {
      if ((e.target as Element).closest?.(".tm-menu-wrap")) return
      setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])
  const aliveRef = React.useRef(true)

  const loadInvitees = React.useCallback(async () => {
    try {
      const r = await api.getInvitees(props.meetingId)
      if (!aliveRef.current) return
      setInvitees(r.invitees ?? [])
      setInviteesError('')
    } catch (e) {
      if (!aliveRef.current) return
      setInviteesError(errorText(e))
      setInvitees([])
    }
  }, [props.meetingId])

  const loadDetail = React.useCallback(
    async (showSpinner: boolean) => {
      if (showSpinner) setDetailLoading(true)
      try {
        const r = await api.getMeeting(props.meetingId)
        if (!aliveRef.current) return
        setDetail(r)
        setDetailError('')
      } catch (e) {
        if (!aliveRef.current) return
        setDetailError(errorText(e))
      } finally {
        if (aliveRef.current) setDetailLoading(false)
      }
    },
    [props.meetingId]
  )

  const loadStates = React.useCallback(async () => {
    try {
      const r = await api.getStates(props.meetingId)
      if (!aliveRef.current) return
      setStates(r)
    } catch {
      /* 派生状态取不到不影响正文，界面按 emptyStates 的保守值走 */
    }
  }, [props.meetingId])

  // 实时事件到达：服务端已回读真实状态，直接采用（不重新推导，避免客户端算错）
  React.useEffect(() => {
    const e = props.liveEvent
    if (!e || e.meetingId !== props.meetingId) return
    if (e.states) setStates(e.states)
    if (e.eventKey === 'meeting.end' || e.eventKey === 'meeting.canceled') {
      void loadDetail(false)
      void loadStates()
    }
  }, [props.liveEvent, props.meetingId, loadStates, loadDetail])

  const loadPeople = React.useCallback(async () => {
    // 有旧名单就先留着，后台悄悄更新；没有才抬 loading
    if (!peopleMemo.has(props.meetingId)) setPeopleLoading(true)
    try {
      const r = await api.getParticipants(props.meetingId)
      if (!aliveRef.current) return
      peopleMemo.set(props.meetingId, { rows: r.rows ?? [], warning: r.warning ?? '' })
      setParticipants(r.rows ?? [])
      setPeopleWarning(r.warning ?? '')
    } catch (e) {
      if (!aliveRef.current) return
      setPeopleWarning(errorText(e))
      setParticipants([])
    } finally {
      if (aliveRef.current) setPeopleLoading(false)
    }
  }, [props.meetingId])

  React.useEffect(() => {
    aliveRef.current = true
    // 不强制抬骨架：初始 loading 已经按「有没有缓存」定好了
    void loadDetail(false)
    void loadStates()
    void loadPeople()
    void loadInvitees()
    return () => {
      aliveRef.current = false
    }
  }, [loadDetail, loadStates, loadPeople, loadInvitees])

  // 进详情就后台把逐字稿/纪要预热到缓存（验收意见 2：别等用户点开页签才开始取）。
  // 服务端有两层缓存在，新鲜的正文这次请求根本不会碰腾讯接口，不额外烧额度。
  React.useEffect(() => {
    const id = props.meetingId
    const b = props.brief
    if (!id || !b) return
    const hasRecord = (b.recordsTotal ?? 0) > 0 || (b.records?.length ?? 0) > 0 || b.hasTranscript
    if (!hasRecord) return
    for (const kind of ['transcript', 'minutes'] as const) {
      if (api.cachedContent(id, kind)) continue
      void api.getContent(id, kind).catch(() => {})
    }
  }, [props.meetingId, props.brief])

  const brief = detail?.brief ?? props.brief
  const ended = brief ? isEnded(brief) : false
  const live = brief ? isLive(brief) : false

  const badge = ended
    ? { text: '已结束', tone: 'muted' as const }
    : live
      ? { text: '进行中', tone: 'ok' as const }
      : { text: '未开始', tone: 'brand' as const }

  /** 复制邀请：先取文案，再弹窗回显（用户要「无需担忧」看到到底复制了什么） */
  const copyInvite = async (): Promise<void> => {
    try {
      const r = await api.getInviteText(props.meetingId)
      setInviteText(r.text)
      setInviteTextOpen(true)
      await api.copyText(r.text)
    } catch (e) {
      props.toast.push('err', errorText(e))
    }
  }

  /** 修改标题：即将开始/进行中走腾讯同步，历史会议只改本机 */
  const saveSubject = async (): Promise<void> => {
    const subject = titleDraft.trim()
    if (!subject || subject === brief?.subject) {
      setTitleOpen(false)
      return
    }
    setTitleBusy(true)
    setTitleError('')
    try {
      const r = await api.saveSubject(props.meetingId, subject)
      props.toast.push('ok', r.mode === 'cloud' ? '标题已同步到腾讯会议。' : '标题已在本机修改（历史会议不同步腾讯）。')
      setTitleOpen(false)
      await loadDetail(false)
      props.onChanged()
    } catch (e) {
      setTitleError(errorText(e))
    } finally {
      setTitleBusy(false)
    }
  }

  const copyJoin = async (url: string): Promise<void> => {
    const ok = await api.copyText(url)
    props.toast.push(ok ? 'ok' : 'err', ok ? '入会链接已复制。' : '复制没成功，请手动选中再复制。')
  }

  const openReplay = async (): Promise<void> => {
    try {
      const r = await api.openReplay(props.meetingId)
      props.toast.push(r.opened ? 'ok' : 'err', r.message || (r.opened ? '回放页已打开。' : '回放地址还没准备好。'))
    } catch (e) {
      props.toast.push('err', errorText(e))
    }
  }

  const doCancel = async (): Promise<void> => {
    setBusy(true)
    try {
      // 两阶段：先拿预览文案交给用户确认，这里已经是他点过确认之后
      const r = await api.cancelMeeting(props.meetingId, true)
      props.toast.push('ok', r.message || '会议已取消。')
      setConfirmCancel(false)
      props.onChanged()
      await loadDetail(false)
    } catch (e) {
      props.toast.push('err', errorText(e))
    } finally {
      setBusy(false)
    }
  }

  /** 第一步：只预览申请（不提交），把「这一步会做什么」摆给用户看 */
  const startApply = async (): Promise<void> => {
    const recordId = states.meetingRecordId
    if (!recordId) {
      props.toast.push('err', '这场会没有可申请的录制条目。')
      return
    }
    setPermError('')
    setPermPreview('')
    setPermBusy(true)
    setPermOpen(true)
    try {
      const r = await api.applyPermission(recordId, false, props.meetingId)
      if (!aliveRef.current) return
      setPermPreview(r.message || '已准备好申请内容。')
      if (r.ok === false) setPermError(r.message || '准备申请失败。')
    } catch (e) {
      if (aliveRef.current) setPermError(errorText(e))
    } finally {
      if (aliveRef.current) setPermBusy(false)
    }
  }

  /** 第二步：用户确认后才真的提交 */
  const commitApply = async (): Promise<void> => {
    const recordId = states.meetingRecordId
    if (!recordId) return
    setPermBusy(true)
    setPermError('')
    try {
      const r = await api.applyPermission(recordId, true, props.meetingId)
      if (!aliveRef.current) return
      if (r.ok === false) {
        setPermError(r.message || '提交失败。')
        return
      }
      props.toast.push('ok', r.message || '申请已提交，等对方审批。')
      setPermOpen(false)
      await loadStates()
    } catch (e) {
      if (aliveRef.current) setPermError(errorText(e))
    } finally {
      if (aliveRef.current) setPermBusy(false)
    }
  }

  const recognize = async (): Promise<void> => {
    setRecognizing(true)
    try {
      const r = await api.recognizeParticipants(props.meetingId)
      if (!aliveRef.current) return
      setParticipants(r.rows ?? [])
      props.toast.push(
        'ok',
        r.message ||
          (r.added
            ? `认出 ${r.added} 位发言人，已补进名单。`
            : '这次没从逐字稿里认出新的发言人。')
      )
      await loadStates()
    } catch (e) {
      props.toast.push('err', errorText(e))
    } finally {
      if (aliveRef.current) setRecognizing(false)
    }
  }

  const removePerson = async (row: PersonRow): Promise<void> => {
    try {
      const r = await api.mutateParticipants(props.meetingId, 'remove', [row.nickname])
      if (!aliveRef.current) return
      setParticipants(r.rows ?? [])
      setPeopleWarning(r.warning ?? '')
      props.toast.push('ok', `已把 ${row.nickname} 从本地名单里移出。`)
    } catch (e) {
      props.toast.push('err', errorText(e))
    }
  }

  const addInvitees = async (openIds: string[]): Promise<void> => {
    try {
      await api.mutateInvitees(props.meetingId, 'add', openIds)
      props.toast.push('ok', `已邀请 ${openIds.length} 人。`)
      await loadInvitees()
      await loadDetail(false)
      props.onChanged()
    } catch (e) {
      props.toast.push('err', errorText(e))
    }
  }

  const removeInvitee = async (openId: string): Promise<void> => {
    try {
      await api.mutateInvitees(props.meetingId, 'remove', [openId])
      props.toast.push('ok', '已移出受邀人。')
      await loadInvitees()
      await loadDetail(false)
    } catch (e) {
      props.toast.push('err', errorText(e))
    }
  }

  const tabItems = PANES.map((p) => {
    if (p.value === 'transcript') {
      return { value: p.value, label: p.label, disabled: states.tabs.transcriptDisabled, reason: states.tabReasons.transcript }
    }
    if (p.value === 'minutes') {
      return { value: p.value, label: p.label, disabled: states.tabs.minutesDisabled, reason: states.tabReasons.minutes }
    }
    return { value: p.value, label: p.label }
  })

  // 当前页签若不可用，把原因直接写在页签下面——只靠悬停 title 等于没解释
  const activeTab = tabItems.find((t) => t.value === pane)

  return (
    <div className="tm-detail">
      <div className="tm-detail-head">
        {props.embedded ? null : (
          <IconButton label="返回会议列表" onClick={() => props.onBack?.()} style={{ marginTop: 2 }}>
            <ChevronLeft size={16} />
          </IconButton>
        )}
        <div className="tm-grow tm-stack" style={{ gap: 0 }}>
          {/* 标题可点：改标题（即将开始同步腾讯，历史只改本机） */}
          <button
            type="button"
            className="tm-title-edit"
            onClick={() => {
              setTitleDraft(brief?.subject ?? '')
              setTitleError('')
              setTitleOpen(true)
            }}
            title="点击修改标题"
          >
            <span className="tm-detail-title">{brief?.subject || '（正在取会议信息）'}</span>
            <Pen size={12} />
          </button>
          <div className="tm-detail-meta">
            {brief ? <span>{formatAbsoluteRange(brief.startTime, brief.endTime)}</span> : null}
            {brief?.meetingCode ? <span>会议号 {formatMeetingCode(brief.meetingCode)}</span> : null}
            <Badge tone={badge.tone}>{badge.text}</Badge>
            {states.replay === 'ready' ? <Badge tone="brand">有回放</Badge> : null}
            {brief?.hasTranscript ? <Badge tone="ok">有逐字稿</Badge> : null}
          </div>
        </div>
        <div className="tm-row" style={{ flex: 'none' }}>
          {brief?.joinUrl && !ended ? (
            <Button size="sm" variant="primary" onClick={() => window.open(brief.joinUrl as string, '_blank', 'noopener,noreferrer')} icon={<Video size={13} />}>
              入会
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => void copyInvite()} icon={<Copy size={13} />}>
            复制邀请
          </Button>
          <div className="tm-menu-wrap">
            <IconButton label="更多操作" onClick={() => setMenuOpen((v) => !v)}>
              <MoreHorizontal size={16} />
            </IconButton>
            {menuOpen ? (
              <div className="tm-popmenu" role="menu">
                <div className="tm-popmenu-label">会议操作</div>
                {/* 修改会议只在会议已结束时出现（未结束的会改不了时间等字段） */}
                {ended ? (
                  <button type="button" role="menuitem" className="tm-popmenu-item"
                    onClick={() => { setMenuOpen(false); setEditOpen(true) }}>修改会议</button>
                ) : null}
                <button type="button" role="menuitem" className="tm-popmenu-item"
                  onClick={() => { setMenuOpen(false); void loadDetail(true) }}>重新读取详情</button>
                <button type="button" role="menuitem" className="tm-popmenu-item" disabled={!brief?.joinUrl}
                  onClick={() => { setMenuOpen(false); if (brief?.joinUrl) void copyJoin(brief.joinUrl as string) }}>复制入会链接</button>
                <button type="button" role="menuitem" className="tm-popmenu-item" disabled={states.replay !== 'ready'}
                  onClick={() => { setMenuOpen(false); void openReplay() }}>打开回放</button>
                <button type="button" role="menuitem" className="tm-popmenu-item" disabled={ended}
                  onClick={() => { setMenuOpen(false); setInviteOpen(true) }}>管理受邀人</button>
                <button type="button" role="menuitem" className="tm-popmenu-item is-danger" disabled={ended}
                  onClick={() => { setMenuOpen(false); setConfirmCancel(true) }}>取消这场会议</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {detailError ? (
        <div style={{ padding: '10px 18px 0' }}>
          <Banner
            tone="err"
            icon={<Alert size={14} />}
            action={
              <Button size="sm" variant="ghost" onClick={() => void loadDetail(true)}>
                重试
              </Button>
            }
          >
            {detailError}
          </Banner>
        </div>
      ) : null}

      {states.blocker ? (
        <div style={{ padding: '10px 18px 0' }}>
          <Banner
            tone={states.replay === 'rejected' ? 'err' : 'warn'}
            icon={<Alert size={14} />}
            action={
              states.replay === 'denied' || states.replay === 'rejected' ? (
                <Button
                  size="sm"
                  variant="primary"
                  disabled={permBusy || !states.meetingRecordId}
                  icon={permBusy ? <Spinner /> : undefined}
                  onClick={() => void startApply()}
                >
                  {permBusy ? '正在提交…' : states.replay === 'rejected' ? '重新提交申请' : '提交查看申请'}
                </Button>
              ) : states.blocker.action ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (states.blocker?.pane === 'minutes') setPane('minutes')
                    else if (states.blocker?.pane === 'transcript') setPane('transcript')
                    else void loadStates()
                  }}
                >
                  {states.blocker.action}
                </Button>
              ) : undefined
            }
          >
            {states.blocker.text}
            {states.replay === 'denied' || states.replay === 'rejected'
              ? '　申请会发给录制所有者，他同意后这里就能看逐字稿。'
              : ''}
          </Banner>
        </div>
      ) : null}

      <Dialog
        open={permOpen}
        onOpenChange={setPermOpen}
        title="提交录制查看申请"
        description="这一步会给录制所有者发一条申请，对方同意后你才能看到逐字稿与纪要。"
        footer={
          <>
            <span className="tm-grow tm-caption">{permPreview || '正在准备申请内容…'}</span>
            <div className="tm-dialog-acts">
              <Button onClick={() => setPermOpen(false)} disabled={permBusy}>
                取消
              </Button>
              <Button variant="primary" onClick={() => void commitApply()} disabled={permBusy} icon={permBusy ? <Spinner /> : undefined}>
                {permBusy ? '正在提交…' : '确认提交'}
              </Button>
            </div>
          </>
        }
      >
        {permError ? (
          <Banner tone="err" icon={<Alert size={14} />}>
            {permError}
          </Banner>
        ) : (
          <p className="tm-caption" style={{ margin: 0 }}>
            提交后状态会变成「审批中」，对方通过后本机会自动解锁。
          </p>
        )}
      </Dialog>

      <div className="tm-detail-body">
        <div className="tm-detail-main">
          <TabsRoot value={pane} onValueChange={(v) => setPane(v as Pane)} className="tm-tabs-root">
            <TabList items={tabItems} value={pane} onValueChange={() => {}} label="会议内容" />
            <div className="tm-tabpanel">
              {activeTab && activeTab.disabled && activeTab.reason ? (
                <p className="tm-tab-reason" role="note">
                  {activeTab.reason}
                </p>
              ) : null}
              {/* 页签切换时整块淡入：数据本来就要等，切换再「啪」一下会显得很廉价 */}
              <div className="tm-fade-in" key={pane}>
              <TabsContent value="overview">
                <OverviewPane
                  detail={detail}
                  loading={detailLoading}
                  states={states}
                  participants={participants}
                  peopleLoading={peopleLoading}
                  peopleWarning={peopleWarning}
                  recognizing={recognizing}
                  onRecognize={() => void recognize()}
                  onRemove={(row) => void removePerson(row)}
                  onOpenReplay={() => void openReplay()}
                  onCopyJoin={copyJoin}
                  brief={brief}
                />
              </TabsContent>
              <TabsContent value="transcript">
                <ContentPane meetingId={props.meetingId} kind="transcript" ready={states.transcript === 'ready'} emptyText="这场会还没有逐字稿。要有云录制加自动转写才会产生。" toast={props.toast} />
              </TabsContent>
              <TabsContent value="minutes">
                <ContentPane meetingId={props.meetingId} kind="minutes" ready={states.minutes === 'ready'} emptyText="腾讯侧还没生成纪要。逐字稿出来后一般要等一会儿。" toast={props.toast} />
              </TabsContent>
              <TabsContent value="todos">
                <ContentPane meetingId={props.meetingId} kind="todos" ready emptyText="材料里没提取到待办。" toast={props.toast} />
              </TabsContent>
              <TabsContent value="outputs">
                <OutputsPane
                  meetingId={props.meetingId}
                  gen={states.gen}
                  ended={ended}
                  toast={props.toast}
                  onChanged={() => void loadStates()}
                />
              </TabsContent>
              </div>
            </div>
          </TabsRoot>
        </div>
        {/* 右侧目录与顶部页签是同一份信息，重复一遍只会让人猜「该点哪边」。留页签，去掉目录。 */}
      </div>

      <InviteesDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        invitees={invitees}
        error={inviteesError}
        onAdd={(ids) => void addInvitees(ids)}
        onRemove={(openId) => void removeInvitee(openId)}
        onReload={() => void loadInvitees()}
      />

      <EditMeetingDialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v)
          if (!v) void loadDetail(false)
        }}
        meetingId={props.meetingId}
        detail={detail}
        toast={props.toast}
        onSaved={() => {
          void loadDetail(false)
          props.onChanged()
        }}
      />

      <Dialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="取消这场会议？"
        description="取消后参与者会收到通知，会议不可恢复。本机已有的逐字稿与产出不会删。"
        dismissable={!busy}
        footer={
          <>
            <span className="tm-grow">这一步会真的提交到腾讯会议。</span>
            <div className="tm-dialog-acts">
              <Button onClick={() => setConfirmCancel(false)} disabled={busy}>
                不取消
              </Button>
              <Button variant="danger" onClick={() => void doCancel()} disabled={busy}>
                {busy ? '正在取消…' : '确认取消会议'}
              </Button>
            </div>
          </>
        }
      >
        <p className="tm-hint">
          会议号 {brief?.meetingCode ? formatMeetingCode(brief.meetingCode) : '未知'}，主题「{brief?.subject || ''}」。
        </p>
      </Dialog>

      <Dialog
        open={inviteTextOpen}
        onOpenChange={setInviteTextOpen}
        title="已复制到剪贴板"
        description="下面是复制的内容，可以直接确认。"
        footer={
          <>
            <span className="tm-grow" />
            <div className="tm-dialog-acts">
              <Button onClick={() => void api.copyText(inviteText).then((ok) => props.toast.push(ok ? 'ok' : 'err', ok ? '已再次复制。' : '复制没成功，请手动选中。'))}>
                再复制一次
              </Button>
              <Button variant="primary" onClick={() => setInviteTextOpen(false)}>好</Button>
            </div>
          </>
        }
      >
        <pre className="tm-invite-text">{inviteText || '（没取到文案）'}</pre>
      </Dialog>

      <Dialog
        open={titleOpen}
        onOpenChange={(v) => { if (!titleBusy) setTitleOpen(v) }}
        title="修改标题"
        description={ended ? '这是已结束的会议，只在本机修改。' : '即将开始/进行中的会议会同步修改腾讯会议。'}
        footer={
          <>
            <span className="tm-grow" />
            <div className="tm-dialog-acts">
              <Button onClick={() => setTitleOpen(false)} disabled={titleBusy}>取消</Button>
              <Button variant="primary" onClick={() => void saveSubject()} disabled={titleBusy || !titleDraft.trim()}>
                {titleBusy ? '正在保存…' : '保存'}
              </Button>
            </div>
          </>
        }
      >
        <Field label="会议标题" htmlFor="tm-title-input">
          <Input
            id="tm-title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void saveSubject()
            }}
          />
        </Field>
        {titleError ? <p className="tm-hint" style={{ color: 'var(--dsw-alias-state-error-primary, #dc2626)' }}>{titleError}</p> : null}
      </Dialog>
    </div>
  )
}

/* ── 受邀人弹窗：读 / 加 / 移出，全部直接提交（每个动作一次确认） ── */

function InviteesDialog(props: {
  open: boolean
  onOpenChange: (v: boolean) => void
  invitees: api.InviteeRow[]
  error: string
  onAdd: (openIds: string[]) => void
  onRemove: (openId: string) => void
  onReload: () => void
}): React.ReactElement {
  const [draft, setDraft] = React.useState('')
  const invitees = useReveal(props.invitees, 8)

  React.useEffect(() => {
    if (!props.open) setDraft('')
  }, [props.open])

  const submit = (): void => {
    const ids = draft
      .split(/[\s,，、;；]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!ids.length) return
    props.onAdd(ids)
    setDraft('')
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="管理受邀人"
      description="按腾讯会议的 open_id 添加或移出。改完会直接同步到这场会。"
      footer={
        <>
          <span className="tm-grow">共 {props.invitees.length} 位受邀人</span>
          <div className="tm-dialog-acts">
            <Button onClick={() => props.onOpenChange(false)}>关闭</Button>
          </div>
        </>
      }
    >
      {props.error ? (
        <Banner
          tone="err"
          icon={<Alert size={14} />}
          action={
            <Button size="sm" variant="ghost" onClick={props.onReload}>
              重试
            </Button>
          }
        >
          {props.error}
        </Banner>
      ) : null}

      <Field label="添加受邀人（填 open_id，多个用空格或逗号隔开）" htmlFor="tm-invite-input">
        <div className="tm-row">
          <Input
            id="tm-invite-input"
            className="tm-grow"
            value={draft}
            placeholder="例如 a1b2c3d4、e5f6g7h8"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
          />
          <Button variant="primary" size="sm" onClick={submit} disabled={!draft.trim()} icon={<Plus size={13} />}>
            添加
          </Button>
        </div>
      </Field>

      {props.invitees.length ? (
        <div className="tm-people">
          {invitees.shown.map((p) => (
            <div className="tm-person" key={p.openId}>
              <span className="tm-avatar" aria-hidden="true">
                {(p.nickname || p.openId).slice(0, 1)}
              </span>
              <span className="tm-person-main">
                <span className="tm-person-name">{p.nickname || '未命名受邀人'}</span>
                <span className="tm-person-org">{p.openId}</span>
              </span>
              <span className="tm-person-acts">
                <IconButton label={`移出 ${p.nickname || p.openId}`} onClick={() => props.onRemove(p.openId)}>
                  <X size={12} />
                </IconButton>
              </span>
            </div>
          ))}
          <RevealMore
            hidden={invitees.hidden}
            total={props.invitees.length}
            noun="人"
            expanded={invitees.expanded}
            onReveal={invitees.reveal}
            onCollapse={invitees.collapse}
          />
        </div>
      ) : (
        <Empty title="还没有受邀人" desc="这场会目前谁都没被单独邀请。填 open_id 就能加。" />
      )}
    </Dialog>
  )
}

/* ── 改会弹窗：两阶段（先预览再提交） ── */

function EditMeetingDialog(props: {
  open: boolean
  onOpenChange: (v: boolean) => void
  meetingId: string
  detail: MeetingDetailView | null
  toast: ToastApi
  onSaved: () => void
}): React.ReactElement {
  const [subject, setSubject] = React.useState('')
  const [joinLimit, setJoinLimit] = React.useState<'1' | '2' | '3'>('1')
  const [cloudRecord, setCloudRecord] = React.useState(false)
  const [autoTranscribe, setAutoTranscribe] = React.useState(false)
  const [waitingRoom, setWaitingRoom] = React.useState(false)
  const [note, setNote] = React.useState('')
  const [stage, setStage] = React.useState<'form' | 'preview'>('form')
  const [fields, setFields] = React.useState<api.PreviewField[]>([])
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  // 打开时用回读到的真实设置做初值：改会最怕「用默认值把用户设的覆盖掉」
  React.useEffect(() => {
    if (!props.open) return
    setStage('form')
    setFields([])
    setError('')
    setBusy(false)
    const d = props.detail
    setSubject(d?.brief.subject ?? '')
    setJoinLimit(String(d?.settings.joinType ?? 1) as '1' | '2' | '3')
    setCloudRecord(d?.settings.autoRecordType === 'cloud')
    setAutoTranscribe(Boolean(d?.settings.autoAsr))
    setWaitingRoom(Boolean(d?.settings.waitingRoom))
    setNote(d?.brief.note ?? '')
  }, [props.open, props.detail])

  const patch = (): api.UpdatePatch => ({
    subject: subject.trim(),
    joinLimit: Number(joinLimit) as 1 | 2 | 3,
    cloudRecord,
    autoTranscribe,
    waitingRoom,
    note: note.trim()
  })

  const goPreview = async (): Promise<void> => {
    setError('')
    if (!subject.trim()) {
      setError('主题不能为空。')
      return
    }
    setBusy(true)
    try {
      const r = await api.updateMeeting(props.meetingId, patch(), false)
      if (r.stage !== 'preview') {
        setError('没拿到预览，先别提交。')
        return
      }
      setFields(r.fields)
      setStage('preview')
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const commit = async (): Promise<void> => {
    setError('')
    setBusy(true)
    try {
      const r = await api.updateMeeting(props.meetingId, patch(), true)
      if (r.stage === 'updated') {
        const overridden = r.overridden ?? []
        props.toast.push(
          'ok',
          overridden.length ? `改好了，但这些被企业策略覆盖：${overridden.join('、')}` : r.message || '会议已更新。'
        )
        props.onSaved()
        props.onOpenChange(false)
      } else {
        setError('提交后没收到更新结果，回详情页重新读一次确认。')
      }
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={stage === 'form' ? '编辑会议' : '确认修改'}
      description={
        stage === 'form'
          ? '初值来自腾讯侧真实生效的设置，改完先看预览再提交。'
          : '下面是将要提交的改动，点「确认修改」才会生效。'
      }
      wide={stage === 'preview'}
      dismissable={!busy}
      footer={
        <>
          <span className="tm-grow">{stage === 'preview' ? '这一步之前什么都没发出去。' : ''}</span>
          <div className="tm-dialog-acts">
            {stage === 'form' ? (
              <>
                <Button onClick={() => props.onOpenChange(false)} disabled={busy}>
                  取消
                </Button>
                <Button variant="primary" onClick={() => void goPreview()} disabled={busy}>
                  {busy ? '正在生成预览…' : '下一步：预览'}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setStage('form')} disabled={busy} icon={<ChevronLeft size={13} />}>
                  回去改
                </Button>
                <Button variant="primary" onClick={() => void commit()} disabled={busy}>
                  {busy ? '正在提交…' : '确认修改'}
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
          <Field label="会议主题" htmlFor="tm-edit-subject" required>
            <Input id="tm-edit-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="入会限制" htmlFor="tm-edit-join">
            <Select
              id="tm-edit-join"
              ariaLabel="入会限制"
              value={joinLimit}
              onValueChange={(v) => setJoinLimit(v as '1' | '2' | '3')}
              options={[
                { value: '1', label: '所有人可入会' },
                { value: '2', label: '仅受邀成员' },
                { value: '3', label: '仅企业内部' }
              ]}
            />
          </Field>
          <div className="tm-switch-row">
            <div className="tm-switch-text">
              <div className="tm-switch-title">云录制</div>
              <div className="tm-switch-desc">关掉之后这场会就取不到逐字稿与纪要。</div>
            </div>
            <Switch checked={cloudRecord} onCheckedChange={setCloudRecord} label="云录制" />
          </div>
          <div className="tm-switch-row">
            <div className="tm-switch-text">
              <div className="tm-switch-title">自动转写</div>
              <div className="tm-switch-desc">要有云录制才生效。</div>
            </div>
            <Switch checked={autoTranscribe} onCheckedChange={setAutoTranscribe} label="自动转写" />
          </div>
          <div className="tm-switch-row">
            <div className="tm-switch-text">
              <div className="tm-switch-title">等候室</div>
              <div className="tm-switch-desc">开启后由主持人在腾讯客户端放行。</div>
            </div>
            <Switch checked={waitingRoom} onCheckedChange={setWaitingRoom} label="等候室" />
          </div>
          <Field label="备注（仅本地留档）" htmlFor="tm-edit-note">
            <AutoTextarea id="tm-edit-note" value={note} minRows={2} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <p className="tm-hint is-warn">公司策略可能覆盖录制与转写，提交后会自动回读真实生效值。</p>
        </>
      ) : (
        <dl className="tm-preview">
          {fields.map((f) => (
            <div className="tm-preview-row" key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Dialog>
  )
}

/* ── 右侧目录：常驻窄栏，悬停/聚焦提高不透明度；跳到对应页签 ── */

function Toc(props: {
  pane: Pane
  onPick: (p: Pane) => void
  detail: MeetingDetailView | null
}): React.ReactElement {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({ overview: true })
  const items: Array<{ key: Pane; label: string; hint: string }> = [
    { key: 'overview', label: '会议概览', hint: '时间、会议号、真实录制设置' },
    { key: 'transcript', label: '逐字稿', hint: '谁在什么时候说了什么' },
    { key: 'minutes', label: '纪要', hint: '腾讯侧生成的纪要' },
    { key: 'todos', label: '待办', hint: '材料里出现的待办事项' },
    { key: 'outputs', label: '会后产出', hint: '四份用你自己的模型生成' }
  ]
  const groups: Array<{ id: string; title: string; keys: Pane[] }> = [
    { id: 'info', title: '会议信息', keys: ['overview'] },
    { id: 'content', title: '会议内容', keys: ['transcript', 'minutes', 'todos'] },
    { id: 'after', title: '会后', keys: ['outputs'] }
  ]

  return (
    <nav className="tm-toc" aria-label="会议目录">
      <div className="tm-toc-head">目录</div>
      <div className="tm-toc-panel">
        {groups.map((g) => {
          const open = openGroups[g.id] ?? true
          return (
            <div className="tm-toc-group" key={g.id}>
              <button
                type="button"
                className="tm-toc-grouphead"
                aria-expanded={open}
                onClick={() => setOpenGroups((s) => ({ ...s, [g.id]: !open }))}
              >
                {open ? <ChevronDownTiny /> : <ChevronRight size={10} />}
                {g.title}
              </button>
              {open
                ? g.keys.map((key) => {
                    const it = items.find((i) => i.key === key)
                    if (!it) return null
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`tm-toc-item${props.pane === key ? ' is-on' : ''}`}
                        aria-current={props.pane === key ? 'true' : undefined}
                        title={it.hint}
                        onClick={() => props.onPick(key)}
                      >
                        {it.label}
                      </button>
                    )
                  })
                : null}
            </div>
          )
        })}
      </div>
      {props.detail ? (
        <div style={{ marginTop: 'auto', padding: '8px 6px 0' }}>
          <span className="tm-caption">
            {props.detail.invitees.length ? `受邀 ${props.detail.invitees.length} 人` : '还没有受邀人'}
          </span>
        </div>
      ) : null}
    </nav>
  )
}

function ChevronDownTiny(): React.ReactElement {
  return (
    <svg width={10} height={10} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d="M3.6 6.2L8 10.6l4.4-4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── 概览 ── */

function OverviewPane(props: {
  detail: MeetingDetailView | null
  loading: boolean
  states: ContentStates
  participants: PersonRow[]
  peopleLoading: boolean
  peopleWarning: string
  recognizing: boolean
  onRecognize: () => void
  onRemove: (row: PersonRow) => void
  onOpenReplay: () => void
  onCopyJoin: (url: string) => void
  brief?: MeetingBrief
}): React.ReactElement {
  // hook 必须在任何提前 return 之前调用（否则加载态与完成态之间 hook 数量会变）
  const people = useReveal(props.participants, 8)

  if (props.loading && !props.detail && !props.brief)
    return (
      <div className="tm-fade-in" aria-busy="true">
        <SkeletonRows rows={5} />
        <span className="tm-caption" style={{ padding: '2px 8px' }}>
          正在读取会议详情…
        </span>
      </div>
    )

  const d = props.detail
  const brief = d?.brief ?? props.brief
  const settings = d?.settings
  const overridden = settings?.overridden ? settings.overriddenFields : []

  return (
    <div className="tm-stack" style={{ gap: 12 }}>
      <Card>
        <CardHeader
          title="会议信息"
          sub={brief ? formatAbsoluteRange(brief.startTime, brief.endTime) : undefined}
          extra={
            <span className="tm-row" style={{ gap: 6 }}>
              {settings?.overridden ? (
                <Badge tone="warn" title={`被企业策略覆盖：${overridden.join('、')}`}>
                  部分设置被企业策略覆盖
                </Badge>
              ) : null}
              {props.states.replay === 'ready' ? (
                <Button size="sm" variant="ghost" onClick={props.onOpenReplay} icon={<Play size={13} />}>
                  打开回放
                </Button>
              ) : null}
            </span>
          }
        />
        <div className="tm-card-b">
          {brief ? (
            <KeyValues
              rows={[
                { label: '时间', value: formatAbsoluteRange(brief.startTime, brief.endTime) },
                {
                  label: '会议号',
                  value: (
                    <span className="tm-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <span>{formatMeetingCode(brief.meetingCode) || '未给出'}</span>
                      {brief.localPassword ? (
                        <span className="tm-caption">（入会密码：{brief.localPassword}）</span>
                      ) : settings?.passwordRequired ? (
                        <span className="tm-caption">（有入会密码，本机没记）</span>
                      ) : null}
                    </span>
                  )
                },
                {
                  label: '入会链接',
                  value: brief.joinUrl ? (
                    <span className="tm-row" style={{ gap: 6 }}>
                      <a href={brief.joinUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--dsw-alias-brand-primary,#2563eb)' }} onClick={(e) => e.stopPropagation()}>
                        打开入会链接
                      </a>
                      <Button size="sm" variant="text" onClick={() => props.onCopyJoin(brief.joinUrl as string)}>
                        复制
                      </Button>
                    </span>
                  ) : (
                    '没有链接'
                  )
                },
                { label: '备注', value: brief.note || '没有本地备注' }
              ]}
            />
          ) : (
            <p className="tm-hint">没取到会议信息。</p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title={`参会人 ${props.participants.length ? `· ${props.participants.length} 人` : ''}`}
          sub="头像是首字，右侧是姓名与公司；再下面一行是 AI 归纳的当场观点"
          extra={
            <Button
              size="sm"
              variant="ghost"
              onClick={props.onRecognize}
              disabled={props.recognizing || props.states.tabs.transcriptDisabled}
              title={props.states.tabs.transcriptDisabled ? props.states.tabReasons.transcript || '没有逐字稿，认不了人' : undefined}
              icon={props.recognizing ? <Pen size={13} /> : <Wand size={13} />}
            >
              {props.recognizing ? '正在认人…' : 'AI 认人'}
            </Button>
          }
        />
        <div className="tm-card-b">
          {props.peopleLoading && !props.participants.length ? (
            <SkeletonRows rows={3} />
          ) : props.participants.length ? (
            <div className="tm-people">
              {people.shown.map((p) => (
                <div className="tm-person" key={p.key}>
                  <span className="tm-avatar" aria-hidden="true">
                    {p.nickname.slice(0, 1)}
                  </span>
                  <span className="tm-person-main">
                    <span className="tm-person-name">{p.nickname}</span>
                    {p.company || p.title ? (
                      <span className="tm-person-org">{[p.company, p.title].filter(Boolean).join(' · ')}</span>
                    ) : null}
                    {p.source ? <span className="tm-caption">{sourceText(p.source)}</span> : null}
                  </span>
                  <span className="tm-person-acts">
                    <IconButton label={`把 ${p.nickname} 从本地名单移出`} onClick={() => props.onRemove(p)}>
                      <X size={12} />
                    </IconButton>
                  </span>
                  {p.view ? <span className="tm-person-view">{p.view}</span> : null}
                </div>
              ))}
              <RevealMore
                hidden={people.hidden}
                total={props.participants.length}
                noun="人"
                expanded={people.expanded}
                onReveal={people.reveal}
                onCollapse={people.collapse}
              />
            </div>
          ) : (
            <Empty
              title="还没有参会名单"
              desc="腾讯侧要等会议结束后才出报告；也可以点「AI 认人」，从逐字稿里把发言人捞出来。"
            />
          )}
        </div>
      </Card>
    </div>
  )
}

function SettingValue(props: { text: string }): React.ReactElement {
  return <span>{props.text}</span>
}

function mark(node: React.ReactElement, overridden: string[], field: string): React.ReactElement {
  if (!overridden.some((f) => f.toLowerCase().includes(field.toLowerCase()))) return node
  return (
    <span className="tm-row" style={{ gap: 6 }}>
      {node}
      <Badge tone="warn" title="提交值被企业策略改写">
        被覆盖
      </Badge>
    </span>
  )
}

function recordText(v: 'none' | 'local' | 'cloud' | null): string {
  if (v === 'none') return '不录制'
  if (v === 'local') return '本地录制'
  if (v === 'cloud') return '云录制'
  return '未知'
}

function boolText(v: boolean | null): string {
  if (v === true) return '开启'
  if (v === false) return '关闭'
  return '未知'
}

function joinText(v: number | null): string {
  if (v === 1) return '所有人可入会'
  if (v === 2) return '仅受邀成员'
  if (v === 3) return '仅企业内部'
  return '未知'
}

function replayText(state: ContentStates['replay']): string {
  switch (state) {
    case 'waiting':
      return '回放还在转码'
    case 'approving':
      return '回放权限申请中'
    case 'denied':
      return '没有回放权限'
    case 'rejected':
      return '权限申请被拒'
    case 'ready':
      return '回放可看'
    default:
      return '没有回放'
  }
}

function sourceText(source: NonNullable<PersonRow['source']>): string {
  if (source === 'tencent') return '腾讯名单'
  if (source === 'ai') return 'AI 认出'
  return '本地补充'
}

/* ── 正文页签（逐字稿 / 纪要 / 待办） ── */

function ContentPane(props: {
  meetingId: string
  kind: 'transcript' | 'minutes' | 'todos'
  ready: boolean
  emptyText: string
  toast: ToastApi
}): React.ReactElement {
  // 初始就用本机已有缓存顶上：切页签、切走再回来，都不该重新转圈
  const [view, setView] = React.useState<ContentView | null>(() =>
    api.cachedContent(props.meetingId, props.kind)
  )
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(() => !api.cachedContent(props.meetingId, props.kind))
  const [forced, setForced] = React.useState(false)
  const [filter, setFilter] = React.useState('')
  const [pasteOpen, setPasteOpen] = React.useState(false)
  /** 是否已经拿到过内容：拿到后后台刷新不再抬骨架（初始就有缓存也算有） */
  const hasViewRef = React.useRef(Boolean(view))

  const load = React.useCallback(
    async (force: boolean) => {
      // 强制重取（用户点了重试/重新取）才显示骨架；平时静默后台刷新
      if (force || !hasViewRef.current) setLoading(true)
      setError('')
      try {
        const r = await api.getContent(props.meetingId, props.kind, force)
        if (r && !r.empty) hasViewRef.current = true
        setView(r)
      } catch (e) {
        setError(errorText(e))
        setView(null)
        hasViewRef.current = false
      } finally {
        setLoading(false)
      }
    },
    [props.meetingId, props.kind]
  )

  React.useEffect(() => {
    if (view && !view.empty) hasViewRef.current = true
    void load(false)
  }, [load])

  // hook 先于提前 return（加载态与完成态之间 hook 数量必须一致）
  const matched = React.useMemo(() => {
    const list = view?.chunks ?? []
    const q = filter.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (c) => c.text.toLowerCase().includes(q) || (c.speaker ?? '').toLowerCase().includes(q)
    )
  }, [view, filter])
  const chunks = useReveal(matched, 8)

  if (loading)
    return (
      <div className="tm-fade-in" aria-busy="true">
        <SkeletonRows rows={6} />
        <span className="tm-caption" style={{ padding: '2px 8px' }}>
          正在取回内容…
        </span>
      </div>
    )

  // 取不到（网络/额度/别人的会）和「确实没有」都不弹红色报错条：用户要的是原文，
  // 下面空态已经给了「粘贴原文」和「重新取一次」两条出路，报错文案只会制造焦虑。
  if (!view || view.empty) {
    // 空态不是结论，是下一步：这场会大概率是别人开的，拿不到录制与转写。
    // 用户手上的录音转文字照样能出稿，所以这里直接给「粘贴原文」这个出口。
    return (
      <div className="tm-fade-in">
        <Empty
          title={props.emptyText}
          desc="如果是别人开的会，腾讯不会给你录制和转写。你可以把手机录音转出来的文字粘进来，会后产出照样能做。"
          actions={
            <>
              <Button size="sm" variant="primary" icon={<Plus size={13} />} onClick={() => setPasteOpen(true)}>
                粘贴原文
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={<Refresh size={13} />}
                onClick={() => {
                  setForced(true)
                  void load(true)
                }}
              >
                {forced ? '再取一次' : '重新取一次'}
              </Button>
            </>
          }
        />
        <PasteDialog
          open={pasteOpen}
          onOpenChange={setPasteOpen}
          meetingId={props.meetingId}
          kind={props.kind === 'minutes' ? 'minutes' : props.kind === 'todos' ? 'todos' : 'transcript'}
          toast={props.toast}
          onSaved={() => {
            setForced(false)
            void load(true)
          }}
        />
      </div>
    )
  }

  return (
    <div className="tm-stack" style={{ gap: 10 }}>
      <div className="tm-row-between">
        <span className="tm-caption">
          {view.source === 'pasted' ? (
            <>
              <Badge tone="brand">本机粘贴</Badge> {chunks.all.length} 段 · 来源：{view.pastedSource || '你提供'}
            </>
          ) : (
            <>
              {chunks.all.length} 段 · 取回于 {formatFetchedAt(view.fetchedAt)}
            </>
          )}
        </span>
        <span className="tm-row">
          {view.source === 'pasted' ? (
            <Button size="sm" variant="text" onClick={() => setPasteOpen(true)}>
              替换原文
            </Button>
          ) : null}
          <Button size="sm" variant="text" icon={<Refresh size={13} />} onClick={() => void load(true)}>
            重新取一次
          </Button>
        </span>
      </div>
      <PasteDialog
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        meetingId={props.meetingId}
        kind={props.kind === 'minutes' ? 'minutes' : props.kind === 'todos' ? 'todos' : 'transcript'}
        toast={props.toast}
        onSaved={() => {
          setForced(false)
          void load(true)
        }}
      />
      {chunks.all.length && (props.kind === 'transcript' || view.source === 'pasted') ? (
        <>
          <div className="tm-row">
            <Input
              value={filter}
              placeholder="在逐字稿里搜人名或关键词"
              aria-label="在逐字稿里搜索"
              onChange={(e) => setFilter(e.target.value)}
            />
            {filter ? (
              <Button size="sm" variant="ghost" onClick={() => setFilter('')} icon={<X size={12} />}>
                清掉
              </Button>
            ) : null}
          </div>
          {!chunks.shown.length ? (
            <Empty title={`没有匹配「${filter}」的段落`} desc="换个关键词，或者清掉搜索看全文。" />
          ) : (
            <div className="tm-content">
              {chunks.shown.map((c, i) => (
                <div className="tm-chunk" key={`${i}-${c.time ?? ''}`}>
                  {c.speaker || c.time ? (
                    <div className="tm-chunk-meta">
                      {c.time ? <span>{c.time}</span> : null}
                      {c.speaker ? <span className="tm-speaker">{c.speaker}</span> : null}
                    </div>
                  ) : null}
                  <p className="tm-chunk-text">{c.text}</p>
                </div>
              ))}
              <RevealMore
                hidden={chunks.hidden}
                total={chunks.all.length}
                noun="段"
                expanded={chunks.expanded}
                onReveal={chunks.reveal}
                onCollapse={chunks.collapse}
              />
            </div>
          )}
        </>
      ) : (
        <p className="tm-plain">{view.plain}</p>
      )}
    </div>
  )
}

function formatFetchedAt(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso
  const d = new Date(t)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/* ── 会后产出 ── */

/* ── 会后产出 · 组件级缓存：读的是本机已生成的结果，不该每次进来都空一帧 ── */

const outputsMemo = new Map<string, Partial<Record<OutputKind, OutputView>>>()

/** 单份产出的整份文档：已生成直接展开全文；未生成给「生成这份」 */
function OutputDoc(props: {
  kind: OutputKind
  out?: OutputView
  busy: boolean
  ended: boolean
  toast: ToastApi
  onPreview: () => void
  onRegenerate: () => void
  onDelete: () => void
}): React.ReactElement {
  const { kind, out, busy } = props
  const html = React.useMemo(() => (out ? renderMarkdown(out.text) : ''), [out])
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [confirm, setConfirm] = React.useState<null | 'delete' | 'regenerate'>(null)

  // 「更多」下拉的点外面关 / Esc 关
  React.useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent): void => {
      if ((e.target as Element).closest?.('.tm-menu-wrap')) return
      setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const outText = out?.text ?? ''

  /** 成品 HTML（导出与「在浏览器打开」共用同一份，避免两处样式不一致） */
  const docHtml = React.useMemo(
    () => markdownToHtmlDocument(out?.text ?? '', OUTPUT_LABELS[kind], { generatedAt: out?.generatedAt }),
    [out, kind]
  )

  /** 在浏览器新标签里打开渲染后的成品（自包含 HTML） */
  const openInBrowser = (): void => {
    const url = URL.createObjectURL(new Blob([docHtml], { type: 'text/html;charset=utf-8' }))
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  /** 导出 HTML 成品 */
  const downloadHtml = (): void => {
    downloadText(`${OUTPUT_LABELS[kind]}.html`, docHtml, 'text/html')
    props.toast.push('ok', '已导出 HTML（排版后的样子）。')
  }

  /** 导出 Markdown 原文（次要入口：要再编辑 / 再生成时用） */
  const downloadMd = (): void => {
    downloadText(`${OUTPUT_LABELS[kind]}.md`, outText, 'text/markdown')
  }

  if (!out) {
    return (
      <div className="tm-output tm-output-doc">
        <div className="tm-row-between">
          <h3 className="tm-output-title">{OUTPUT_LABELS[kind]}</h3>
          <Badge tone="muted">未生成</Badge>
        </div>
        <p className="tm-hint">{outputHint(kind)}</p>
        <div>
          <Button
            size="sm"
            variant="primary"
            disabled={busy || !props.ended}
            onClick={props.onRegenerate}
            icon={busy ? <Pen size={13} /> : <Doc size={13} />}
          >
            {busy ? '正在生成…' : '生成这份'}
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="tm-output tm-output-doc">
      <div className="tm-row-between">
        <h3 className="tm-output-title">{OUTPUT_LABELS[kind]}</h3>
        <div className="tm-row" style={{ gap: 4 }}>
          <Badge tone="ok">已生成</Badge>
          <IconButton label="全屏" onClick={props.onPreview}>
            <Maximize size={15} />
          </IconButton>
          <div className="tm-menu-wrap">
            <IconButton label="更多" onClick={() => setMenuOpen((v) => !v)}>
              <MoreHorizontal size={16} />
            </IconButton>
            {menuOpen ? (
              <div className="tm-popmenu" role="menu">
                <button type="button" role="menuitem" className="tm-popmenu-item" onClick={() => { setMenuOpen(false); openInBrowser() }}>
                  在浏览器打开
                </button>
                <button type="button" role="menuitem" className="tm-popmenu-item" onClick={() => { setMenuOpen(false); downloadHtml() }}>
                  导出 HTML
                </button>
                <button type="button" role="menuitem" className="tm-popmenu-item" onClick={() => { setMenuOpen(false); downloadMd() }}>
                  导出 Markdown
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="tm-popmenu-item"
                  onClick={() => {
                    setMenuOpen(false)
                    void api.copyText(outText).then((ok) => {
                      props.toast.push(ok ? 'ok' : 'err', ok ? '正文已复制。' : '复制没成功，请手动选中。')
                    })
                  }}
                >
                  复制正文
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="tm-popmenu-item"
                  disabled={busy}
                  onClick={() => { setMenuOpen(false); setConfirm('regenerate') }}
                >
                  重新生成
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="tm-popmenu-item is-danger"
                  disabled={busy}
                  onClick={() => { setMenuOpen(false); setConfirm('delete') }}
                >
                  删除
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="tm-row" style={{ flexWrap: 'wrap', gap: 6 }}>
        <span className="tm-caption">素材：{out.source === 'transcript' ? '逐字稿' : '纪要'}</span>
        <span className="tm-caption">模型：{out.model || '跟随默认'}</span>
        {out.truncated ? <Badge tone="warn" title="素材超过 6 万字被截断">素材已截断</Badge> : null}
      </div>
      <div className="tm-outview-page tm-output-rendered" dangerouslySetInnerHTML={{ __html: html }} />

      <Dialog
        open={confirm !== null}
        onOpenChange={(v) => { if (!v) setConfirm(null) }}
        title={confirm === 'delete' ? '删除这份产出？' : '重新生成这份产出？'}
        description={confirm === 'delete' ? '删除后不可恢复，需要重新生成。' : '会用当前素材重新生成，覆盖现有内容。'}
        footer={
          <>
            <span className="tm-grow" />
            <div className="tm-dialog-acts">
              <Button onClick={() => setConfirm(null)}>取消</Button>
              <Button
                variant={confirm === 'delete' ? 'danger' : 'primary'}
                disabled={busy}
                onClick={() => {
                  const act = confirm
                  setConfirm(null)
                  if (act === 'delete') props.onDelete()
                  else props.onRegenerate()
                }}
              >
                {confirm === 'delete' ? '确认删除' : '确认重新生成'}
              </Button>
            </div>
          </>
        }
      >
        <p className="tm-hint">{confirm === 'delete' ? `将删除「${OUTPUT_LABELS[kind]}」。` : `将重新生成「${OUTPUT_LABELS[kind]}」。`}</p>
      </Dialog>
    </div>
  )
}

/** 下载一个文本文件 */
function downloadText(filename: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 产出排版预览（全屏浮层） */
function OutputPreview(props: { title: string; text: string; generatedAt?: string; toast: ToastApi; onClose: () => void }): React.ReactElement {
  const html = React.useMemo(() => renderMarkdown(props.text), [props.text])
  const doc = React.useMemo(
    () => markdownToHtmlDocument(props.text, props.title, { generatedAt: props.generatedAt }),
    [props.text, props.title, props.generatedAt]
  )
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') props.onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [props])
  const openInBrowser = (): void => {
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
  return (
    <div className="tm-outview" role="dialog" aria-modal="true" aria-label={`${props.title}预览`}>
      <div className="tm-outview-bar">
        <span className="tm-grow tm-outview-title">{props.title}</span>
        <Button size="sm" variant="ghost" onClick={openInBrowser}>
          在浏览器打开
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            downloadText(`${props.title}.html`, doc, 'text/html')
            props.toast.push('ok', '已导出 HTML（排版后的样子）。')
          }}
        >
          导出 HTML
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            downloadText(`${props.title}.md`, props.text, 'text/markdown')
            props.toast.push('ok', '已导出 Markdown 原文。')
          }}
        >
          导出 MD
        </Button>
        <IconButton label="关闭预览" onClick={props.onClose}>
          <X size={15} />
        </IconButton>
      </div>
      <div className="tm-outview-body">
        <div className="tm-outview-page" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}

/** 复盘「更多」里的二次确认 */
function ReviewConfirmDialog(props: {
  confirm: null | 'delete' | 'regenerate'
  setConfirm: (v: null | 'delete' | 'regenerate') => void
  onRegenerate: () => void
  onDelete: () => void
}): React.ReactElement {
  const act = props.confirm
  return (
    <Dialog
      open={act !== null}
      onOpenChange={(v) => { if (!v) props.setConfirm(null) }}
      title={act === 'delete' ? '删除复盘报告？' : '重新生成复盘报告？'}
      description={act === 'delete' ? '删除后不可恢复，需要重新生成。' : '会用当前素材按所选类型重新生成，覆盖现有内容。'}
      footer={
        <>
          <span className="tm-grow" />
          <div className="tm-dialog-acts">
            <Button onClick={() => props.setConfirm(null)}>取消</Button>
            <Button
              variant={act === 'delete' ? 'danger' : 'primary'}
              onClick={() => {
                props.setConfirm(null)
                if (act === 'delete') props.onDelete()
                else props.onRegenerate()
              }}
            >
              {act === 'delete' ? '确认删除' : '确认重新生成'}
            </Button>
          </div>
        </>
      }
    >
      <p className="tm-hint">{act === 'delete' ? '将删除「复盘报告」。' : '将按当前选定的类型重新生成「复盘报告」。'}</p>
    </Dialog>
  )
}

/** 复盘报告卡：先判定类型，用户可改选，再生成 */
function ReviewCard(props: {
  meetingId: string
  out?: OutputView
  ended: boolean
  toast: ToastApi
  onChanged: () => void
  onPreview: () => void
}): React.ReactElement {
  const [plan, setPlan] = React.useState<api.ReviewPlanPayload | null>(null)
  const [planError, setPlanError] = React.useState('')
  const [choice, setChoice] = React.useState('')
  const [step, setStep] = React.useState<'idle' | 'judging' | 'material' | 'generating'>('idle')
  const [choosing, setChoosing] = React.useState(false)
  /** 轮询控制器：卸载时停轮询（宿主的后台任务不受影响） */
  const pollCtrl = React.useRef<AbortController | null>(null)
  const notify = useNotifyOnReady()
  /** 「更多」下拉与二次确认 */
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [confirm, setConfirm] = React.useState<null | 'delete' | 'regenerate'>(null)

  // 「更多」下拉的点外面关 / Esc 关
  React.useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent): void => {
      if ((e.target as Element).closest?.('.tm-menu-wrap')) return
      setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const loadPlan = React.useCallback(
    async (type?: string) => {
      try {
        const p = await api.getReviewPlan(props.meetingId, type)
        setPlan(p)
        setChoice(p.type)
        setPlanError('')
      } catch (e) {
        setPlanError(errorText(e))
      }
    },
    [props.meetingId]
  )

  React.useEffect(() => {
    void loadPlan()
  }, [loadPlan])

  const changeType = async (id: string): Promise<void> => {
    setChoice(id)
    try {
      setPlan(await api.getReviewPlan(props.meetingId, id))
    } catch {
      /* 保留上一次的判定，不覆盖 */
    }
  }

  /** 轮询后台生成：跑完刷新并提示；关面板只停轮询，任务继续 */
  const watchGeneration = React.useCallback((): void => {
    pollCtrl.current?.abort()
    const ctrl = new AbortController()
    pollCtrl.current = ctrl
    void (async () => {
      while (!ctrl.signal.aborted) {
        await new Promise((r) => setTimeout(r, 2500))
        if (ctrl.signal.aborted) return
        try {
          const s = await api.outputStatus(props.meetingId)
          const t = s.tasks.find((x) => x.kind === 'review')
          if (!t || t.status === 'done') {
            setStep('idle')
            if (notify) props.toast.push('ok', t?.message || '复盘报告生成好了。')
            props.onChanged()
            return
          }
          if (t.status === 'error') {
            setStep('idle')
            props.toast.push('err', t.message || '生成失败')
            return
          }
        } catch {
          /* 网络抖动：下一轮再问 */
        }
      }
    })()
  }, [props.meetingId, notify])

  // 切走再回来：复盘还在后台跑就接着显示生成中
  React.useEffect(() => {
    void (async () => {
      try {
        const s = await api.outputStatus(props.meetingId)
        const t = s.tasks.find((x) => x.kind === 'review' && x.status === 'running')
        if (t) {
          setStep('generating')
          watchGeneration()
        }
      } catch {
        /* 查不到就当没有后台任务 */
      }
    })()
    return () => {
      pollCtrl.current?.abort()
    }
  }, [props.meetingId, watchGeneration])

  const generate = async (): Promise<void> => {
    if (!props.ended) return
    setStep('generating')
    try {
      const r = await api.generateOutput(props.meetingId, 'review', { type: choice })
      if (!r.started) props.toast.push('info', '复盘报告正在生成中。')
      watchGeneration()
    } catch (e) {
      setStep('idle')
      props.toast.push('err', errorText(e))
    }
  }

  /** 取消生成：让宿主停掉那次后台任务 */
  const cancelGenerate = async (): Promise<void> => {
    try {
      await api.cancelOutput(props.meetingId, 'review')
      props.toast.push('info', '已取消生成。')
    } catch (e) {
      props.toast.push('err', errorText(e))
    } finally {
      setStep('idle')
    }
  }

  const remove = async (): Promise<void> => {
    try {
      await api.deleteOutput(props.meetingId, 'review')
      props.toast.push('ok', '复盘报告已删除。')
      props.onChanged()
    } catch (e) {
      props.toast.push('err', errorText(e))
    }
  }

  const html = React.useMemo(() => (props.out ? renderMarkdown(props.out.text) : ''), [props.out])
  const working = step !== 'idle'
  const stepLabels = ['判定类型', '取素材', '生成', '排版']
  const activeIdx = step === 'judging' ? 0 : step === 'material' ? 1 : step === 'generating' ? 2 : 4
  const typeName = plan?.typeName ?? (plan?.types.find((t) => t.id === choice)?.name || '未判定')

  return (
    <div
      className={`tm-output${props.out ? ' is-clickable' : ''}`}
      role={props.out ? 'button' : undefined}
      tabIndex={props.out ? 0 : undefined}
      title={props.out ? '点开看排版后的样子' : undefined}
      onClick={props.out ? props.onPreview : undefined}
      onKeyDown={
        props.out
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                props.onPreview()
              }
            }
          : undefined
      }
    >
      <div className="tm-row-between">
        <h3 className="tm-output-title">{OUTPUT_LABELS.review}</h3>
        {working ? <Pen size={14} /> : props.out ? <Badge tone="ok">已生成</Badge> : <Badge tone="muted">未生成</Badge>}
      </div>

      {working ? (
        <div className="tm-steps">
          {stepLabels.map((label, i) => (
            <span key={label} className={`tm-step${i < activeIdx ? ' is-done' : i === activeIdx ? ' is-now' : ''}`}>
              {i < activeIdx ? '✓ ' : ''}
              {label}
            </span>
          ))}
          <span className="tm-grow" />
          <Button size="sm" variant="text" onClick={() => void cancelGenerate()}>
            取消
          </Button>
        </div>
      ) : props.out ? (
        <>
          <div className="tm-row" style={{ flexWrap: 'wrap', gap: 6 }}>
            <span className="tm-caption">类型：{typeName}</span>
            <span className="tm-caption">素材：{props.out.source === 'transcript' ? '逐字稿' : '纪要'}</span>
            <span className="tm-caption">模型：{props.out.model || '跟随默认'}</span>
            {props.out.reviewDegraded ? <Badge tone="warn" title="素材不足，已按要点版生成">降级版</Badge> : null}
            {props.out.truncated ? <Badge tone="warn" title="素材超过 6 万字被截断">素材已截断</Badge> : null}
          </div>
          <div className="tm-outview-page tm-output-rendered" dangerouslySetInnerHTML={{ __html: html }} />
          {/* 操作收进标题右上角：全屏 / 更多（与其它产出一致） */}
          <div className="tm-row" style={{ justifyContent: 'flex-end' }}>
            <IconButton label="全屏" onClick={(e) => { e.stopPropagation(); props.onPreview() }}>
              <Maximize size={15} />
            </IconButton>
            <div className="tm-menu-wrap">
              <IconButton label="更多" onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}>
                <MoreHorizontal size={16} />
              </IconButton>
              {menuOpen ? (
                <div className="tm-popmenu" role="menu" onClick={(e) => e.stopPropagation()}>
                  <button type="button" role="menuitem" className="tm-popmenu-item" onClick={() => { setMenuOpen(false); props.onPreview() }}>
                    浏览器打开
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="tm-popmenu-item"
                    onClick={() => {
                      setMenuOpen(false)
                      void api.copyText(props.out!.text).then((ok) => {
                        props.toast.push(ok ? 'ok' : 'err', ok ? '正文已复制。' : '复制没成功，请手动选中。')
                      })
                    }}
                  >
                    复制正文
                  </button>
                  <button type="button" role="menuitem" className="tm-popmenu-item" onClick={() => { setMenuOpen(false); setConfirm('regenerate') }}>
                    重新生成
                  </button>
                  <button type="button" role="menuitem" className="tm-popmenu-item is-danger" onClick={() => { setMenuOpen(false); setConfirm('delete') }}>
                    删除
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <ReviewConfirmDialog
            confirm={confirm}
            setConfirm={setConfirm}
            onRegenerate={() => void generate()}
            onDelete={() => void remove()}
          />
        </>
      ) : (
        <>
          {planError ? (
            <Banner tone="err" icon={<Alert size={14} />}>
              {planError}
            </Banner>
          ) : null}
          {plan ? (
            choosing ? (
              <div className="tm-review-plan">
                <p className="tm-caption">
                  选一个类型（判定建议：<b>{plan.typeName}</b>）
                </p>
                <div className="tm-type-grid">
                  {plan.types.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className={`tm-type-chip${choice === t.id ? ' is-on' : ''}`}
                      onClick={() => void changeType(t.id)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                <p className="tm-caption">将看：{plan.frame.join(' / ')}</p>
                <p className="tm-caption">{plan.reason}</p>
                {plan.degraded ? (
                  <Banner tone="warn" icon={<Alert size={14} />}>
                    这次是降级版：{plan.degradeReason}
                  </Banner>
                ) : null}
                <div className="tm-row">
                  <Button size="sm" variant="primary" disabled={!props.ended} onClick={() => void generate()} icon={<Doc size={13} />}>
                    开始生成
                  </Button>
                  <Button size="sm" variant="text" onClick={() => setChoosing(false)}>
                    返回
                  </Button>
                </div>
              </div>
            ) : (
              <div className="tm-review-plan">
                <p className="tm-caption">
                  类型判定：<b>{plan.typeName}</b>
                </p>
                <p className="tm-caption">{plan.reason}</p>
                <p className="tm-caption">将看：{plan.frame.join(' / ')}</p>
                {plan.available.length ? <p className="tm-caption">素材：{plan.available.join(' · ')}</p> : null}
                {plan.missing.length ? (
                  <div className="tm-missing">
                    {plan.missing.map((m) => (
                      <p className="tm-caption" key={m.what}>
                        <b>{m.what}</b>：{m.why} <span className="tm-hint">→ {m.how}</span>
                      </p>
                    ))}
                  </div>
                ) : null}
                {plan.degraded ? (
                  <Banner tone="warn" icon={<Alert size={14} />}>
                    这次是降级版：{plan.degradeReason}
                  </Banner>
                ) : null}
                <Button size="sm" variant="primary" disabled={!props.ended} onClick={() => setChoosing(true)} icon={<Doc size={13} />}>
                  生成复盘
                </Button>
              </div>
            )
          ) : (
            <p className="tm-hint">正在判定这场会的类型…</p>
          )}
        </>
      )}
    </div>
  )
}

/** 会后产出页签：五份产出，点哪个看哪份 */
function OutputsPane(props: {
  meetingId: string
  gen: ContentStates['gen']
  ended: boolean
  toast: ToastApi
  onChanged: () => void
}): React.ReactElement {
  const [outputs, setOutputs] = React.useState<Partial<Record<OutputKind, OutputView>>>(() => outputsMemo.get(props.meetingId) ?? {})
  const [loading, setLoading] = React.useState(() => !outputsMemo.has(props.meetingId))
  const [error, setError] = React.useState('')
  const [working, setWorking] = React.useState<OutputKind | null>(null)
  const [preview, setPreview] = React.useState<OutputKind | null>(null)
  const [active, setActive] = React.useState<OutputKind>(() => {
    const done = OUTPUT_KINDS.find((k) => outputs[k])
    return done ?? OUTPUT_KINDS[0]
  })
  /** 轮询控制器：换页签/换会议/卸载时停掉（宿主那边的生成不受影响） */
  const pollCtrl = React.useRef<AbortController | null>(null)
  const notify = useNotifyOnReady()

  const load = React.useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true)
      try {
        const r = await api.getOutputs(props.meetingId)
        outputsMemo.set(props.meetingId, r ?? {})
        setOutputs(r ?? {})
        setError('')
      } catch (e) {
        setError(errorText(e))
      } finally {
        setLoading(false)
      }
    },
    [props.meetingId]
  )

  React.useEffect(() => {
    void load(false)
  }, [load])

  /** 轮询后台生成状态：跑完就刷新产出并提示；关面板只是停止轮询，任务继续 */
  const watchGeneration = React.useCallback(
    (kind: OutputKind): void => {
      pollCtrl.current?.abort()
      const ctrl = new AbortController()
      pollCtrl.current = ctrl
      void (async () => {
        while (!ctrl.signal.aborted) {
          await new Promise((r) => setTimeout(r, 2500))
          if (ctrl.signal.aborted) return
          try {
            const s = await api.outputStatus(props.meetingId)
            const t = s.tasks.find((x) => x.kind === kind)
            if (!t || t.status === 'done') {
              setWorking((cur) => (cur === kind ? null : cur))
              await load(false)
              props.onChanged()
              if (notify) props.toast.push('ok', t?.message || `${OUTPUT_LABELS[kind]}生成好了。`)
              return
            }
            if (t.status === 'error') {
              setWorking((cur) => (cur === kind ? null : cur))
              props.toast.push('err', t.message || '生成失败')
              return
            }
          } catch {
            /* 网络抖动：下一轮再问 */
          }
        }
      })()
    },
    [props.meetingId, load, notify]
  )

  // 切走再回来 / 换页签：这份产出还在后台跑就接着显示「生成中」
  React.useEffect(() => {
    void (async () => {
      try {
        const s = await api.outputStatus(props.meetingId)
        const t = s.tasks.find((x) => x.kind === active && x.status === 'running')
        if (t) {
          setWorking(active)
          watchGeneration(active)
        }
      } catch {
        /* 状态查不到就当没有后台任务 */
      }
    })()
    return () => {
      pollCtrl.current?.abort()
    }
  }, [props.meetingId, active, watchGeneration])

  const generate = async (kind: OutputKind): Promise<void> => {
    if (working) return
    setWorking(kind)
    try {
      const r = await api.generateOutput(props.meetingId, kind)
      if (!r.started) props.toast.push('info', '这份产出正在生成中。')
      // 起了就轮询；started=false（已在跑）也接着等
      watchGeneration(kind)
    } catch (e) {
      setWorking(null)
      props.toast.push('err', errorText(e))
    }
  }

  /** 取消生成：让宿主停掉那次后台任务 */
  const cancelGenerate = async (): Promise<void> => {
    if (!working) return
    const kind = working
    try {
      await api.cancelOutput(props.meetingId, kind)
      props.toast.push('info', '已取消生成。')
    } catch (e) {
      props.toast.push('err', errorText(e))
    } finally {
      setWorking(null)
    }
  }

  const remove = async (kind: OutputKind): Promise<void> => {
    setWorking(kind)
    try {
      await api.deleteOutput(props.meetingId, kind)
      props.toast.push('ok', `${OUTPUT_LABELS[kind]}已删除。`)
      await load()
      props.onChanged()
    } catch (e) {
      props.toast.push('err', errorText(e))
    } finally {
      setWorking(null)
    }
  }

  if (loading) {
    return (
      <div className="tm-fade-in" aria-busy="true">
        <SkeletonRows rows={4} />
        <span className="tm-caption" style={{ padding: '2px 8px' }}>
          正在读取会后产出…
        </span>
      </div>
    )
  }

  return (
    <div className="tm-stack" style={{ gap: 10 }}>
      {error ? (
        <Banner
          tone="err"
          icon={<Alert size={14} />}
          action={
            <Button size="sm" variant="ghost" onClick={() => void load()}>
              重试
            </Button>
          }
        >
          {error}
        </Banner>
      ) : null}
      {!props.ended ? (
        <Banner tone="warn" icon={<Alert size={14} />}>
          会议还没结束。产出要等会后有逐字稿才生成得出来。
        </Banner>
      ) : null}
      {/* 生成中：只给「在动 + 可以走 + 能取消」，不编造进度和耗时 */}
      {working ? (
        <div className="tm-gen-progress" role="status" aria-live="polite">
          <div className="tm-gen-bar"><span /></div>
          <p className="tm-caption">
            正在生成「{OUTPUT_LABELS[working]}」。可以先去做别的，生成完会出现在这里。
          </p>
          <Button size="sm" variant="ghost" onClick={cancelGenerate}>
            取消生成
          </Button>
        </div>
      ) : null}
      <div className="tm-output-menu" role="tablist" aria-label="会后产出">
        {OUTPUT_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={active === kind}
            className={`tm-output-tab${active === kind ? ' is-on' : ''}`}
            onClick={() => setActive(kind)}
          >
            {OUTPUT_LABELS[kind]}
            {outputs[kind] ? <span className="tm-dot is-ok" title="已生成" /> : null}
          </button>
        ))}
      </div>
      {active === 'review' ? (
        <ReviewCard
          meetingId={props.meetingId}
          out={outputs.review}
          ended={props.ended}
          toast={props.toast}
          onChanged={props.onChanged}
          onPreview={() => setPreview('review')}
        />
      ) : (
        <OutputDoc
          kind={active}
          out={outputs[active]}
          busy={working === active}
          ended={props.ended}
          toast={props.toast}
          onPreview={() => setPreview(active)}
          onRegenerate={() => void generate(active)}
          onDelete={() => void remove(active)}
        />
      )}
      <p className="tm-hint">
        五份产出都用你在设置页选的模型生成；素材优先逐字稿，缺了才用腾讯纪要，两者都没有会直接说没有素材、不编内容。
      </p>
      {preview && outputs[preview] ? (
        <OutputPreview
          title={OUTPUT_LABELS[preview]}
          text={outputs[preview].text}
          generatedAt={outputs[preview].generatedAt}
          toast={props.toast}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </div>
  )
}

function genStateOf(kind: OutputKind, gen: ContentStates['gen']): ContentStates['gen'][keyof ContentStates['gen']] {  if (kind === 'insight') return gen.insight
  if (kind === 'minutes-company') return gen.company
  if (kind === 'minutes-investor') return gen.investor
  if (kind === 'review') return gen.review
  return gen.qa
}

function outputHint(kind: OutputKind): string {
  switch (kind) {
    case 'minutes-company':
      return '站在主办方立场：结论、要点、已确认事项、待办、未决问题。'
    case 'minutes-investor':
      return '站在与会投资人立场：经营数据、增长驱动、风险、管理层原话。'
    case 'review':
      return '复盘这场会开得怎么样：做得好的、该改的、下一场的具体改动。'
    case 'insight':
      return '分析沟通方式：冲突回避、发言占比、倾听与引导风格，带原话依据。'
    default:
      return '把会上被问到的问题与回答整理成清单，方便复用。'
  }
}

