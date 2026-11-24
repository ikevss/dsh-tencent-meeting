/**
 * 工具面：14 个 tm_* 工具。
 *
 * 契约（dsh-tools 0.2.x）：
 *  - `parameters` 是「属性名 → 值 schema」的映射（隐式对象根），必填写成 `required: true`；
 *  - `output.schema` 是原始 JSON Schema（JsonSchemaNode），对象节点必须显式 additionalProperties；
 *  - `execute(args, exec)` 返回的必须正好匹配 output.schema；
 *  - 只读工具 isConcurrencySafe=true，写工具 confirm 前置。
 */
import { defineTool } from '@deepseek-ai/dsh-tools';
import { OUTPUT_KINDS, OUTPUT_LABELS, formatAbsoluteRange } from './shared/types.js';
import { readPrefs } from './prefs.js';
import { readStatus } from './services/auth.js';
import * as meetings from './services/meetings.js';
import * as records from './services/records.js';
import * as participants from './services/participants.js';
import * as outputs from './services/outputs.js';
import { planReview, collectFacts } from './services/review-plan.js';
import { analyzeParticipation } from './services/review-participation.js';
import { readStore } from './services/store.js';
import { getPasted } from './services/pasted.js';
import { diskPeekChars, diskPeekView } from './services/content-cache.js';
import { catalog } from './services/agent-run.js';
import { explain } from './cli/errors.js';
/**
 * 输出 schema：dsh-tools 的 output.schema 也走「值 schema DSL」，
 * 必填写成每个属性上的 `required: true`，不是根级 required 数组。
 */
