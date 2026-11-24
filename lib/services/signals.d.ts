/**
 * 内容信号层（移植 superIR `tmeetState.ts` 的实测结论）。
 *
 * 三条铁律，全部来自 superIR 的实测陷阱：
 *  1. 就绪只认「真的取到了内容」，不认腾讯的标记字段（has_transcript_content 实测不可信）。
 *  2. 500260 / 30002 都是「还没转完」，不是取数失败；判成终态会让用户永远等不到页签打开。
 *  3. timeline 有 status 不代表有内容，必须判数组非空。
 *
 * 事件只当触发器：收到事件后一律回读本文件的结果再改界面，绝不拿 payload 更新状态。
 */
import type { ContentStates, ReplayState } from '../shared/types.js';
import { type ContentAction } from '../cli/commands.js';
import type { TmeetError } from '../cli/errors.js';
export interface Ctx {
    binary: string;
    timeoutMs: number;
    signal?: AbortSignal;
}
/** 一条录制（v1.1.0 结构：注意 record search 没有 state 字段） */
export interface RecordItem {
    meeting_record_id?: string;
    record_file_id?: string;
    file_type?: string;
    duration_seconds?: number;
    /** 实测不可信：为 true 时转写可能仍为空，禁止用作就绪判据 */
    has_transcript_content?: boolean;
    has_smart_minutes?: boolean;
    permission_status?: string;
    state?: string;
}
export interface ContentSignals {
    /** 会前设置读回值（以 meeting get 的 settings 为准，不是建会提交值） */
    autoRecordType?: 'none' | 'local' | 'cloud';
    autoAsr?: boolean;
    /** 是否真的存在录制文件（会中手动开录也算） */
    hasRecord?: boolean;
    /** 录制是否已可看（record access 能取到非空地址） */
    recordPlayable?: boolean;
    /** 转写段落总数 */
    transcriptTotal?: number;
    /** 转写业务错误码：'500260' | '30002' */
    transcriptErrorCode?: string;
    /** 转写取数本身失败（网络/权限/CLI 坏了），与「云端还没转完」分开 */
    transcriptQueryFailed?: boolean;
    /** 正文是否真的取到且界面能渲染 */
    transcriptBodyReady?: boolean;
    timelineLength?: number;
    minutesLength?: number;
    /** record search 的 has_smart_minutes 标记，作为纪要就绪的辅助信号 */
    minutesFlag?: boolean;
    /** 录制访问权限 */
    permission?: 'granted' | 'denied' | 'approving' | 'rejected';
    /** 录制条目标识（提交查看申请的两步 CLI 依赖它） */
    meetingRecordId?: string;
    /** 腾讯原始 permission_status */
    permissionStatus?: string;
    /** 参会人是否可见（对方组织的会取不到） */
    participantsVisible?: boolean;
    gen?: Partial<ContentStates['gen']>;
}
export declare const DEFAULT_GEN: ContentStates['gen'];
export interface CollectOptions {
    /** 只回读指定维度（事件触发时用，省额度） */
    only?: SignalDimension[];
}
export type SignalDimension = 'record' | 'transcript' | 'timeline' | 'minutes' | 'participants' | 'settings';
/**
 * 回读一场会议的真实内容信号。
 * 只在「事件触发 / 用户点刷新 / 打开详情页」时调用，不在面板每次渲染时调用（额度纪律）。
 */
export declare function collectSignals(ctx: Ctx, meetingId: string, options?: CollectOptions): Promise<{
    ok: boolean;
    data?: ContentSignals;
    error?: TmeetError;
}>;
export declare function deriveContentStates(s: ContentSignals): ContentStates;
/** 徽标颜色语义：橙=等待、蓝=可用、红=失败、灰=终态无内容 */
export declare function replayBadge(state: ReplayState, longWait?: boolean): {
    text: string;
    tone: 'warn' | 'on' | 'fail' | 'term';
};
/** 事件只当触发器：把事件 key 映射到「该回读什么」 */
export declare function eventToRefetch(eventKey: string): {
    record: boolean;
    transcript: boolean;
    timeline: boolean;
    participants: boolean;
    minutes: boolean;
};
/** 就绪态单调化：只允许 waiting → ready，禁止 ready 回退成 waiting */
export declare function enforceMonotonic(prev: ContentStates | undefined, next: ContentStates): ContentStates;
/** 本地信号：打开详情页即派生，0 次 CLI 调用 */
export declare function localContentSignals(input: {
    records?: Array<Record<string, unknown>>;
    content: Record<string, {
        empty: boolean;
    }>;
    ended?: boolean;
    autoRecordType?: 'none' | 'local' | 'cloud';
    autoAsr?: boolean;
}): ContentSignals;
/** 供事件服务使用：把 store 里的本机就绪标记并入信号 */
export declare function mergeLocalReady(signals: ContentSignals, meetingId: string): ContentSignals;
export type { ContentAction };
