/**
 * 本地存储：会议列表快照、逐字稿就绪清单、本地补充的参会人、已生成的产出。
 *
 * 为什么要有本地这一层：腾讯 CLI 有每日调用额度（500246 实测），
 * 面板每渲染一次就真取一次数据是最快的烧额度方式（superIR 版实测 48 条命令/次）。
 * 所以列表读快照，只有用户点「同步」或首次进面板才真取。
 *
 * 存储后端：$DSH_HOME/plugin-data/dsh-tencent-meeting/store.json。
 * 单个 JSON，写入走原子替换；数据量很小（几十场会 + 少量正文缓存索引）。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
function dshHome() {
    const explicit = String(process.env.DSH_HOME || '').trim();
    if (explicit)
        return explicit;
    return path.join(os.homedir(), '.dsh');
}
export function pluginDataDir() {
    return path.join(dshHome(), 'plugin-data', 'dsh-tencent-meeting');
}
function storeFile() {
    return path.join(pluginDataDir(), 'store.json');
}
function emptySnapshot() {
    return {
        upcoming: [],
        upcomingFetchedAt: null,
        history: [],
        syncedAt: null,
        historyFrom: null,
        noMoreHistory: false
    };
}
export function emptyStore() {
    return {
        accountOpenId: '',
        snapshot: emptySnapshot(),
        transcriptReady: [],
        localParticipants: {},
        outputs: {},
        contentIndex: {},
        pastedMaterials: {},
        localPasswords: {}
    };
}
let cache = null;
export function readStore() {
    if (cache)
        return cache;
    try {
        const text = fs.readFileSync(storeFile(), 'utf8');
        const parsed = JSON.parse(text);
        cache = {
            accountOpenId: String(parsed.accountOpenId || ''),
            snapshot: { ...emptySnapshot(), ...(parsed.snapshot || {}) },
            transcriptReady: Array.isArray(parsed.transcriptReady) ? parsed.transcriptReady.map(String) : [],
            localParticipants: parsed.localParticipants || {},
            outputs: parsed.outputs || {},
            contentIndex: parsed.contentIndex || {},
            pastedMaterials: parsed.pastedMaterials || {},
            localPasswords: parsed.localPasswords || {}
        };
        return cache;
    }
    catch {
        cache = emptyStore();
        return cache;
    }
}
export function writeStore(mutate) {
    const draft = structuredCloneSafe(readStore());
    mutate(draft);
    cache = draft;
    try {
        fs.mkdirSync(pluginDataDir(), { recursive: true });
        const tmp = `${storeFile()}.${process.pid}.tmp`;
        fs.writeFileSync(tmp, JSON.stringify(draft), 'utf8');
        fs.renameSync(tmp, storeFile());
    }
    catch {
        // 写不进就只在内存生效，不影响本次会话使用
    }
    return draft;
}
function structuredCloneSafe(value) {
    try {
        return structuredClone(value);
    }
    catch {
        return JSON.parse(JSON.stringify(value));
    }
}
/** 清空某个账号的全部本地数据（切换账号时用户勾选「清除会议记录」走这里） */
export function purgeAccount() {
    const before = readStore();
    const meetings = before.snapshot.upcoming.length + before.snapshot.history.length;
    const outputs = Object.keys(before.outputs).length;
    cache = emptyStore();
    try {
        fs.mkdirSync(pluginDataDir(), { recursive: true });
        fs.writeFileSync(storeFile(), JSON.stringify(cache), 'utf8');
    }
    catch {
        /* 内存已清空，落盘失败下次启动会读到旧值——如实由调用方提示 */
    }
    return { meetings, outputs };
}
/** 列表快照是否新鲜（用于「今天还没同步过」的判断） */
export function snapshotFresh(ttlMs) {
    const s = readStore().snapshot;
    if (!s.syncedAt)
        return false;
    const t = Date.parse(s.syncedAt);
    if (Number.isNaN(t))
        return false;
    return Date.now() - t < ttlMs;
}
/** 增量维护「已取回逐字稿」的 id 集合 */
export function markTranscriptReady(meetingId, ready) {
    if (!meetingId)
        return;
    writeStore((d) => {
        const set = new Set(d.transcriptReady);
        if (ready)
            set.add(meetingId);
        else
            set.delete(meetingId);
        d.transcriptReady = Array.from(set);
    });
}
export function transcriptReadySet() {
    return new Set(readStore().transcriptReady);
}
