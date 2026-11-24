import { type OutputKind } from './shared/types.js';
export interface Prefs {
    /** 空 = 跟随 DSH 默认模型 */
    provider: string;
    /** 空 = 跟随 DSH 默认模型 */
    model: string;
    /** 空 = 单发模型调用；非空 = 委派给该预设的 agent */
    agentPreset: string;
    outputSkills: OutputKind[];
    notifyOnReady: boolean;
    /** 严格限额：true=到本地计数上限就拒绝发请求；false=只计数不拦（默认，额度只是估计值） */
    quotaStrict: boolean;
}
export declare const DEFAULT_PREFS: Prefs;
/** 读偏好：任何失败都退回默认值，绝不抛（插件不该因为偏好文件坏了就起不来） */
export declare function readPrefs(): Prefs;
/** 原子写：先写临时文件再 rename，避免半个文件 */
export declare function writePrefs(patch: Partial<Prefs>): Prefs;
export declare function prefsPath(): string;
