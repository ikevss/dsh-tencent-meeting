export interface QuotaState {
    /** 本地日期 YYYY-MM-DD */
    date: string;
    used: number;
    budget: number;
}
export interface QuotaSnapshot extends QuotaState {
    remaining: number;
    exhausted: boolean;
}
export declare function readQuota(budget?: number): QuotaSnapshot;
/** 这条子命令是否真的打腾讯的接口（打才计数） */
export declare function isNetworkCommand(args: string[]): boolean;
/**
 * 发请求前计一次数。
 * 腾讯的真实每日上限是黑盒，本地数字只是粗略估计，所以这里**从不拒绝**请求：
 * 计满了就自动清零重新计，不提示、不拦截。真撞上腾讯的 500246，由错误码单独如实提示。
 */
export declare function tryConsume(budget?: number): {
    allowed: boolean;
    snapshot: QuotaSnapshot;
};
/** 重置计数（用户换账号或第二天） */
export declare function resetQuota(budget?: number): QuotaSnapshot;
