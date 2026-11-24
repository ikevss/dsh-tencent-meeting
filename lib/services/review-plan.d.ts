/**
 * 复盘洞察 · 规则层（纯函数，不花模型额度）
 *
 * 职责边界（写死，别越界）：
 *  - 只做「查表 + 计数 + 阈值」：类型初判、素材完整度、版面降级判定。
 *  - 不做归纳、不做评价、不替用户拍板——判定结果只是建议，生成前必须让用户确认或改选。
 *
 * 17 类来自 ikevss-tencentmeeting 的分析框架，仅用于复盘侧（建会模板不做，用户已明确）。
 */
export interface ReviewTypeDef {
    id: string;
    name: string;
    /** 命中即算特征，按数组顺序优先 */
    keywords: string[];
    /** 这类会该看的框架（生成时按此组织） */
    frame: string[];
    /** 这类会的核心洞察方向 */
    insight: string;
}
/** 顺序即优先级：高优先级先命中；「路演+投资人」判 2，「路演+客户」判 16 */
export declare const REVIEW_TYPES: ReviewTypeDef[];
export declare const GENERIC_TYPE: ReviewTypeDef;
export interface ReviewPlanInput {
    subject: string;
    /** 素材开头若干字，用于辅助判类（可为空） */
    materialHead?: string;
    hasTranscript: boolean;
    transcriptChars: number;
    hasMinutes: boolean;
    participantCount: number;
    hasTimeline: boolean;
    durationMin?: number;
    providedByUser?: boolean;
    providedSource?: string;
}
export interface MissingItem {
    what: string;
    why: string;
    how: string;
}
export interface ReviewPlan {
    type: string;
    typeName: string;
    /** high=命中≥2词；medium=命中1词；low=没命中（走无特征或候选） */
    confidence: 'high' | 'medium' | 'low';
    /** 判定理由：命中了哪些词，或为什么判不出来 */
    reason: string;
    /** 候选类型（置信度低时给用户点） */
    candidates: Array<{
        id: string;
        name: string;
    }>;
    frame: string[];
    insight: string;
    available: string[];
    missing: MissingItem[];
    degraded: boolean;
    degradeReason?: string;
}
export declare function planReview(input: ReviewPlanInput): ReviewPlan;
export interface ReviewValidation {
    ok: boolean;
    issues: string[];
    marks: {
        引用: number;
        转写: number;
        概括: number;
        推断: number;
    };
}
/**
 * 校验模型出的复盘是否守了硬约束。
 * 这是「分层标注不靠模型自觉」的落地点：标记格式写死在提示词里，这里机器核查。
 */
export declare function validateReviewText(text: string): ReviewValidation;
export declare function typeById(id: string): ReviewTypeDef;
export interface BriefLike {
    meetingId: string;
    subject: string;
    hasTranscript?: boolean;
    startTime: string;
    endTime: string;
}
export interface ReviewStoreLike {
    snapshot: {
        upcoming: BriefLike[];
        history: BriefLike[];
    };
    contentIndex: Record<string, string>;
    localParticipants: Record<string, string[]>;
}
export interface PastedLike {
    chars: number;
    source: string;
}
export declare function collectFacts(store: ReviewStoreLike, id: string, getPasted: (id: string, kind: 'transcript' | 'minutes' | 'todos') => PastedLike | null, peek: (key: string) => number | null): ReviewPlanInput;
