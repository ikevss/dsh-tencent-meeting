/**
 * 会后产出：四份，全部由 DSH 里配置的模型生成。
 *
 * 铁律（superIR 版的教训，照搬）：
 *  - 素材优先逐字稿，缺了才用腾讯纪要；两者都没有就直接说「没有可用素材」，不编。
 *  - 单场素材硬截断（6 万字），截断要在产出正文里注明。
 *  - 只写材料里出现的事实。
 */
import type { OutputKind, OutputView } from '../shared/types.js';
import type { Context } from '@deepseek-ai/cordis';
import type { ModelRef } from './agent-run.js';
export interface OutputDef {
    kind: OutputKind;
    title: string;
    /** 给模型的系统提示：角色 + 硬约束 */
    system: string;
    /** 正文里必须出现的段落名 */
    sections: string[];
}
export declare const OUTPUT_DEFS: Record<OutputKind, OutputDef>;
export interface Material {
    text: string;
    source: 'transcript' | 'minutes';
    truncated: boolean;
    chars: number;
    /** 素材是用户自己粘贴的原文（不是腾讯侧取回的），产出里必须写明来源 */
    providedByUser?: boolean;
    /** 用户声明的来源描述，例如「手机录音转文字」 */
    providedSource?: string;
}
/** 截断素材并标记；截断点在段落边界上，不切半句 */
export declare function trimMaterial(raw: string, source: Material['source']): Material;
/** 复盘的判定上下文：来自规则层（类型/框架/降级），决定生成时看什么 */
export interface ReviewContext {
    type: string;
    typeName: string;
    frame: string[];
    insight: string;
    degraded: boolean;
    available: string[];
    missing: Array<{
        what: string;
        why: string;
        how: string;
    }>;
}
export interface GenArgs {
    ctx: Context;
    meetingId: string;
    kind: OutputKind;
    meeting: {
        subject: string;
        timeRange: string;
        participants: string[];
    };
    material: Material;
    ref: ModelRef;
    agentPreset: string;
    signal?: AbortSignal;
    /** 仅 kind=review 时有：判定结果，让生成按对的框架看 */
    review?: ReviewContext;
}
export interface GenResult {
    ok: boolean;
    output?: OutputView;
    message?: string;
}
export declare function generateOutput(args: GenArgs): Promise<GenResult>;
export declare function listOutputs(meetingId: string): Partial<Record<OutputKind, OutputView>>;
export declare function deleteOutput(meetingId: string, kind: OutputKind): boolean;
/**
 * 写入一份产出（供 AI 对话工具回写）。
 * 模型字段标成「DSH 会话」，与插件内生成的区分开；来源按素材类型标注。
 */
export declare function writeOutput(meetingId: string, kind: OutputKind, text: string, source?: 'transcript' | 'minutes'): void;
/** 把已生成的产出拼成给工具返回值用的文本 */
export declare function outputAsText(view: OutputView): string;
