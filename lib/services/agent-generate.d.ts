/**
 * 走 DSH agent harness 的一次性产出生成。
 *
 * 关键接口（DSH sessionController）：
 *  - create({ cwd, agentPreset, sessionId }) 建一个普通会话
 *  - prompt({ requestId, sessionId, mode, content }) 投递一条用户提示
 *  - wait({ sessionId, timeoutMs, maxMessages }) 等它安静下来并取回限定范围内的助手输出
 *
 * 为什么不用 `agent.followup`：那条路在插件上下文里拿不到已发布会话的写入权，
 * 消息进不了会话（实测会话日志只有 header 一条事件，生成永远超时）。
 * sessionController 是「显式恢复会话后投递」的正规入口。
 *
 * 失败就是失败，不静默降级回单发模型。
 */
import type { Context } from '@deepseek-ai/cordis';
export interface HarnessGenerateInput {
    system: string;
    prompt: string;
    agentPreset?: string;
    signal?: AbortSignal;
    /** 最多等多久拿结果（毫秒），超时按失败处理并归档 */
    timeoutMs?: number;
}
export interface HarnessGenerateResult {
    ok: boolean;
    text: string;
    /** 实际用的模型/预设标签，写进产出便于复现 */
    model: string;
    message?: string;
}
export declare function harnessGenerate(ctx: Context, input: HarnessGenerateInput): Promise<HarnessGenerateResult>;
