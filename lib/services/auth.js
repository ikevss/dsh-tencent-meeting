/**
 * 认证服务：状态探测 + 一键授权（OAuth 设备码）+ 登出。
 *
 * 铁律：
 *  - 不读、不复制、不打印 ~/.tmeet 任何文件；凭证只由 tmeet 自己管理。
 *  - 只有在用户点了「去授权」之后才 spawn `tmeet auth login`，apply() 内零 spawn。
 *  - 同一时刻最多一个登录进程；120 秒未完成就 kill；插件卸载时 kill。
 */
import { execFileSync, spawn } from 'node:child_process';
import { authLogout, authStatus } from '../cli/commands.js';
import { probeCli } from '../cli/exec.js';
import { loginGuidance, upgradeGuidance } from '../cli/errors.js';
import { EXPECTED_VERSION, locateBinary } from '../cli/locate.js';
function execOpts(input) {
    return { binary: input.binary, timeoutMs: input.timeoutMs };
}
/** 把「二进制 / 版本 / 登录」三件事合成一个可直接渲染的状态 */
export async function readStatus(input) {
    const expected = input.expectedVersion || EXPECTED_VERSION;
    const profile = await probeCli(execOpts(input));
    const checkedAt = Date.now();
    if (!profile.ok) {
        const missing = profile.error?.code === 'missing-cli';
        return {
            cli: missing ? 'missing' : 'missing',
            version: profile.version || '',
            expectedVersion: expected,
            modern: false,
            auth: 'unknown',
            account: '',
            binary: profile.binary || locateBinary(input.binary).binary,
            state: 'not-installed',
            hint: missing
                ? '还没安装腾讯会议组件。点下面的按钮装一次，之后就不用管了。'
                : '会议组件存在但跑不起来，可能是路径不对或架构不匹配。',
            checkedAt
        };
    }
    if (!profile.modern) {
        return {
            cli: 'ready',
            version: profile.version,
            expectedVersion: expected,
            modern: false,
            auth: 'unknown',
            account: '',
            binary: profile.binary,
            state: 'version-mismatch',
            hint: upgradeGuidance(profile.version).replace(/\n/g, ' '),
            checkedAt
        };
    }
    const auth = await authStatus(execOpts(input));
    if (!auth.ok || !auth.data) {
        return {
            cli: 'ready',
            version: profile.version,
            expectedVersion: expected,
            modern: true,
            auth: 'unknown',
            account: '',
            binary: profile.binary,
            state: 'operation-failed',
            hint: '读不到登录状态，稍后再试一次。',
            checkedAt
        };
    }
    if (!auth.data.loggedIn) {
        return {
            cli: 'ready',
            version: profile.version,
            expectedVersion: expected,
            modern: true,
            auth: 'not-logged-in',
            account: '',
            binary: profile.binary,
            state: 'none',
            hint: '还没有登录腾讯会议。点「去授权」，在打开的页面上确认一次即可。',
            checkedAt
        };
    }
    const access = auth.data.accessRemainingMs;
    const expiring = access !== null && access > 0 && access < 24 * 3600 * 1000;
    const expired = access !== null && access <= 0;
    const state = expired ? 'expired' : expiring ? 'expiring' : 'connected';
    return {
        cli: 'ready',
        version: profile.version,
        expectedVersion: expected,
        modern: true,
        auth: expired ? 'expired' : 'logged-in',
        account: auth.data.account,
        binary: profile.binary,
        state,
        hint: state === 'expired'
            ? '登录已过期，点「续期」重新授权一次。'
            : state === 'expiring'
                ? `授权快到期了（还剩 ${Math.max(1, Math.round((access ?? 0) / 36e5))} 小时），建议现在续期。`
                : `已连接${auth.data.account ? `：${auth.data.account}` : ''}`,
        checkedAt
    };
}
const AUTH_TIMEOUT_MS = 120_000;
let job = null;
let lastStartedAt = 0;
/** 正在跑授权进程时禁止重复启动（同一时刻只允许一个） */
export function authBusy() {
    return job !== null && job.state === 'waiting';
}
/**
 * 清掉「上一次授权留下的登录进程」。
 *
 * 实测坑：`tmeet auth login` 会占 ~/.tmeet/token.lock。上一个进程没退干净时，
 * 新的 auth login 会在 5 秒后报 `file lock timeout`，界面上就是一句看不懂的英文错误。
 * 这里只杀命令行里带 `auth login` 的进程——那是我们自己的授权助手，不是用户的会议客户端。
 */
function killStaleLoginProcesses() {
    if (process.platform !== 'win32')
        return 0;
    try {
        const ps = [
            "$me = $PID",
            'Get-CimInstance Win32_Process -Filter "Name like \'tmeet%\'" |',
            "  Where-Object { $_.CommandLine -and $_.CommandLine -match 'auth\\s+login' } |",
            '  ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop; $_.ProcessId } catch {} }'
        ].join(' ');
        const out = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], {
            encoding: 'utf8',
            timeout: 8000,
            windowsHide: true
        });
        return String(out || '')
            .split(/\s+/)
            .filter((s) => /^\d+$/.test(s)).length;
    }
    catch {
        return 0;
    }
}
/**
 * 起 `tmeet auth login`。它会在 stdout 打印一条授权链接，然后前台轮询。
 * 我们把链接截出来交给界面，界面自己开浏览器（插件不去抢用户的浏览器行为）。
 */
