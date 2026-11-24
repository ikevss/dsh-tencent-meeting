/**
 * 腾讯会议 CLI 的定位与安装。
 *
 * 事实：`@tencentcloud/tmeet` 是「Go 单文件二进制 + Node 启动壳」的 npm 包。
 * 二进制在包内 `dist/tm-<Platform>-<Arch>[.exe]`；npm 全局装完还会生成
 * `tmeet` / `tmeet.cmd` / `tmeet.ps1` 三个壳。Windows 上 `execFile` 只能跑 `.cmd`
 * 或真正的 exe，不能跑 `.ps1`，所以这里优先找二进制本体。
 */
import { execFile, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
/** 本模块所在目录（lib/cli），用于定位随插件打包的 vendor 目录 */
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
export const CLI_PACKAGE = '@tencentcloud/tmeet';
/** 我们实现所针对的 CLI 契约版本；低版本会明确提示升级，不静默降级 */
export const EXPECTED_VERSION = '1.1.0';
/** record content / record search / meeting search 的最低版本 */
export function isModernVersion(version) {
    const v = parseVersion(version);
    if (!v)
        return false;
    const [maj] = v;
    if (maj > 1)
        return true;
    if (maj < 1)
        return false;
    const [, min] = v;
    return min >= 1;
}
export function parseVersion(raw) {
    const m = /(\d+)\.(\d+)\.(\d+)/.exec(String(raw || ''));
    if (!m)
        return null;
    return [Number(m[1]), Number(m[2]), Number(m[3])];
}
/**
 * npm 包 dist 下真实的二进制文件名后缀。
 * 实测 @tencentcloud/tmeet@1.1.0：`tmeet-macOS-AppleSilicon` / `tmeet-macOS-Intel`
 * / `tmeet-Windows-x86_64.exe` / `tmeet-Linux-x86_64` / `tmeet-Linux-ARM64`。
 * 早期按 Node 的 `process.platform/arch` 拼名字（Darwin-arm64）在这里一个都不存在，
 * mac 上会「装好了却找不到」。返回候选列表，逐个试，兼容不同版本的命名。
 */
function platformTags() {
    const p = process.platform;
    const a = process.arch;
    if (p === 'win32')
        return ['Windows-x86_64', 'Windows-AMD64']; // Windows on ARM 靠 x64 模拟跑
    if (p === 'darwin')
        return a === 'arm64' ? ['macOS-AppleSilicon'] : ['macOS-Intel'];
    if (p === 'linux') {
        const base = a === 'arm64' ? 'Linux-ARM64' : 'Linux-x86_64';
        return [base, base.toLowerCase()];
    }
    return [`${p}-${a}`, `${p}-${a}`.toLowerCase()];
}
/** 二进制后缀：Windows 用 .exe，其余没有后缀 */
function binarySuffix() {
    return process.platform === 'win32' ? '.exe' : '';
}
function binaryName() {
    return process.platform === 'win32' ? 'tmeet.exe' : 'tmeet';
}
/** 全局 npm 根目录的候选位置（不同安装方式各不一样，全部试一遍） */
function npmGlobalRoots() {
    const out = [];
    const home = os.homedir();
    if (process.env.APPDATA)
        out.push(path.join(process.env.APPDATA, 'npm', 'node_modules'));
    out.push(path.join(home, 'AppData', 'Roaming', 'npm', 'node_modules'));
    out.push('/usr/local/lib/node_modules');
    out.push('/usr/lib/node_modules');
    out.push(path.join(home, '.npm-global', 'lib', 'node_modules'));
    const prefix = process.env.npm_config_prefix;
    if (prefix) {
        out.push(process.platform === 'win32' ? path.join(prefix, 'node_modules') : path.join(prefix, 'lib', 'node_modules'));
    }
    if (process.env.NVM_BIN) {
        out.push(path.join(path.dirname(process.env.NVM_BIN), 'lib', 'node_modules'));
    }
    return out;
}
function exists(p) {
    try {
        return fs.statSync(p).isFile();
    }
    catch {
        return false;
    }
}
/**
 * 返回可用二进制的绝对路径，找不到返回空串。
 * 顺序：显式配置 → PATH 上的 exe/cmd → 全局 npm 包内 dist。
 */
export function locateBinary(explicit) {
    const want = String(explicit || '').trim();
    if (want && exists(want))
        return { binary: want, source: 'config' };
    // 随插件打包的二进制：用户不用装任何东西，插件装上就能用（未随包分发时为空）
    const suffix = binarySuffix();
    for (const tag of platformTags()) {
        const bundled = path.resolve(MODULE_DIR, '..', '..', 'vendor', 'tmeet', `tmeet-${tag}${suffix}`);
        if (exists(bundled))
            return { binary: bundled, source: 'bundled' };
    }
    // PATH：直接命中 tmeet.exe（有些发行方式就是裸 exe）
    const exeName = process.platform === 'win32' ? 'tmeet.exe' : 'tmeet';
    for (const dir of String(process.env.PATH || '').split(path.delimiter)) {
        if (!dir)
            continue;
        const candidate = path.join(dir, exeName);
        if (exists(candidate))
            return { binary: candidate, source: 'path' };
    }
    // 全局 npm 包内的二进制（推荐路径：与启动壳同源，最稳）
    const bin = binaryName();
    for (const root of npmGlobalRoots()) {
        for (const tag of platformTags()) {
            const candidate = path.join(root, CLI_PACKAGE, 'dist', `tmeet-${tag}${suffix}`);
            if (exists(candidate))
                return { binary: candidate, source: 'npm-global' };
        }
        // 少数版本把二进制直接放在包根
        const direct = path.join(root, CLI_PACKAGE, bin);
        if (exists(direct))
            return { binary: direct, source: 'npm-global' };
    }
    // PATH：退回 shell 壳（cmd），Windows 上 execFile 可以跑 .cmd
    if (process.platform === 'win32') {
        for (const dir of String(process.env.PATH || '').split(path.delimiter)) {
            if (!dir)
                continue;
            const candidate = path.join(dir, 'tmeet.cmd');
            if (exists(candidate))
                return { binary: candidate, source: 'path-cmd' };
        }
    }
    return { binary: '', source: 'none' };
}
/** 全局 npm 包是否已安装（用于「已装壳但版本旧」的判断） */
export function installedPackageDir() {
    for (const root of npmGlobalRoots()) {
        const dir = path.join(root, CLI_PACKAGE);
        if (fs.existsSync(dir))
            return dir;
    }
    return '';
}
/**
 * 起 tmeet 子进程。
 * Windows 上 `.cmd` 不是 PE 可执行文件，必须经 cmd.exe；显式调用 cmd.exe
 * 而不是用 `shell: true`，避免 Node 的参数拼接安全告警（DEP0190）。
 */
export function spawnTmeet(binary, args, options = {}) {
    const stdio = options.stdio === 'ignore' ? 'ignore' : 'pipe';
    if (process.platform === 'win32' && /\.cmd$/i.test(binary)) {
        return spawn(process.env.COMSPEC || 'cmd.exe', ['/c', binary, ...args], {
            windowsHide: true,
            stdio,
            env: options.env
        });
    }
    return spawn(binary, args, { windowsHide: true, stdio, env: options.env });
}
const INSTALL_TIMEOUT_MS = 180_000;
/**
 * 安装/升级 CLI。只在用户点了按钮、或工具明确要求时才调用。
 * 不读任何凭证，不写项目目录；只调一次全局 npm。
 */
export function runInstall(version = EXPECTED_VERSION) {
    const spec = `${CLI_PACKAGE}@${version.replace(/^v/, '')}`;
    const command = `npm i -g ${spec}`;
    return new Promise((resolve) => {
        execFile(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['i', '-g', spec], {
            timeout: INSTALL_TIMEOUT_MS,
            maxBuffer: 8 * 1024 * 1024,
            windowsHide: true,
            shell: process.platform === 'win32'
        }, (error, stdout, stderr) => {
            const out = String(stdout || '');
            const err = String(stderr || '');
            if (error) {
                const reason = pickInstallFailure(err || error.message);
                resolve({ ok: false, command, stdout: out, stderr: err, message: reason });
                return;
            }
            resolve({
                ok: true,
                command,
                stdout: out,
                stderr: err,
                message: `已安装 ${spec}`
            });
        });
    });
}
/** 把 npm 的英文报错翻成能照做的一句话；翻译不出来就保留原文尾部 */
function pickInstallFailure(raw) {
    const text = raw || '';
    if (/EACCES|EPERM|permission denied/i.test(text)) {
        return '没有权限写入全局 npm 目录。请用管理员身份重开终端，手动执行 npm i -g @tencentcloud/tmeet@1.1.0';
    }
    if (/ENOTFOUND|ETIMEDOUT|ECONNREFUSED|network/i.test(text)) {
        return '网络不通，装不下来。请检查代理或换网络后重试。';
    }
    if (/ENOSPC/i.test(text)) {
        return '磁盘空间不足，安装失败。';
    }
    const tail = text.trim().split(/\r?\n/).slice(-3).join(' ');
    return tail ? `安装失败：${tail.slice(0, 300)}` : '安装失败，请手动执行 npm i -g @tencentcloud/tmeet@1.1.0';
}
