/**
 * 素材补录：用户自己粘贴的逐字稿 / 纪要。
 *
 * 为什么需要（产品事实）：用户参加的会大部分是别人开的，对方不给云录制与转写，
 * 于是拉回来的会议里「逐字稿 / 纪要 / 参会人」大片空白，四类会后产出全都做不了。
 * 但产出的本质是「原文 → 结构」，原文不必来自腾讯——手机录音转出来的文字照样能出稿。
 *
 * 三条纪律：
 *  1. 只存本机（store.json），不上传、不进日志。
 *  2. 每条素材必须记来源与时间；产出里要写「据用户提供的原文生成」，不许伪装成腾讯数据。
 *  3. 覆盖前必须确认（由界面负责二次确认，服务端只按 commit 执行）。
 */
import type { ContentKind } from './records.js'
import { readStore, writeStore, type PastedMaterial } from './store.js'

export type PastedKind = Extract<ContentKind, 'transcript' | 'minutes' | 'todos'>

export const PASTED_KINDS: PastedKind[] = ['transcript', 'minutes', 'todos']

export function pastedKey(meetingId: string, kind: PastedKind): string {
  return `${meetingId}:${kind}`
}

export function getPasted(meetingId: string, kind: PastedKind): PastedMaterial | null {
  const store = readStore()
  const hit = store.pastedMaterials[pastedKey(meetingId, kind)]
  return hit && hit.text ? hit : null
}

/** 只列元信息（不含正文），用于界面显示「已粘贴 xx 字」 */
export function listPasted(meetingId: string): Array<{ kind: PastedKind; at: string; source: string; chars: number }> {
  const store = readStore()
  const out: Array<{ kind: PastedKind; at: string; source: string; chars: number }> = []
  for (const kind of PASTED_KINDS) {
    const hit = store.pastedMaterials[pastedKey(meetingId, kind)]
    if (hit && hit.text) out.push({ kind, at: hit.at, source: hit.source, chars: hit.chars })
  }
  return out
}

export interface SavePastedInput {
  meetingId: string
  kind: PastedKind
  text: string
  source?: string
  /** 已有内容时要显式确认覆盖 */
  overwrite?: boolean
}

export function savePasted(input: SavePastedInput): { ok: boolean; message: string; replaced: boolean } {
  const text = String(input.text ?? '').replace(/\r\n/g, '\n').trim()
  if (!text) return { ok: false, message: '内容为空，没有保存。', replaced: false }
  if (text.length > 400_000) {
    return { ok: false, message: '内容超过 40 万字，请分段粘贴。', replaced: false }
  }
  const existing = getPasted(input.meetingId, input.kind)
  if (existing && !input.overwrite) {
    return { ok: false, message: '这场会已经有一份了，覆盖需要先确认。', replaced: true }
  }
  const material: PastedMaterial = {
    text,
    at: new Date().toISOString(),
    source: String(input.source ?? '').trim() || '用户提供',
    chars: text.length
  }
  writeStore((d) => {
    d.pastedMaterials[pastedKey(input.meetingId, input.kind)] = material
  })
  return {
    ok: true,
    message: existing ? `已覆盖，共 ${material.chars} 字。` : `已保存，共 ${material.chars} 字。`,
    replaced: Boolean(existing)
  }
}

export function deletePasted(meetingId: string, kind: PastedKind): { ok: boolean; message: string } {
  const existed = Boolean(getPasted(meetingId, kind))
  writeStore((d) => {
    delete d.pastedMaterials[pastedKey(meetingId, kind)]
  })
  return { ok: true, message: existed ? '已删除这份素材。' : '本来就没有这份素材。' }
}

/** 把粘贴的素材摊平成可读文本，供产出与简报使用 */
export function pastedAsText(meetingId: string): { transcript?: string; minutes?: string; todos?: string; sources: string[] } {
  const t = getPasted(meetingId, 'transcript')
  const m = getPasted(meetingId, 'minutes')
  const d = getPasted(meetingId, 'todos')
  const sources: string[] = []
  if (t) sources.push(`逐字稿（用户提供，${t.chars} 字，${t.at.slice(0, 10)}）`)
  if (m) sources.push(`纪要（用户提供，${m.chars} 字，${m.at.slice(0, 10)}）`)
  if (d) sources.push(`待办（用户提供，${d.chars} 字，${d.at.slice(0, 10)}）`)
  return {
    transcript: t?.text,
    minutes: m?.text,
    todos: d?.text,
    sources
  }
}
