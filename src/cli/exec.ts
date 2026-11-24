/**
 * tmeet 子进程执行层。
 *
 * 契约：所有命令末尾追加 --format json；成功输出统一信封 { trace_id, message, data }。
 * 两个必须靠内容而不靠退出码判断的坑：
 *   1. auth status 未登录时输出纯文本且退出码 0；
 *   2. 不存在的子命令会打印父命令帮助且退出码 0。
 * 所以任何"成功"都必须以「能解析出信封」为准。
 */
import { execFile } from 'node:child_process'
import type { TmeetError } from './errors.js'
import { errorOf } from './errors.js'
import { EXPECTED_VERSION, isModernVersion, locateBinary, spawnTmeet } from './locate.js'
import { isNetworkCommand, tryConsume } from './quota.js'

/** 每天允许的接口调用上限（可由插件配置覆盖） */
let dailyBudget = 60
export function setDailyBudget(n: number): void {
  if (Number.isFinite(n) && n > 0) dailyBudget = Math.floor(n)
}
export function getDailyBudget(): number {
  return dailyBudget
}

export interface ExecOptions {
  /** 显式二进制路径；空 = 自动查找 */
  binary?: string
  timeoutMs?: number
  signal?: AbortSignal
}

export type ExecResult =
  | { ok: true; stdout: string; stderr: string }
  | { ok: false; error: TmeetError; stdout: string; stderr: string }

export interface Envelope<T = unknown> {
  trace_id?: string
  message?: string
  data: T
}

const DEFAULT_TIMEOUT_MS = 20_000
const MAX_BUFFER = 32 * 1024 * 1024

/** 裸跑一条命令，不做 JSON 解析。用于 auth login 这类前台流式命令。 */
export function runRaw(
  args: string[],
  opts: ExecOptions = {}
): Promise<ExecResult> {
  // 本地只做粗略计数（满了自动清零），不拦请求：腾讯的真实上限是黑盒，估出来的数不该挡住用户。
  if (isNetworkCommand(args)) tryConsume(dailyBudget)
  const { binary } = locateBinary(opts.binary)
  if (!binary) {
    return Promise.resolve({
      ok: false,
      error: errorOf('', 'missing-binary'),
      stdout: '',
      stderr: ''
    })
  }
  const timeout = Number(opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : DEFAULT_TIMEOUT_MS
  return new Promise((resolve) => {
    const child = spawnTmeet(binary, args, { stdio: 'pipe' })
    let out = ''
    let err = ''
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      try {
        child.kill()
      } catch {
        /* 已经退了 */
      }
      resolve({ ok: false, error: errorOf('', 'timeout'), stdout: out, stderr: err })
    }, timeout)
    timer.unref?.()
    child.stdout?.on('data', (c: Buffer) => {
      if (out.length < MAX_BUFFER) out += c.toString('utf8')
    })
    child.stderr?.on('data', (c: Buffer) => {
      if (err.length < MAX_BUFFER) err += c.toString('utf8')
    })
    child.on('error', (e) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ ok: false, error: errorOf(e.message || '', 'missing-binary'), stdout: out, stderr: err })
    })
    child.on('exit', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (code === 0) {
        resolve({ ok: true, stdout: out, stderr: err })
        return
      }
      // 有的命令把有效输出打在 stdout 同时给非零退出码：只要 stdout 能解析就当成功
      resolve({ ok: false, error: errorOf(err || `退出码 ${code}`, code === 127 ? 'missing-binary' : undefined), stdout: out, stderr: err })
    })
  })
}

/** 剥掉 ANSI 与 BOM，命令输出里偶尔带 */
function clean(s: string): string {
  return String(s || '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/^\uFEFF/, '')
    .trim()
}

/**
 * 从输出里截出第一个能解析的 JSON 值。
 * 命令有时会在 JSON 前面打印提示（含方括号的中文提示），所以不能只看第一个括号，
 * 要按出现顺序逐个候选起点试一遍。
 */
export function sliceJson(text: string): string {
  const t = clean(text)
  if (!t) return ''
  const starts: number[] = []
  for (let i = 0; i < t.length && starts.length < 64; i += 1) {
    const ch = t[i]
    if (ch === '{' || ch === '[') starts.push(i)
  }
  for (const start of starts) {
    const candidate = matchBalanced(t, start)
    if (!candidate) continue
    try {
      JSON.parse(candidate)
      return candidate
    } catch {
      /* 换下一个起点 */
    }
  }
  return ''
}

/** 从 start 处的括号出发做配对，跳过字符串里的括号；配不上返回空串 */
function matchBalanced(t: string, start: number): string {
  const open = t[start]
  const close = open === '{' ? '}' : ']'
  let depth = 0
  let inStr = false
  let esc = false
  for (let i = start; i < t.length; i += 1) {
    const ch = t[i]
    if (inStr) {
      if (esc) esc = false
      else if (ch === '\\') esc = true
      else if (ch === '"') inStr = false
      continue
    }
    if (ch === '"') {
      inStr = true
      continue
    }
    if (ch === open) depth += 1
    else if (ch === close) {
      depth -= 1
      if (depth === 0) return t.slice(start, i + 1)
    }
  }
  return ''
}

/** 一条「要 JSON」的命令：跑 → 解析信封 → 成功拿 data */
/**
 * 腾讯的 meeting_id 是 18~20 位数字，超过 JS 的安全整数范围（2^53）。
 * 如果 CLI 把它当 JSON 数字输出，JSON.parse 会**静默丢精度**，
 * 于是一个「看起来正常」的 id 拿去查详情就报「会议号无效」（实测 500001）。
 * 这里在解析前把超长整数改成字符串，保住每一位。
 */
export function quoteLongIntegers(text: string): string {
  return String(text || '').replace(/([:[,]\s*)(-?\d{16,})(\s*[,\]}])/g, '$1"$2"$3')
}

