/**
 * tmeet 子命令的参数拼装。
 * 原则：所有「可能被企业策略覆盖」的写参数都在这里显式给出，绝不留空交给 CLI 默认值。
 * 参数名一律以 `tmeet <group> <cmd> --help` 实测为准。
 */
import { type ExecOptions } from './exec.js';
import type { TmeetError } from './errors.js';
export interface Rec<T = any> {
    ok: boolean;
    data?: T;
    error?: TmeetError;
    /** 服务端分页令牌 */
    nextCursor?: string;
}
export interface AuthStatus {
    loggedIn: boolean;
    account: string;
    openId: string;
    /** 令牌剩余毫秒；未知为 null */
    accessRemainingMs: number | null;
    refreshRemainingMs: number | null;
    raw: string;
}
/**
 * auth status 的特殊处理：未登录时是纯文本 + 退出码 0，且没有 JSON 信封。
 * 因此这里直接用 runRaw 读文本，不按 JSON 解析。
 */
export declare function authStatus(opts?: ExecOptions): Promise<Rec<AuthStatus>>;
export declare function authLogout(opts?: ExecOptions): Promise<Rec<null>>;
export interface RawMeeting {
    meeting_id?: string;
    meeting_code?: string;
    subject?: string;
    start_time?: string;
    end_time?: string;
    meeting_type?: string | number;
    sub_meeting_id?: string;
    join_url?: string;
    records?: any[];
    records_total_count?: number;
    minute_total_count?: number;
    minutes?: any[];
    settings?: Record<string, unknown>;
    [k: string]: unknown;
}
export declare function listUpcoming(args: {
    limit?: number;
    cursor?: string;
    days?: number;
}, opts?: ExecOptions): Promise<Rec<RawMeeting[]>>;
export declare function listEnded(args: {
    limit?: number;
    cursor?: string;
    start?: string;
    end?: string;
}, opts?: ExecOptions): Promise<Rec<RawMeeting[]>>;
export declare function searchMeetings(args: {
    query: string;
    limit?: number;
    cursor?: string;
    start?: string;
    end?: string;
}, opts?: ExecOptions): Promise<Rec<RawMeeting[]>>;
export declare function getMeeting(args: {
    meetingId?: string;
    meetingCode?: string;
}, opts?: ExecOptions): Promise<Rec<RawMeeting>>;
export interface CreateInput {
    subject: string;
    start: string;
    end: string;
    autoRecordType: 'none' | 'local' | 'cloud';
    autoAsr: boolean;
    password?: string;
    joinType?: 1 | 2 | 3;
    meetingType?: 0 | 1;
    waitingRoom?: boolean;
    timezone?: string;
    inviteeOpenIds?: string[];
}
export declare function createMeeting(input: CreateInput, opts?: ExecOptions): Promise<Rec<RawMeeting>>;
export interface UpdateInput {
    meetingId: string;
    subMeetingId?: string;
    subject?: string;
    start?: string;
    end?: string;
    autoRecordType?: 'none' | 'local' | 'cloud';
    autoAsr?: boolean;
    password?: string;
    joinType?: 1 | 2 | 3;
    waitingRoom?: boolean;
    timezone?: string;
}
export declare function updateMeeting(input: UpdateInput, opts?: ExecOptions): Promise<Rec<RawMeeting>>;
export declare function cancelMeeting(args: {
    meetingId: string;
    meetingType?: 0 | 1;
    subMeetingId?: string;
}, opts?: ExecOptions): Promise<Rec<null>>;
export declare function listInvitees(args: {
    meetingId: string;
    cursor?: string;
}, opts?: ExecOptions): Promise<Rec<Array<{
    openId: string;
    nickname?: string;
}>>>;
export declare function mutateInvitees(args: {
    meetingId: string;
    action: 'add' | 'remove' | 'replace';
    openIds: string[];
}, opts?: ExecOptions): Promise<Rec<null>>;
export declare function searchRecords(args: {
    meetingId?: string;
    meetingCode?: string;
    start?: string;
    end?: string;
}, opts?: ExecOptions): Promise<Rec<any[]>>;
export declare function recordAddress(args: {
    meetingRecordId: string;
}, opts?: ExecOptions): Promise<Rec<any[]>>;
export type ContentAction = 'minutes' | 'todos' | 'transcript' | 'paragraphs' | 'timeline';
/**
 * 各 action 支持的参数不同，传错会被 CLI 直接拒
 * （实测：`--meeting-id is not supported by --action timeline`）。
 * 所以 --meeting-id 只在 transcript / paragraphs 这两种形态上带。
 */
export declare function recordContent(args: {
    action: ContentAction;
    recordFileId: string;
    meetingId?: string;
}, opts?: ExecOptions): Promise<Rec<any>>;
export declare function permissionApply(args: {
    meetingRecordId: string;
    commit: boolean;
    meetingId?: string;
}, opts?: ExecOptions): Promise<Rec<any>>;
export declare function yuanbaoMinutes(args: {
    meetingId: string;
    subMeetingId?: string;
}, opts?: ExecOptions): Promise<Rec<any>>;
export declare function reportParticipants(args: {
    meetingId: string;
    subMeetingId?: string;
    limit?: number;
}, opts?: ExecOptions): Promise<Rec<any[]>>;
export declare function lookupContact(args: {
    email?: string;
    phone?: string;
}, opts?: ExecOptions): Promise<Rec<Array<{
    openId: string;
    nickname?: string;
}>>>;
export declare function eventList(opts?: ExecOptions): Promise<Rec<Array<{
    key: string;
    domain: string;
    description: string;
}>>>;
export declare function eventStatus(opts?: ExecOptions): Promise<Rec<any>>;
export declare function controlMembers(args: {
    action: 'call' | 'kick' | 'waiting-room';
    meetingId: string;
    openIds: string[];
}, opts?: ExecOptions): Promise<Rec<null>>;
