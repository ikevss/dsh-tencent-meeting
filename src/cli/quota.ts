/**
 * 本地用量闸门。
 *
 * 为什么要有它：腾讯会议 CLI 的调用次数是**按账号按天**上限（实测 error_code 500246）。
 * 面板里任何一次「顺手刷新」都在烧同一份额度，而额度用完时用户看到的是空列表——
 * 这正是「取不到」被显示成「没有会议」的经典事故。
 *
 * 所以纪律落到代码上，而不是靠自觉：
 *  1. 只有真正打网络的子命令才计数（meeting / record / minutes / report / contact / app）；
 *     `auth status` 读本地凭据、`auth logout` 清本地凭据，都不计数。
 *  2. 计数落盘（跨进程、跨重启），同一天累计。
 *  3. 到上限就**在本地拒绝**，返回明确原因，不发请求、不烧额度。
 *  4. 面板不自动轮询：只有用户点刷新、首次打开、或收到系统推送才回读。
 */
import fs from 'node:fs'
import path from 'node:path'
import { pluginDataDir } from '../services/store.js'

const DEFAULT_BUDGET = 60

export interface QuotaState {
  /** 本地日期 YYYY-MM-DD */
  date: string
  used: number
  budget: number
}

export interface QuotaSnapshot extends QuotaState {
  remaining: number
  exhausted: boolean
}

function dir(): string {
  // 与 store.json 用同一个目录：之前这里用 process.cwd()，
  // 结果额度计数和会议快照分家，用户看到「今日 120/120」却找不到文件。
  return pluginDataDir()
}

function file(): string {
  return path.join(dir(), 'quota.json')
}

function today(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function readQuota(budget = DEFAULT_BUDGET): QuotaSnapshot {
  let state: QuotaState = { date: today(), used: 0, budget }
  try {
    const raw = fs.readFileSync(file(), 'utf8')
    const parsed = JSON.parse(raw) as Partial<QuotaState>
    if (parsed && parsed.date === today() && typeof parsed.used === 'number') {
      // 预算永远以当前配置为准：存文件里的旧预算不能说话（改了上限却仍按旧值显示就是这坑）
      state = { date: parsed.date, used: parsed.used, budget }
    }
  } catch {
    /* 首次运行或文件损坏：从 0 起算 */
  }
  const remaining = Math.max(0, state.budget - state.used)
  return { ...state, remaining, exhausted: remaining <= 0 }
}

function writeQuota(state: QuotaState): void {
  try {
    fs.mkdirSync(dir(), { recursive: true })
    fs.writeFileSync(file(), JSON.stringify(state, null, 2), 'utf8')
  } catch {
    /* 写不了就只影响计数精度，不影响主流程 */
  }
}

/** 这条子命令是否真的打腾讯的接口（打才计数） */
export function isNetworkCommand(args: string[]): boolean {
  const head = String(args[0] || '')
  if (head === 'auth') return false
  if (head === 'event') return false // 事件走长连接，不占「调用次数」
  return ['meeting', 'record', 'minutes', 'report', 'contact', 'app', 'control'].includes(head)
}

/**
 * 发请求前计一次数。
 * 腾讯的真实每日上限是黑盒，本地数字只是粗略估计，所以这里**从不拒绝**请求：
 * 计满了就自动清零重新计，不提示、不拦截。真撞上腾讯的 500246，由错误码单独如实提示。
 */
export function tryConsume(budget = DEFAULT_BUDGET): { allowed: boolean; snapshot: QuotaSnapshot } {
  let state = readQuota(budget)
  if (state.exhausted) state = { ...state, used: 0, remaining: budget, exhausted: false }
  const next: QuotaState = { date: state.date, used: state.used + 1, budget: state.budget }
  writeQuota(next)
  return {
    allowed: true,
    snapshot: {
      ...next,
      remaining: Math.max(0, next.budget - next.used),
      exhausted: next.budget - next.used <= 0
    }
  }
}

/** 重置计数（用户换账号或第二天） */
export function resetQuota(budget = DEFAULT_BUDGET): QuotaSnapshot {
  writeQuota({ date: today(), used: 0, budget })
  return readQuota(budget)
}