export async function runJson<T = unknown>(
  args: string[],
  opts: ExecOptions = {}
): Promise<{ ok: true; data: T; envelope: Envelope<T> } | { ok: false; error: TmeetError }> {
  const res = await runRaw([...args, '--format', 'json'], opts)
  const stdout = res.stdout
  const stderr = res.stderr || (res.ok ? '' : (res.error.raw ?? ''))

  const payload = sliceJson(stdout)
  if (payload) {
    try {
      // 先把 18~20 位的整数转成字符串，避免 JSON.parse 丢精度（会议号无效的根因）
      const parsed = JSON.parse(quoteLongIntegers(payload)) as unknown
      const env = normalizeEnvelope<T>(parsed)
      // 信封里的 message 有时携带业务错误文本，但 data 仍可用
      if (env) return { ok: true, data: env.data, envelope: env }
    } catch {
      /* 落到下面的失败分支 */
    }
  }

  // 解析不出 JSON：可能是业务错误、也可能是未登录的纯文本
  const probe = (stderr || stdout || '').trim()
  if (!res.ok) {
    // 已经有明确原因的错误（额度闸门、超时、找不到二进制）必须原样带出去。
    // 之前这里重新推断一次，闸门拦下时 stderr/stdout 都是空的，
    // 于是被推断成「无法识别的结果」，用户完全看不懂为什么失败。
    if (res.error) return { ok: false, error: res.error }
    return { ok: false, error: errorOf(probe || '', /\.cmd|exec/i.test(probe) ? 'missing-binary' : undefined) }
  }
  // 退出码 0 但没有 JSON：未登录的 auth status 就是这种形态
  if (/not logged in|user config is empty/i.test(probe)) {
    return { ok: false, error: errorOf(probe, 'not-logged-in') }
  }
  return { ok: false, error: errorOf(probe || '命令没有返回可解析的内容', 'unknown') }
}

function normalizeEnvelope<T>(parsed: unknown): Envelope<T> | null {
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    if ('data' in obj) {
      return {
        trace_id: typeof obj.trace_id === 'string' ? obj.trace_id : undefined,
        message: typeof obj.message === 'string' ? obj.message : undefined,
        data: obj.data as T
      }
    }
    // 少数命令直接返回裸对象：整包当 data
    return { data: obj as unknown as T }
  }
  if (Array.isArray(parsed)) return { data: parsed as unknown as T }
  return null
}

export interface CliProfile {
  ok: boolean
  binary: string
  source: string
  version: string
  modern: boolean
  error?: TmeetError
}

/**
 * 探测二进制与版本。**只在真正需要时调用**（工具首次调用 / 面板请求 / 用户点按钮），
 * 绝不在 apply() 里调用。
 */
export async function probeCli(opts: ExecOptions = {}, opts2: { fresh?: boolean } = {}): Promise<CliProfile> {
  const loc = locateBinary(opts.binary)
  if (!loc.binary) {
    return {
      ok: false,
      binary: '',
      source: loc.source,
      version: '',
      modern: false,
      error: errorOf('', 'missing-cli')
    }
  }
  const res = await runRaw(['--version'], { ...opts, timeoutMs: Math.min(Number(opts.timeoutMs) || 8000, 15000) })
  const text = res.ok ? res.stdout + res.stderr : res.stdout + res.stderr
  const version = (/v?(\d+\.\d+\.\d+)/.exec(text)?.[1] ?? '').trim() || ''
  if (!version) {
    // 找到了文件但跑不起来（架构不对/权限不足）：说清楚，别假装没装
    const hint = res.ok ? '' : (res.error.raw || '')
    return {
      ok: false,
      binary: loc.binary,
      source: loc.source,
      version: '',
      modern: false,
      error: errorOf(hint || '组件存在但无法执行', 'missing-binary')
    }
  }
  void opts2
  return {
    ok: true,
    binary: loc.binary,
    source: loc.source,
    version,
    modern: isModernVersion(version) || version === EXPECTED_VERSION
  }
}

/**
 * 时间窗钳制：CLI 视角下任何查询窗口都不得大于 31 天（否则 190004）。
 * 返回可安全提交的一对 ISO 时间串。
 */
export function clampWindow(startIso: string, endIso: string): { start: string; end: string } {
  const MAX = 31 * 864e5
  const s = Date.parse(startIso)
  const e = Date.parse(endIso)
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) {
    const now = Date.now()
    return { start: new Date(now - MAX).toISOString(), end: new Date(now).toISOString() }
  }
  if (e - s <= MAX) return { start: startIso, end: endIso }
  return { start: new Date(e - MAX).toISOString(), end: endIso }
}

/** tmeet 要本地时区偏移的 ISO 串，例如 2026-03-12T15:00+08:00 */
export function isoLocal(d: Date): string {
  const off = -d.getTimezoneOffset()
  const sign = off >= 0 ? '+' : '-'
  const pad = (n: number) => String(n).padStart(2, '0')
  const oh = pad(Math.floor(Math.abs(off) / 60))
  const om = pad(Math.abs(off) % 60)
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${oh}:${om}`
  )
}
