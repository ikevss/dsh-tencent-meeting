import type { PluginStatus } from '../shared/types.js';
export interface StatusInput {
    binary: string;
    expectedVersion?: string;
    timeoutMs?: number;
}
/** 把「二进制 / 版本 / 登录」三件事合成一个可直接渲染的状态 */
export declare function readStatus(input: StatusInput): Promise<PluginStatus>;
/** 正在跑授权进程时禁止重复启动（同一时刻只允许一个） */
export declare function authBusy(): boolean;
export interface StartAuthResult {
    ok: boolean;
    url: string | null;
    opened: boolean;
    message: string;
}
/**
 * 起 `tmeet auth login`。它会在 stdout 打印一条授权链接，然后前台轮询。
 * 我们把链接截出来交给界面，界面自己开浏览器（插件不去抢用户的浏览器行为）。
 */
export declare function startLogin(opts: {
    binary: string;
    switchAccount?: boolean;
    timeoutMs?: number;
}): StartAuthResult;
export interface PollResult {
    state: 'idle' | 'waiting' | 'done' | 'failed';
    url: string;
    reason: string;
    waitedMs: number;
}
export declare function pollLogin(input?: StatusInput): Promise<PollResult>;
/** 用户主动放弃等待：停掉授权进程，回到可再试的状态 */
export declare function cancelLogin(): {
    ok: boolean;
    message: string;
};
export declare function killJob(): void;
export declare function disposeAuth(): void;
export declare function logout(input: StatusInput & {
    confirm: boolean;
}): Promise<{
    ok: boolean;
    message: string;
}>;
/** 未登录时给界面/工具用的完整引导文本 */
export declare function guidanceFor(status: PluginStatus): string;
