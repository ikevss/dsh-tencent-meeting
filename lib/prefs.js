/**
 * 用户偏好：模型 / agent / 产出技能开关。
 *
 * 为什么和 Config 分开：Config 是部署默认值（写在 cordis.patch.yml 里，改一次重启插件），
 * 偏好是用户在面板里随手改的东西，必须热更、必须持久化、必须有默认值兜底。
 * 落盘位置放 $DSH_HOME/plugin-data/<插件名>/prefs.json，不碰用户的 cordis.patch.yml。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { OUTPUT_KINDS } from './shared/types.js';
export const DEFAULT_PREFS = {
    provider: '',
    model: '',
    agentPreset: '',
    outputSkills: [...OUTPUT_KINDS],
    notifyOnReady: true,
    quotaStrict: false
};
function dshHome() {
    const explicit = String(process.env.DSH_HOME || '').trim();
    if (explicit)
        return explicit;
    return path.join(os.homedir(), '.dsh');
}
function prefsDir() {
    return path.join(dshHome(), 'plugin-data', 'dsh-tencent-meeting');
}
function prefsFile() {
    return path.join(prefsDir(), 'prefs.json');
}
function sanitize(raw) {
    const obj = (raw && typeof raw === 'object' ? raw : {});
    const skills = Array.isArray(obj.outputSkills)
        ? obj.outputSkills.filter((k) => OUTPUT_KINDS.includes(k))
        : [...DEFAULT_PREFS.outputSkills];
    return {
        provider: typeof obj.provider === 'string' ? obj.provider : '',
        model: typeof obj.model === 'string' ? obj.model : '',
        agentPreset: typeof obj.agentPreset === 'string' ? obj.agentPreset : '',
        outputSkills: skills.length ? Array.from(new Set(skills)) : [],
        notifyOnReady: obj.notifyOnReady === undefined ? true : Boolean(obj.notifyOnReady),
        quotaStrict: obj.quotaStrict === true
    };
}
/** 读偏好：任何失败都退回默认值，绝不抛（插件不该因为偏好文件坏了就起不来） */
export function readPrefs() {
    try {
        const text = fs.readFileSync(prefsFile(), 'utf8');
        return sanitize(JSON.parse(text));
    }
    catch {
        return { ...DEFAULT_PREFS, outputSkills: [...DEFAULT_PREFS.outputSkills] };
    }
}
/** 原子写：先写临时文件再 rename，避免半个文件 */
export function writePrefs(patch) {
    const next = sanitize({ ...readPrefs(), ...patch });
    try {
        fs.mkdirSync(prefsDir(), { recursive: true });
        const tmp = `${prefsFile()}.${process.pid}.tmp`;
        fs.writeFileSync(tmp, JSON.stringify(next, null, 2), 'utf8');
        fs.renameSync(tmp, prefsFile());
    }
    catch (e) {
        // 写不进就只在内存生效：调用方拿返回值照样能用，界面上会提示保存失败
        throw new Error(`偏好保存失败：${e?.message ?? String(e)}`);
    }
    return next;
}
export function prefsPath() {
    return prefsFile();
}
