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
import type { Context } from '@deepseek-ai/cordis';
export interface ModelRef {
    provider: string;
    model: string;
}
export interface CatalogModel {
    provider: string;
    providerName: string;
    models: Array<{
        id: string;
        name: string;
    }>;
}
export interface CatalogAgent {
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
}
export interface CatalogPayload {
    models: CatalogModel[];
    agents: CatalogAgent[];
    defaultProvider: string;
    defaultModel: string;
}
/** 列出可选模型（provider → models），失败返回空数组而不是抛 */
export declare function listModels(ctx: Context): Promise<CatalogModel[]>;
/** 列出 agent 预设 */
export declare function listAgents(ctx: Context): Promise<CatalogAgent[]>;
/** DSH 当前的默认模型（用户没在插件里指定时用它） */
export declare function defaultModel(ctx: Context): ModelRef;
export declare function catalog(ctx: Context): Promise<CatalogPayload>;
export interface GenerateResult {
    ok: boolean;
    text: string;
    /** 实际使用的模型，写进产出便于复现 */
    model: string;
    /** 走了哪条路，界面与产出里都要说清楚 */
    route: 'agent' | 'stream';
    message?: string;
}
export interface RunOptions {
    /** 用户选的模型；空则用 DSH 默认 */
    ref: ModelRef;
    /** 用户选的 agent 预设；空则不走委派 */
    agentPreset: string;
    system: string;
    prompt: string;
    signal?: AbortSignal;
    maxTokens?: number;
}
export declare function generate(ctx: Context, opts: RunOptions): Promise<GenerateResult>;
