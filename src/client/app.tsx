/**
 * 主页面：按状态切引导态 / 两栏列表 / 详情 / 设置；外加切换账号弹窗。
 *
 * 路由态只有三档，自己用一个 state 管（不引路由库：宿主是单个面板，刷新会丢栈，
 * 引入路由反而多一层会失效的东西）。
 */
import * as React from 'react'
import type { MeetingBrief, PluginStatus } from '../shared/types'
import { formatRelativeRange, formatWaited, isLive } from '../shared/types'
import * as api from './lib/api'
import { errorText } from './lib/api'
import { useAuthPoll, useMeetings, useStatus } from './lib/hooks'
import { useLiveSync } from './lib/use-live'
import { Detail } from './detail'
import { TopBar } from './topbar'
import { Guide, OperationFailed } from './guide'
import { CreateDialog } from './create-dialog'
import { Banner, Badge, Button, Card, CardHeader, Empty, IconButton, LoadingRow, Progress, RevealMore, SkeletonRows, Spinner, useReveal } from './ui/base'
import { Dialog, Switch } from './ui/radix'
import {
  Alert,
  Calendar,
  ChevronRight,
  Filter,
  Logout,
  MoreHorizontal,
  Plus,
  Refresh,
  Settings as SettingsIcon,
  Video
} from './ui/icons'
import { ToastHost, useToast } from './ui/toast'

type Route = { kind: 'home' }

/** 宿主导航：让 DSH 用自己的完整对话功能打开这场会 */
interface NavLike {
  /** 打开工作区并在会话建好后回调 sessionId；返回是否成功发起 */
  openMeetingWorkspace?: (
    workspaceId: string,
    onSessionOpened?: (sessionId: string) => void
  ) => Promise<boolean>
  openSettings?: () => void
}

/**
 * 视图状态记忆：切到别的插件再回来，面板不能回到首页——
 * 那是「每次都要重新找」的折磨。这里存模块级（切面板不会卸载模块）。
 */
const lastView: { route: Route; selectedId: string; query: string; onlyTranscript: boolean } = {
  route: { kind: 'home' },
  selectedId: '',
  query: '',
  onlyTranscript: false
}

