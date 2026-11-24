import fs from 'node:fs';
import path from 'node:path';
import { pluginDataDir } from './store.js';
/**
 * 正文磁盘缓存（第三层，最持久的一层）。
 *
 * 为什么要它：内存缓存一重启就没、TTL 一到就重拉，用户第二天进同一场会
 * 又看到转圈——而逐字稿这类内容只要没重转写，七天前的和今天取的是同一份。
 * 落盘后：每天同步只需拉列表；正文只在「推送说变了」或「超过保鲜期」时才重新取。
 * 额度因此花在真正有变化的地方，符合「别乱调接口」的原则。
 */
const CACHE_DIR = () => path.join(pluginDataDir(), 'content-cache');
const fileOf = (key) => path.join(CACHE_DIR(), `${key.replace(/[^0-9A-Za-z_-]/g, '_')}.json`);
export function diskGet(key, maxAgeMs) {
    try {
        const raw = fs.readFileSync(fileOf(key), 'utf8');
        const o = JSON.parse(raw);
        if (typeof o.savedAt !== 'number' || Date.now() - o.savedAt > maxAgeMs)
            return null;
        return o;
    }
    catch {
        return null;
    }
}
export function diskPut(key, view) {
    try {
        fs.mkdirSync(CACHE_DIR(), { recursive: true });
        fs.writeFileSync(fileOf(key), JSON.stringify({ savedAt: Date.now(), view }), 'utf8');
    }
    catch {
        /* 磁盘问题不致命：拿不到缓存就走接口 */
    }
}
/** 删某场会的全部正文缓存（不带 id 就全清） */
export function diskDrop(meetingId) {
    try {
        if (!meetingId) {
            fs.rmSync(CACHE_DIR(), { recursive: true, force: true });
            return;
        }
        if (!fs.existsSync(CACHE_DIR()))
            return;
        const prefix = `${meetingId}_`.replace(/[^0-9A-Za-z_-]/g, '_');
        for (const f of fs.readdirSync(CACHE_DIR())) {
            if (f.startsWith(prefix) && f.endsWith('.json'))
                fs.rmSync(path.join(CACHE_DIR(), f), { force: true });
        }
    }
    catch {
        /* ignore */
    }
}
/** 删单个键（如一条详情缓存） */
export function diskRemove(key) {
    try {
        fs.rmSync(fileOf(key), { force: true });
    }
    catch {
        /* ignore */
    }
}
/** 只读长度、不取整份内容：给判定/预览算「素材有多少字」用，零接口 */
export function diskPeekChars(key) {
    try {
        const raw = fs.readFileSync(fileOf(key), 'utf8');
        const o = JSON.parse(raw);
        const plain = o?.view?.plain;
        return typeof plain === 'string' ? plain.length : null;
    }
    catch {
        return null;
    }
}
/** 只读视图、不取整份内容给判定用：参与度分析要 chunks */
export function diskPeekView(key) {
    try {
        const raw = fs.readFileSync(fileOf(key), 'utf8');
        const o = JSON.parse(raw);
        return o?.view ?? null;
    }
    catch {
        return null;
    }
}
/** 按前缀批量删（详情类键都以 detail: 开头） */
export function diskDropPrefix(prefix) {
    try {
        if (!fs.existsSync(CACHE_DIR()))
            return;
        const want = prefix.replace(/[^0-9A-Za-z_-]/g, "_");
        for (const f of fs.readdirSync(CACHE_DIR())) {
            if (f.startsWith(want) && f.endsWith(".json"))
                fs.rmSync(path.join(CACHE_DIR(), f), { force: true });
        }
    }
    catch {
        /* ignore */
    }
}
