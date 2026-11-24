/**
 * 复盘洞察 · 参与者贡献分析（纯计算，不花额度）
 *
 * 数据只来自已有的逐字稿段落与参会人名单，不额外打腾讯接口。
 * 价值点：一场会里「谁没说话」往往比「谁说了什么」更能说明问题，所以沉默者单独列。
 */
import type { PersonRow } from '../shared/types.js'

export interface ParticipationRow {
  speaker: string
  /** 发言段数 */
  chunks: number
  /** 发言总字数 */
  chars: number
  /** 字数占比（0–1） */
  share: number
}

export interface ParticipationResult {
  rows: ParticipationRow[]
  /** 名单里有、但逐字稿里没出声的人 */
  silent: string[]
  totalChunks: number
  totalChars: number
  /** 逐字稿里有没有可用的说话人字段 */
  speakerAvailable: boolean
  /** 名单缺失时只能按发言人名统计 */
  rosterMissing: boolean
}

/** 归一化说话人名字：去掉空白与常见称呼后缀，避免同一人被拆成两行 */
function norm(name: string): string {
  return String(name ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/(老师|总|经理|博士)$/, '')
}

export function analyzeParticipation(
  chunks: Array<{ text: string; speaker?: string }>,
  roster: PersonRow[] = []
): ParticipationResult {
  const map = new Map<string, { speaker: string; chunks: number; chars: number }>()
  let totalChars = 0
  let speakerAvailable = false

  for (const c of chunks) {
    const text = String(c.text ?? '')
    const key = norm(c.speaker || '')
    if (key) speakerAvailable = true
    const bucket = key || '（未标注说话人）'
    const hit = map.get(bucket) ?? { speaker: bucket, chunks: 0, chars: 0 }
    hit.chunks += 1
    hit.chars += text.length
    totalChars += text.length
    map.set(bucket, hit)
  }

  const rows: ParticipationRow[] = [...map.values()]
    .map((r) => ({
      speaker: r.speaker,
      chunks: r.chunks,
      chars: r.chars,
      share: totalChars > 0 ? Math.round((r.chars / totalChars) * 100) / 100 : 0
    }))
    .sort((a, b) => b.chars - a.chars)

  // 沉默者：名单里有、逐字稿里没出现的（名字归一化后比对）
  const spoken = new Set([...map.keys()].map(norm))
  const silent = roster
    .map((p) => String(p.nickname ?? '').trim())
    .filter((n) => n && !spoken.has(norm(n)))

  return {
    rows,
    silent,
    totalChunks: chunks.length,
    totalChars,
    speakerAvailable,
    rosterMissing: roster.length === 0
  }
}
