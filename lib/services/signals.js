import { recordAddress, recordContent, reportParticipants, searchRecords, yuanbaoMinutes } from '../cli/commands.js';
import { readStore } from './store.js';
function opts(ctx) {
    return { binary: ctx.binary, timeoutMs: ctx.timeoutMs, signal: ctx.signal };
}
export const DEFAULT_GEN = {
    insight: 'idle',
    company: 'idle',
    investor: 'idle',
    review: 'idle',
    qa: 'idle'
};
/* ── 采集：全部来自回读，不来自事件 payload ── */
function codeOfTranscriptError(e) {
    const raw = e?.raw ?? e?.message ?? '';
    const m = /(500260|30002|500249|500282)/.exec(raw);
    return m ? m[1] : undefined;
}
/** 取录制引用（文件 id / 录制条目 id / 权限形态），两种键名都认 */
function pickRefs(records) {
    const list = Array.isArray(records) ? records : [];
    const read = (r, ...keys) => {
        for (const k of keys) {
            const v = r?.[k];
            if (v !== undefined && v !== null && v !== '')
                return String(v);
        }
        return '';
    };
    let recordFileId = '';
    let meetingRecordId = '';
    let permissionStatus = '';
    for (const raw of list) {
        const r = raw;
        if (!recordFileId)
            recordFileId = read(r, 'record_file_id', 'recordFileId');
        if (!meetingRecordId)
            meetingRecordId = read(r, 'meeting_record_id', 'meetingRecordId');
        if (!permissionStatus)
            permissionStatus = read(r, 'permission_status', 'permissionStatus');
        if (recordFileId && meetingRecordId && permissionStatus)
            break;
    }
    return { recordFileId, meetingRecordId, permissionStatus };
}
/**
 * 回读一场会议的真实内容信号。
 * 只在「事件触发 / 用户点刷新 / 打开详情页」时调用，不在面板每次渲染时调用（额度纪律）。
 */
