/**
 * 本地存储：会议列表快照、逐字稿就绪清单、本地补充的参会人、已生成的产出。
 *
 * 为什么要有本地这一层：腾讯 CLI 有每日调用额度（500246 实测），
 * 面板每渲染一次就真取一次数据是最快的烧额度方式（superIR 版实测 48 条命令/次）。
 * 所以列表读快照，只有用户点「同步」或首次进面板才真取。
 *
 * 存储后端：$DSH_HOME/plugin-data/dsh-tencent-meeting/store.json。
 * 单个 JSON，写入走原子替换；数据量很小（几十场会 + 少量正文缓存索引）。
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { MeetingBrief, OutputView } from '../shared/types.js'

export interface Snapshot {
  /** 进行中/即将开始一次取回的结果 */
  upcoming: MeetingBrief[]
  upcomingFetchedAt: string | null
  /** 历史会议（按窗口追加） */
  history: MeetingBrief[]
  syncedAt: string | null
  /** 最早已经取到的时间点，用于「加载更早」 */
  historyFrom: string | null
  noMoreHistory: boolean
}

export interface StoreShape {
  /** 每次登录的账号 open_id，用于换号时判断要不要清本地 */
  accountOpenId: string
  snapshot: Snapshot
  /** 本机已取回非空逐字稿的 meeting_id 集合（列表标签与筛选共用） */
  transcriptReady: string[]
  /** 本机手工补充的参会人：meetingId → 姓名数组 */
  localParticipants: Record<string, string[]>
  /** 已生成的会后产出：`${meetingId}:${kind}` → 产出 */
  outputs: Record<string, OutputView>
  /** 正文缓存索引（只记 fetchedAt，正文按需重取，避免把上万字塞进 JSON） */
  contentIndex: Record<string, string>
  /**
   * 用户自行粘贴的会后素材：`${meetingId}:${kind}` → 内容。
   *
   * 为什么要有：用户参加的会大部分是别人开的，对方不给录制与转写，
   * 于是「逐字稿 / 纪要」全空，四类产出全都做不了。
   * 而产出本质是「原文 → 结构」，原文不必来自腾讯——用户手上的录音转文字照样能出稿。
   * 这部分只存本机，不上传；界面与产出里必须标明来源是用户提供。
   */
  pastedMaterials: Record<string, PastedMaterial>
  /**
   * 本机记下的入会密码：只有用户在本插件里建会/改会时填过才有。
   * 腾讯接口不回传密码，所以别处建的会这里就是空的——界面上会如实说「有密码但不知道」。
   */
  localPasswords: Record<string, string>
}

export interface PastedMaterial {
  /** 原文正文 */
  text: string
  /** 粘贴时间（ISO） */
  at: string
  /** 用户声明的来源，例如「手机录音转文字」 */
  source: string
  /** 字数，列表里显示用（避免每次都把正文读出来） */
  chars: number
}

function dshHome(): string {
  const explicit = String(process.env.DSH_HOME || '').trim()
  if (explicit) return explicit
  return path.join(os.homedir(), '.dsh')
}

export function pluginDataDir(): string {
  return path.join(dshHome(), 'plugin-data', 'dsh-tencent-meeting')
}

function storeFile(): string {
  return path.join(pluginDataDir(), 'store.json')
}

function emptySnapshot(): Snapshot {
  return {
    upcoming: [],
    upcomingFetchedAt: null,
    history: [],
    syncedAt: null,
    historyFrom: null,
    noMoreHistory: false
  }
}

export function emptyStore(): StoreShape {
  return {
    accountOpenId: '',
    snapshot: emptySnapshot(),
    transcriptReady: [],
    localParticipants: {},
    outputs: {},
    contentIndex: {},
    pastedMaterials: {},
    localPasswords: {}
  }
}

let cache: StoreShape | null = null

export function readStore(): StoreShape {
  if (cache) return cache
  try {
    const text = fs.readFileSync(storeFile(), 'utf8')
    const parsed = JSON.parse(text) as Partial<StoreShape>
    cache = {
      accountOpenId: String(parsed.accountOpenId || ''),
      snapshot: { ...emptySnapshot(), ...(parsed.snapshot || {}) },
      transcriptReady: Array.isArray(parsed.transcriptReady) ? parsed.transcriptReady.map(String) : [],
      localParticipants: (parsed.localParticipants as Record<string, string[]>) || {},
      outputs: (parsed.outputs as Record<string, OutputView>) || {},
      contentIndex: (parsed.contentIndex as Record<string, string>) || {},
      pastedMaterials: (parsed.pastedMaterials as Record<string, PastedMaterial>) || {},
      localPasswords: (parsed.localPasswords as Record<string, string>) || {}
    }
    return cache
  } catch {
    cache = emptyStore()
    return cache
  }
}

export function writeStore(mutate: (draft: StoreShape) => void): StoreShape {
  const draft = structuredCloneSafe(readStore())
  mutate(draft)
  cache = draft
  try {
    fs.mkdirSync(pluginDataDir(), { recursive: true })
    const tmp = `${storeFile()}.${process.pid}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(draft), 'utf8')
    fs.renameSync(tmp, storeFile())
  } catch {
    // 写不进就只在内存生效，不影响本次会话使用
  }
  return draft
}

function structuredCloneSafe<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

/** 清空某个账号的全部本地数据（切换账号时用户勾选「清除会议记录」走这里） */
export function purgeAccount(): { meetings: number; outputs: number } {
  const before = readStore()
  const meetings = before.snapshot.upcoming.length + before.snapshot.history.length
  const outputs = Object.keys(before.outputs).length
  cache = emptyStore()
  try {
    fs.mkdirSync(pluginDataDir(), { recursive: true })
    fs.writeFileSync(storeFile(), JSON.stringify(cache), 'utf8')
  } catch {
    /* 内存已清空，落盘失败下次启动会读到旧值——如实由调用方提示 */
  }
  return { meetings, outputs }
}

/** 列表快照是否新鲜（用于「今天还没同步过」的判断） */
export function snapshotFresh(ttlMs: number): boolean {
  const s = readStore().snapshot
  if (!s.syncedAt) return false
  const t = Date.parse(s.syncedAt)
  if (Number.isNaN(t)) return false
  return Date.now() - t < ttlMs
}

/** 增量维护「已取回逐字稿」的 id 集合 */
export function markTranscriptReady(meetingId: string, ready: boolean): void {
  if (!meetingId) return
  writeStore((d) => {
    const set = new Set(d.transcriptReady)
    if (ready) set.add(meetingId)
    else set.delete(meetingId)
    d.transcriptReady = Array.from(set)
  })
}

export function transcriptReadySet(): Set<string> {
  return new Set(readStore().transcriptReady)
}
