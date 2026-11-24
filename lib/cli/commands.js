/**
 * tmeet 子命令的参数拼装。
 * 原则：所有「可能被企业策略覆盖」的写参数都在这里显式给出，绝不留空交给 CLI 默认值。
 * 参数名一律以 `tmeet <group> <cmd> --help` 实测为准。
 */
import { clampWindow, isoLocal, runJson, runRaw } from './exec.js';
/**
 * auth status 的特殊处理：未登录时是纯文本 + 退出码 0，且没有 JSON 信封。
 * 因此这里直接用 runRaw 读文本，不按 JSON 解析。
 */
export async function authStatus(opts = {}) {
    const res = await runRaw(['auth', 'status'], opts);
    const text = `${res.stdout}\n${res.stderr}`.trim();
    if (!res.ok && !text)
        return { ok: false, error: res.error };
    const loggedIn = /logged in/i.test(text) && !/not logged in/i.test(text);
    if (!loggedIn) {
        return {
            ok: true,
            data: { loggedIn: false, account: '', openId: '', accessRemainingMs: null, refreshRemainingMs: null, raw: text }
        };
    }
    const openId = /OpenId:\s*(\S+)/i.exec(text)?.[1] ?? '';
    const account = /UserName:\s*(.+)/i.exec(text)?.[1]?.trim() ?? '';
    return {
        ok: true,
        data: {
            loggedIn: true,
            account,
            openId,
            accessRemainingMs: parseRemaining(/AccessToken:[^\n]*remaining\s+(\S+)/i.exec(text)?.[1]),
            refreshRemainingMs: parseRemaining(/RefreshToken:[^\n]*remaining\s+(\S+)/i.exec(text)?.[1]),
            raw: text
        }
    };
}
/** 把 "32m" / "29d 18h 32m" / "1h" 解析成毫秒 */
function parseRemaining(s) {
    if (!s)
        return null;
    let ms = 0;
    let hit = false;
    const re = /(\d+)\s*(d|h|m|s)/gi;
    let m;
    while ((m = re.exec(s))) {
        hit = true;
        const n = Number(m[1]);
        const unit = m[2].toLowerCase();
        ms += n * (unit === 'd' ? 864e5 : unit === 'h' ? 36e5 : unit === 'm' ? 6e4 : 1000);
    }
    return hit ? ms : null;
}
export async function authLogout(opts = {}) {
    // 注意：`auth logout` 成功时不输出任何内容（实测），走 runJson 会因「没解析到 JSON」
    // 被误判成失败，界面上就是「请求失败（HTTP 400）」。这里只看退出码。
    const r = await runRaw(['auth', 'logout'], opts);
    if (r.ok)
        return { ok: true, data: null };
    return { ok: false, error: r.error };
}
function pageOf(data) {
    if (!data)
        return { items: [], next: '' };
    // 不同命令的分页字段名不完全一致，全部兼容
    const items = (Array.isArray(data) ? data : undefined) ??
        data.meeting_info_list ??
        data.meetings ?? // 搜索接口实测把结果放在 meetings 字段里
        data.meeting_list ??
        data.list ??
        data.items ??
        data.records ??
        [];
    const next = data.next_page_token ??
        data.next_page?.page_token ??
        data.page_token ??
        data.next_token ??
        '';
    return { items: Array.isArray(items) ? items : [], next: String(next || '') };
}
export async function listUpcoming(args, opts = {}) {
    const now = new Date();
    const days = Math.min(31, Math.max(1, Number(args.days) || 7));
    const from = new Date(now.getTime() - 864e5);
    const to = new Date(now.getTime() + days * 864e5);
    const window = clampWindow(isoLocal(from), isoLocal(to));
    const argv = [
        'meeting',
        'list',
        '--start',
        window.start,
        '--end',
        window.end,
        '--page-size',
        String(Math.min(20, Math.max(1, Number(args.limit) || 20)))
    ];
    if (args.cursor)
        argv.push('--page-token', String(args.cursor));
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const p = pageOf(r.data);
    return { ok: true, data: p.items, nextCursor: p.next || undefined };
}
export async function listEnded(args, opts = {}) {
    const argv = ['meeting', 'list-ended', '--page-size', String(Math.min(30, Math.max(1, Number(args.limit) || 30)))];
    if (args.start && args.end) {
        const w = clampWindow(args.start, args.end);
        argv.push('--start', w.start, '--end', w.end);
    }
    if (args.cursor)
        argv.push('--page-token', String(args.cursor));
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const p = pageOf(r.data);
    return { ok: true, data: p.items, nextCursor: p.next || undefined };
}
export async function searchMeetings(args, opts = {}) {
    const argv = ['meeting', 'search', '--query', args.query, '--page-size', String(Math.min(30, Math.max(1, Number(args.limit) || 30)))];
    if (args.start && args.end) {
        const w = clampWindow(args.start, args.end);
        argv.push('--start', w.start, '--end', w.end);
    }
    if (args.cursor)
        argv.push('--page-token', String(args.cursor));
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const p = pageOf(r.data);
    return { ok: true, data: p.items, nextCursor: p.next || undefined };
}
export async function getMeeting(args, opts = {}) {
    const argv = ['meeting', 'get'];
    if (args.meetingId)
        argv.push('--meeting-id', String(args.meetingId));
    else if (args.meetingCode)
        argv.push('--meeting-code', String(args.meetingCode));
    else
        return { ok: false, error: { code: 'invalid-args', message: '要传会议 ID 或会议号。' } };
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    // 实测形态：{ meeting_info_list: [ {...} ] }；少数版本是 { meeting_info: {...} }
    const data = Array.isArray(r.data?.meeting_info_list)
        ? r.data.meeting_info_list[0]
        : r.data?.meeting_info ?? r.data;
    return { ok: true, data: (data ?? {}) };
}
export async function createMeeting(input, opts = {}) {
    const argv = [
        'meeting',
        'create',
        '--subject',
        input.subject,
        '--start',
        input.start,
        '--end',
        input.end,
        '--auto-record-type',
        input.autoRecordType,
        '--timezone',
        input.timezone || 'Asia/Shanghai'
    ];
    // --auto-asr 是布尔开关：只在需要时出现，显式写 false 会被 CLI 当成未知参数
    if (input.autoAsr)
        argv.push('--auto-asr');
    if (input.waitingRoom)
        argv.push('--waiting-room');
    if (input.password)
        argv.push('--password', input.password);
    if (input.joinType)
        argv.push('--join-type', String(input.joinType));
    if (input.meetingType)
        argv.push('--meeting-type', String(input.meetingType));
    if (input.inviteeOpenIds?.length)
        argv.push('--invitees', input.inviteeOpenIds.slice(0, 100).join(','));
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const data = r.data?.meeting_info ? r.data.meeting_info : r.data;
    return { ok: true, data: (data ?? {}) };
}
export async function updateMeeting(input, opts = {}) {
    const argv = ['meeting', 'update', '--meeting-id', input.meetingId];
    if (input.subMeetingId)
        argv.push('--sub-meeting-id', input.subMeetingId);
    if (input.subject)
        argv.push('--subject', input.subject);
    if (input.start)
        argv.push('--start', input.start);
    if (input.end)
        argv.push('--end', input.end);
    if (input.autoRecordType)
        argv.push('--auto-record-type', input.autoRecordType);
    if (input.autoAsr !== undefined) {
        // 更新的 --auto-asr 是开关型；要关掉时 CLI 没有否定形式，只能靠回读提示用户
        if (input.autoAsr)
            argv.push('--auto-asr');
    }
    if (input.waitingRoom)
        argv.push('--waiting-room');
    if (input.password)
        argv.push('--password', input.password);
    if (input.joinType)
        argv.push('--join-type', String(input.joinType));
    if (input.timezone)
        argv.push('--timezone', input.timezone);
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const data = r.data?.meeting_info ? r.data.meeting_info : r.data;
    return { ok: true, data: (data ?? {}) };
}
export async function cancelMeeting(args, opts = {}) {
    const argv = ['meeting', 'cancel', '--meeting-id', args.meetingId];
    if (args.meetingType !== undefined)
        argv.push('--meeting-type', String(args.meetingType));
    if (args.subMeetingId)
        argv.push('--sub-meeting-id', args.subMeetingId);
    const r = await runJson(argv, opts);
    return r.ok ? { ok: true, data: null } : { ok: false, error: r.error };
}
/* ── 受邀人 ── */
export async function listInvitees(args, opts = {}) {
    const argv = ['meeting', 'invitees-list', '--meeting-id', args.meetingId, '--page-size', '30'];
    if (args.cursor)
        argv.push('--page-token', args.cursor);
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const p = pageOf(r.data);
    const list = p.items.map((it) => ({
        openId: String(it?.open_id ?? it?.openId ?? ''),
        nickname: it?.nickname ? String(it.nickname) : undefined
    })).filter((x) => x.openId);
    return { ok: true, data: list, nextCursor: p.next || undefined };
}
export async function mutateInvitees(args, opts = {}) {
    const cmd = args.action === 'add' ? 'invitees-add' : args.action === 'remove' ? 'invitees-remove' : 'invitees-replace';
    const argv = ['meeting', cmd, '--meeting-id', args.meetingId, '--invitees', args.openIds.slice(0, 100).join(',')];
    const r = await runJson(argv, opts);
    return r.ok ? { ok: true, data: null } : { ok: false, error: r.error };
}
/* ── 录制与内容 ── */
export async function searchRecords(args, opts = {}) {
    const argv = ['record', 'search', '--page-size', '30'];
    if (args.meetingId)
        argv.push('--meeting-id', args.meetingId);
    if (args.meetingCode)
        argv.push('--meeting-code', args.meetingCode);
    if (args.start && args.end) {
        const w = clampWindow(args.start, args.end);
        argv.push('--start', w.start, '--end', w.end);
    }
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const p = pageOf(r.data);
    return { ok: true, data: p.items };
}
export async function recordAddress(args, opts = {}) {
    const r = await runJson(['record', 'access', '--action', 'address', '--meeting-record-id', args.meetingRecordId, '--page-size', '30'], opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const p = pageOf(r.data);
    return { ok: true, data: p.items };
}
/**
 * 各 action 支持的参数不同，传错会被 CLI 直接拒
 * （实测：`--meeting-id is not supported by --action timeline`）。
 * 所以 --meeting-id 只在 transcript / paragraphs 这两种形态上带。
 */
export async function recordContent(args, opts = {}) {
    const argv = ['record', 'content', '--action', args.action, '--record-file-id', args.recordFileId];
    const acceptsMeetingId = args.action === 'transcript' || args.action === 'paragraphs';
    if (args.meetingId && acceptsMeetingId)
        argv.push('--meeting-id', args.meetingId);
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    return { ok: true, data: r.data };
}
export async function permissionApply(args, opts = {}) {
    const argv = [
        'record',
        'permission-apply',
        '--action',
        args.commit ? 'commit' : 'prepare',
        '--meeting-record-id',
        args.meetingRecordId
    ];
    if (args.meetingId)
        argv.push('--meeting-id', args.meetingId);
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    return { ok: true, data: r.data };
}
export async function yuanbaoMinutes(args, opts = {}) {
    const argv = ['minutes', 'get', '--meeting-id', args.meetingId];
    if (args.subMeetingId)
        argv.push('--sub-meeting-id', args.subMeetingId);
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    return { ok: true, data: r.data };
}
/* ── 参会人 ── */
export async function reportParticipants(args, opts = {}) {
    const argv = [
        'report',
        'participants',
        '--meeting-id',
        args.meetingId,
        '--page-size',
        String(Math.min(100, Math.max(1, Number(args.limit) || 100)))
    ];
    if (args.subMeetingId)
        argv.push('--sub-meeting-id', args.subMeetingId);
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const p = pageOf(r.data);
    return { ok: true, data: p.items, nextCursor: p.next || undefined };
}
/* ── 通讯录（只用于「邮箱/手机 → open_id」这一跳） ── */
export async function lookupContact(args, opts = {}) {
    const argv = ['contact', args.email ? 'lookup-by-email' : 'lookup-by-phone'];
    argv.push(args.email ? '--email' : '--phone', String(args.email || args.phone));
    const r = await runJson(argv, opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const p = pageOf(r.data);
    return {
        ok: true,
        data: p.items
            .map((it) => ({ openId: String(it?.open_id ?? ''), nickname: it?.nickname ? String(it.nickname) : undefined }))
            .filter((x) => x.openId)
    };
}
/* ── 事件 ── */
export async function eventList(opts = {}) {
    const r = await runJson(['event', 'list'], opts);
    if (!r.ok)
        return { ok: false, error: r.error };
    const list = Array.isArray(r.data) ? r.data : [];
    return { ok: true, data: list.map((x) => ({ key: String(x?.key ?? ''), domain: String(x?.domain ?? ''), description: String(x?.description ?? '') })) };
}
export async function eventStatus(opts = {}) {
    const r = await runJson(['event', 'status'], opts);
    return r.ok ? { ok: true, data: r.data } : { ok: false, error: r.error };
}
/* ── 会中控制 ── */
export async function controlMembers(args, opts = {}) {
    const argv = ['control', args.action, '--meeting-id', args.meetingId, '--members', args.openIds.join(',')];
    const r = await runJson(argv, opts);
    return r.ok ? { ok: true, data: null } : { ok: false, error: r.error };
}