export function App(props: { nav?: NavLike | null }): React.ReactElement {
  const toast = useToast()
  const status = useStatus()
  const [route, setRouteState] = React.useState<Route>(lastView.route)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [switchOpen, setSwitchOpen] = React.useState(false)
  const [onlyTranscript, setOnlyTranscriptState] = React.useState(lastView.onlyTranscript)
  const [query, setQueryState] = React.useState(lastView.query)
  const [queryDraft, setQueryDraft] = React.useState(lastView.query)
  /** 筛选下拉（只看有转写） */
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [selectedId, setSelectedIdState] = React.useState(lastView.selectedId)
  /** 今日接口用量（本地闸门） */
  /** 正在把这场会的 AI 对话交给 DSH 打开 */
  const [chatBusy, setChatBusy] = React.useState(false)

  // 任何视图变化都写回记忆（支持函数式更新，和原生 setState 一样用）
  const setRoute = (v: React.SetStateAction<Route>): void => {
    setRouteState((cur) => {
      const next = typeof v === 'function' ? (v as (c: Route) => Route)(cur) : v
      lastView.route = next
      return next
    })
  }
  const setOnlyTranscript = (v: React.SetStateAction<boolean>): void => {
    setOnlyTranscriptState((cur) => {
      const next = typeof v === 'function' ? (v as (c: boolean) => boolean)(cur) : v
      lastView.onlyTranscript = next
      return next
    })
  }
  const setQuery = (v: React.SetStateAction<string>): void => {
    setQueryState((cur) => {
      const next = typeof v === 'function' ? (v as (c: string) => string)(cur) : v
      lastView.query = next
      return next
    })
  }
  const setSelectedId = (v: React.SetStateAction<string>): void => {
    setSelectedIdState((cur) => {
      const next = typeof v === 'function' ? (v as (c: string) => string)(cur) : v
      lastView.selectedId = next
      return next
    })
  }

  // 搜索：输入即过滤（120ms 防抖），不再要求按回车——按回车才动是上个时代的交互
  React.useEffect(() => {
    if (queryDraft === query) return
    const t = setTimeout(() => setQuery(queryDraft.trim()), 120)
    return () => clearTimeout(t)
  }, [queryDraft, query])

  // 筛选下拉的「点外面关 / Esc 关」
  React.useEffect(() => {
    if (!filterOpen) return
    const onDown = (e: PointerEvent): void => {
      if ((e.target as Element).closest?.('.tm-menu-wrap')) return
      setFilterOpen(false)
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setFilterOpen(false)
    }
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [filterOpen])

  const meetings = useMeetings(onlyTranscript)
  const ready = status.status && isReady(status.status) && !status.error

  // （本地用量计数已不再展示：腾讯真实上限是黑盒，估出来的数字只会误导）

  // 选中态：有进行中的会优先选它；否则选第一场历史会
  const allMeetings = React.useMemo(
    () => [...meetings.live, ...meetings.upcoming, ...meetings.history],
    [meetings.live, meetings.upcoming, meetings.history]
  )
  React.useEffect(() => {
    if (!ready || !allMeetings.length) return
    setSelectedId((cur) => (cur && allMeetings.some((m) => m.meetingId === cur) ? cur : allMeetings[0].meetingId))
  }, [ready, allMeetings])

  /** 用 DSH 自己的完整 AI 对话：为这场会准备会话，交给 DSH 打开（右侧栏） */
  const openMeetingChat = async (): Promise<void> => {
    const m = allMeetings.find((x) => x.meetingId === selectedId)
    if (!m) {
      toast.push('info', '先在左边选一场会，再开 AI 对话。')
      return
    }
    setChatBusy(true)
    try {
      const r = await api.prepareChatSession(m.meetingId)
      if (!props.nav?.openMeetingWorkspace) {
        toast.push('err', '跳转服务不可用。工作区已备好：' + r.workspaceId)
        return
      }
      // openWorkspace 建好会话的瞬间把 sessionId 交给我们，立刻投放本场会资料 + 引导语。
      const opened = await props.nav.openMeetingWorkspace(r.workspaceId, (sessionId) => {
        void api.seedChat(m.meetingId, sessionId).then((s) => {
          if (!s.seeded) toast.push('err', s.message || '这场会的资料没投进去，可以手动发一句。')
        })
      })
      if (!opened) toast.push('err', 'AI 对话窗没打开，稍后再点一次。')
    } catch (e) {
      toast.push('err', errorText(e))
    } finally {
      setChatBusy(false)
    }
  }

  // 实时同步：进入面板即订阅；推送只是触发器，收到后自动真同步，用户不用点
  const [liveEvent, setLiveEvent] = React.useState<api.PushEvent | null>(null)
  /** 同步状态浮层：只在点击「同步」时展开，6 秒后自动收起（不再 hover 误遮挡） */
  const [syncPop, setSyncPop] = React.useState(false)
  const popTimer = React.useRef<number | null>(null)
  React.useEffect(() => {
    return () => {
      if (popTimer.current) window.clearTimeout(popTimer.current)
    }
  }, [])
  const selectedIdRef = React.useRef(selectedId)
  selectedIdRef.current = selectedId
  // 30 秒内的连续推送合并成一次同步：不然一场会连发 5 个事件就是 10 条接口调用
  const lastPushSyncRef = React.useRef(0)
  const pushSync = (): void => {
    const now = Date.now()
    if (now - lastPushSyncRef.current < 30_000) return
    lastPushSyncRef.current = now
    void meetings.sync()
  }
  const live = useLiveSync({
    enabled: Boolean(ready),
    onEvent: (e) => {
      setLiveEvent(e)
      // 正在看的这场会：单独回读它的状态（逐字稿/纪要出来没出来）
      if (e.meetingId && e.meetingId === selectedIdRef.current) {
        void api.refreshMeeting(e.meetingId).then((r) => {
          if (r.states) setLiveEvent({ ...e, states: r.states })
        })
      }
      // 其它一律触发列表真同步（防抖）：新建/修改/取消/结束/转写/纪要都会走到这里，
      // 「有转写」标记和列表不用用户再点同步
      pushSync()
    }
  })

  // 首次/每日自动同步已挪进 useMeetings（判据是能拿到真实 syncedAt），
  // 这里不再重复触发，避免第一次打开连打两次接口。

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return meetings.history
    return meetings.history.filter((m) => m.subject.toLowerCase().includes(q) || m.meetingCode.includes(q))
  }, [meetings.history, query])

  // 列表先给一页：几十行一起铺出去，读者只会看到一片灰（超过 8 条就折）
  const historyReveal = useReveal(filtered, 8)

  const openDetail = (m: MeetingBrief): void => setSelectedId(m.meetingId)

  return (
    <div className="tm-surface">
      <style dangerouslySetInnerHTML={{ __html: STYLE_TEXT }} />
      {renderBody()}
      <ToastHost api={toast} />
      <CreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        toast={toast}
        onCreated={(id) => {
          // 建会成功后服务端已把这场会写进本地快照，这里只读快照即可（不打腾讯接口）。
          // 之前是 sync()，撞上每日额度上限就静默失败，用户以为没建成。
          void meetings.reload().then(() => {
            if (id) setSelectedId(id)
          })
        }}
      />
      <SwitchAccountDialog
        open={switchOpen}
        onOpenChange={setSwitchOpen}
        toast={toast}
        account={status.status?.account ?? ''}
        onDone={async () => {
          await status.refresh()
          await meetings.reload()
          setRoute({ kind: 'home' })
        }}
      />
    </div>
  )

  function renderBody(): React.ReactElement {
    if (status.loading && !status.status) {
      return (
        <div className="tm-scroll">
          <LoadingRow text="正在检测会议组件与登录状态…" />
        </div>
      )
    }

    if (status.error && !status.status) {
      return <OperationFailed message={status.error} onRetry={() => void status.refresh()} />
    }

    const s = status.status
    if (!s) {
      return <OperationFailed message="状态是空的，可能刚启动还没读完。" onRetry={() => void status.refresh()} />
    }

    if (!isReady(s)) {
      return (
        <Guide
          status={s}
          toast={toast}
          onRefresh={status.refresh}
          onSwitchAccount={() => setSwitchOpen(true)}
        />
      )
    }

    return renderHome(s)
  }

  function renderHome(s: PluginStatus): React.ReactElement {
    const syncedText = meetings.syncedAt ? `上次同步 ${formatShort(meetings.syncedAt)}` : '还没同步过'
    const liveItems = meetings.live
    const soonItems = meetings.upcoming
    // 注意：这里不能有 hook。renderHome 只在部分分支被调用，
    // 在它内部用 useMemo/useState 会让两次渲染的 hook 数量不一致（React #310 → 整屏空白）。
    const all = [...liveItems, ...soonItems, ...filtered]
    const selected = all.find((m) => m.meetingId === selectedId) ?? null

    return (
      <div className="tm-home">
        <aside className="tm-col-left">
          <div className="tm-col-head">
            <div className="tm-grow tm-stack" style={{ gap: 0 }}>
              <h2 className="tm-title">会议</h2>
            </div>
          </div>

          <div className="tm-left-body">
            <Button variant="primary" block onClick={() => setCreateOpen(true)} icon={<Plus size={14} />}>
              新建会议
            </Button>

            {meetings.loading ? <Progress /> : null}

            <div className="tm-list-toolbar">
              {/* 搜索框默认展开；右侧漏斗下拉勾选筛选 */}
              <span className="tm-search">
                <input
                  className="tm-input"
                  autoFocus={false}
                  value={queryDraft}
                  placeholder="主题或会议号"
                  aria-label="搜索会议"
                  onChange={(e) => setQueryDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setQueryDraft('')
                      setQuery('')
                    }
                  }}
                />
                {queryDraft ? (
                  <button
                    type="button"
                    className="tm-search-clear"
                    aria-label="清空搜索"
                    onClick={() => {
                      setQueryDraft('')
                      setQuery('')
                    }}
                  >
                    ×
                  </button>
                ) : null}
              </span>
              <div className="tm-menu-wrap">
                <IconButton label="筛选" onClick={() => setFilterOpen((v) => !v)}>
                  <Filter size={15} />
                </IconButton>
                {filterOpen ? (
                  <div className="tm-popmenu" role="menu" style={{ right: 0 }}>
                    <div className="tm-popmenu-label">筛选</div>
                    <button
                      type="button"
                      role="menuitem"
                      className="tm-popmenu-item"
                      aria-pressed={onlyTranscript}
                      onClick={() => setOnlyTranscript(!onlyTranscript)}
                    >
                      <span className="tm-check">{onlyTranscript ? '✓' : ''}</span>
                      只看有转写
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {meetings.loading && !all.length ? <SkeletonRows rows={4} /> : null}

            {liveItems.length ? (
              <>
                <h3 className="tm-group-title">进行中</h3>
                <div className="tm-upcoming">
                  {liveItems.map((m) => (
                    <MeetingRow
                      key={m.meetingId}
                      m={m}
                      tone="live"
                      active={m.meetingId === selectedId}
                      onClick={() => setSelectedId(m.meetingId)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {soonItems.length ? (
              <>
                <h3 className="tm-group-title">即将开始</h3>
                <div className="tm-upcoming">
                  {soonItems.map((m) => (
                    <MeetingRow
                      key={m.meetingId}
                      m={m}
                      tone="soon"
                      active={m.meetingId === selectedId}
                      onClick={() => setSelectedId(m.meetingId)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {filtered.length ? (
              <>
                <h3 className="tm-group-title">历史会议</h3>
                <div className="tm-upcoming">
                  {historyReveal.shown.map((m) => (
                    <MeetingRow
                      key={m.meetingId}
                      m={m}
                      tone="history"
                      active={m.meetingId === selectedId}
                      onClick={() => setSelectedId(m.meetingId)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {!meetings.loading && !all.length ? (
              <HistoryEmpty
                filtered={onlyTranscript || Boolean(query)}
                hiddenCount={meetings.hiddenByFilter}
                onClear={() => {
                  setOnlyTranscript(false)
                  setQuery('')
                  setQueryDraft('')
                }}
                onSync={() => void meetings.sync()}
                onSearch={query ? `没有匹配「${query}」的会议` : undefined}
              />
            ) : null}

            <RevealMore
              hidden={historyReveal.hidden}
              total={filtered.length}
              noun="场"
              expanded={historyReveal.expanded}
              onReveal={historyReveal.reveal}
              onCollapse={historyReveal.collapse}
            />

            <div className="tm-list-foot">
              <span className="tm-caption">
                {all.length ? `共 ${all.length} 场` : '暂无'}
                {meetings.hiddenByFilter ? `，另有 ${meetings.hiddenByFilter} 场被筛选隐藏` : ''}
              </span>
              {/* 有搜索或筛选时不给「加载更早」：现在拉的是服务器数据，
                  在筛选结果里点它，用户会以为「再拉点就能出现更多匹配」，其实是白拉。 */}
              {meetings.hasMore && !query && !onlyTranscript ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void meetings.loadEarlier()
                  }}
                  disabled={meetings.loadingMore}
                  icon={meetings.loadingMore ? <Spinner /> : <Calendar size={13} />}
                >
                  {meetings.loadingMore ? '正在加载…' : '加载更早的 30 天'}
                </Button>
              ) : !meetings.hasMore && filtered.length && !query && !onlyTranscript ? (
                <span className="tm-caption">没有更早的了</span>
              ) : null}
            </div>
          </div>

          <div className="tm-left-foot">
            <span className={`tm-led${s.account ? ' is-live' : ''}`} aria-hidden="true" />
            <span className="tm-led-text" title={s.account || undefined}>
              {s.account ? `已连接 ${s.account}` : '已连接'}
            </span>
            <span className="tm-grow" />
            <Button size="sm" variant="text" onClick={() => setSwitchOpen(true)}>
              切换
            </Button>
          </div>
        </aside>

        <div className="tm-col-right">
          <div className="tm-right-head">
            {/* 顶栏只留：同步（hover 看上次同步/用量/状态）+ 实时同步小点 + 设置/助手。 */}
            <div className="tm-sync">
              {/* 同步按钮：点击才会展开「上次同步 / 实时同步状态」，不再 hover 误遮挡标题 */}
              <div className={`tm-menu-wrap tm-sync-wrap${syncPop ? ' is-open' : ''}`}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSyncPop(true)
                    if (popTimer.current) window.clearTimeout(popTimer.current)
                    popTimer.current = window.setTimeout(() => setSyncPop(false), 6000)
                    void meetings.sync().then(() => toast.push('ok', '同步完成。'))
                  }}
                  disabled={meetings.loading}
                  icon={meetings.loading ? <Spinner /> : <Refresh size={13} />}
                >
                  {meetings.loading ? '正在同步…' : '同步'}
                </Button>
                <div className="tm-sync-pop" role="status">
                  <div className="tm-sync-pop-row">{syncedText}</div>
                  <div className="tm-sync-pop-row">
                    {live.state === 'degraded'
                      ? '实时同步已断开，改为手动刷新'
                      : live.state === 'live'
                        ? '实时同步中，会议状态自动更新'
                        : live.state === 'connecting'
                          ? '正在连接实时同步…'
                          : '实时同步未开启'}
                  </div>
                </div>
              </div>
              {/* 实时同步中：只在通道正常时显示一句无边框短文案，其余状态一律不显示 */}
              {live.state === 'live' ? (
                <span className="tm-live-dot" title="实时同步中，会议状态会自动更新">
                  <span className="tm-led" aria-hidden="true" />
                  实时同步中
                </span>
              ) : null}
            </div>
            <div className="tm-grow" />
            <TopBar
              toast={toast}
              onOpenSettings={() => props.nav?.openSettings?.()}
              onOpenAssistant={openMeetingChat}
            />
          </div>

          {meetings.error ? (
            <div style={{ padding: '0 18px 8px' }} className="tm-fade-in">
              <Banner
                tone="err"
                icon={<Alert size={14} />}
                action={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      void meetings.sync()
                    }}
                  >
                    重试
                  </Button>
                }
              >
                {meetings.error}
              </Banner>
            </div>
          ) : null}

          {selected ? (
            <Detail
              key={selected.meetingId}
              meetingId={selected.meetingId}
              brief={selected}
              toast={toast}
              embedded
              liveEvent={liveEvent}
              syncState={live.state}
              onChanged={() => void meetings.reload()}
            />
          ) : (            <div className="tm-scroll">
              <Empty
                title="选一场会议看详情"
                desc="左边列出进行中、即将开始和已结束的会议，点哪场右边就显示哪场。"
                actions={
                  <Button size="sm" variant="ghost" icon={<Refresh size={13} />} onClick={() => void meetings.sync()}>
                    先同步一次
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
    )
  }
}

/* ── 左侧列表行：选中态用边框+文字，不靠颜色单独表意 ── */

function MeetingRow(props: {
  m: MeetingBrief
  tone: 'live' | 'soon' | 'history'
  active: boolean
  onClick: () => void
}): React.ReactElement {
  const { m, tone, active, onClick } = props
  const meta =
    tone === 'live'
      ? `进行中 · ${formatRelativeRange(m.startTime, m.endTime)}`
      : formatRelativeRange(m.startTime, m.endTime)
  return (
    <button
      type="button"
      className={`tm-upcoming-item${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-current={active || undefined}
      aria-label={`${m.subject}，${meta}`}
    >
      <span className={`tm-led${tone === 'live' ? ' is-live' : ''}`} aria-hidden="true" />
      <span className="tm-item-text tm-grow">
        <span className="tm-item-name">{m.subject}</span>
        <span className="tm-item-meta">
          <span>{meta}</span>
          {m.hasTranscript ? <Badge tone="ok">有转写</Badge> : null}
          {m.recordsTotal ? <span>录制 {m.recordsTotal}</span> : null}
        </span>
      </span>
      <ChevronRight size={13} />
    </button>
  )
}

/* ── 历史空态：把「真的没有」「被筛掉」「搜不到」分开说 ── */

function HistoryEmpty(props: {
  filtered: boolean
  hiddenCount: number
  onClear: () => void
  onSync: () => void
  onSearch?: string
}): React.ReactElement {
  if (props.onSearch) {
    return (
      <Empty
        title={props.onSearch}
        desc="换个关键词，或者清掉搜索看全部。"
        actions={
          <Button size="sm" variant="ghost" onClick={props.onClear}>
            清掉筛选
          </Button>
        }
      />
    )
  }
  if (props.filtered && props.hiddenCount) {
    return (
      <Empty
        title="这些会暂时还没有逐字稿"
        desc={`筛掉了 ${props.hiddenCount} 场本机暂无转写的会；同步后可能就进来了。`}
        actions={
          <Button size="sm" variant="ghost" onClick={props.onClear}>
            取消筛选
          </Button>
        }
      />
    )
  }
  return (
    <Empty
      title="近 30 天没有已结束的会议"
      desc="只列你自己账号的会议。同步一次能看到最新的；更早的用下面的「加载更早」。"
      actions={
        <Button size="sm" variant="ghost" icon={<Refresh size={13} />} onClick={props.onSync}>
          同步一次
        </Button>
      }
    />
  )
}

/* ── 切换账号弹窗：默认不勾「清除记录」；勾了提示变红、确认按钮变红；进行中禁所有关闭路径 ── */

function SwitchAccountDialog(props: {
  open: boolean
  onOpenChange: (v: boolean) => void
  toast: ReturnType<typeof useToast>
  account: string
  onDone: () => Promise<void>
}): React.ReactElement {
  const [purge, setPurge] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [waiting, setWaiting] = React.useState(false)
  const [error, setError] = React.useState('')
  const poll = useAuthPoll(waiting)

  React.useEffect(() => {
    if (!props.open) {
      setPurge(false)
      setBusy(false)
      setWaiting(false)
      setError('')
    }
  }, [props.open])

  React.useEffect(() => {
    if (poll.phase !== 'done') return
    let alive = true
    void props.onDone().then(() => {
      if (!alive) return
      setWaiting(false)
      props.onOpenChange(false)
      props.toast.push('ok', '已切换到新账号。')
    })
    return () => {
      alive = false
    }
  }, [poll.phase, props])

  const start = async (): Promise<void> => {
    setError('')
    setBusy(true)
    try {
      if (purge) {
        // 先退旧账号并按勾选清本地记录，再起授权；顺序反了会留下上个账号的残留。
        // 退出失败不拦着换号：新账号登录会覆盖旧凭据，这里只提示、不中断。
        try {
          const out = await api.logout(true)
          if (!out.ok) setError(out.message || '旧账号退出没成功，直接登录新账号也可以覆盖。')
        } catch (e) {
          setError(errorText(e))
        }
      }
      const r = await api.startAuth(true)
      if (r.url && typeof window !== 'undefined') window.open(r.url, '_blank', 'noopener,noreferrer')
      if (!r.ok && !r.url) {
        setError(r.message || '授权没起来，稍后再点一次。')
        setBusy(false)
        return
      }
      setWaiting(true)
      props.toast.push('info', '授权页已打开，确认后这里会自动切过去。')
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const blocking = busy || waiting

  /** 停止等待：停掉后台授权进程，回到可以重试的状态。任何时刻都能点。 */
  const stopWaiting = async (): Promise<void> => {
    setWaiting(false)
    setError('')
    try {
      await api.cancelAuth()
      props.toast.push('info', '已停止等待授权，可以重新生成链接。')
    } catch {
      /* 停止失败也不拦着用户 */
    }
  }

  const close = (): void => {
    // 关窗时如果还在等授权，把后台进程一起停掉——否则会留一个占着 token.lock 的孤儿进程，
    // 下次再点授权就会报 file lock timeout。
    if (waiting) {
      setWaiting(false)
      void api.cancelAuth().catch(() => {})
    }
    props.onOpenChange(false)
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(next) => {
        if (!next) close()
        else props.onOpenChange(true)
      }}
      title="切换腾讯会议账号"
      description={props.account ? `当前登录：${props.account}` : '当前还没有登录账号'}
      dismissable
      footer={
        <>
          <span className="tm-grow">
            {waiting ? formatWaited(poll.waitedSeconds) : purge ? '勾了清除：本机会议记录会一起删掉。' : '默认保留本机会议记录。'}
          </span>
          <div className="tm-dialog-acts">
            {waiting ? (
              <>
                <Button onClick={() => void stopWaiting()}>停止等待</Button>
                <Button variant="subtle" onClick={() => void start()} disabled={busy}>
                  重新生成链接
                </Button>
              </>
            ) : (
              <>
                <Button onClick={close} disabled={busy}>
                  取消
                </Button>
                <Button
                  variant={purge ? 'danger' : 'primary'}
                  onClick={() => void start()}
                  disabled={busy}
                  icon={busy ? <Spinner /> : <Logout size={13} />}
                >
                  {busy ? '正在切换…' : purge ? '退出并清除后切换' : '去授权切换'}
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

      <div className="tm-switch-row">
        <div className="tm-switch-text">
          <div className="tm-switch-title" style={purge ? { color: 'var(--dsw-alias-state-error-primary,#dc2626)' } : undefined}>
            清除这个账号下的会议记录
          </div>
          <div className={`tm-switch-desc${purge ? ' ' : ''}`} style={purge ? { color: 'var(--dsw-alias-state-error-primary,#dc2626)' } : undefined}>
            {purge
              ? '会删掉本机的列表快照、逐字稿缓存与已生成的产出，不可恢复。腾讯服务器上的会议不会被删。'
              : '默认不清除。勾上之后本机缓存会一起删掉，避免看到上个账号的内容。'}
          </div>
        </div>
        <Switch checked={purge} onCheckedChange={setPurge} disabled={blocking} label="清除这个账号下的会议记录" />
      </div>

      {waiting ? (
        <div className="tm-row" role="status">
          <Spinner />
          <span className="tm-hint">在浏览器里确认授权；这里会自动接上，别关这个弹窗。</span>
        </div>
      ) : null}
    </Dialog>
  )
}

/* ── 工具 ── */

function isReady(s: PluginStatus): boolean {
  return s.state === 'connected' || s.state === 'connected-empty' || s.state === 'expiring'
}

function formatShort(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso
  const d = new Date(t)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** 样式表文本由打包器的 .css=text 注入（见 scripts/build-client.mjs） */
import STYLE_TEXT from './styles.css'
