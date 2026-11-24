/**
 * 两端共用的类型（Host 与 Client 都 import，只放类型与纯函数，不 import 任何运行时）。
 * 与 SPEC.md §4.6 一一对应；改这里必须同步改 spec。
 */
/** 会议洞察分析放第一项 */
export const OUTPUT_KINDS = ['insight', 'minutes-company', 'minutes-investor', 'review', 'qa'];
export const OUTPUT_LABELS = {
    insight: '会议洞察分析',
    'minutes-company': '公司视角纪要',
    'minutes-investor': '投资人视角纪要',
    review: '复盘报告',
    qa: '问答清单'
};
export function emptyStates() {
    return {
        replay: 'none',
        transcript: 'none',
        minutes: 'waiting',
        timeline: 'waiting',
        gen: { insight: 'idle', company: 'idle', investor: 'idle', review: 'idle', qa: 'idle' },
        tabs: { transcriptDisabled: false, minutesDisabled: false, qaDisabled: false },
        tabReasons: { transcript: '', minutes: '', qa: '' },
        disabledReason: '',
        blocker: null
    };
}
/* ── 纯函数：两端共用 ── */
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
function pad(n) {
    return String(n).padStart(2, '0');
}
function parseDate(iso) {
    if (!iso)
        return null;
    const t = Date.parse(iso);
    return Number.isNaN(t) ? null : new Date(t);
}
function dayKey(d) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
/** 相对时间标签：今天 / 明天 / 昨天 / MM-DD 周X + 起止时分 */
export function formatRelativeRange(startIso, endIso, now = new Date()) {
    const s = parseDate(startIso);
    const e = parseDate(endIso);
    if (!s)
        return startIso || '';
    const hm = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
    const endHm = e ? ` – ${pad(e.getHours())}:${pad(e.getMinutes())}` : '';
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dayKey(s) === dayKey(now))
        return `今天 ${hm}${endHm}`;
    if (dayKey(s) === dayKey(tomorrow))
        return `明天 ${hm}${endHm}`;
    if (dayKey(s) === dayKey(yesterday))
        return `昨天 ${hm}${endHm}`;
    const md = `${pad(s.getMonth() + 1)}-${pad(s.getDate())}`;
    if (s.getFullYear() === now.getFullYear() && Math.abs(s.getTime() - now.getTime()) < 7 * 864e5) {
        return `${md} ${WEEKDAYS[s.getDay()]} ${hm}${endHm}`;
    }
    return `${md} ${hm}${endHm}`;
}
/** 绝对时间标签：复制邀请必须给绝对日期 */
export function formatAbsoluteRange(startIso, endIso) {
    const s = parseDate(startIso);
    const e = parseDate(endIso);
    if (!s)
        return `${startIso || ''} – ${endIso || ''}`;
    const so = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())} ${pad(s.getHours())}:${pad(s.getMinutes())}`;
    if (!e)
        return so;
    const sameDay = dayKey(s) === dayKey(e);
    const eo = sameDay
        ? `${pad(e.getHours())}:${pad(e.getMinutes())}`
        : `${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())} ${pad(e.getHours())}:${pad(e.getMinutes())}`;
    return `${so} – ${eo}`;
}
export function isLive(m, now = Date.now()) {
    const s = Date.parse(m.startTime);
    const e = Date.parse(m.endTime);
    if (Number.isNaN(s) || Number.isNaN(e))
        return false;
    return now >= s && now < e;
}
export function isEnded(m, now = Date.now()) {
    const e = Date.parse(m.endTime);
    return !Number.isNaN(e) && now >= e;
}
/** 同一场会被重复建多次时，展示层按「主题+起止」去重，只留第一条 */
export function dedupeBySlot(list) {
    const seen = new Set();
    const out = [];
    for (const m of list) {
        const key = `${m.subject}|${m.startTime}|${m.endTime}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        out.push(m);
    }
    return out;
}
/** 「已等待 X 分 YY 秒」：等待态只说已等待，不给预计 */
export function formatWaited(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `已等待 ${m} 分 ${pad(s)} 秒` : `已等待 ${s} 秒`;
}
/** 会议号格式：腾讯是 9 位数字，3-3-3 分组更易读 */
export function formatMeetingCode(code) {
    const c = String(code || '').replace(/\D/g, '');
    if (c.length !== 9)
        return code || '';
    return `${c.slice(0, 3)} ${c.slice(3, 6)} ${c.slice(6)}`;
}