function textOut(properties, requiredExtra = []) {
    const props = {
        text: { type: 'string', required: true },
        ...properties
    };
    for (const key of requiredExtra) {
        if (props[key] && typeof props[key] === 'object') {
            props[key] = { ...props[key], required: true };
        }
    }
    return {
        schema: {
            type: 'object',
            additionalProperties: false,
            properties: props
        },
        render: (_args, value) => [{ type: 'text', text: String(value?.text ?? '') }]
    };
}
const arrOf = (props) => ({
    type: 'array',
    items: { type: 'object', additionalProperties: true, properties: props }
});
const ISO_TZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.[\d]+)?(Z|[+-]\d{2}:\d{2})$/;
export function buildTools(ctx, cfg) {
    const statusInput = {
        binary: cfg.binary,
        timeoutMs: cfg.timeoutMs,
        expectedVersion: cfg.expectedVersion
    };
    const io = { binary: cfg.binary, timeoutMs: cfg.timeoutMs };
    /**
     * 会议 ID / 会议号都认：列表里给人看的是 9 位会议号，模型和用户很容易直接拿它当 ID 用。
     * 9～10 位纯数字（允许带空格/横线）按会议号处理，换成真正的会议 ID；其余原样当 ID。
     */
    async function resolveMeetingId(raw) {
        const input = String(raw ?? '').trim();
        if (!input)
            return { ok: false, text: '要传会议 ID 或会议号。' };
        const digits = input.replace(/[\s-]/g, '');
        if (!/^\d{9,10}$/.test(digits))
            return { ok: true, id: input };
        const r = await meetings.detail(io, { meetingCode: digits });
        if (!r.ok || !r.detail) {
            return {
                ok: false,
                text: `没有找到会议号 ${digits} 对应的会议${r.error ? `：${explain(r.error)}` : '。'}可以先用搜索确认会议号。`
            };
        }
        return { ok: true, id: r.detail.brief.meetingId };
    }
    /** 统一前置检查：没装/版本低/没登录就把可照做的引导原样返回 */
    async function guard() {
        const status = await readStatus(statusInput);
        if (status.state === 'not-installed') {
            return {
                ok: false,
                text: [
                    '还没安装腾讯会议组件（@tencentcloud/tmeet）。',
                    '在 DSH 左栏点「腾讯会议」→「安装会议组件」，或在终端执行：',
                    '  npm i -g @tencentcloud/tmeet@1.1.0',
                    '装完再让我重试。'
                ].join('\n')
            };
        }
        if (status.state === 'version-mismatch') {
            return {
                ok: false,
                text: [
                    `当前组件版本 ${status.version || '未知'}，需要 1.1.0 及以上（读逐字稿、搜会议、看待办都要它）。`,
                    '在面板点「升级会议组件」，或执行：',
                    '  npm i -g @tencentcloud/tmeet@1.1.0'
                ].join('\n')
            };
        }
        if (status.state === 'none' || status.state === 'expired') {
            return {
                ok: false,
                text: [
                    status.state === 'expired' ? '腾讯会议登录已过期。' : '还没有登录腾讯会议。',
                    '在 DSH 左栏点「腾讯会议」→「去授权」，用企业微信或腾讯会议账号确认一次即可。'
                ].join('\n')
            };
        }
        return { ok: true };
    }
    const statusTool = defineTool({
        name: 'tm_status',
        description: '腾讯会议插件自检：组件是否已安装、版本、登录状态与账号、当前配置的模型与 agent。用户问「腾讯会议能用了么」「为什么取不到会议」时先调它。只读，不消耗会议接口额度。',
        parameters: {},
        output: textOut({
            state: { type: 'string' },
            version: { type: 'string' },
            account: { type: 'string' },
            binary: { type: 'string' },
            model: { type: 'string' },
            agentPreset: { type: 'string' }
        }),
        isConcurrencySafe: () => true,
        presentCall: () => ({ card: 'generic', title: '检查腾讯会议状态' }),
        async execute() {
            const status = await readStatus(statusInput);
            const prefs = readPrefs();
            const connected = status.state === 'connected' || status.state === 'expiring' || status.state === 'connected-empty';
            const model = prefs.provider && prefs.model ? `${prefs.provider}/${prefs.model}` : '';
            const lines = [
                connected ? `状态：已连接${status.account ? `（${status.account}）` : ''}` : `状态：${status.hint}`,
                `组件版本：${status.version || '未探测到'}（需要 ${status.expectedVersion}）`,
                `二进制：${status.binary || '未找到'}`,
                `模型：${model || '跟随 DSH 默认'}`,
                `Agent 预设：${prefs.agentPreset || '不指定（单发模型调用）'}`,
                `已启用产出：${prefs.outputSkills.map((k) => OUTPUT_LABELS[k]).join('、') || '无'}`
            ];
            return {
                text: lines.join('\n'),
                state: status.state,
                version: status.version,
                account: status.account,
                binary: status.binary,
                model,
                agentPreset: prefs.agentPreset
            };
        }
    });
    const listTool = defineTool({
        name: 'tm_meeting_list',
        description: '列出最近的腾讯会议（进行中/即将开始，或已结束）。默认读本地快照不消耗接口额度；只有 refresh=true 才真去腾讯取一次。用户问「今天有什么会」「最近开过哪些会」时用。',
        parameters: {
            scope: { type: 'string', enum: ['upcoming', 'ended'], description: 'upcoming=进行中/即将开始（默认），ended=已结束' },
            limit: { type: 'number', description: '条数，默认 20/30' },
            keyword: { type: 'string', description: '按主题或会议号过滤' },
            onlyTranscript: { type: 'boolean', description: '只看本机已取回逐字稿的会' },
            refresh: { type: 'boolean', description: 'true=真的去腾讯取一次（消耗接口额度）' }
        },
        output: textOut({ count: { type: 'number' }, meetings: arrOf({ meetingId: { type: 'string' } }) }, ['count', 'meetings']),
        isConcurrencySafe: () => true,
        presentCall: () => ({ card: 'generic', title: '查腾讯会议日程' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const g = await guard();
            if (!g.ok)
                return { text: g.text, count: 0, meetings: [] };
            const scope = args.scope === 'ended' ? 'ended' : 'upcoming';
            const r = await meetings.list(io, {
                scope,
                limit: args.limit,
                query: args.keyword,
                onlyTranscript: args.onlyTranscript === true,
                refresh: args.refresh === true
            });
            if (r.error)
                return { text: `取不到会议列表：${r.error}`, count: 0, meetings: [] };
            if (!r.meetings.length) {
                return {
                    text: scope === 'ended' ? '最近 30 天没有已结束的会议。' : '今天没有进行中或即将开始的会议。',
                    count: 0,
                    meetings: []
                };
            }
            const lines = r.meetings.map((m, i) => {
                const when = formatAbsoluteRange(m.startTime, m.endTime);
                const tag = m.hasTranscript ? ' · 有转写' : '';
                return `${i + 1}. ${m.subject}｜${when}｜会议号 ${m.meetingCode}${tag}`;
            });
            return {
                text: [`共 ${r.meetings.length} 场${r.partial ? '（这次只取到一部分）' : ''}：`, ...lines].join('\n'),
                count: r.meetings.length,
                meetings: r.meetings.map((m) => ({
                    meetingId: m.meetingId,
                    meetingCode: m.meetingCode,
                    subject: m.subject,
                    startTime: m.startTime,
                    endTime: m.endTime,
                    hasTranscript: m.hasTranscript
                }))
            };
        }
    });
    const getTool = defineTool({
        name: 'tm_meeting_get',
        description: '取一场腾讯会议的详情：主题、时间、会议号、入会链接、真实生效的录制与转写设置、受邀人。用户问「这场会几点」「链接是什么」「有没有开云录制」时用。',
        parameters: {
            meetingId: { type: 'string', description: '会议 id（优先）' },
            meetingCode: { type: 'string', description: '会议号（没有 id 时用）' }
        },
        output: textOut({ meeting: { type: 'object', additionalProperties: true }, settings: { type: 'object', additionalProperties: true } }, ['meeting', 'settings']),
        isConcurrencySafe: () => true,
        presentCall: () => ({ card: 'generic', title: '看会议详情' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const g = await guard();
            if (!g.ok)
                return { text: g.text, meeting: {}, settings: {} };
            const r = await meetings.detail(io, { meetingId: args.meetingId, meetingCode: args.meetingCode });
            if (!r.ok || !r.detail) {
                return {
                    text: explain(r.error ?? { code: 'unknown', message: '取不到会议详情' }),
                    meeting: {},
                    settings: {}
                };
            }
            const d = r.detail;
            const s = d.settings;
            const lines = [
                `主题：${d.brief.subject}`,
                `时间：${formatAbsoluteRange(d.brief.startTime, d.brief.endTime)}`,
                `会议号：${d.brief.meetingCode}`,
                d.brief.joinUrl ? `入会链接：${d.brief.joinUrl}` : '入会链接：接口没有返回（列表类接口不给链接）',
                `自动录制：${s.autoRecordType === 'cloud' ? '云录制' : s.autoRecordType === 'local' ? '本地录制' : s.autoRecordType === 'none' ? '不录制' : '未知'}`,
                `自动转写：${s.autoAsr === null ? '未知' : s.autoAsr ? '开启' : '关闭'}`,
                `等候室：${s.waitingRoom === null ? '未知' : s.waitingRoom ? '开启' : '关闭'}`,
                `受邀人：${d.invitees.length} 人`,
                d.brief.records.length ? `录制：${d.brief.records.length} 个文件` : '录制：还没有（或未开云录制）'
            ];
            return {
                text: lines.join('\n'),
                meeting: {
                    meetingId: d.brief.meetingId,
                    meetingCode: d.brief.meetingCode,
                    subject: d.brief.subject,
                    startTime: d.brief.startTime,
                    endTime: d.brief.endTime,
                    joinUrl: d.brief.joinUrl ?? ''
                },
                settings: {
                    autoRecordType: s.autoRecordType ?? '',
                    autoAsr: s.autoAsr === null ? '' : String(s.autoAsr),
                    waitingRoom: s.waitingRoom === null ? '' : String(s.waitingRoom)
                }
            };
        }
    });
    const createTool = defineTool({
        name: 'tm_meeting_create',
        description: '创建腾讯会议。两阶段：第一次调用（不传 confirm）只返回将要提交的内容预览、不发起任何请求；用户明确确认后再传 confirm=true 才真正创建。要纪要或逐字稿必须同时开 cloudRecord 与 autoTranscribe。',
        parameters: {
            subject: { type: 'string', required: true, description: '会议主题（必填）' },
            date: { type: 'string', description: '日期 YYYY-MM-DD' },
            startTime: { type: 'string', description: '开始时间 HH:mm' },
            durationMinutes: { type: 'number', description: '时长（分钟），默认 60' },
            passwordEnabled: { type: 'boolean', description: '是否设置入会密码' },
            password: { type: 'string', description: '入会密码（4-6 位数字）' },
            recurring: { type: 'boolean', description: '是否周期性会议' },
            joinLimit: { type: 'number', description: '入会限制 1=所有人 2=仅受邀 3=仅内部' },
            cloudRecord: { type: 'boolean', description: '是否自动云录制' },
            autoTranscribe: { type: 'boolean', description: '是否自动转写（需 cloudRecord）' },
            waitingRoom: { type: 'boolean', description: '是否开启等候室' },
            inviteeOpenIds: { type: 'array', items: { type: 'string' }, description: '受邀人 open_id 列表' },
            note: { type: 'string', description: '备注（只存本地，不会提交给腾讯）' },
            confirm: { type: 'boolean', description: 'true 才真正创建' }
        },
        output: textOut({ stage: { type: 'string' }, meeting: { type: 'object', additionalProperties: true } }, ['stage']),
        isConcurrencySafe: () => false,
        presentCall: () => ({ card: 'generic', title: '创建腾讯会议' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const g = await guard();
            if (!g.ok)
                return { text: g.text, stage: 'blocked', meeting: {} };
            const form = {
                subject: String(args.subject ?? ''),
                date: String(args.date ?? ''),
                startTime: String(args.startTime ?? ''),
                durationMinutes: Number(args.durationMinutes) || 60,
                passwordEnabled: args.passwordEnabled === true,
                password: args.password ? String(args.password) : undefined,
                recurring: args.recurring === true,
                joinLimit: Number(args.joinLimit) || 1,
                cloudRecord: args.cloudRecord === true,
                autoTranscribe: args.autoTranscribe === true,
                waitingRoom: args.waitingRoom === true,
                inviteeOpenIds: Array.isArray(args.inviteeOpenIds) ? args.inviteeOpenIds.map(String) : undefined,
                note: args.note ? String(args.note) : undefined
            };
            if (args.confirm !== true) {
                const p = meetings.previewCreate(form);
                if (!p.ok)
                    return { text: `还不能建：${p.error}`, stage: 'invalid', meeting: {} };
                return {
                    text: ['将要创建这场会议：', p.text || '', '', '确认后再调一次并传 confirm=true，我才会真正提交。'].join('\n'),
                    stage: 'preview',
                    meeting: {}
                };
            }
            const r = await meetings.create(io, form);
            if (!r.ok) {
                return { text: explain(r.error ?? { code: 'unknown', message: '建会失败' }), stage: 'failed', meeting: {} };
            }
            const m = r.meeting;
            const lines = [`会议已创建：${m?.subject ?? form.subject}`];
            if (m) {
                lines.push(`时间：${formatAbsoluteRange(m.startTime, m.endTime)}`, `会议号：${m.meetingCode}`);
                if (m.joinUrl)
                    lines.push(`入会链接：${m.joinUrl}`);
            }
            if (r.overridden?.length) {
                lines.push('', `注意：${r.overridden.join('、')}被企业策略改成了实际值，请到面板详情页确认。`);
            }
            return {
                text: lines.join('\n'),
                stage: 'created',
                meeting: m
                    ? {
                        meetingId: m.meetingId,
                        meetingCode: m.meetingCode,
                        subject: m.subject,
                        startTime: m.startTime,
                        endTime: m.endTime
                    }
                    : {}
            };
        }
    });
    const updateTool = defineTool({
        name: 'tm_meeting_update',
        description: '修改已有的腾讯会议（主题/时间/录制/转写/等候室/入会限制/密码）。两阶段：不传 confirm 只预览差异；confirm=true 才提交。没显式改的录制设置会带上当前生效值，避免被重置。',
        parameters: {
            meetingId: { type: 'string', required: true, description: '会议 ID 或会议号（必填，两者都行）' },
            subject: { type: 'string' },
            start: { type: 'string', description: '开始时间，ISO 带时区' },
            end: { type: 'string', description: '结束时间，ISO 带时区' },
            cloudRecord: { type: 'boolean' },
            autoTranscribe: { type: 'boolean' },
            waitingRoom: { type: 'boolean' },
            joinLimit: { type: 'number', description: '1=所有人 2=仅受邀 3=仅内部' },
            passwordEnabled: { type: 'boolean' },
            password: { type: 'string' },
            note: { type: 'string', description: '备注（只存本地）' },
            confirm: { type: 'boolean', description: 'true 才真正提交' }
        },
        output: textOut({ stage: { type: 'string' } }, ['stage']),
        isConcurrencySafe: () => false,
        presentCall: () => ({ card: 'generic', title: '修改腾讯会议' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const g = await guard();
            if (!g.ok)
                return { text: g.text, stage: 'blocked' };
            const rid = await resolveMeetingId(args.meetingId);
            if (!rid.ok)
                return { text: rid.text, stage: 'failed' };
            const id = rid.id;
            const patch = {
                subject: args.subject ? String(args.subject) : undefined,
                start: args.start ? String(args.start) : undefined,
                end: args.end ? String(args.end) : undefined,
                cloudRecord: typeof args.cloudRecord === 'boolean' ? args.cloudRecord : undefined,
                autoTranscribe: typeof args.autoTranscribe === 'boolean' ? args.autoTranscribe : undefined,
                waitingRoom: typeof args.waitingRoom === 'boolean' ? args.waitingRoom : undefined,
                joinLimit: args.joinLimit ? Number(args.joinLimit) : undefined,
                passwordEnabled: typeof args.passwordEnabled === 'boolean' ? args.passwordEnabled : undefined,
                password: args.password ? String(args.password) : undefined,
                note: args.note !== undefined ? String(args.note) : undefined
            };
            if (args.confirm !== true) {
                const before = await meetings.detail(io, { meetingId: id });
                if (!before.ok || !before.detail)
                    return { text: '取不到这场会的当前设置，改不了。', stage: 'failed' };
                const p = meetings.previewUpdate(before.detail, patch);
                return { text: ['将要做这些改动：', p.text, '', '确认后再调一次并传 confirm=true。'].join('\n'), stage: 'preview' };
            }
            const r = await meetings.update(io, { meetingId: id, patch });
            if (!r.ok)
                return { text: explain(r.error ?? { code: 'unknown', message: '修改失败' }), stage: 'failed' };
            const lines = [r.message ?? '修改已生效。'];
            if (r.overridden?.length)
                lines.push(`注意：${r.overridden.join('、')}被企业策略覆盖，以回读结果为准。`);
            return { text: lines.join('\n'), stage: 'updated' };
        }
    });
    const cancelTool = defineTool({
        name: 'tm_meeting_cancel',
        description: '取消一场腾讯会议。两阶段：不传 confirm 只说明后果；confirm=true 才真取消。取消不可恢复，参与者会收到通知。',
        parameters: {
            meetingId: { type: 'string', required: true, description: '会议 ID 或会议号（必填，两者都行）' },
            confirm: { type: 'boolean', description: 'true 才真正取消' }
        },
        output: textOut({ stage: { type: 'string' } }, ['stage']),
        isConcurrencySafe: () => false,
        presentCall: () => ({ card: 'generic', title: '取消腾讯会议' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const g = await guard();
            if (!g.ok)
                return { text: g.text, stage: 'blocked' };
            const rid = await resolveMeetingId(args.meetingId);
            if (!rid.ok)
                return { text: rid.text, stage: 'failed' };
            const id = rid.id;
            if (args.confirm !== true) {
                // 先查出是哪一场再让用户确认；查不到就不给确认入口，避免取消错的会
                const found = await meetings.detail(io, { meetingId: id });
                if (!found.ok || !found.detail) {
                    return {
                        text: `查不到这场会（${id}），所以不给取消。可能是 ID 传错（不是会议号）或暂时取不到数据：${found.error ? explain(found.error) : '无详情'}`,
                        stage: 'failed'
                    };
                }
                const b = found.detail.brief;
                return {
                    text: [
                        '将要取消这场会议：',
                        `主题：${b.subject}`,
                        `时间：${formatAbsoluteRange(b.startTime, b.endTime)}`,
                        `会议号：${b.meetingCode}`,
                        '取消后参与者会收到通知，且不可恢复。确认无误后再调一次并传 confirm=true。'
                    ].join('\n'),
                    stage: 'preview'
                };
            }
            const r = await meetings.cancel(io, { meetingId: id });
            if (!r.ok)
                return { text: explain(r.error ?? { code: 'unknown', message: '取消失败' }), stage: 'failed' };
            return { text: r.message ?? '会议已取消。', stage: 'canceled' };
        }
    });
    const searchTool = defineTool({
        name: 'tm_meeting_search',
        description: '按关键词搜索腾讯会议（主题/会议号/时间范围）。查询时间窗会自动钳到 31 天以内（腾讯限制）。用户说「找一下上个月那个会」时用。',
        parameters: {
            query: { type: 'string', required: true, description: '关键词（必填）' },
            start: { type: 'string', description: '起始时间，ISO 带时区（可选）' },
            end: { type: 'string', description: '结束时间，ISO 带时区（可选）' },
            limit: { type: 'number', description: '条数，默认 30' }
        },
        output: textOut({ count: { type: 'number' }, meetings: arrOf({ meetingId: { type: 'string' } }) }, ['count', 'meetings']),
        isConcurrencySafe: () => true,
        presentCall: () => ({ card: 'generic', title: '搜索腾讯会议' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const g = await guard();
            if (!g.ok)
                return { text: g.text, count: 0, meetings: [] };
            const query = String(args.query ?? '').trim();
            if (!query)
                return { text: '要传搜索关键词。', count: 0, meetings: [] };
            const start = args.start ? String(args.start) : undefined;
            const end = args.end ? String(args.end) : undefined;
            if ((start && !ISO_TZ.test(start)) || (end && !ISO_TZ.test(end))) {
                return { text: '时间要写成带时区的 ISO 格式，例如 2026-03-12T14:00+08:00。', count: 0, meetings: [] };
            }
            const r = await meetings.search(io, { query, start, end, limit: Number(args.limit) || 30 });
            if (!r.ok) {
                return {
                    text: explain(r.error ?? { code: 'unknown', message: '搜索失败' }),
                    count: 0,
                    meetings: []
                };
            }
            if (!r.meetings.length)
                return { text: `没有找到包含「${query}」的会议。`, count: 0, meetings: [] };
            const lines = r.meetings.map((m, i) => `${i + 1}. ${m.subject}｜${formatAbsoluteRange(m.startTime, m.endTime)}｜${m.meetingCode}`);
            return {
                text: [`找到 ${r.meetings.length} 场：`, ...lines].join('\n'),
                count: r.meetings.length,
                meetings: r.meetings.map((m) => ({ meetingId: m.meetingId, meetingCode: m.meetingCode, subject: m.subject }))
            };
        }
    });
    const recordTool = defineTool({
        name: 'tm_record_summary',
        description: '读一场会议的内容：智能纪要（minutes）、全文逐字稿（transcript）、时间轴（timeline）、待办（todos）。用户问「这场会说了什么」「待办有哪些」时用。没有转写时会明确说明，不返回空。',
        parameters: {
            meetingId: { type: 'string', required: true, description: '会议 ID 或会议号（必填，两者都行）' },
            action: { type: 'string', enum: ['minutes', 'transcript', 'timeline', 'todos'], description: '要哪一类内容' },
            maxChars: { type: 'number', description: '最多返回多少字，默认 12000' }
        },
        output: textOut({ kind: { type: 'string' }, empty: { type: 'boolean' }, chars: { type: 'number' } }, [
            'kind',
            'empty',
            'chars'
        ]),
        isConcurrencySafe: () => true,
        presentCall: () => ({ card: 'generic', title: '读会议内容' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const g = await guard();
            if (!g.ok)
                return { text: g.text, kind: '', empty: true, chars: 0 };
            const rid = await resolveMeetingId(args.meetingId);
            if (!rid.ok)
                return { text: rid.text, kind: '', empty: true, chars: 0 };
            const meetingId = rid.id;
            const action = String(args.action ?? 'minutes');
            const kind = (action === 'transcript'
                ? 'transcript'
                : action === 'timeline'
                    ? 'timeline'
                    : action === 'todos'
                        ? 'todos'
                        : 'minutes');
            const r = await records.content(io, { meetingId, kind });
            if (!r.ok || !r.view) {
                return {
                    text: explain(r.error ?? { code: 'unknown', message: '取不到内容' }),
                    kind,
                    empty: true,
                    chars: 0
                };
            }
            if (r.view.empty) {
                const label = kind === 'minutes' ? '智能纪要' : kind === 'timeline' ? '时间轴' : kind === 'todos' ? '待办' : '逐字稿';
                return { text: `这场会没有${label}内容。`, kind, empty: true, chars: 0 };
            }
            const max = Math.min(60_000, Math.max(500, Number(args.maxChars) || 12_000));
            const text = r.view.plain.length > max ? `${r.view.plain.slice(0, max)}\n\n（已截断，原文 ${r.view.plain.length} 字）` : r.view.plain;
            return { text, kind, empty: false, chars: r.view.plain.length };
        }
    });
    const briefTool = defineTool({
        name: 'tm_meeting_brief',
        description: '用 DSH 里配置的模型，把一场会议整理成一页简报（结论/决议/待办/未决）。素材优先逐字稿，缺了用智能纪要；两者都没有会明确说明。用户说「这场会总结一下」「帮我出个纪要」时用。',
        parameters: {
            meetingId: { type: 'string', required: true, description: '会议 ID 或会议号（必填，两者都行）' },
            kind: {
                type: 'string',
                enum: ['insight', 'minutes-company', 'minutes-investor', 'review', 'qa'],
                description: '产出类型：公司纪要/投资人纪要/复盘/问答清单，默认公司纪要'
            }
        },
        output: textOut({ kind: { type: 'string' }, model: { type: 'string' }, route: { type: 'string' } }, [
            'kind',
            'model',
            'route'
        ]),
        isConcurrencySafe: () => false,
        presentCall: () => ({ card: 'generic', title: '生成会议简报' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const g = await guard();
            if (!g.ok)
                return { text: g.text, kind: '', model: '', route: '' };
            const rid = await resolveMeetingId(args.meetingId);
            if (!rid.ok)
                return { text: rid.text, kind: '', model: '', route: '' };
            const meetingId = rid.id;
            const kind = String(args.kind ?? 'minutes-company');
            if (!OUTPUT_KINDS.includes(kind))
                return { text: '不认识的产出类型。', kind, model: '', route: '' };
            const detail = await meetings.detail(io, { meetingId });
            if (!detail.ok || !detail.detail) {
                return { text: '取不到这场会的信息，无法生成。', kind, model: '', route: '' };
            }
            let materialText = '';
            let source = 'transcript';
            const tx = await records.content(io, { meetingId, kind: 'transcript' });
            if (tx.ok && tx.view && !tx.view.empty)
                materialText = tx.view.plain;
            else {
                const mn = await records.content(io, { meetingId, kind: 'minutes' });
                if (mn.ok && mn.view && !mn.view.empty) {
                    materialText = mn.view.plain;
                    source = 'minutes';
                }
            }
            if (!materialText.trim()) {
                return {
                    text: '这场会没有可用的素材（既没有逐字稿，也没有智能纪要），生成不了。',
                    kind,
                    model: '',
                    route: ''
                };
            }
            const prefs = readPrefs();
            const material = outputs.trimMaterial(materialText, source);
            const r = await outputs.generateOutput({
                ctx,
                meetingId,
                kind,
                meeting: {
                    subject: detail.detail.brief.subject,
                    timeRange: formatAbsoluteRange(detail.detail.brief.startTime, detail.detail.brief.endTime),
                    participants: detail.detail.invitees.map((x) => x.nickname || x.openId).slice(0, 20)
                },
                material,
                ref: { provider: prefs.provider, model: prefs.model },
                agentPreset: prefs.agentPreset
            });
            if (!r.ok || !r.output)
                return { text: r.message ?? '生成失败', kind, model: '', route: '' };
            const head = r.message && r.message !== '已生成。' ? `${r.message}\n\n` : '';
            return {
                text: `${head}${r.output.text}`,
                kind,
                model: r.output.model,
                route: prefs.agentPreset ? 'agent' : 'stream'
            };
        }
    });
    const participantsTool = defineTool({
        name: 'tm_participants',
        description: '取一场会议的参会人名单（腾讯侧名单 + 本机手工补充）。对方组织的会看不到腾讯名单时会明确说明，并给出本机已存档的名单。用户问「这场会谁来了」时用。',
        parameters: {
            meetingId: { type: 'string', required: true, description: '会议 ID 或会议号（必填，两者都行）' }
        },
        output: textOut({ count: { type: 'number' }, rows: arrOf({ nickname: { type: 'string' } }) }, ['count', 'rows']),
        isConcurrencySafe: () => true,
        presentCall: () => ({ card: 'generic', title: '看参会人' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const g = await guard();
            if (!g.ok)
                return { text: g.text, count: 0, rows: [] };
            const rid = await resolveMeetingId(args.meetingId);
            if (!rid.ok)
                return { text: rid.text, count: 0, rows: [] };
            const r = await participants.listParticipants(io, { meetingId: rid.id });
            const lines = [];
            if (r.warning)
                lines.push(r.warning, '');
            if (!r.rows.length)
                lines.push('这场会还没有参会人记录。');
            else {
                lines.push(`共 ${r.rows.length} 人：`);
                for (const p of r.rows) {
                    const tag = p.fromLocal ? '（本机存档）' : '';
                    const view = p.view ? ` · ${p.view}` : '';
                    lines.push(`- ${p.nickname}${tag}${view}`);
                }
            }
            return {
                text: lines.join('\n'),
                count: r.rows.length,
                rows: r.rows.map((p) => ({ nickname: p.nickname, fromLocal: p.fromLocal, view: p.view ?? '' }))
            };
        }
    });
    const outputTool = defineTool({
        name: 'tm_output',
        description: '读或删除已生成的会后产出（公司纪要/投资人纪要/复盘/问答清单）。生成请用 tm_meeting_brief。用户问「上次生成的纪要在哪」时用。',
        parameters: {
            meetingId: { type: 'string', required: true, description: '会议 ID 或会议号（必填，两者都行）' },
            action: { type: 'string', enum: ['list', 'read', 'delete'], description: '默认 list' },
            kind: {
                type: 'string',
                enum: ['insight', 'minutes-company', 'minutes-investor', 'review', 'qa'],
                description: '产出类型（read/delete 必填）'
            }
        },
        output: textOut({ count: { type: 'number' } }, ['count']),
        isConcurrencySafe: () => false,
        presentCall: () => ({ card: 'generic', title: '看会后产出' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const rid = await resolveMeetingId(args.meetingId);
            if (!rid.ok)
                return { text: rid.text, count: 0 };
            const meetingId = rid.id;
            const action = String(args.action ?? 'list');
            const kind = String(args.kind ?? '');
            if (action === 'delete') {
                if (!OUTPUT_KINDS.includes(kind))
                    return { text: '要指定要删哪一份产出。', count: 0 };
                const done = outputs.deleteOutput(meetingId, kind);
                return { text: done ? `已删除「${OUTPUT_LABELS[kind]}」。` : '这份产出不存在。', count: done ? 1 : 0 };
            }
            const list = outputs.listOutputs(meetingId);
            const kinds = Object.keys(list);
            if (!kinds.length)
                return { text: '这场会还没有生成任何产出。', count: 0 };
            if (action === 'read') {
                if (!OUTPUT_KINDS.includes(kind))
                    return { text: '要指定读哪一份产出。', count: 0 };
                const view = list[kind];
                if (!view)
                    return { text: `「${OUTPUT_LABELS[kind]}」还没生成过。`, count: 0 };
                return { text: view.text, count: 1 };
            }
            const lines = kinds.map((k) => {
                const v = list[k];
                return `- ${OUTPUT_LABELS[k]}｜模型 ${v.model || '未知'}｜${v.generatedAt}${v.truncated ? '｜素材已截断' : ''}`;
            });
            return { text: [`共 ${kinds.length} 份产出：`, ...lines].join('\n'), count: kinds.length };
        }
    });
    const infoTool = defineTool({
        name: 'tm_plugin_info',
        description: '腾讯会议插件诊断：组件路径与版本、可选模型清单、可选 agent 预设。用户问「能选哪些模型」「有哪些 agent」时用。只读。',
        parameters: {},
        output: textOut({ models: arrOf({ provider: { type: 'string' } }), agents: arrOf({ id: { type: 'string' } }) }, ['models', 'agents']),
        isConcurrencySafe: () => true,
        presentCall: () => ({ card: 'generic', title: '插件诊断' }),
        async execute() {
            const c = await catalog(ctx);
            const status = await readStatus(statusInput);
            const prefs = readPrefs();
            const lines = [
                `组件：${status.binary || '未找到'}（版本 ${status.version || '未知'}）`,
                `默认模型：${c.defaultProvider && c.defaultModel ? `${c.defaultProvider}/${c.defaultModel}` : '未设置'}`,
                `当前选择：${prefs.provider && prefs.model ? `${prefs.provider}/${prefs.model}` : '跟随 DSH 默认'}`,
                '',
                '可选模型：',
                ...c.models.flatMap((m) => [`- ${m.providerName}（${m.provider}）`, ...m.models.map((x) => `  · ${x.id}`)]),
                '',
                '可选 agent 预设：',
                ...(c.agents.length ? c.agents.map((a) => `- ${a.name}（${a.id}）${a.isDefault ? ' · 默认' : ''}`) : ['- 当前环境没有 agent 预设'])
            ];
            return {
                text: lines.join('\n'),
                models: c.models.map((m) => ({ provider: m.provider, providerName: m.providerName, count: m.models.length })),
                agents: c.agents.map((a) => ({ id: a.id, name: a.name, isDefault: a.isDefault }))
            };
        }
    });
    const reviewPlanTool = defineTool({
        name: 'tm_review_plan',
        description: '判定一场会该用哪种复盘视角（17 类：客户成功/决策评审/周会…），给出将看哪几项、素材够不够、缺什么怎么补。只读本地，不消耗腾讯接口额度。要复盘但没说怎么看时先调它。',
        parameters: { meetingId: { type: 'string', required: true, description: '会议 ID 或会议号（必填，两者都行）' } },
        output: textOut({
            type: { type: 'string' },
            typeName: { type: 'string' },
            confidence: { type: 'string' },
            frame: { type: 'array', items: { type: 'string' } },
            available: { type: 'array', items: { type: 'string' } },
            missing: { type: 'string' },
            degraded: { type: 'boolean' }
        }, ['type', 'typeName', 'confidence', 'degraded']),
        isConcurrencySafe: () => true,
        presentCall: () => ({ card: 'generic', title: '判定复盘视角' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const rid = await resolveMeetingId(args.meetingId);
            if (!rid.ok) {
                return { text: rid.text, type: '', typeName: '', confidence: '', frame: [], available: [], missing: '', degraded: false };
            }
            const id = rid.id;
            const plan = planReview(collectFacts(readStore(), id, getPasted, diskPeekChars));
            const lines = [
                `判定：${plan.typeName}（置信度 ${plan.confidence}）`,
                plan.reason,
                `将看：${plan.frame.join(' / ')}`,
                plan.available.length ? `素材：${plan.available.join(' · ')}` : ''
            ];
            for (const m of plan.missing)
                lines.push(`缺少：${m.what}（${m.why}）→ ${m.how}`);
            if (plan.degraded)
                lines.push(`注意：素材不足，这次是降级版。${plan.degradeReason ?? ''}`);
            if (plan.candidates.length)
                lines.push(`也可以判成：${plan.candidates.map((c) => c.name).join('、')}——最终由用户选。`);
            return {
                text: lines.filter(Boolean).join('\n'),
                type: plan.type,
                typeName: plan.typeName,
                confidence: plan.confidence,
                frame: plan.frame,
                available: plan.available,
                missing: plan.missing.map((m) => `${m.what}：${m.how}`).join('\n'),
                degraded: plan.degraded
            };
        }
    });
    const participationTool = defineTool({
        name: 'tm_review_participation',
        description: '一场会的参与者贡献分析：谁发言多少（段数/字数/占比）、谁没说话。数据来自本机已有的逐字稿与名单，不额外打腾讯接口。用户问「谁没说话」「谁在主导」时用。',
        parameters: { meetingId: { type: 'string', required: true, description: '会议 ID 或会议号（必填，两者都行）' } },
        output: textOut({
            speakers: { type: 'array', items: { type: 'object', additionalProperties: true } },
            silent: { type: 'array', items: { type: 'string' } },
            rosterMissing: { type: 'boolean' }
        }, ['speakers', 'silent', 'rosterMissing']),
        isConcurrencySafe: () => true,
        presentCall: () => ({ card: 'generic', title: '看参与者贡献' }),
        async execute(rawArgs) {
            const args = rawArgs;
            const rid = await resolveMeetingId(args.meetingId);
            if (!rid.ok)
                return { text: rid.text, speakers: [], silent: [], rosterMissing: true };
            const id = rid.id;
            const st = readStore();
            const pasted = getPasted(id, 'transcript');
            const view = (diskPeekView(`${id}:transcript`) ?? {});
            const chunks = pasted ? [{ text: pasted.text }] : Array.isArray(view.chunks) ? view.chunks : [];
            const roster = (st.localParticipants[`people:${id}`] ?? []).map((n) => ({
                key: `local:${n}`,
                nickname: n,
                fromLocal: true
            }));
            const p = analyzeParticipation(chunks, roster);
            if (!p.totalChunks) {
                return { text: '这场会还没有可用的逐字稿，算不了贡献分布。', speakers: [], silent: [], rosterMissing: p.rosterMissing };
            }
            const lines = p.rows.map((r) => `- ${r.speaker}：${r.chunks} 段 · ${r.chars} 字 · 占比 ${Math.round(r.share * 100)}%`);
            if (p.silent.length)
                lines.push(`名单内未发声：${p.silent.join('、')}`);
            if (p.rosterMissing)
                lines.push('（本机没有参会人名单，只能按逐字稿里出现的发言人统计）');
            return { text: lines.join('\n'), speakers: p.rows, silent: p.silent, rosterMissing: p.rosterMissing };
        }
    });
    return [
        statusTool,
        listTool,
        getTool,
        createTool,
        updateTool,
        cancelTool,
        searchTool,
        recordTool,
        briefTool,
        participantsTool,
        outputTool,
        infoTool,
        reviewPlanTool,
        participationTool
    ];
}
export function registerTools(ctx, cfg) {
    const tools = ctx.get?.('tools');
    if (!tools || typeof tools.register !== 'function')
        return () => { };
    const defs = buildTools(ctx, cfg);
    const disposers = [];
    for (const def of defs) {
        try {
            const d = tools.register(def);
            if (typeof d === 'function')
                disposers.push(d);
        }
        catch (e) {
            console.warn(`[tmeet] 工具 ${def?.name} 注册失败：${e?.message ?? String(e)}`);
        }
    }
    return () => {
        while (disposers.length) {
            try {
                disposers.pop()?.();
            }
            catch {
                /* 反注册失败不影响卸载 */
            }
        }
    };
}
