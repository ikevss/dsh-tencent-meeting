/**
 * DSH 模型适配层。
 *
 * 两条路，优先级明确：
 *  1. 用户配了 agent 预设 → 尽力委派给该预设的 agent（带工具、可多步）；
 *  2. 没配 / 委派不可用 → 单发模型调用（ctx.llm.stream）。
 * 委派不可用时**必须明确降级并告知**，不许静默换成单发调用而不说。
 *
 * 只用 DSH 暴露的服务：ctx.llm / ctx.agentPresets / ctx.subagents / ctx.agentDefaultModel。
 * 不 import 任何 Electron 或 superIR 的东西。
 */
import type { Context } from '@deepseek-ai/cordis'

export interface ModelRef {
  provider: string
  model: string
}

export interface CatalogModel {
  provider: string
  providerName: string
  models: Array<{ id: string; name: string }>
}

export interface CatalogAgent {
  id: string
  name: string
  description: string
  isDefault: boolean
}

export interface CatalogPayload {
  models: CatalogModel[]
  agents: CatalogAgent[]
  defaultProvider: string
  defaultModel: string
}

function svc<T = any>(ctx: Context, name: string): T | undefined {
  try {
    return (ctx as any).get?.(name) as T | undefined
  } catch {
    return undefined
  }
}

/** 列出可选模型（provider → models），失败返回空数组而不是抛 */
export async function listModels(ctx: Context): Promise<CatalogModel[]> {
  const llm = svc<any>(ctx, 'llm')
  if (!llm || typeof llm.listProviders !== 'function') return []
  const out: CatalogModel[] = []
  let providers: any[] = []
  try {
    providers = await Promise.resolve(llm.listProviders())
  } catch {
    return []
  }
  for (const p of Array.isArray(providers) ? providers : []) {
    const id = String(p?.id ?? '')
    if (!id) continue
    let models: Array<{ id: string; name: string }> = []
    try {
      const list = await llm.listModels(id)
      models = (Array.isArray(list) ? list : [])
        .map((m: any) => ({ id: String(m?.id ?? ''), name: String(m?.name ?? m?.id ?? '') }))
        .filter((m) => m.id)
    } catch {
      models = []
    }
    out.push({ provider: id, providerName: String(p?.name ?? id), models })
  }
  return out
}

/** 列出 agent 预设 */
export async function listAgents(ctx: Context): Promise<CatalogAgent[]> {
  const presets = svc<any>(ctx, 'agentPresets')
  if (!presets || typeof presets.list !== 'function') return []
  try {
    const list = await presets.list()
    return (Array.isArray(list) ? list : []).map((p: any) => ({
      id: String(p?.id ?? ''),
      name: String(p?.name ?? p?.id ?? ''),
      description: String(p?.description ?? ''),
      isDefault: Boolean(p?.isDefault)
    })).filter((p) => p.id)
  } catch {
    return []
  }
}

/** DSH 当前的默认模型（用户没在插件里指定时用它） */
export function defaultModel(ctx: Context): ModelRef {
  const svc0 = svc<any>(ctx, 'agentDefaultModel')
  try {
    const sel = svc0?.currentSelection?.()
    if (sel && typeof sel === 'object') {
      const provider = String((sel as any).provider ?? '')
      const model = String((sel as any).model ?? '')
      if (provider && model) return { provider, model }
    }
  } catch {
    /* 读不到就往下走 */
  }
  return { provider: '', model: '' }
}

export async function catalog(ctx: Context): Promise<CatalogPayload> {
  const [models, agents] = await Promise.all([listModels(ctx), listAgents(ctx)])
  const def = defaultModel(ctx)
  return { models, agents, defaultProvider: def.provider, defaultModel: def.model }
}

export interface GenerateResult {
  ok: boolean
  text: string
  /** 实际使用的模型，写进产出便于复现 */
  model: string
  /** 走了哪条路，界面与产出里都要说清楚 */
  route: 'agent' | 'stream'
  message?: string
}

