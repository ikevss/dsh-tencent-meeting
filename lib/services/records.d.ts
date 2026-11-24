/**
 * 录制内容服务：回放地址 / 逐字稿 / 时间轴 / 纪要 / 待办 / 权限申请。
 *
 * 关键实测结论（决定这里的实现）：
 *  - 云录制 state: 1 录制中 / 2 转码中 / 3 转码完成；**只有完成才返回文件列表**，
 *    所以「刚结束就能看回放」不成立。
 *  - 无转写有三种信号：500260、HTTP 500 + 30002、paragraphs 成功但 total=0。
 *  - 取录制内容要先有 record_file_id；权限类错误（500249/500282）是终态，要置 denied。
 */
import type { ContentStates, ContentView } from '../shared/types.js';
import type { TmeetError } from '../cli/errors.js';
export interface Ctx {
    binary: string;
    timeoutMs: number;
    signal?: AbortSignal;
}
export declare function clearContentCache(meetingId?: string): void;
export interface RecordRefs {
    /** 取正文用的文件 id */
    recordFileId: string;
    /** 申请权限/取地址用的录制条目 id */
    meetingRecordId: string;
    state: string;
    permissionStatus: string;
}
/**
 * 从会议详情/列表的 records 里挑出可用引用（可能分散在不同条目上）。
 * 两种键名都要认：CLI 原始返回是 snake_case，本插件转成 MeetingBrief 后是 camelCase。
 */
export declare function pickRecordRefs(records: Array<Record<string, unknown>> | undefined): RecordRefs;
/** 直接问一次 record search，补上列表里没有的录制引用 */
export declare function lookupRecordRefs(ctx: Ctx, args: {
    meetingId?: string;
    meetingCode?: string;
}): Promise<RecordRefs | null>;
export type ContentKind = ContentView['kind'];
export interface ContentResult {
    ok: boolean;
    view?: ContentView;
    error?: TmeetError;
}
export declare function content(ctx: Ctx, args: {
    meetingId: string;
    kind: ContentKind;
    recordFileId?: string;
    force?: boolean;
}): Promise<ContentResult>;
export interface StatesInput {
    meetingId: string;
    records?: Array<Record<string, unknown>>;
    ended: boolean;
    hasTranscript: boolean;
    hasTimeline: boolean;
    hasMinutes: boolean;
    gen: ContentStates['gen'];
    errorCode?: string;
}
export declare function deriveStates(input: StatesInput): ContentStates;
export interface ReplayResult {
    ok: boolean;
    url?: string;
    message: string;
    error?: TmeetError;
}
export declare function replayAddress(ctx: Ctx, args: {
    meetingRecordId?: string;
    meetingId?: string;
}): Promise<ReplayResult>;
export declare function applyPermission(ctx: Ctx, args: {
    meetingRecordId: string;
    commit: boolean;
    meetingId?: string;
}): Promise<{
    ok: boolean;
    message: string;
    error?: TmeetError;
}>;
