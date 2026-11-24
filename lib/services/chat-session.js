/**
 * 给一场会开一个「DSH 原生会话」，让 DSH 自己的 AI 对话窗来承接。
 *
 * 为什么这么做：插件自绘的对话窗既难维护、又拿不到 DSH 的模型选择/历史/工具链，
 * 用户体验和主程序不一致。DSH 的会话窗没有开放给插件内嵌的插槽，
 * 所以正确做法是：为每场会准备一个会话（cwd = 该会的素材目录），
 * 然后让客户端 `uiWorkspace.openSession(sessionId)` 打开它——用户看到的就是 DSH 原生窗口。
 *
 * 三条纪律：
 *  1. 素材全部读本机（快照 / 粘贴 / 磁盘缓存 / 已生成产出），不打腾讯接口。
 *  2. 同一场会复用同一个 sessionId，追问与历史都在 DSH 里。
 *  3. 会话的 agentPreset 跟随插件设置；工具用插件全局注册的 tm_* 工具。
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pluginDataDir } from './store.js';
import { getPasted, PASTED_KINDS } from './pasted.js';
import { listOutputs } from './outputs.js';
import { OUTPUT_LABELS } from '../shared/types.js';
import { diskPeekChars, diskPeekView } from './content-cache.js';
/** 所有会议的工作区根目录（在插件数据目录下，不污染用户的工作区） */
export function workspaceRoot() {
    return path.join(pluginDataDir(), 'workspace');
}
function safeSegment(raw) {
    const cleaned = String(raw || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    return cleaned || 'meeting';
}
export function meetingDir(meetingId) {
    return path.join(workspaceRoot(), safeSegment(meetingId));
}
/** 读本机素材（零腾讯接口），组装成给 AI 看的材料 */
export function collectMaterial(input) {
    const pasted = new Map();
    for (const kind of PASTED_KINDS) {
        const hit = getPasted(input.meetingId, kind);
        if (hit?.text)
            pasted.set(kind, hit.text);
    }
    const transcript = pasted.get('transcript') || diskPeekView(`${input.meetingId}:transcript`)?.plain;
    const minutes = pasted.get('minutes') || diskPeekView(`${input.meetingId}:minutes`)?.plain;
    const todos = pasted.get('todos');
    const outs = listOutputs(input.meetingId);
    const outputs = Object.keys(outs)
        .filter((k) => outs[k]?.text)
        .map((k) => ({ kind: k, label: OUTPUT_LABELS[k], text: String(outs[k].text) }));
    return {
        meetingId: input.meetingId,
        subject: input.subject,
        timeRange: input.timeRange,
        meetingCode: input.meetingCode,
        transcript,
        minutes,
        todos,
        outputs
    };
}
/** 把素材写成 Markdown 文件，放进该会的会话目录（AI 用 DSH 自带的读取工具就能看） */
export function writeMaterialFiles(dir, material) {
    fs.mkdirSync(dir, { recursive: true });
    const parts = [
        `# ${material.subject}`,
        '',
        `- 会议 id：${material.meetingId}`,
        material.timeRange ? `- 时间：${material.timeRange}` : '',
        material.meetingCode ? `- 会议号：${material.meetingCode}` : '',
        ''
    ];
    fs.writeFileSync(path.join(dir, '会议信息.md'), parts.filter(Boolean).join('\n'), 'utf8');
    if (material.transcript) {
        fs.writeFileSync(path.join(dir, '逐字稿.md'), `# 逐字稿\n\n${material.transcript}`, 'utf8');
    }
    else {
        fs.writeFileSync(path.join(dir, '逐字稿.md'), '# 逐字稿\n\n（本机没有逐字稿）\n', 'utf8');
    }
    if (material.minutes) {
        fs.writeFileSync(path.join(dir, '智能纪要.md'), `# 智能纪要\n\n${material.minutes}`, 'utf8');
    }
    if (material.todos) {
        fs.writeFileSync(path.join(dir, '待办.md'), `# 待办\n\n${material.todos}`, 'utf8');
    }
    for (const o of material.outputs) {
        const safe = o.label.replace(/[\\/:*?"<>|]/g, '_');
        fs.writeFileSync(path.join(dir, `产出-${safe}.md`), `# ${o.label}\n\n${o.text}`, 'utf8');
    }
    // 索引：让 AI 一眼知道目录里有什么
    const index = [
        '# 这场会的资料索引',
        '',
        `资料目录：${dir}`,
        '',
        '本目录是这场会的本机资料，全部来自插件本机数据（不含任何推测）。',
        '',
        `- 会议信息.md（主题/时间/会议号）`,
        `- 逐字稿.md（${material.transcript ? `${material.transcript.length} 字` : '无'}）`,
        `- 智能纪要.md（${material.minutes ? `${material.minutes.length} 字` : '无'}）`,
        `- 待办.md（${material.todos ? `${material.todos.length} 字` : '无'}）`,
        '',
        '已生成产出：',
        ...(material.outputs.length ? material.outputs.map((o) => `- 产出-${o.label}.md`) : ['（还没有）']),
        '',
        '纪律：只引用上面的本机资料；没有的就明说「资料里没有」，不要编数字或内容。需要其它会议时，用 tm_output_documents 之类工具读取本机数据。'
    ];
    fs.writeFileSync(path.join(dir, '会议索引.md'), index.join('\n'), 'utf8');
}
/** 素材里本机字数的摘要（给日志/界面用） */
export function materialSummary(material) {
    const tx = material.transcript ? `${material.transcript.length} 字` : '无';
    const mn = material.minutes ? `${material.minutes.length} 字` : '无';
    const td = material.todos ? `${material.todos.length} 字` : '无';
    return `逐字稿 ${tx}／纪要 ${mn}／待办 ${td}／产出 ${material.outputs.length} 份`;
}
/**
 * 为一场会准备工作区：目录 + 本机素材文件 + 工作区注册。
 * 不自己建会话——交给 DSH 客户端在右侧栏打开它自己的完整对话。
 */
export async function prepareChatSession(ctx, input) {
    const dir = meetingDir(input.meetingId);
    const material = collectMaterial(input);
    writeMaterialFiles(dir, material);
    // 固定一个「腾讯会议」工作区：先按路径找回，没有才建——否则每点一次就多一个同名工作区
    const registry = ctx.get?.('workspaceRegistry');
    if (!registry?.create) {
        throw new Error('这个环境没有工作区服务，开不了 AI 对话。');
    }
    let ws = null;
    try {
        ws = await registry.resolveByPath?.(workspaceRoot());
    }
    catch {
        ws = null;
    }
    if (!ws?.id)
        ws = await registry.create(workspaceRoot(), '腾讯会议');
    const workspaceId = String(ws?.id ?? '');
    if (!workspaceId)
        throw new Error('工作区创建失败，开不了 AI 对话。');
    return { workspaceId, dir };
}
/** 素材字数（供状态检查用） */
export function materialChars(meetingId) {
    return {
        transcript: diskPeekChars(`${meetingId}:transcript`) ?? 0,
        minutes: diskPeekChars(`${meetingId}:minutes`) ?? 0
    };
}
/** 自动发给 AI 的第一条消息：本场会的本机资料 + 让它主动引导用户 */
function buildSeedText(indexText) {
    return [
        '【本机资料｜这场会】',
        indexText,
        '',
        '这是腾讯会议插件自动带来的本场会资料。请先用一两句说清你拿到了什么（有哪几份、各多少字），',
        '再主动告诉用户可以直接让你做什么，例如：「这场会的结论」「还有哪些待办」「谁没说话」，',
        '或出一份产出（会议洞察分析 / 公司视角纪要 / 投资人视角纪要 / 复盘报告 / 问答清单）。',
        '只引用上面的本机资料；资料里没有的就说没有，不要编数字。'
    ].join('\n');
}
/**
 * DSH 客户端打开会话后，把这场会的本机资料作为第一条消息投进去，
 * 让 AI 开口就知道这场会（否则是个空白新会话，什么都不知道）。
 *
 * sessionId 由客户端在 openWorkspace 的 beforeOpen 钩子里给出——那是宿主刚建好的会话，
 * 最可靠。不要再用 cwd 反查：会话的 cwd 是「腾讯会议」工作区根目录，不是该场会的子目录，
 * 按会议子目录找永远找不到（这就是「打开只有空白会话」的根因）。
 */
export async function seedMeetingChat(ctx, meetingId, sessionId) {
    const sc = ctx.get?.('sessionController');
    if (!sc?.prompt)
        return { seeded: false, message: '这个环境没有会话服务，投不进去。' };
    let text = '';
    try {
        text = fs.readFileSync(path.join(meetingDir(meetingId), '会议索引.md'), 'utf8');
    }
    catch {
        return { seeded: false, message: '这场会还没准备资料，先刷新一下列表。' };
    }
    // 兜底：没拿到 sessionId 时，按工作区根目录找最近一个会话（旧宿主没有 beforeOpen 钩子）
    let sid = sessionId ? String(sessionId) : '';
    if (!sid) {
        try {
            const page = await sc.list({}, new AbortController().signal);
            const root = workspaceRoot();
            const hit = (page?.items ?? [])
                .filter((s) => String(s?.cwd ?? '') === root)
                .sort((a, b) => Number(b?.updatedAt ?? 0) - Number(a?.updatedAt ?? 0))[0];
            sid = String(hit?.sessionId ?? '');
        }
        catch {
            sid = '';
        }
    }
    if (!sid)
        return { seeded: false, message: 'AI 对话窗还没就绪，稍后再点一次。' };
    try {
        await sc.prompt({
            requestId: randomUUID(),
            sessionId: sid,
            mode: 'queue',
            content: [{ type: 'text', text: buildSeedText(text) }]
        }, new AbortController().signal);
        return { seeded: true, sessionId: sid };
    }
    catch (e) {
        return { seeded: false, sessionId: sid, message: e?.message || '投放失败，可以再发一次。' };
    }
}
