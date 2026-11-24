/**
 * 腾讯会议实时事件消费（移植 superIR `tmeetEventService.ts` 的设计约束）。
 *
 * 三条约束全部来自 superIR 的实测，不是偏好：
 *  1. 事件只当触发器：收到事件后一律回读真实状态再广播。payload 含 open_id 等个人标识，
 *     既不拿它更新状态，也不把它转发给浏览器（隐私）。
 *  2. consume 退出不等于 bus 退出（实测 bus 仍 running），回收必须显式 `event stop`。
 *  3. 就绪态单调：晚到或乱序的事件不得把已就绪改回等待。
 */
import { execFileSync } from 'node:child_process';
import { spawnTmeet } from '../cli/locate.js';
import { locateBinary } from '../cli/locate.js';
import { collectSignals, deriveContentStates, enforceMonotonic, eventToRefetch, mergeLocalReady } from './signals.js';
import { writeStore } from './store.js';
import { clearContentCache, content as fetchContent } from './records.js';
/** 本期订阅的事件；meeting.created/updated 不订阅，本地已知道 */
export const SUBSCRIBED_EVENTS = [
    'meeting.started',
    'meeting.end',
    'recording.completed',
    'smart.transcripts',
    'smart.minutes'
];
const MAX_CONSECUTIVE_FAILURES = 3;
const BACKOFF_MS = [1_000, 5_000, 30_000];
let consumers = new Map();
let consecutiveFailures = 0;
let degraded = false;
let started = false;
/** 广播订阅者（SSE 连接） */
const listeners = new Set();
/** 每场会议的上次状态，用于单调化 */
const lastStates = new Map();
/** 每场会议同一录制文件只通知一次 */
const notified = new Set();
/** 每场会议串行回读，避免并发互相覆盖 */
const queues = new Map();
export function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}
export function listenerCount() {
    return listeners.size;
}
function emit(e) {
    for (const fn of listeners) {
        try {
            fn(e);
        }
        catch {
            /* 单个订阅者失败不影响其他人 */
        }
    }
}
export function isDegraded() {
    return degraded;
}
export function eventStatus() {
    return {
        running: started,
        consumers: consumers.size,
        degraded,
        failures: consecutiveFailures
    };
}
/** 从事件 payload 里只取 meeting_id，其余字段一律不读 */
export function extractMeetingId(payload) {
    const p = payload;
    const id = p?.payload?.[0]?.meeting_info?.meeting_id;
    return typeof id === 'string' && id ? id : null;
}
/** 启动订阅。bus 由第一个 consume 拉起，后续 key 复用同一条连接。 */
export function startEventConsumers(deps) {
    if (started)
        return;
    started = true;
    degraded = false;
    consecutiveFailures = 0;
    // 上一轮宿主进程被强杀时，它派生的 consume 会变成孤儿一直挂着（实测）：
    // 不清掉就会有两套消费者同时回读，既重复广播也白烧额度。
    killOrphanConsumers();
    for (const key of SUBSCRIBED_EVENTS)
        spawnConsumer(key, deps);
}
/**
 * 清掉「父进程已经不在了」的 consume 进程。
 * 只杀 parent 不是当前进程的那种——不会误伤别的正在运行的 DSH 实例。
 */