export function startLogin(opts) {
    if (authBusy()) {
        return { ok: true, url: job?.url || null, opened: false, message: '已经有一个授权在等着了，请先完成它。' };
    }
    // 换号必须先 logout：已登录状态下 auth login 会被 CLI 直接拒
    const { binary } = locateBinary(opts.binary);
    if (!binary) {
        return { ok: false, url: null, opened: false, message: '没找到腾讯会议组件，请先安装。' };
    }
    // 先把上一轮的残留授权进程清掉，否则一定撞 token.lock
    killStaleLoginProcesses();
    lastStartedAt = Date.now();
    job = { child: null, buffer: '', url: '', state: 'waiting', reason: '', timer: null };
    const args = ['auth', 'login'];
    try {
        const child = spawn(binary, args, {
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: process.platform === 'win32' && /\.cmd$/i.test(binary)
        });
        job.child = child;
        const collect = (chunk) => {
            if (!job)
                return;
            job.buffer += chunk.toString('utf8');
            if (!job.url) {
                const url = pickAuthUrl(job.buffer);
                if (url)
                    job.url = url;
            }
            if (/logged in|login success|success/i.test(job.buffer) && /user/i.test(job.buffer)) {
                if (job.state === 'waiting')
                    job.state = 'done';
            }
        };
        child.stdout?.on('data', collect);
        child.stderr?.on('data', collect);
        child.on('error', (e) => {
            if (!job)
                return;
            job.state = 'failed';
            job.reason = e.message;
        });
        child.on('exit', (code) => {
            if (!job)
                return;
            if (job.state === 'waiting') {
                if (code === 0 && /logged in/i.test(job.buffer))
                    job.state = 'done';
                else if (code === 0)
                    job.state = 'done';
                else {
                    job.state = 'failed';
                    job.reason = pickReason(job.buffer) || `授权进程退出（退出码 ${code}）`;
                }
            }
            if (job.timer)
                clearTimeout(job.timer);
            job.timer = null;
        });
        job.timer = setTimeout(() => {
            if (job && job.state === 'waiting') {
                job.state = 'failed';
                job.reason = '授权等待超过 2 分钟没有完成，请重新生成链接。';
                killJob();
            }
        }, AUTH_TIMEOUT_MS);
        job.timer.unref?.();
    }
    catch (e) {
        job.state = 'failed';
        job.reason = e?.message ?? String(e);
    }
    return {
        ok: true,
        url: job.url || null,
        opened: false,
        message: job.url
            ? '已生成授权链接，复制到浏览器打开后确认授权。'
            : '正在生成授权链接，稍等一会再刷新。'
    };
}
/** 从输出里捞第一条 https 链接 */
function pickAuthUrl(text) {
    const m = /https:\/\/[^\s"'<>]+/i.exec(text || '');
    return m ? m[0] : '';
}
function pickReason(text) {
    const lines = String(text || '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    const err = lines.find((l) => /error|failed|拒绝|失败/i.test(l));
    return (err || lines[lines.length - 1] || '').slice(0, 300);
}
export async function pollLogin(input) {
    const waited = job ? Date.now() - lastStartedAt : 0;
    if (job && job.state !== 'waiting') {
        return { state: job.state, url: job.url || pickAuthUrl(job.buffer), reason: job.reason, waitedMs: waited };
    }
    // 以「本地登录态」为准兜底：浏览器里授权成功后，CLI 进程可能已经退出、
    // 甚至插件重载把 job 丢了——只信 job 会让界面永远停在「等待授权中」。
    // 这一步读的是本地凭据文件，不消耗腾讯接口额度。
    if (input) {
        try {
            const s = await authStatus({ binary: input.binary, timeoutMs: input.timeoutMs });
            if (s.ok && s.data && s.data.loggedIn) {
                if (job) {
                    job.state = 'done';
                    if (job.timer)
                        clearTimeout(job.timer);
                    job.timer = null;
                }
                return { state: 'done', url: job?.url || '', reason: '', waitedMs: waited };
            }
        }
        catch {
            /* 读不到就当还没登，继续等 */
        }
    }
    if (!job)
        return { state: 'idle', url: '', reason: '', waitedMs: 0 };
    return { state: 'waiting', url: job.url || pickAuthUrl(job.buffer), reason: '', waitedMs: waited };
}
/** 用户主动放弃等待：停掉授权进程，回到可再试的状态 */
export function cancelLogin() {
    if (!job)
        return { ok: true, message: '没有在等的授权。' };
    disposeAuth();
    return { ok: true, message: '已停止等待授权，可以重新生成链接。' };
}
export function killJob() {
    const j = job;
    if (!j)
        return;
    if (j.timer)
        clearTimeout(j.timer);
    j.timer = null;
    if (j.child && !j.child.killed) {
        try {
            j.child.kill();
        }
        catch {
            /* 进程已经没了 */
        }
    }
    j.child = null;
}
export function disposeAuth() {
    killJob();
    job = null;
}
export async function logout(input) {
    if (!input.confirm) {
        return { ok: false, message: '退出登录需要在界面上点一次确认。' };
    }
    disposeAuth();
    const r = await authLogout(execOpts(input));
    if (!r.ok)
        return { ok: false, message: r.error?.message ?? '退出失败' };
    return { ok: true, message: '已退出腾讯会议账号。' };
}
/** 未登录时给界面/工具用的完整引导文本 */
export function guidanceFor(status) {
    if (status.state === 'not-installed')
        return '腾讯会议命令行组件随插件自带，正常不用装。如果这里提示缺失，说明插件包装得不完整——重新安装插件即可；仍不行再手动执行 npm i -g @tencentcloud/tmeet@1.1.0';
    if (status.state === 'version-mismatch')
        return upgradeGuidance(status.version);
    if (status.state === 'none' || status.state === 'expired')
        return loginGuidance();
    return '';
}
