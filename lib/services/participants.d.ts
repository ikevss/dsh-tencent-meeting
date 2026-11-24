/**
 * 参会人服务。
 *
 * 两个来源合并成一张表：
 *  1. 腾讯 `report participants`（只给 open_id / nickname / 进出时间）；
 *  2. 本机手工补充（对方组织的会看不到名单时，用户自己存档用 —— 这是产品明确要求的）。
 * AI 认人（从逐字稿里认人）在 v1 里只做「补名字」，不做联系人库匹配。
 */
import type { PersonRow } from '../shared/types.js';
import type { TmeetError } from '../cli/errors.js';
export interface Ctx {
    binary: string;
    timeoutMs: number;
    signal?: AbortSignal;
    /** 供 AI 认人使用的模型调用（可为空，空则只做本地合并） */
    recognize?: (transcript: string, known: string[]) => Promise<Array<{
        name: string;
        view: string;
    }>>;
    /** 读逐字稿正文（认人要用），为空则跳过 AI 认人 */
    readTranscript?: (meetingId: string) => Promise<string>;
}
export interface ParticipantsResult {
    ok: boolean;
    rows: PersonRow[];
    warning?: string;
    error?: TmeetError;
}
/** 读名单：腾讯侧失败不报错，降级成「只有本地补充」并给一句提示 */
export declare function listParticipants(ctx: Ctx, args: {
    meetingId: string;
    subMeetingId?: string;
}): Promise<ParticipantsResult>;
export interface MutateResult {
    ok: boolean;
    rows: PersonRow[];
    error?: string;
}
/** 本机名单增删/覆盖（写本地，不碰腾讯） */
export declare function mutateLocal(args: {
    meetingId: string;
    action: 'add' | 'remove' | 'replace';
    names: string[];
}): MutateResult;
/**
 * AI 认人：把「名单里的人」和「逐字稿里的说话人」对上，并概括每个人在这场会的观点。
 * 没有模型能力时返回空结果，界面上的按钮会说明原因（不静默失败）。
 */
export declare function recognizeParticipants(ctx: Ctx, args: {
    meetingId: string;
}): Promise<{
    ok: boolean;
    rows: PersonRow[];
    added: number;
    matched: number;
    message?: string;
}>;
