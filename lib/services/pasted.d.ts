/**
 * 素材补录：用户自己粘贴的逐字稿 / 纪要。
 *
 * 为什么需要（产品事实）：用户参加的会大部分是别人开的，对方不给云录制与转写，
 * 于是拉回来的会议里「逐字稿 / 纪要 / 参会人」大片空白，四类会后产出全都做不了。
 * 但产出的本质是「原文 → 结构」，原文不必来自腾讯——手机录音转出来的文字照样能出稿。
 *
 * 三条纪律：
 *  1. 只存本机（store.json），不上传、不进日志。
 *  2. 每条素材必须记来源与时间；产出里要写「据用户提供的原文生成」，不许伪装成腾讯数据。
 *  3. 覆盖前必须确认（由界面负责二次确认，服务端只按 commit 执行）。
 */
import type { ContentKind } from './records.js';
import { type PastedMaterial } from './store.js';
export type PastedKind = Extract<ContentKind, 'transcript' | 'minutes' | 'todos'>;
export declare const PASTED_KINDS: PastedKind[];
export declare function pastedKey(meetingId: string, kind: PastedKind): string;
export declare function getPasted(meetingId: string, kind: PastedKind): PastedMaterial | null;
/** 只列元信息（不含正文），用于界面显示「已粘贴 xx 字」 */
export declare function listPasted(meetingId: string): Array<{
    kind: PastedKind;
    at: string;
    source: string;
    chars: number;
}>;
export interface SavePastedInput {
    meetingId: string;
    kind: PastedKind;
    text: string;
    source?: string;
    /** 已有内容时要显式确认覆盖 */
    overwrite?: boolean;
}
export declare function savePasted(input: SavePastedInput): {
    ok: boolean;
    message: string;
    replaced: boolean;
};
export declare function deletePasted(meetingId: string, kind: PastedKind): {
    ok: boolean;
    message: string;
};
/** 把粘贴的素材摊平成可读文本，供产出与简报使用 */
export declare function pastedAsText(meetingId: string): {
    transcript?: string;
    minutes?: string;
    todos?: string;
    sources: string[];
};
