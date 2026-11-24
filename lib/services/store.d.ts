import type { MeetingBrief, OutputView } from '../shared/types.js';
export interface Snapshot {
    /** 进行中/即将开始一次取回的结果 */
    upcoming: MeetingBrief[];
    upcomingFetchedAt: string | null;
    /** 历史会议（按窗口追加） */
    history: MeetingBrief[];
    syncedAt: string | null;
    /** 最早已经取到的时间点，用于「加载更早」 */
    historyFrom: string | null;
    noMoreHistory: boolean;
}
export interface StoreShape {
    /** 每次登录的账号 open_id，用于换号时判断要不要清本地 */
    accountOpenId: string;
    snapshot: Snapshot;
    /** 本机已取回非空逐字稿的 meeting_id 集合（列表标签与筛选共用） */
    transcriptReady: string[];
    /** 本机手工补充的参会人：meetingId → 姓名数组 */
    localParticipants: Record<string, string[]>;
    /** 已生成的会后产出：`${meetingId}:${kind}` → 产出 */
    outputs: Record<string, OutputView>;
    /** 正文缓存索引（只记 fetchedAt，正文按需重取，避免把上万字塞进 JSON） */
    contentIndex: Record<string, string>;
    /**
     * 用户自行粘贴的会后素材：`${meetingId}:${kind}` → 内容。
     *
     * 为什么要有：用户参加的会大部分是别人开的，对方不给录制与转写，
     * 于是「逐字稿 / 纪要」全空，四类产出全都做不了。
     * 而产出本质是「原文 → 结构」，原文不必来自腾讯——用户手上的录音转文字照样能出稿。
     * 这部分只存本机，不上传；界面与产出里必须标明来源是用户提供。
     */
    pastedMaterials: Record<string, PastedMaterial>;
    /**
     * 本机记下的入会密码：只有用户在本插件里建会/改会时填过才有。
     * 腾讯接口不回传密码，所以别处建的会这里就是空的——界面上会如实说「有密码但不知道」。
     */
    localPasswords: Record<string, string>;
}
export interface PastedMaterial {
    /** 原文正文 */
    text: string;
    /** 粘贴时间（ISO） */
    at: string;
    /** 用户声明的来源，例如「手机录音转文字」 */
    source: string;
    /** 字数，列表里显示用（避免每次都把正文读出来） */
    chars: number;
}
export declare function pluginDataDir(): string;
export declare function emptyStore(): StoreShape;
export declare function readStore(): StoreShape;
export declare function writeStore(mutate: (draft: StoreShape) => void): StoreShape;
/** 清空某个账号的全部本地数据（切换账号时用户勾选「清除会议记录」走这里） */
export declare function purgeAccount(): {
    meetings: number;
    outputs: number;
};
/** 列表快照是否新鲜（用于「今天还没同步过」的判断） */
export declare function snapshotFresh(ttlMs: number): boolean;
/** 增量维护「已取回逐字稿」的 id 集合 */
export declare function markTranscriptReady(meetingId: string, ready: boolean): void;
export declare function transcriptReadySet(): Set<string>;