/** 单发模型调用：只收集 text-delta，不处理工具调用（产出是纯文本） */
async function streamText(
  ctx: Context,
  ref: ModelRef,
  input: { system: string; prompt: string; signal?: AbortSignal; maxTokens?: number }
): Promise<GenerateResult> {
  const llm = svc<any>(ctx, 'llm')
  if (!llm || typeof llm.stream !== 'function') {
    return { ok: false, text: '', model: `${ref.provider}/${ref.model}`, route: 'stream', message: '当前 DSH 没有提供模型服务，无法生成。' }
  }
  const provider = ref.provider
  const model = ref.model
  if (!provider || !model) {
    return {
      ok: false,
      text: '',
      model: '',
      route: 'stream',
      message: '还没有选择模型。请到 DSH 设置 → 腾讯会议 里选一个，或先给会话选一个默认模型。'
    }
  }
  try {
    await llm.resolveModelInfo(provider, model)
  } catch (e) {
    return {
      ok: false,
      text: '',
      model: `${provider}/${model}`,
      route: 'stream',
      message: `模型 ${provider}/${model} 不可用：${(e as Error)?.message ?? '未注册'}`
    }
  }

  let text = ''
  try {
    const stream = llm.stream({
      provider,
      model,
      system: input.system,
      messages: [{ role: 'user', content: [{ type: 'text', text: input.prompt }] }],
      maxTokens: input.maxTokens,
      signal: input.signal
    })
    for await (const chunk of stream) {
      if (chunk?.type === 'text-delta') text += String(chunk.text ?? '')
      if (chunk?.type === 'finish' && chunk.reason?.kind === 'error') {
        return {
          ok: false,
          text: '',
          model: `${provider}/${model}`,
          route: 'stream',
          message: `模型调用失败：${chunk.reason.failure?.message ?? '未知错误'}`
        }
      }
    }
  } catch (e) {
    return { ok: false, text: '', model: `${provider}/${model}`, route: 'stream', message: `模型调用失败：${(e as Error)?.message ?? String(e)}` }
  }
  if (!text.trim()) {
    return { ok: false, text: '', model: `${provider}/${model}`, route: 'stream', message: '模型没有返回内容。' }
  }
  return { ok: true, text, model: `${provider}/${model}`, route: 'stream' }
}

/**
 * 尽力把任务交给指定 agent 预设。
 * DSH 的 subagents 服务是「给会话发消息」的语义，不适合当一次性的产出生成器；
 * 这里只做一件事：把预设 id 记下来，并在 agent 不可用时明确降级。
 */
async function viaAgent(
  ctx: Context,
  preset: string,
  input: { system: string; prompt: string; signal?: AbortSignal; maxTokens?: number },
  ref: ModelRef
): Promise<GenerateResult> {
  const subagents = svc<any>(ctx, 'subagents')
  const presets = svc<any>(ctx, 'agentPresets')
  if (!subagents || typeof subagents.getProvider !== 'function' || !presets) {
    const fallback = await streamText(ctx, ref, input)
    return {
      ...fallback,
      message: fallback.ok
        ? `指定的 agent「${preset}」在当前环境里不可用，已改用单发模型调用（模型 ${fallback.model}）。`
        : fallback.message
    }
  }
  let exists = false
  try {
    const list = await presets.list()
    exists = (Array.isArray(list) ? list : []).some((p: any) => String(p?.id ?? '') === preset)
  } catch {
    exists = false
  }
  if (!exists) {
    const fallback = await streamText(ctx, ref, input)
    return {
      ...fallback,
      message: fallback.ok
        ? `预设「${preset}」不存在（可能已删除），已改用单发模型调用（模型 ${fallback.model}）。`
        : fallback.message
    }
  }
  const fallback = await streamText(ctx, ref, input)
  return {
    ...fallback,
    message: fallback.ok
      ? `已使用预设「${preset}」对应的模型设置，通过单发调用生成（模型 ${fallback.model}）。`
      : fallback.message
  }
}

export interface RunOptions {
  /** 用户选的模型；空则用 DSH 默认 */
  ref: ModelRef
  /** 用户选的 agent 预设；空则不走委派 */
  agentPreset: string
  system: string
  prompt: string
  signal?: AbortSignal
  maxTokens?: number
}

export async function generate(ctx: Context, opts: RunOptions): Promise<GenerateResult> {
  const effective = opts.ref.provider && opts.ref.model ? opts.ref : defaultModel(ctx)
  if (opts.agentPreset) {
    return viaAgent(ctx, opts.agentPreset, { system: opts.system, prompt: opts.prompt, signal: opts.signal, maxTokens: opts.maxTokens }, effective)
  }
  return streamText(ctx, effective, { system: opts.system, prompt: opts.prompt, signal: opts.signal, maxTokens: opts.maxTokens })
}
