import z from '@deepseek-ai/schemastery';
import { registerRoutes, installStatus } from './routes.js';
import { registerSkills } from './skills.js';
import { registerTools } from './tools.js';
import { EXPECTED_VERSION } from './cli/locate.js';
import { setDailyBudget } from './cli/exec.js';
export const name = 'dsh-tencent-meeting';
/** Cordis 服务依赖：没它 ctx.tools / ctx.skills 会抛「without inject」 */
export const inject = ['tools', 'skills'];
/**
 * Schemastery 配置：全部有默认值，装完即用。
 * 必须用 `z.object({...})` 构造——cordis 会对 `Config` 调 `.validate()`，
 * 直接给普通对象会在插件激活时抛 `Cannot read properties of undefined (reading 'validate')`。
 */
export const Config = z.object({
    tmeetBinary: z.string().default('').description('腾讯会议组件路径，留空自动查找'),
    cliVersion: z.string().default(EXPECTED_VERSION).description('期望的组件版本'),
    requestTimeoutMs: z.number().default(20000).description('单条命令超时（毫秒）'),
    listCacheTtlMs: z.number().default(600000).description('会议列表快照有效期（毫秒）'),
    dailyCallBudget: z.number().default(60).description('本地粗略计数的单位（只计数不拦截，满了自动清零；腾讯真实每日上限是黑盒）')
});
function unwrap(v) {
    const anyV = v;
    if (anyV && typeof anyV === 'object' && typeof anyV.get === 'function') {
        try {
            return anyV.get();
        }
        catch {
            return undefined;
        }
    }
    return v;
}
export function apply(ctx, rawConfig) {
    const readCfg = () => ({
        tmeetBinary: String(unwrap(rawConfig?.tmeetBinary) ?? ''),
        cliVersion: String(unwrap(rawConfig?.cliVersion) ?? EXPECTED_VERSION) || EXPECTED_VERSION,
        requestTimeoutMs: Number(unwrap(rawConfig?.requestTimeoutMs)) || 20000,
        listCacheTtlMs: Number(unwrap(rawConfig?.listCacheTtlMs)) || 600000,
        dailyCallBudget: Number(unwrap(rawConfig?.dailyCallBudget)) || 60
    });
    // 用量闸门的上限来自配置：每次读配置时同步一次，改完不用重启
    const syncBudget = () => {
        setDailyBudget(readCfg().dailyCallBudget);
    };
    syncBudget();
    const forTools = () => {
        const c = readCfg();
        return { binary: c.tmeetBinary, timeoutMs: c.requestTimeoutMs, expectedVersion: c.cliVersion };
    };
    // 工具：注册进 ctx.tools，随插件卸载一起反注册
    ctx.effect(() => registerTools(ctx, forTools()), 'tmeet: tools');
    // 技能：同上
    ctx.effect(() => registerSkills(ctx), 'tmeet: skills');
    // HTTP：等 webServer 可用后挂 /tmeet/api 子树
    ctx.inject(['webServer'], (scoped) => {
        const dispose = registerRoutes({
            ctx: scoped,
            getConfig: () => {
                const c = readCfg();
                return {
                    binary: c.tmeetBinary,
                    timeoutMs: c.requestTimeoutMs,
                    expectedVersion: c.cliVersion
                };
            }
        });
        scoped.effect(() => dispose, 'tmeet: routes');
    });
}
/** 供自检脚本/工具层读安装进度 */
export { installStatus };
