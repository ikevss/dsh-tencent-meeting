/**
 * 错误码 → 中文文案。
 * 错误码来源（实测 + superIR 封装层长期沉淀）：
 *   500246 用量上限 / 190004 时间窗 >31 天 / 500249 无观看权限 /
 *   500282 该录制不接受申请 / 500260 无转写 / HTTP500+30002 无转写 /
 *   user config is empty 未登录 / user identity expired 过期
 */
export type ErrorCode = 'missing-cli' | 'missing-binary' | 'not-logged-in' | 'expired' | 'needs-upgrade' | 'rate-limited' | 'local-quota' | 'lock-busy' | 'plan-unsupported' | 'time-range' | 'permission' | 'permission-password' | 'not-transcribed' | 'timeout' | 'invalid-args' | 'network' | 'meeting-not-found' | 'unknown';
export interface TmeetError {
    code: ErrorCode;
    message: string;
    /** 原始串，只进日志/诊断，不进界面正文 */
    raw?: string;
}
export declare const ERROR_MESSAGES: Record<ErrorCode, string>;
export declare function codeOf(raw: string): ErrorCode;
export declare function errorOf(raw: string, override?: ErrorCode): TmeetError;
/** 未登录/过期的「下一步」：直接拼进工具返回与界面提示 */
export declare function loginGuidance(): string;
export declare function upgradeGuidance(currentVersion?: string): string;
/** 给工具与界面共用的「可照做」文案 */
export declare function explain(error: TmeetError, extra?: {
    version?: string;
}): string;
