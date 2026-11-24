/**
 * Node 半入口。
 *
 * 只做三件事：声明依赖、注册（工具 / 技能 / HTTP 路由）、声明配置。
 * 硬规则：`apply()` 内零 spawn、零网络、零文件读取——所有外部动作都推迟到
 * 工具调用 / HTTP 请求 / 用户点按钮时发生，避免拖慢宿主启动。
 */
import type { Context } from '@deepseek-ai/cordis';
import { installStatus } from './routes.js';
export declare const name = "dsh-tencent-meeting";
/** Cordis 服务依赖：没它 ctx.tools / ctx.skills 会抛「without inject」 */
export declare const inject: string[];
export interface Config {
    /** tmeet 可执行文件路径；留空自动查找 */
    tmeetBinary: string;
    /** 期望的 CLI 版本（首装/升级用） */
    cliVersion: string;
    /** 首次使用前自动安装 CLI（默认开；关掉则回到手动点按钮） */
    autoInstall: boolean;
    /** 单条命令超时（毫秒） */
    requestTimeoutMs: number;
    /** 列表快照有效期（毫秒） */
    listCacheTtlMs: number;
    /** 每天允许的腾讯接口调用次数（本地闸门，到上限就不再发请求） */
    dailyCallBudget: number;
}
/**
 * Schemastery 配置：全部有默认值，装完即用。
 * 必须用 `z.object({...})` 构造——cordis 会对 `Config` 调 `.validate()`，
 * 直接给普通对象会在插件激活时抛 `Cannot read properties of undefined (reading 'validate')`。
 */
export declare const Config: new () => Config;
export declare function apply(ctx: Context, rawConfig: any): void;
/** 供自检脚本/工具层读安装进度 */
export { installStatus };
