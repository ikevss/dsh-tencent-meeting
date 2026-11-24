/**
 * 复盘洞察 · 参与者贡献分析（纯计算，不花额度）
 *
 * 数据只来自已有的逐字稿段落与参会人名单，不额外打腾讯接口。
 * 价值点：一场会里「谁没说话」往往比「谁说了什么」更能说明问题，所以沉默者单独列。
 */
import type { PersonRow } from '../shared/types.js';
export interface ParticipationRow {
    speaker: string;
    /** 发言段数 */
    chunks: number;
    /** 发言总字数 */
    chars: number;
    /** 字数占比（0–1） */
    share: number;
}
export interface ParticipationResult {
    rows: ParticipationRow[];
    /** 名单里有、但逐字稿里没出声的人 */
    silent: string[];
    totalChunks: number;
    totalChars: number;
    /** 逐字稿里有没有可用的说话人字段 */
    speakerAvailable: boolean;
    /** 名单缺失时只能按发言人名统计 */
    rosterMissing: boolean;
}
export declare function analyzeParticipation(chunks: Array<{
    text: string;
    speaker?: string;
}>, roster?: PersonRow[]): ParticipationResult;
