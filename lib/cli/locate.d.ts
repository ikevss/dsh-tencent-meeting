/**
 * 腾讯会议 CLI 的定位与安装。
 *
 * 事实：`@tencentcloud/tmeet` 是「Go 单文件二进制 + Node 启动壳」的 npm 包。
 * 二进制在包内 `dist/tm-<Platform>-<Arch>[.exe]`；npm 全局装完还会生成
 * `tmeet` / `tmeet.cmd` / `tmeet.ps1` 三个壳。Windows 上 `execFile` 只能跑 `.cmd`
 * 或真正的 exe，不能跑 `.ps1`，所以这里优先找二进制本体。
 */
import { type ChildProcess } from 'node:child_process';
export declare const CLI_PACKAGE = "@tencentcloud/tmeet";
/** 我们实现所针对的 CLI 契约版本；低版本会明确提示升级，不静默降级 */
export declare const EXPECTED_VERSION = "1.1.0";
/** record content / record search / meeting search 的最低版本 */
export declare function isModernVersion(version: string): boolean;
export declare function parseVersion(raw: string): [number, number, number] | null;
/**
 * 返回可用二进制的绝对路径，找不到返回空串。
 * 顺序：显式配置 → PATH 上的 exe/cmd → 全局 npm 包内 dist。
 */
export declare function locateBinary(explicit?: string): {
    binary: string;
    source: string;
};
/** 全局 npm 包是否已安装（用于「已装壳但版本旧」的判断） */
export declare function installedPackageDir(): string;
export interface InstallResult {
    ok: boolean;
    /** 实际执行过的命令，便于用户复现 */
    command: string;
    stdout: string;
    stderr: string;
    message: string;
}
export interface SpawnOptions {
    stdio?: 'pipe' | 'ignore';
    env?: NodeJS.ProcessEnv;
}
/**
 * 起 tmeet 子进程。
 * Windows 上 `.cmd` 不是 PE 可执行文件，必须经 cmd.exe；显式调用 cmd.exe
 * 而不是用 `shell: true`，避免 Node 的参数拼接安全告警（DEP0190）。
 */
export declare function spawnTmeet(binary: string, args: string[], options?: SpawnOptions): ChildProcess;
/**
 * 安装/升级 CLI。只在用户点了按钮、或工具明确要求时才调用。
 * 不读任何凭证，不写项目目录；只调一次全局 npm。
 */
export declare function runInstall(version?: string): Promise<InstallResult>;
