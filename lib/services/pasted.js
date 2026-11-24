import { readStore, writeStore } from './store.js';
export const PASTED_KINDS = ['transcript', 'minutes', 'todos'];
export function pastedKey(meetingId, kind) {
    return `${meetingId}:${kind}`;
}
export function getPasted(meetingId, kind) {
    const store = readStore();
    const hit = store.pastedMaterials[pastedKey(meetingId, kind)];
    return hit && hit.text ? hit : null;
}
/** 只列元信息（不含正文），用于界面显示「已粘贴 xx 字」 */
export function listPasted(meetingId) {
    const store = readStore();
    const out = [];
    for (const kind of PASTED_KINDS) {
        const hit = store.pastedMaterials[pastedKey(meetingId, kind)];
        if (hit && hit.text)
            out.push({ kind, at: hit.at, source: hit.source, chars: hit.chars });
    }
    return out;
}
export function savePasted(input) {
    const text = String(input.text ?? '').replace(/\r\n/g, '\n').trim();
    if (!text)
        return { ok: false, message: '内容为空，没有保存。', replaced: false };
    if (text.length > 400_000) {
        return { ok: false, message: '内容超过 40 万字，请分段粘贴。', replaced: false };
    }
    const existing = getPasted(input.meetingId, input.kind);
    if (existing && !input.overwrite) {
        return { ok: false, message: '这场会已经有一份了，覆盖需要先确认。', replaced: true };
    }
    const material = {
        text,
        at: new Date().toISOString(),
        source: String(input.source ?? '').trim() || '用户提供',
        chars: text.length
    };
    writeStore((d) => {
        d.pastedMaterials[pastedKey(input.meetingId, input.kind)] = material;
    });
    return {
        ok: true,
        message: existing ? `已覆盖，共 ${material.chars} 字。` : `已保存，共 ${material.chars} 字。`,
        replaced: Boolean(existing)
    };
}
export function deletePasted(meetingId, kind) {
    const existed = Boolean(getPasted(meetingId, kind));
    writeStore((d) => {
        delete d.pastedMaterials[pastedKey(meetingId, kind)];
    });
    return { ok: true, message: existed ? '已删除这份素材。' : '本来就没有这份素材。' };
}
/** 把粘贴的素材摊平成可读文本，供产出与简报使用 */
export function pastedAsText(meetingId) {
    const t = getPasted(meetingId, 'transcript');
    const m = getPasted(meetingId, 'minutes');
    const d = getPasted(meetingId, 'todos');
    const sources = [];
    if (t)
        sources.push(`逐字稿（用户提供，${t.chars} 字，${t.at.slice(0, 10)}）`);
    if (m)
        sources.push(`纪要（用户提供，${m.chars} 字，${m.at.slice(0, 10)}）`);
    if (d)
        sources.push(`待办（用户提供，${d.chars} 字，${d.at.slice(0, 10)}）`);
    return {
        transcript: t?.text,
        minutes: m?.text,
        todos: d?.text,
        sources
    };
}
