/** 归一化说话人名字：去掉空白与常见称呼后缀，避免同一人被拆成两行 */
function norm(name) {
    return String(name ?? '')
        .trim()
        .replace(/\s+/g, '')
        .replace(/(老师|总|经理|博士)$/, '');
}
export function analyzeParticipation(chunks, roster = []) {
    const map = new Map();
    let totalChars = 0;
    let speakerAvailable = false;
    for (const c of chunks) {
        const text = String(c.text ?? '');
        const key = norm(c.speaker || '');
        if (key)
            speakerAvailable = true;
        const bucket = key || '（未标注说话人）';
        const hit = map.get(bucket) ?? { speaker: bucket, chunks: 0, chars: 0 };
        hit.chunks += 1;
        hit.chars += text.length;
        totalChars += text.length;
        map.set(bucket, hit);
    }
    const rows = [...map.values()]
        .map((r) => ({
        speaker: r.speaker,
        chunks: r.chunks,
        chars: r.chars,
        share: totalChars > 0 ? Math.round((r.chars / totalChars) * 100) / 100 : 0
    }))
        .sort((a, b) => b.chars - a.chars);
    // 沉默者：名单里有、逐字稿里没出现的（名字归一化后比对）
    const spoken = new Set([...map.keys()].map(norm));
    const silent = roster
        .map((p) => String(p.nickname ?? '').trim())
        .filter((n) => n && !spoken.has(norm(n)));
    return {
        rows,
        silent,
        totalChunks: chunks.length,
        totalChars,
        speakerAvailable,
        rosterMissing: roster.length === 0
    };
}
