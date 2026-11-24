import type { Context } from '@deepseek-ai/cordis';
import type { ContentStates, PersonRow } from './shared/types.js';
import { type OutputKind } from './shared/types.js';
import * as meetings from './services/meetings.js';
export declare const ROUTE_PREFIX = "/tmeet/api";
export interface RouteDeps {
    ctx: Context;
    getConfig: () => {
        binary: string;
        timeoutMs: number;
        expectedVersion: string;
        autoInstall: boolean;
    };
}
export declare function installStatus(): {
    installing: boolean;
    lastMessage: string;
};
export declare function registerRoutes(deps: RouteDeps): () => void;
/** 邀请文案：必须给绝对时间，不许「今天/明天」 */
export declare function buildInviteText(detail: {
    brief: {
        subject: string;
        startTime: string;
        endTime: string;
        meetingCode: string;
        joinUrl?: string;
    };
}): string;
/** 供工具层复用的「会议 + 状态 + 产出」组合读取 */
export declare function readMeetingBundle(deps: {
    binary: string;
    timeoutMs: number;
}, meetingId: string): Promise<{
    detail?: meetings.DetailResult['detail'];
    states?: ContentStates;
    outputs?: Partial<Record<OutputKind, unknown>>;
    rows?: PersonRow[];
    error?: string;
}>;
