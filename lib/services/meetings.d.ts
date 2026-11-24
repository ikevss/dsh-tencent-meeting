/**
 * 会议服务：列表快照、详情、建会/改会/取消、受邀人。
 *
 * 取数纪律（照 superIR 的教训）：
 *  - 列表读本地快照，只有 refresh / 首次进面板才真取；
 *  - 建会/改会后必须 `meeting get` 回读，因为企业策略会覆盖你提交的录制设置；
 *  - 时间窗一律钳到 ≤31 天。
 */
import type { MeetingBrief, MeetingDetailView, MeetingListPayload, MeetingSettings } from '../shared/types.js';
import { type RawMeeting } from '../cli/commands.js';
import type { TmeetError } from '../cli/errors.js';
export interface Ctx {
    binary: string;
    timeoutMs: number;
}
/**
 * 把一场会插进本地快照（同 id 覆盖），按开始时间倒序。
 * 写操作成功后用它就地更新列表——不再二次拉取腾讯接口，省额度也更快。
 */
export declare function upsertSnapshot(scope: 'upcoming' | 'ended', brief: MeetingBrief): void;
export interface ListArgs {
    scope?: 'upcoming' | 'ended';
    limit?: number;
    cursor?: string;
    query?: string;
    onlyTranscript?: boolean;
    refresh?: boolean;
    /** 「加载更早」用的起点（ISO）；不传就用快照里记录的最早时间 */
    before?: string;
}
export type ListResult = MeetingListPayload & {
    error?: string;
};
/**
 * 列表。三种模式：
 *  1. 读快照（默认，0 次调用）
 *  2. refresh=true：真取一次 upcoming + ended，写快照
 *  3. before=...：把历史窗再往前推 30 天（追加，不覆盖）
 */
export declare function list(ctx: Ctx, args: ListArgs, signal?: AbortSignal): Promise<ListResult>;
/** 关键词搜索：CLI 有时间窗限制，这里自动钳到 31 天并合并 list/list-ended 的结果 */
export declare function search(ctx: Ctx, args: {
    query: string;
    start?: string;
    end?: string;
    limit?: number;
}, signal?: AbortSignal): Promise<{
    ok: false;
    error: TmeetError | undefined;
    meetings?: undefined;
} | {
    ok: true;
    meetings: MeetingBrief[];
    error?: undefined;
}>;
/** 从设置对象里读回真实生效值（键名以实测的 meeting get 返回为准） */
export declare function settingsOf(raw: RawMeeting): MeetingSettings;
export interface DetailResult {
    ok: boolean;
    detail?: MeetingDetailView;
    error?: TmeetError;
}
export declare function invalidateDetail(meetingId?: string): void;
export declare function detail(ctx: Ctx, args: {
    meetingId?: string;
    meetingCode?: string;
}, signal?: AbortSignal): Promise<DetailResult>;
/** 需要受邀人时单独调（用在 `/meeting/invitees` 路由，不在每次详情里隐式触发） */
export declare function detailWithInvitees(ctx: Ctx, args: {
    meetingId?: string;
    meetingCode?: string;
}, signal?: AbortSignal): Promise<DetailResult>;
export interface CreateForm {
    subject: string;
    date: string;
    startTime: string;
    start?: string;
    end?: string;
    durationMinutes?: number;
    passwordEnabled?: boolean;
    password?: string;
    recurring?: boolean;
    joinLimit?: 1 | 2 | 3;
    cloudRecord?: boolean;
    autoTranscribe?: boolean;
    waitingRoom?: boolean;
    inviteeOpenIds?: string[];
    /** 仅本地留档：备注与类型不进腾讯请求 */
    note?: string;
    typeId?: string;
    timezone?: string;
}
/** 从「日期 + 开始时间 + 时长」推出起止 ISO（带本地时区偏移） */
export declare function resolveRange(form: CreateForm): {
    start: string;
    end: string;
} | {
    error: string;
};
export interface PreviewField {
    label: string;
    value: string;
}
/** 建会预览：只描述将要提交的内容，不发起任何调用 */
export declare function previewCreate(form: CreateForm): {
    ok: boolean;
    fields?: PreviewField[];
    text?: string;
    error?: string;
};
export interface WriteResult {
    ok: boolean;
    meeting?: MeetingBrief;
    detail?: MeetingDetailView;
    /** 被企业策略覆盖时，列出实际生效与提交不同的字段 */
    overridden?: string[];
    error?: TmeetError;
    message?: string;
}
export declare function create(ctx: Ctx, form: CreateForm, signal?: AbortSignal): Promise<WriteResult>;
export interface UpdatePatch {
    subject?: string;
    start?: string;
    end?: string;
    cloudRecord?: boolean;
    autoTranscribe?: boolean;
    waitingRoom?: boolean;
    joinLimit?: 1 | 2 | 3;
    passwordEnabled?: boolean;
    password?: string;
    note?: string;
    typeId?: string;
}
export declare function previewUpdate(before: MeetingDetailView, patch: UpdatePatch): {
    fields: PreviewField[];
    text: string;
};
export declare function update(ctx: Ctx, args: {
    meetingId: string;
    patch: UpdatePatch;
}, signal?: AbortSignal): Promise<WriteResult>;
export declare function cancel(ctx: Ctx, args: {
    meetingId: string;
    subMeetingId?: string;
}, signal?: AbortSignal): Promise<{
    ok: boolean;
    error?: TmeetError;
    message?: string;
}>;
export declare function invitees(ctx: Ctx, meetingId: string, signal?: AbortSignal): Promise<{
    ok: true;
    invitees: {
        openId: string;
        nickname?: string;
    }[];
    error?: undefined;
} | {
    ok: false;
    error: TmeetError | undefined;
    invitees?: undefined;
}>;
export declare function mutate(ctx: Ctx, args: {
    meetingId: string;
    action: 'add' | 'remove' | 'replace';
    openIds: string[];
}, signal?: AbortSignal): Promise<{
    ok: true;
    error?: undefined;
} | {
    ok: false;
    error: TmeetError | undefined;
}>;
