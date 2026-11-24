import type { TmeetError } from './errors.js';
export declare function setDailyBudget(n: number): void;
export declare function getDailyBudget(): number;
export interface ExecOptions {
    /** 显式二进制路径；空 = 自动查找 */
    binary?: string;
    timeoutMs?: number;
    signal?: AbortSignal;
}
export type ExecResult = {
    ok: true;
    stdout: string;
    stderr: string;
} | {
    ok: false;
    error: TmeetError;
    stdout: string;
    stderr: string;
};
export interface Envelope<T = unknown> {
    trace_id?: string;
    message?: string;
    data: T;
}
/** 裸跑一条命令，不做 JSON 解析。用于 auth login 这类前台流式命令。 */
export declare function runRaw(args: string[], opts?: ExecOptions): Promise<ExecResult>;
/**
 * 从输出里截出第一个能解析的 JSON 值。
 * 命令有时会在 JSON 前面打印提示（含方括号的中文提示），所以不能只看第一个括号，
 * 要按出现顺序逐个候选起点试一遍。
 */
export declare function sliceJson(text: string): string;
/** 一条「要 JSON」的命令：跑 → 解析信封 → 成功拿 data */
/**
 * 腾讯的 meeting_id 是 18~20 位数字，超过 JS 的安全整数范围（2^53）。
 * 如果 CLI 把它当 JSON 数字输出，JSON.parse 会**静默丢精度**，
 * 于是一个「看起来正常」的 id 拿去查详情就报「会议号无效」（实测 500001）。
 * 这里在解析前把超长整数改成字符串，保住每一位。
 */
export declare function quoteLongIntegers(text: string): string;
export declare function runJson<T = unknown>(args: string[], opts?: ExecOptions): Promise<{
    ok: true;
    data: T;
    envelope: Envelope<T>;
} | {
    ok: false;
    error: TmeetError;
}>;
export interface CliProfile {
    ok: boolean;
    binary: string;
    source: string;
    version: string;
    modern: boolean;
    error?: TmeetError;
}
/**
 * 探测二进制与版本。**只在真正需要时调用**（工具首次调用 / 面板请求 / 用户点按钮），
 * 绝不在 apply() 里调用。
 */
export declare function probeCli(opts?: ExecOptions, opts2?: {
    fresh?: boolean;
}): Promise<CliProfile>;
/**
 * 时间窗钳制：CLI 视角下任何查询窗口都不得大于 31 天（否则 190004）。
 * 返回可安全提交的一对 ISO 时间串。
 */
export declare function clampWindow(startIso: string, endIso: string): {
    start: string;
    end: string;
};
/** tmeet 要本地时区偏移的 ISO 串，例如 2026-03-12T15:00+08:00 */
export declare function isoLocal(d: Date): string;
