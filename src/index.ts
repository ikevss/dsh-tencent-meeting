/**
 * Node 半入口。
 *
 * 只做三件事：声明依赖、注册（工具 / 技能 / HTTP 路由）、声明配置。
 * 硬规则：`apply()` 内零 spawn、零网络、零文件读取——所有外部动作都推迟到
 * 工具调用 / HTTP 请求 / 用户点按钮时发生，避免拖慢宿主启动。
 */
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { registerRoutes, installStatus } from './routes.js'
import { registerSkills } from './skills.js'
import { registerTools } from './tools.js'
import { EXPECTED_VERSION } from './cli/locate.js'
import { setDailyBudget } from './cli/exec.js'

export const name = 'dsh-tencent-meeting'

/** Cordis 服务依赖：没它 ctx.tools / ctx.skills 会抛「without inject」 */
export const inject = ['tools', 'skills']

export interface Config {
  /** tmeet 可执行文件路径；留空自动查找 */
  tmeetBinary: string
  /** 期望的 CLI 版本（首装/升级用） */
  cliVersion: string
  /** 单条命令超时（毫秒） */
  requestTimeoutMs: number
  /** 列表快照有效期（毫秒） */
  listCacheTtlMs: number
  /** 每天允许的腾讯接口调用次数（本地闸门，到上限就不再发请求） */
  dailyCallBudget: number
}

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
}) as unknown as new () => Config

function unwrap(v: unknown): unknown {
  const anyV = v as any
  if (anyV && typeof anyV === 'object' && typeof anyV.get === 'function') {
    try {
      return anyV.get()
    } catch {
      return undefined
    }
  }
  return v
}

export function apply(ctx: Context, rawConfig: any): void {
  const readCfg = (): Config => ({
    tmeetBinary: String(unwrap(rawConfig?.tmeetBinary) ?? ''),
    cliVersion: String(unwrap(rawConfig?.cliVersion) ?? EXPECTED_VERSION) || EXPECTED_VERSION,
    requestTimeoutMs: Number(unwrap(rawConfig?.requestTimeoutMs)) || 20000,
    listCacheTtlMs: Number(unwrap(rawConfig?.listCacheTtlMs)) || 600000,
    dailyCallBudget: Number(unwrap(rawConfig?.dailyCallBudget)) || 60
  })

  // 用量闸门的上限来自配置：每次读配置时同步一次，改完不用重启
  const syncBudget = (): void => {
    setDailyBudget(readCfg().dailyCallBudget)
  }
  syncBudget()

  const forTools = (): { binary: string; timeoutMs: number; expectedVersion: string } => {
    const c = readCfg()
    return { binary: c.tmeetBinary, timeoutMs: c.requestTimeoutMs, expectedVersion: c.cliVersion }
  }

  // 工具：注册进 ctx.tools，随插件卸载一起反注册
  ctx.effect(() => registerTools(ctx, forTools()), 'tmeet: tools')

  // 技能：同上
  ctx.effect(() => registerSkills(ctx), 'tmeet: skills')

  // HTTP：等 webServer 可用后挂 /tmeet/api 子树
  ctx.inject(['webServer'] as any, (scoped: Context) => {
    const dispose = registerRoutes({
      ctx: scoped,
      getConfig: () => {
        const c = readCfg()
        return {
          binary: c.tmeetBinary,
          timeoutMs: c.requestTimeoutMs,
          expectedVersion: c.cliVersion
        }
      }
    })
    scoped.effect(() => dispose, 'tmeet: routes')
  })
}

/** 供自检脚本/工具层读安装进度 */
export { installStatus }
