export const ERROR_MESSAGES = {
    'missing-cli': '还没安装腾讯会议组件。',
    'missing-binary': '没找到腾讯会议组件，可能装在了别的位置。',
    'not-logged-in': '还没有登录腾讯会议。',
    expired: '腾讯会议登录已过期。',
    'needs-upgrade': '这个能力需要更新的腾讯会议组件。',
    'rate-limited': '腾讯会议组件今天的调用次数已经用完，请明天再试。',
    'local-quota': '为避免把腾讯的每日调用额度打空，这次请求在本地被拦下了。明天自动恢复，或在设置里调高上限。',
    'lock-busy': '上一次的授权进程还没退干净，占着凭证锁。已经帮你清掉残留进程，点「重新生成链接」再试一次即可。',
    'plan-unsupported': '这个功能需要更高版本的腾讯会议套餐（当前套餐不支持）。升级后即可使用。',
    'time-range': '查询时间范围不能超过 31 天。',
    permission: '这个录制你没有观看权限，需要录制所有者审批。',
    'permission-password': '该录制设置了访问密码，不接受权限申请。',
    'not-transcribed': '这场会议没有转写内容（可能没开自动转写，或还在转码）。',
    timeout: '腾讯会议组件响应超时，请稍后重试。',
    'invalid-args': '参数不对，请检查后重试。',
    network: '网络不通，取不到腾讯会议的数据。',
    'meeting-not-found': '没有找到这场会议（会议 ID 或会议号不存在）。',
    unknown: '腾讯会议组件返回了无法识别的结果。'
};
export function codeOf(raw) {
    const t = String(raw || '');
    if (!t)
        return 'unknown';
    if (/user config is empty|please use '?tmeet auth login'?|not logged in/i.test(t))
        return 'not-logged-in';
    if (/user identity expired|token (is )?expired|access ?token expired/i.test(t))
        return 'expired';
    if (/file lock timeout|token\.lock|lock timeout/i.test(t))
        return 'lock-busy';
    if (/500294|套餐不支持|升级专业版|not supported by current|plan.*not support/i.test(t))
        return 'plan-unsupported';
    if (/500246|usage limit|quota exceeded|调用次数/i.test(t))
        return 'rate-limited';
    if (/190004|greater than 31 days|31 days/i.test(t))
        return 'time-range';
    if (/500249|no permission to view|permission denied for this record/i.test(t))
        return 'permission';
    if (/500282|not accept.*appl|不接受申请/i.test(t))
        return 'permission-password';
    if (/500260|no transcript|transcript not (found|ready)|30002/i.test(t))
        return 'not-transcribed';
    // 实测：假会议 ID 返回 9003「会议信息不存在」，假会议号返回 500001「会议号无效」。要排在 HTTP 兜底之前
    if (/会议信息不存在|会议号无效|"error_code":\s*(9003|500001)\b/.test(t))
        return 'meeting-not-found';
    if (/ETIMEDOUT|ENOTFOUND|ECONNREFUSED|ECONNRESET|socket hang up|network/i.test(t))
        return 'network';
    if (/unknown flag|required flag|invalid argument|invalid value|must be/i.test(t))
        return 'invalid-args';
    if (/no such file|not found|command not found|ENOENT/i.test(t))
        return 'missing-binary';
    // 有 HTTP 状态但没拿到结构化错误：多半是权限/服务端拒了，不要报「无法识别的结果」吓人
    if (/http status[: ]?\d{3}|request failed/i.test(t))
        return 'network';
    return 'unknown';
}
export function errorOf(raw, override) {
    const code = override ?? codeOf(raw);
    return { code, message: ERROR_MESSAGES[code], raw: String(raw || '').slice(0, 1500) };
}
/** 未登录/过期的「下一步」：直接拼进工具返回与界面提示 */
export function loginGuidance() {
    return [
        '下一步：',
        '1. 在插件面板点「去授权」，会打开腾讯会议的授权页；',
        '2. 用企业微信或腾讯会议账号确认授权（凭证与这台机器绑定，只需授权一次）；',
        '3. 回到 DSH，面板会自动变成「已连接」。',
        '',
        '如果在终端里操作，也可以直接运行 tmeet auth login。'
    ].join('\n');
}
export function upgradeGuidance(currentVersion) {
    return [
        `当前组件版本：${currentVersion || '未知'}`,
        '需要的版本：1.1.0 及以上（读逐字稿、搜会议、看待办都要它）',
        '升级方式：在插件面板点「升级会议组件」，或手动执行',
        '  npm i -g @tencentcloud/tmeet@1.1.0'
    ].join('\n');
}
/** 给工具与界面共用的「可照做」文案 */
export function explain(error, extra) {
    const base = error.message;
    if (error.code === 'not-logged-in' || error.code === 'expired') {
        return `${base}\n\n${loginGuidance()}`;
    }
    if (error.code === 'needs-upgrade') {
        return `${base}\n\n${upgradeGuidance(extra?.version)}`;
    }
    if (error.code === 'missing-cli' || error.code === 'missing-binary') {
        return `${base}\n\n在插件面板点「安装会议组件」，或手动执行 npm i -g @tencentcloud/tmeet@1.1.0`;
    }
    return base;
}
