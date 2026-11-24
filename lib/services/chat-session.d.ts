import type { Context } from '@deepseek-ai/cordis';
import { type OutputKind } from '../shared/types.js';
/** 所有会议的工作区根目录（在插件数据目录下，不污染用户的工作区） */
export declare function workspaceRoot(): string;
export declare function meetingDir(meetingId: string): string;
export interface MeetingMaterial {
    meetingId: string;
    subject: string;
    timeRange?: string;
    meetingCode?: string;
    transcript?: string;
    minutes?: string;
    todos?: string;
    outputs: Array<{
        kind: OutputKind;
        label: string;
        text: string;
    }>;
}
/** 读本机素材（零腾讯接口），组装成给 AI 看的材料 */
export declare function collectMaterial(input: {
    meetingId: string;
    subject: string;
    timeRange?: string;
    meetingCode?: string;
}): MeetingMaterial;
/** 把素材写成 Markdown 文件，放进该会的会话目录（AI 用 DSH 自带的读取工具就能看） */
export declare function writeMaterialFiles(dir: string, material: MeetingMaterial): void;
/** 素材里本机字数的摘要（给日志/界面用） */
export declare function materialSummary(material: MeetingMaterial): string;
export interface ChatSessionRef {
    /** 该会专属工作区（客户端用它让 DSH 自己开一个会话，避免 unknown session） */
    workspaceId: string;
    dir: string;
}
/**
 * 为一场会准备工作区：目录 + 本机素材文件 + 工作区注册。
 * 不自己建会话——交给 DSH 客户端在右侧栏打开它自己的完整对话。
 */
export declare function prepareChatSession(ctx: Context, input: {
    meetingId: string;
    subject: string;
    timeRange?: string;
    meetingCode?: string;
}): Promise<ChatSessionRef>;
/** 素材字数（供状态检查用） */
export declare function materialChars(meetingId: string): {
    transcript: number;
    minutes: number;
};
/**
 * DSH 客户端打开会话后，把这场会的本机资料作为第一条消息投进去，
 * 让 AI 开口就知道这场会（否则是个空白新会话，什么都不知道）。
 *
 * sessionId 由客户端在 openWorkspace 的 beforeOpen 钩子里给出——那是宿主刚建好的会话，
 * 最可靠。不要再用 cwd 反查：会话的 cwd 是「腾讯会议」工作区根目录，不是该场会的子目录，
 * 按会议子目录找永远找不到（这就是「打开只有空白会话」的根因）。
 */
export declare function seedMeetingChat(ctx: Context, meetingId: string, sessionId?: string): Promise<{
    seeded: boolean;
    sessionId?: string;
    message?: string;
}>;
