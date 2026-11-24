import type { ContentStates } from '../shared/types.js';
import type { Ctx, ContentSignals } from './signals.js';
/** 本期订阅的事件；meeting.created/updated 不订阅，本地已知道 */
export declare const SUBSCRIBED_EVENTS: readonly ["meeting.started", "meeting.end", "recording.completed", "smart.transcripts", "smart.minutes"];
export type EventKey = (typeof SUBSCRIBED_EVENTS)[number];
/** 广播给浏览器的最小事件：只有会议 id 与事件类型，不含任何个人信息 */
export interface PushEvent {
    meetingId: string;
    eventKey: string;
    at: string;
    /** 回读后的真实状态（可选，省一次客户端请求） */
    states?: ContentStates;
    /** 实时同步是否已降级 */
    degraded?: boolean;
}
export interface EventDeps {
    ctx: Ctx;
    /** 状态变化后广播；实现里只发 meetingId + eventKey + states */
    broadcast: (e: PushEvent) => void;
    /** 需要通知用户的信号（转写就绪等），返回是否已通知 */
    notify?: (input: {
        meetingId: string;
        recordFileId: string;
    }) => boolean;
    /** 覆盖信号采集（测试用） */
    collect?: (ctx: Ctx, meetingId: string, only?: string[]) => Promise<{
        ok: boolean;
        data?: ContentSignals;
    }>;
}
export declare function subscribe(fn: (e: PushEvent) => void): () => void;
export declare function listenerCount(): number;
export declare function isDegraded(): boolean;
export declare function eventStatus(): {
    running: boolean;
    consumers: number;
    degraded: boolean;
    failures: number;
};
/** 从事件 payload 里只取 meeting_id，其余字段一律不读 */
export declare function extractMeetingId(payload: unknown): string | null;
/** 启动订阅。bus 由第一个 consume 拉起，后续 key 复用同一条连接。 */
export declare function startEventConsumers(deps: EventDeps): void;
/** 停止全部订阅并回收 bus。插件卸载必须走这里。 */
export declare function stopEventConsumers(): Promise<void>;
/** 手动触发一次回读（用户点「刷新状态」），复用同一套派生与广播 */
export declare function refreshMeeting(deps: EventDeps, meetingId: string): Promise<ContentStates | null>;
/** 供测试断言 */
export declare function eventRuntimeSnapshot(): {
    consumers: number;
    listeners: number;
    degraded: boolean;
};
/** 广播一条本地事件（例如建会成功后让列表立刻刷新） */
export declare function emitLocal(meetingId: string, eventKey?: string): void;
