import { reportParticipants } from '../cli/commands.js';
import { readStore, writeStore } from './store.js';
function opts(ctx) {
    return { binary: ctx.binary, timeoutMs: ctx.timeoutMs, signal: ctx.signal };
}
function localKey(meetingId) {
    return `people:${meetingId}`;
}
/** 读名单：腾讯侧失败不报错，降级成「只有本地补充」并给一句提示 */
export async function listParticipants(ctx, args) {
    const store = readStore();
    const local = store.localParticipants[localKey(args.meetingId)] ?? [];
    const r = await reportParticipants({ meetingId: args.meetingId, subMeetingId: args.subMeetingId, limit: 100 }, opts(ctx));
    const rows = [];
    if (r.ok) {
        for (const raw of r.data ?? []) {
            const openId = String(raw?.open_id ?? raw?.openId ?? '');
            const nickname = String(raw?.nickname ?? raw?.user_name ?? '').trim();
            if (!nickname && !openId)
                continue;
            rows.push({
                key: openId ? `tmeet:${openId}` : `tmeet:${nickname}`,
                openId: openId || undefined,
                nickname: nickname || '腾讯用户',
                joinTime: raw?.join_time ? String(raw.join_time) : undefined,
                leftTime: raw?.left_time ? String(raw.left_time) : undefined,
                fromLocal: false,
                source: 'tencent'
            });
        }
    }
    const seen = new Set(rows.map((r0) => r0.nickname.trim()));
    for (const name of local) {
        const n = name.trim();
        if (!n || seen.has(n))
            continue;
        seen.add(n);
        rows.push({ key: `local:${n}`, nickname: n, fromLocal: true, source: 'manual' });
    }
    // 文案纪律：不要在句子里套括号再套句号（「（……。），下面是」读起来像机翻）。
    // 原因单独成句，兜底名单单独成句。
    const reason = (r.error?.message ?? '未知原因').replace(/[。.]$/, '');
    const warning = r.ok
        ? undefined
        : r.error?.code === 'permission'
            ? '这场会由对方组织，腾讯侧名单要对方授权后才看得到。下面列出的是本机自己存的名单。'
            : `腾讯侧名单这次没取到：${reason}。下面列出的是本机自己存的名单。`;
    return { ok: true, rows, warning };
}
/** 本机名单增删/覆盖（写本地，不碰腾讯） */
export function mutateLocal(args) {
    const key = localKey(args.meetingId);
    const names = (args.names ?? []).map((n) => String(n).trim()).filter(Boolean);
    if (!names.length)
        return { ok: false, rows: [], error: '要传至少一个名字。' };
    writeStore((d) => {
        const cur = new Set(d.localParticipants[key] ?? []);
        if (args.action === 'replace') {
            d.localParticipants[key] = names;
            return;
        }
        for (const n of names) {
            if (args.action === 'add')
                cur.add(n);
            else
                cur.delete(n);
        }
        d.localParticipants[key] = Array.from(cur);
    });
    const store = readStore();
    return {
        ok: true,
        rows: (store.localParticipants[key] ?? []).map((n) => ({
            key: `local:${n}`,
            nickname: n,
            fromLocal: true,
            source: 'manual'
        }))
    };
}
/**
 * AI 认人：把「名单里的人」和「逐字稿里的说话人」对上，并概括每个人在这场会的观点。
 * 没有模型能力时返回空结果，界面上的按钮会说明原因（不静默失败）。
 */
export async function recognizeParticipants(ctx, args) {
    const base = await listParticipants(ctx, { meetingId: args.meetingId });
    if (!ctx.recognize || !ctx.readTranscript) {
        return { ok: false, rows: base.rows, added: 0, matched: 0, message: '当前没有可用的模型配置，认人功能暂不可用。' };
    }
    const transcript = await ctx.readTranscript(args.meetingId);
    if (!transcript || transcript.trim().length < 40) {
        return { ok: false, rows: base.rows, added: 0, matched: 0, message: '这场会还没有逐字稿，认不出说话人。' };
    }
    const known = base.rows.map((r) => r.nickname);
    let found = [];
    try {
        found = await ctx.recognize(transcript, known);
    }
    catch (e) {
        return { ok: false, rows: base.rows, added: 0, matched: 0, message: `认人失败：${e?.message ?? String(e)}` };
    }
    const rows = base.rows.map((r) => {
        const hit = found.find((f) => f.name && r.nickname.includes(f.name.slice(0, 4)));
        return hit ? { ...r, view: hit.view } : r;
    });
    const existing = new Set(rows.map((r) => r.nickname.trim()));
    let added = 0;
    for (const f of found) {
        const name = String(f.name || '').trim();
        if (!name || existing.has(name))
            continue;
        existing.add(name);
        rows.push({ key: `ai:${name}`, nickname: name, fromLocal: true, source: 'ai', view: f.view });
        added += 1;
    }
    const matched = rows.filter((r) => r.view).length;
    return { ok: true, rows, added, matched };
}
