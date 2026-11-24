import { randomUUID } from 'node:crypto';
function svc(ctx, name) {
    try {
        return ctx.get?.(name);
    }
    catch {
        return undefined;
    }
}
/**
 * 只取「最后一条」助手正文。
 * 不能把整轮的文本拼起来：模型在中途会说「先去找找本机统计」这类过程话，
 * 拼进来会把过程话和最终报告混在一起（实测产出过只有一句过程话的「报告」）。
 */
function lastAssistantText(records) {
    let last = '';
    for (const r of records ?? []) {
        const ev = r?.event ?? r;
        if (String(ev?.type ?? '') !== 'assistant/message')
            continue;
        const content = ev?.data?.message?.content ?? ev?.data?.content ?? ev?.message?.content;
        if (!Array.isArray(content))
            continue;
        const text = content
            .filter((b) => b?.type === 'text')
            .map((b) => String(b?.text ?? ''))
            .join('')
            .trim();
        if (text)
            last = text;
    }
    return last;
}
/** 当前 DSH 默认模型标签，仅用于产出标注 */
function defaultModelLabel(ctx) {
    try {
        const sel = svc(ctx, 'agentDefaultModel')?.currentSelection?.();
        if (sel && sel.model)
            return String(sel.model);
    }
    catch {
        /* 读不到就空 */
    }
    return '';
}
function modelLabel(ctx, preset) {
    if (preset)
        return `agent:${preset}`;
    const def = defaultModelLabel(ctx);
    return def ? `DSH 默认:${def}` : 'DSH 默认模型';
}
export async function harnessGenerate(ctx, input) {
    const sc = svc(ctx, 'sessionController');
    if (!sc || typeof sc.prompt !== 'function') {
        return { ok: false, text: '', model: '', message: '当前 DSH 没有会话控制器，生成不了。请升级 DSH。' };
    }
    const label = modelLabel(ctx, input.agentPreset || '');
    const sessionId = `tmeet-gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
        const created = await sc.create({
            sessionId,
            cwd: process.cwd(),
            agentPreset: input.agentPreset || undefined
        });
        const sid = String(created?.sessionId || sessionId);
        // prompt/wait 的第二个参数是 AbortSignal，必须给（DSH 内部会直接调 signal.throwIfAborted()）
        const ctrl = new AbortController();
        if (input.signal) {
            if (input.signal.aborted)
                ctrl.abort();
            else
                input.signal.addEventListener('abort', () => ctrl.abort(), { once: true });
        }
        const signal = ctrl.signal;
        const task = `【系统指令】\n${input.system}\n\n【任务】\n${input.prompt}`;
        await sc.prompt({
            requestId: randomUUID(),
            sessionId: sid,
            mode: 'queue',
            content: [{ type: 'text', text: task }]
        }, signal);
        // 等这场对话安静下来（turn 结束），而不是盲等一个固定时长：
        // 模型快就早拿结果，慢就给足时间；总时长用总期限兜底，避免永远挂着。
        const totalMs = input.timeoutMs ?? 300_000;
        const deadline = Date.now() + totalMs;
        let wait = undefined;
        for (;;) {
            const remaining = deadline - Date.now();
            if (remaining <= 0)
                break;
            wait = await sc.wait({
                sessionId: sid,
                timeoutMs: Math.min(remaining, 30_000),
                maxMessages: 200
            }, signal);
            if (!wait || wait.reason !== 'timeout')
                break;
        }
        const text = lastAssistantText(wait?.output?.records ?? []);
        if (text)
            return { ok: true, text, model: label };
        if (input.signal?.aborted)
            return { ok: false, text: '', model: label, message: '已取消生成。' };
        const reason = String(wait?.reason ?? '');
        return {
            ok: false,
            text: '',
            model: label,
            message: reason === 'timeout'
                ? '模型跑了 10 分钟仍没给出正文（长会 + 爱思考的模型容易这样）。换个更快的模型再试，或把逐字稿粘短一点。'
                : `助手没有返回内容（${reason || '未知原因'}）。`
        };
    }
    catch (e) {
        const msg = e?.message ?? String(e);
        return { ok: false, text: '', model: label, message: `生成失败：${msg.slice(0, 200)}` };
    }
    finally {
        // 一次性产出不留会话：归档（日志按 DSH 设计保留）
        try {
            const ws = svc(ctx, 'workspaceRegistry');
            await ws?.archiveSession?.(sessionId, { stopActivity: true });
        }
        catch {
            /* 归档失败不影响结果 */
        }
    }
}
