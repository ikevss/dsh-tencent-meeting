/**
 * 设置页：模型（供应商 → 模型两级）/ agent 预设 / 四份产出技能开关 / CLI 路径 / 缓存清理。
 *
 * 保存纪律：保存失败的原文照抄给用户看（后端会给出「偏好保存失败：EACCES …」这种），
 * 不吞成一句「保存失败」——否则用户不知道该改哪。
 */
import * as React from 'react'
import type { CatalogPayload, OutputKind, PluginStatus, PrefsView } from '../shared/types'
import { OUTPUT_KINDS, OUTPUT_LABELS } from '../shared/types'
import * as api from './lib/api'
import { errorText } from './lib/api'
import { Banner, Button, Card, CardHeader, Field, KeyValues, LoadingRow, Separator, Spinner } from './ui/base'
import { Select, Switch } from './ui/radix'
import { Alert, Check, Refresh, Settings as SettingsIcon, Trash } from './ui/icons'
import type { ToastApi } from './ui/toast'

export interface SettingsProps {
  toast: ToastApi
  /** 面板版本里的紧凑排布（设置页里那一节）与整页排布共用同一份逻辑 */
  compact?: boolean
}

export function SettingsView(props: SettingsProps): React.ReactElement {
  const [prefs, setPrefs] = React.useState<PrefsView | null>(null)
  const [catalog, setCatalog] = React.useState<CatalogPayload | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState('')
  const [savedAt, setSavedAt] = React.useState<number | null>(null)
  const [clearing, setClearing] = React.useState(false)
  /** 组件实际状态：路径是部署配置，只能读不能在这里改 */
  const [status, setStatus] = React.useState<PluginStatus | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [r, st] = await Promise.all([api.getSettings(), api.getStatus()])
      setPrefs(r.prefs)
      setCatalog(r.catalog)
      setStatus(st)
      setLoadError('')
    } catch (e) {
      setLoadError(errorText(e))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const save = async (patch: Partial<PrefsView>): Promise<void> => {
    if (!prefs) return
    setSaving(true)
    setSaveError('')
    try {
      const r = await api.saveSettings(patch)
      setPrefs(r.prefs)
      setSavedAt(Date.now())
      props.toast.push('ok', '设置已保存。')
    } catch (e) {
      const msg = errorText(e)
      setSaveError(msg)
      props.toast.push('err', msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading && !prefs) return <LoadingRow text="正在读取设置…" />

  if (loadError && !prefs) {
    return (
      <Banner
        tone="err"
        icon={<Alert size={14} />}
        action={
          <Button size="sm" variant="ghost" onClick={() => void load()}>
            重试
          </Button>
        }
      >
        {loadError}
      </Banner>
    )
  }

  if (!prefs || !catalog) return <p className="tm-hint">没读到设置。</p>

  const providers = catalog.models
  const currentProvider = prefs.provider || catalog.defaultProvider || (providers[0]?.provider ?? '')
  const providerEntry = providers.find((p) => p.provider === currentProvider)
  const modelOptions = [
    { value: '', label: '跟随 DSH 默认模型' },
    ...(providerEntry?.models ?? []).map((m) => ({ value: m.id, label: m.name || m.id }))
  ]
  const agentOptions = [
    { value: '', label: '不指定（单发一次模型调用）' },
    ...catalog.agents.map((a) => ({ value: a.id, label: a.name + (a.isDefault ? '（默认）' : '') }))
  ]

  return (
    <div className="tm-settings-inner">
      <div className="tm-settings-head">
        <div className="tm-stack" style={{ gap: 2 }}>
          <h2 className="tm-title">腾讯会议</h2>
          <p className="tm-subtitle">产出用哪个模型、开哪几份技能、组件在哪里，都在这一页。</p>
        </div>
        <div className="tm-row">
          {saving ? <Spinner /> : savedAt ? <span className="tm-caption">已保存</span> : null}
          <Button size="sm" variant="ghost" onClick={() => void load()} icon={<Refresh size={13} />}>
            重新读取
          </Button>
        </div>
      </div>

      {saveError ? (
        <Banner tone="err" icon={<Alert size={14} />}>
          {saveError}
        </Banner>
      ) : null}

      <Card>
        <CardHeader title="生成用的模型" sub="四份会后产出与 AI 认人都用这个模型" />
        <div className="tm-card-b tm-stack" style={{ gap: 12 }}>
          <Field label="供应商" htmlFor="tm-set-provider">
            <Select
              id="tm-set-provider"
              ariaLabel="模型供应商"
              value={currentProvider}
              disabled={saving || !providers.length}
              onValueChange={(v) => void save({ provider: v, model: '' })}
              options={
                providers.length
                  ? providers.map((p) => ({ value: p.provider, label: p.providerName || p.provider }))
                  : [{ value: '', label: '没有可用的供应商', disabled: true }]
              }
              placeholder="选择供应商"
            />
          </Field>

          <Field
            label="模型"
            htmlFor="tm-set-model"
            hint={modelOptions.length <= 1 ? '这个供应商下没读到可选模型，会跟随 DSH 默认。' : undefined}
          >
            <Select
              id="tm-set-model"
              ariaLabel="模型"
              value={prefs.model}
              disabled={saving}
              onValueChange={(v) => void save({ provider: currentProvider, model: v })}
              options={modelOptions}
              placeholder="跟随默认"
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="agent 预设"
          sub="选了就委派给这个预设跑；不指定则只单发一次模型调用"
        />
        <div className="tm-card-b">
          <Field
            label="预设"
            htmlFor="tm-set-agent"
            hint={
              catalog.agents.length
                ? '委派不可用时会明确告诉你降级了，不会静默切换。'
                : '这台机器上没读到 agent 预设，只能用单发模型调用。'
            }
          >
            <Select
              id="tm-set-agent"
              ariaLabel="agent 预设"
              value={prefs.agentPreset}
              disabled={saving || !catalog.agents.length}
              onValueChange={(v) => void save({ agentPreset: v })}
              options={agentOptions}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="产出技能" sub="关掉的技能不会注册给助手；已生成的文件不受影响" />
        <div className="tm-card-b tm-stack" style={{ gap: 2 }}>
          {OUTPUT_KINDS.map((kind, i) => (
            <React.Fragment key={kind}>
              {i > 0 ? <Separator /> : null}
              <SwitchRow
                title={OUTPUT_LABELS[kind]}
                desc={skillDesc(kind)}
                checked={prefs.outputSkills.includes(kind)}
                disabled={saving}
                onCheckedChange={(on) => {
                  const next = new Set(prefs.outputSkills)
                  if (on) next.add(kind)
                  else next.delete(kind)
                  void save({ outputSkills: OUTPUT_KINDS.filter((k) => next.has(k)) })
                }}
              />
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="通知与缓存" sub="生成完成时提醒一次；缓存清了不会动你的会议数据" />
        <div className="tm-card-b tm-stack" style={{ gap: 2 }}>
          <SwitchRow
            title="生成完成时通知"
            desc="关掉就只能自己回到面板看结果。"
            checked={prefs.notifyOnReady}
            disabled={saving}
            onCheckedChange={(on) => void save({ notifyOnReady: on })}
          />
          <Separator />
          <div className="tm-row-between" style={{ paddingTop: 8 }}>
            <div className="tm-grow tm-stack" style={{ gap: 2 }}>
              <span className="tm-switch-title">清理本地缓存</span>
              <span className="tm-switch-desc">清掉列表快照与内容索引，下次进面板会重新同步。</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              icon={clearing ? <Spinner /> : <Trash size={13} />}
              disabled={clearing}
              onClick={() => {
                setClearing(true)
                void api
                  .clearCache()
                  .then(() => props.toast.push('ok', '缓存已清理，下次进面板会重新同步。'))
                  .catch((e) => props.toast.push('err', errorText(e)))
                  .finally(() => setClearing(false))
              }}
            >
              {clearing ? '正在清理…' : '清理'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="会议组件" sub="腾讯会议的官方命令行组件，插件不打包它" />
        <div className="tm-card-b tm-stack" style={{ gap: 12 }}>
          {/* 只读展示：路径属于部署配置，能填不代表能存——假输入框比没有更糟。 */}
          <KeyValues
            rows={[
              {
                label: '当前组件',
                value: (
                  <code style={{ fontSize: 12, wordBreak: 'break-all' }}>
                    {status?.binary || '正在探测…'}
                  </code>
                )
              },
              {
                label: '版本',
                value: status?.version ? `${status.version}${status.modern ? '' : '（不支持读取逐字稿）'}` : '未知'
              }
            ]}
          />
          <p className="tm-hint">
            组件路径由部署决定，不能在这里改：要换路径或升级，请改插件的 cordis.patch.yml
            再重启插件。想换登录账号，回「腾讯会议」面板，那里有对应的按钮与进度提示。
          </p>
        </div>
      </Card>

      <p className="tm-hint">
        偏好写在 DSH 的插件数据目录里（原子写）。保存失败时上一份设置继续有效，不会写坏。
      </p>
    </div>
  )
}

function SwitchRow(props: {
  title: string
  desc: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (v: boolean) => void
}): React.ReactElement {
  return (
    <div className="tm-switch-row">
      <div className="tm-switch-text">
        <div className="tm-switch-title">{props.title}</div>
        <div className="tm-switch-desc">{props.desc}</div>
      </div>
      <Switch
        checked={props.checked}
        onCheckedChange={props.onCheckedChange}
        disabled={props.disabled}
        label={props.title}
      />
    </div>
  )
}

function skillDesc(kind: OutputKind): string {
  switch (kind) {
    case 'minutes-company':
      return '站在主办方立场整理结论、已确认事项与待办。'
    case 'minutes-investor':
      return '站在与会投资人立场抓数据、增长与风险。'
    case 'review':
      return '复盘会开得怎么样，给下一场的具体改动。'
    default:
      return '把被问到的问题与回答整理成可复用的清单。'
  }
}

export const __settingsIcons = { Check, SettingsIcon }