function killOrphanConsumers() {
    if (process.platform !== 'win32')
        return;
    try {
        const ps = [
            'Get-CimInstance Win32_Process -Filter "Name like \'tmeet%\'" |',
            "  Where-Object { $_.CommandLine -and $_.CommandLine -match 'event\\s+consume' } |",
            `  Where-Object { $_.ParentProcessId -ne ${process.pid} } |`,
            '  ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop; $_.ProcessId } catch {} }'
        ].join(' ');
        execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], {
            encoding: 'utf8',
            timeout: 8000,
            windowsHide: true
        });
    }
    catch {
        /* 清不掉不影响启动 */
    }
}
function spawnConsumer(key, deps) {
    if (!started)
        return;
    const { binary } = locateBinary(deps.ctx.binary);
    if (!binary) {
        consecutiveFailures += 1;
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            degraded = true;
            emit({ meetingId: '', eventKey: key, at: new Date().toISOString(), degraded: true });
        }
        return;
    }
    const child = spawnTmeet(binary, ['event', 'consume', '--event-id', key, '--quiet', '--format', 'json'], { stdio: 'pipe' });
    const consumer = { key, child, buffer: '', ready: false };
    consumers.set(key, consumer);
    const onData = (chunk) => {
        consumer.buffer += chunk.toString('utf8');
        // stderr 的 ready 标记走另一条流；stdout 是 NDJSON 事件
        let idx = consumer.buffer.indexOf('\n');
        while (idx >= 0) {
            const line = consumer.buffer.slice(0, idx).trim();
            consumer.buffer = consumer.buffer.slice(idx + 1);
            if (line)
                handleLine(line, deps);
            idx = consumer.buffer.indexOf('\n');
        }
    };
    child.stdout?.on('data', onData);
    child.stderr?.on('data', (chunk) => {
        const text = chunk.toString('utf8');
        if (/\[event\] ready/.test(text))
            consumer.ready = true;
    });
    child.on('error', () => markFailure(key, deps));
    child.on('exit', () => {
        consumers.delete(key);
        markFailure(key, deps);
    });
}
function markFailure(key, deps) {
    consecutiveFailures += 1;
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        // 不静默：降级为手动刷新，界面要给出可见提示
        degraded = true;
        emit({ meetingId: '', eventKey: key, at: new Date().toISOString(), degraded: true });
        return;
    }
    const delay = BACKOFF_MS[Math.min(consecutiveFailures - 1, BACKOFF_MS.length - 1)];
    setTimeout(() => spawnConsumer(key, deps), delay).unref?.();
}
async function handleLine(line, deps) {
    let parsed;
    try {
        parsed = JSON.parse(line);
    }
    catch {
        return;
    }
    const eventKey = String(parsed?.event ?? '');
    const meetingId = extractMeetingId(parsed);
    if (!meetingId || !eventKey)
        return;
    consecutiveFailures = 0;
    // 同一会议串行回读
    const prev = queues.get(meetingId) ?? Promise.resolve();
    const task = prev.then(() => handleEvent(meetingId, eventKey, deps)).catch(() => undefined);
    queues.set(meetingId, task);
    await task;
}
async function handleEvent(meetingId, eventKey, deps) {
    const want = eventToRefetch(eventKey);
    const nothing = !want.record && !want.transcript && !want.timeline && !want.participants && !want.minutes;
    if (nothing) {
        emit({ meetingId, eventKey, at: new Date().toISOString(), degraded });
        return;
    }
    const only = [];
    if (want.record)
        only.push('record');
    if (want.transcript)
        only.push('transcript');
    if (want.timeline)
        only.push('timeline');
    if (want.minutes)
        only.push('minutes');
    if (want.participants)
        only.push('participants');
    const collected = deps.collect ?? ((c, id, o) => collectSignals(c, id, { only: o }));
    const r = await collected(deps.ctx, meetingId, only);
    if (!r.ok || !r.data) {
        emit({ meetingId, eventKey, at: new Date().toISOString(), degraded });
        return;
    }
    const signals = mergeLocalReady(r.data, meetingId);
    const next = enforceMonotonic(lastStates.get(meetingId), deriveContentStates(signals));
    lastStates.set(meetingId, next);
    // 正文会因这次事件而变化（重转写/新纪要）→ 三层缓存全部作废，后台重新取一份落盘。
    // 这样用户下次点开看到的仍是"直接就有"，而不是"进来才重取"。
    if (want.transcript || want.minutes || want.record) {
        clearContentCache(meetingId);
        void (async () => {
            for (const kind of ['transcript', 'minutes']) {
                try {
                    const r = await fetchContent(deps.ctx, { meetingId, kind });
                    if (!r.ok && r.error?.code === 'local-quota')
                        return;
                }
                catch {
                    return;
                }
            }
        })();
    }
    // 本机就绪标记落盘（列表徽标与筛选共用）
    if (next.transcript === 'ready') {
        writeStore((d) => {
            const set = new Set(d.transcriptReady);
            set.add(meetingId);
            d.transcriptReady = Array.from(set);
        });
    }
    writeStore((d) => {
        if (next.timeline === 'ready')
            d.contentIndex[`${meetingId}:timeline`] = new Date().toISOString();
        if (next.minutes === 'ready')
            d.contentIndex[`${meetingId}:minutes`] = new Date().toISOString();
    });
    // 转写就绪 → 通知（必须回读确认，不能只信事件）
    let notifiedNow = false;
    if (next.transcript === 'ready' && signals.meetingRecordId) {
        const key = `${meetingId}:${signals.meetingRecordId}`;
        if (!notified.has(key) && (signals.transcriptTotal ?? 0) > 0) {
            notified.add(key);
            if (deps.notify?.({ meetingId, recordFileId: signals.meetingRecordId ?? '' }))
                notifiedNow = true;
        }
    }
    emit({
        meetingId,
        eventKey,
        at: new Date().toISOString(),
        states: next,
        degraded
    });
    void notifiedNow;
}
/** 停止全部订阅并回收 bus。插件卸载必须走这里。 */
export async function stopEventConsumers() {
    started = false;
    for (const c of consumers.values()) {
        if (c.child && !c.child.killed) {
            try {
                c.child.kill();
            }
            catch {
                /* 已经没了 */
            }
        }
    }
    consumers.clear();
    // consume 进程被杀不代表 bus 结束（实测），必须显式 stop
    const { binary } = locateBinary('');
    if (binary) {
        try {
            const p = spawnTmeet(binary, ['event', 'stop'], { stdio: 'ignore' });
            p.unref?.();
        }
        catch {
            /* bus 可能本来就没起 */
        }
    }
    lastStates.clear();
    notified.clear();
    queues.clear();
}
/** 手动触发一次回读（用户点「刷新状态」），复用同一套派生与广播 */
export async function refreshMeeting(deps, meetingId) {
    const r = await collectSignals(deps.ctx, meetingId);
    if (!r.ok || !r.data)
        return null;
    const next = enforceMonotonic(lastStates.get(meetingId), deriveContentStates(mergeLocalReady(r.data, meetingId)));
    lastStates.set(meetingId, next);
    emit({ meetingId, eventKey: 'manual.refresh', at: new Date().toISOString(), states: next, degraded });
    return next;
}
/** 供测试断言 */
export function eventRuntimeSnapshot() {
    return { consumers: consumers.size, listeners: listeners.size, degraded };
}
/** 广播一条本地事件（例如建会成功后让列表立刻刷新） */
export function emitLocal(meetingId, eventKey = 'meeting.created') {
    emit({ meetingId, eventKey, at: new Date().toISOString(), degraded });
}