export async function collectSignals(ctx, meetingId, options = {}) {
    const only = options.only ? new Set(options.only) : null;
    const want = (k) => !only || only.has(k);
    const signals = {};
    const refs = pickRefs(undefined);
    // 1) 录制列表（有录制 + 权限形态）
    if (want('record')) {
        const r = await searchRecords({ meetingId }, opts(ctx));
        if (r.ok) {
            const list = (r.data ?? []);
            const p = pickRefs(list);
            signals.hasRecord = list.length > 0;
            signals.meetingRecordId = p.meetingRecordId || undefined;
            signals.permissionStatus = p.permissionStatus || undefined;
            signals.minutesFlag = list.some((x) => x.has_smart_minutes === true);
            // 录制可看：record access 能取到非空地址
            if (p.meetingRecordId) {
                const addr = await recordAddress({ meetingRecordId: p.meetingRecordId }, opts(ctx));
                if (addr.ok) {
                    const first = (addr.data ?? [])[0];
                    signals.recordPlayable = Boolean(first?.view_address ?? first?.download_address ?? first?.url);
                }
            }
        }
    }
    // 2) 转写：取段落，total>0 才算就绪
    if (want('transcript')) {
        const recordFileId = refs.recordFileId || (await firstRecordFileId(ctx, meetingId));
        if (recordFileId) {
            const r = await recordContent({ action: 'transcript', recordFileId, meetingId }, opts(ctx));
            if (r.ok) {
                const paragraphs = r.data?.minutes?.paragraphs ?? r.data?.paragraph_list;
                const total = Array.isArray(paragraphs) ? paragraphs.length : Number(r.data?.total ?? 0);
                signals.transcriptTotal = Number.isFinite(total) ? total : 0;
                signals.transcriptBodyReady = signals.transcriptTotal > 0;
            }
            else {
                // 500260 / 30002 是「还没转完」，不是失败
                const code = codeOfTranscriptError(r.error);
                if (code === '500260' || code === '30002') {
                    signals.transcriptErrorCode = code;
                }
                else {
                    signals.transcriptQueryFailed = true;
                }
            }
        }
    }
    // 3) 时间轴：数组非空才算就绪
    if (want('timeline')) {
        const recordFileId = refs.recordFileId || (await firstRecordFileId(ctx, meetingId));
        if (recordFileId) {
            const r = await recordContent({ action: 'timeline', recordFileId }, opts(ctx));
            if (r.ok) {
                const tl = r.data?.timeline;
                signals.timelineLength = Array.isArray(tl) ? tl.length : 0;
            }
        }
    }
    // 4) 纪要：独立信号，不许拿转写冒充
    if (want('minutes')) {
        const viaMinutes = await yuanbaoMinutes({ meetingId }, opts(ctx));
        if (viaMinutes.ok && viaMinutes.data) {
            const arr = viaMinutes.data?.minutes;
            if (Array.isArray(arr) && arr.length) {
                const text = arr.map((m) => String(m?.summary_points ?? m?.overview ?? '')).join('');
                signals.minutesLength = text.length;
            }
        }
        else {
            const recordFileId = refs.recordFileId || (await firstRecordFileId(ctx, meetingId));
            if (recordFileId) {
                const r = await recordContent({ action: 'minutes', recordFileId, meetingId }, opts(ctx));
                if (r.ok)
                    signals.minutesLength = JSON.stringify(r.data ?? '').length;
            }
        }
    }
    // 5) 参会人可见性
    if (want('participants')) {
        const r = await reportParticipants({ meetingId, limit: 100 }, opts(ctx));
        signals.participantsVisible = r.ok;
    }
    // 6) 会前设置（meeting get 的 settings）
    if (want('settings')) {
        const r = await searchRecords({ meetingId }, opts(ctx));
        void r;
        // settings 由调用方从 meeting get 注入；这里不重复打
    }
    return { ok: true, data: signals };
}
async function firstRecordFileId(ctx, meetingId) {
    const r = await searchRecords({ meetingId }, opts(ctx));
    if (!r.ok)
        return '';
    const list = (r.data ?? []);
    const p = pickRefs(list);
    return p.recordFileId;
}
/* ── 派生（与 superIR 同构） ── */
export function deriveContentStates(s) {
    const hasRecord = s.hasRecord === true ||
        s.recordPlayable === true ||
        (s.transcriptTotal ?? 0) > 0 ||
        (s.timelineLength ?? 0) > 0 ||
        (s.minutesLength ?? 0) > 0;
    const noCloudRecord = !hasRecord && s.autoRecordType !== 'cloud';
    let replay;
    if (s.permission === 'denied')
        replay = 'denied';
    else if (s.permission === 'approving')
        replay = 'approving';
    else if (s.permission === 'rejected')
        replay = 'rejected';
    else if (noCloudRecord)
        replay = 'none';
    else
        replay = s.recordPlayable ? 'ready' : 'waiting';
    let transcript;
    if (replay === 'denied' || replay === 'approving' || replay === 'rejected')
        transcript = 'denied';
    else if ((s.transcriptTotal ?? 0) > 0)
        transcript = 'ready';
    // 有录制就还有转写可取（用户可能在会中手动开了转写，会前设置不代表事实）。
    // 只有「确定没有云录制」才判 none，否则一律给 waiting，让人能点进去试。
    else if (noCloudRecord)
        transcript = 'none';
    else
        transcript = 'waiting';
    const minutes = (s.minutesLength ?? 0) > 0 || s.minutesFlag === true ? 'ready' : 'waiting';
    const timeline = (s.timelineLength ?? 0) > 0 ? 'ready' : 'waiting';
    const transcriptNotReadyReason = transcript === 'denied'
        ? '对方还没授权，转写取不到'
        : transcript === 'none'
            ? '这场会没有可取的转写'
            : s.transcriptQueryFailed
                ? '转写取数没成功，点「刷新」重试'
                : '转写还没取到，好了自动解锁';
    return {
        replay,
        transcript,
        minutes,
        timeline,
        meetingRecordId: s.meetingRecordId,
        permissionStatus: s.permissionStatus,
        gen: { ...DEFAULT_GEN, ...(s.gen ?? {}) },
        tabs: {
            // 只在「确定要授权」时禁用。其它情况一律可点：
            // 之前是「必须有正文才给点」，而正文只有点进去才取——死锁，逐字稿页签永远灰着（实测 bug）。
            transcriptDisabled: transcript === 'denied',
            minutesDisabled: false,
            qaDisabled: true
        },
        tabReasons: {
            transcript: transcript === 'denied'
                ? transcriptNotReadyReason
                : transcript === 'ready' && s.transcriptBodyReady !== true
                    ? '正文这一版还没接通，点进去会自动取一次'
                    : '',
            minutes: '',
            qa: '问答清单需要逐字稿，逐字稿就绪后自动解锁'
        },
        disabledReason: transcript === 'ready' ? '' : transcriptNotReadyReason,
        blocker: buildBlocker(replay, s.participantsVisible !== false)
    };
}
function buildBlocker(replay, participantsVisible) {
    if (!participantsVisible) {
        return {
            text: '这场会由对方组织，参会名单要对方授权后才看得到',
            action: '去「逐字稿」页签提交查看申请',
            pane: 'transcript'
        };
    }
    switch (replay) {
        case 'denied':
            return {
                text: '这场会的录制由对方发起，还没授权给你',
                action: '去「逐字稿」页签提交查看申请',
                pane: 'transcript'
            };
        case 'approving':
            return {
                text: '查看申请已提交，等对方处理',
                action: '去「逐字稿」页签看审批进度',
                pane: 'transcript'
            };
        case 'rejected':
            return {
                text: '对方没通过这次的查看申请',
                action: '去「逐字稿」页签重新提交',
                pane: 'transcript'
            };
        case 'none':
            return { text: '这场会没有开启云录制', action: '会前没开，会后补不了' };
        default:
            return null;
    }
}
/** 徽标颜色语义：橙=等待、蓝=可用、红=失败、灰=终态无内容 */
export function replayBadge(state, longWait = false) {
    switch (state) {
        case 'ready':
            return { text: '内容齐全', tone: 'on' };
        case 'waiting':
            return { text: longWait ? '等待较久' : '转码中', tone: 'warn' };
        case 'denied':
            return { text: '需授权', tone: 'term' };
        case 'approving':
            return { text: '审批中', tone: 'warn' };
        case 'rejected':
            return { text: '未通过', tone: 'term' };
        case 'none':
            return { text: '无回放', tone: 'term' };
    }
}
/** 事件只当触发器：把事件 key 映射到「该回读什么」 */
export function eventToRefetch(eventKey) {
    switch (eventKey) {
        case 'meeting.started':
            return { record: false, transcript: false, timeline: false, participants: false, minutes: false };
        case 'meeting.end':
        case 'meeting.canceled':
            return { record: true, transcript: true, timeline: true, participants: true, minutes: true };
        case 'recording.completed':
            return { record: true, transcript: false, timeline: false, participants: false, minutes: false };
        case 'smart.transcripts':
            return { record: false, transcript: true, timeline: true, participants: false, minutes: false };
        case 'smart.minutes':
            return { record: false, transcript: false, timeline: true, participants: false, minutes: true };
        default:
            return { record: false, transcript: false, timeline: false, participants: false, minutes: false };
    }
}
/** 就绪态单调化：只允许 waiting → ready，禁止 ready 回退成 waiting */
export function enforceMonotonic(prev, next) {
    if (!prev)
        return next;
    const keep = (a, b) => a === 'ready' && b === 'waiting';
    return {
        ...next,
        replay: keep(prev.replay, next.replay) ? prev.replay : next.replay,
        transcript: keep(prev.transcript, next.transcript) ? prev.transcript : next.transcript,
        minutes: keep(prev.minutes, next.minutes) ? prev.minutes : next.minutes,
        timeline: keep(prev.timeline, next.timeline) ? prev.timeline : next.timeline
    };
}
/** 本地信号：打开详情页即派生，0 次 CLI 调用 */
export function localContentSignals(input) {
    const nonEmpty = (kind) => {
        const v = input.content[kind];
        return Boolean(v && !v.empty);
    };
    const hasRecord = Array.isArray(input.records) && input.records.length > 0;
    const knownType = input.autoRecordType === 'none' ||
        input.autoRecordType === 'local' ||
        input.autoRecordType === 'cloud';
    return {
        hasRecord,
        autoRecordType: knownType ? input.autoRecordType : input.ended === false ? 'cloud' : undefined,
        autoAsr: input.autoAsr,
        transcriptTotal: nonEmpty('transcript') ? 1 : 0,
        transcriptBodyReady: nonEmpty('transcript'),
        timelineLength: nonEmpty('timeline') ? 1 : 0,
        minutesLength: nonEmpty('minutes') ? 1 : 0
    };
}
/** 供事件服务使用：把 store 里的本机就绪标记并入信号 */
export function mergeLocalReady(signals, meetingId) {
    const ready = readStore();
    if (ready.transcriptReady.includes(meetingId)) {
        signals.transcriptTotal = Math.max(signals.transcriptTotal ?? 0, 1);
        signals.transcriptBodyReady = true;
    }
    if (ready.contentIndex[`${meetingId}:timeline`]) {
        signals.timelineLength = Math.max(signals.timelineLength ?? 0, 1);
    }
    if (ready.contentIndex[`${meetingId}:minutes`]) {
        signals.minutesLength = Math.max(signals.minutesLength ?? 0, 1);
    }
    return signals;
}
