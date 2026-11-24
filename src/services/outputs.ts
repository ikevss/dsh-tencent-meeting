/**
 * 会后产出：四份，全部由 DSH 里配置的模型生成。
 *
 * 铁律（superIR 版的教训，照搬）：
 *  - 素材优先逐字稿，缺了才用腾讯纪要；两者都没有就直接说「没有可用素材」，不编。
 *  - 单场素材硬截断（6 万字），截断要在产出正文里注明。
 *  - 只写材料里出现的事实。
 */
import type { OutputKind, OutputView } from '../shared/types.js'
import type { Context } from '@deepseek-ai/cordis'
import { harnessGenerate } from './agent-generate.js'
import type { ModelRef } from './agent-run.js'
import { readStore, writeStore } from './store.js'

const MAX_MATERIAL_CHARS = 60_000

export interface OutputDef {
  kind: OutputKind
  title: string
  /** 给模型的系统提示：角色 + 硬约束 */
  system: string
  /** 正文里必须出现的段落名 */
  sections: string[]
}

export const OUTPUT_DEFS: Record<OutputKind, OutputDef> = {
  insight: {
    kind: 'insight',
    title: '会议洞察分析',
    system: [
      '你是一名沟通行为分析师，分析这场会的「沟通方式」——和会议内容复盘（复盘报告）是两回事。',
      '分析维度：冲突回避（有没有该说没说的分歧）、发言占比是否失衡、填充词与犹豫、积极倾听（有没有回应与追问）、引导风格（谁在带节奏、怎么带）。',
      '硬约束：',
      '1. 发言次数、时长占比、谁没说话这类数字，只能用材料里【本机统计】给出的数据，绝不自己算、绝不编；没有统计就写「材料未提及」。',
      '2. 行为判断（回避/倾听/引导风格）必须引用具体原话或时间点做依据，写成「【引用】…」；你的推断写成「【推断·中】…」并带置信度。',
      '3. 每条改进建议要落到下一场会能做的具体动作，不写空泛评价；',
      '4. 材料不足时少写几条，并在「本次看不出的沟通问题」里写清缺什么（例如没有逐字稿就看不出填充词）。'
    ].join('\n'),
    sections: ['一句话画像', '沟通亮点', '可改进点', '下次会的具体动作', '本次看不出的沟通问题']
  },
  'minutes-company': {
    kind: 'minutes-company',
    title: '公司视角纪要',
    system: [
      '你是一名严谨的会议记录员，站在会议主办方（我们公司）的立场整理这场会。',
      '硬约束：',
      '1. 只写材料里出现的事实，不要推测、不要补充背景知识、不要给建议；',
      '2. 人名、数字、时间点必须与材料一致，材料没写的就写「材料未提及」；',
      '3. 不写客套话、不写「综上所述」，直接进结论。'
    ].join('\n'),
    sections: ['一句话结论', '讨论要点', '已确认事项', '待办（谁／何时）', '未决问题']
  },
  'minutes-investor': {
    kind: 'minutes-investor',
    title: '投资人视角纪要',
    system: [
      '你是一名买方研究员，站在与会投资人关注的角度整理这场会。',
      '硬约束：',
      '1. 只写材料里出现的事实；材料没有的数据一律写「材料未提及」；',
      '2. 重点抓：公司/标的的业务与财务信息、增长与风险、管理层口径与前后变化；',
      '3. 不写投资建议，只做信息归纳。'
    ].join('\n'),
    sections: ['一句话结论', '关键经营数据', '增长驱动', '风险与隐忧', '管理层原话要点', '待跟踪事项']
  },
  review: {
    kind: 'review',
    title: '复盘报告',
    system: [
      '你是一名会议复盘教练，帮主办方看清这场会开得怎么样。',
      '硬约束（必须遵守，违反即作废）：',
      '1. 每段信息必须标来源层级：引用（会上原话，用引号）、转写（转写文本归纳）、概括（你的归纳）、推断（你的判断，必须带置信度：高/中/低）。没有来源的内容不许出现。',
      '2. 只写材料里出现的事实；材料没写的写「材料未提及」，不要补背景、不要给建议。',
      '3. 涉及金额、比例、日期、时长时，要么能指回原话/时间点（标「引用」或「转写」），要么标「概括」；不要出现无出处的精确数字。',
      '4. 批评要具体到「哪一段、为什么」，不写空泛评价；建议要能落到下一场会的动作。',
      '5. 材料不足时不许硬凑：按「要点」少写几条，并在「本次拿不到的信息」里写清缺什么、怎么补。',
      '6. 每段开头必须带来源标记，用方括号：【引用】/【转写】/【概括】/【推断·高】/【推断·中】/【推断·低】。没有标记的段落视为不合格。'
    ].join('\n'),
    sections: ['一句话结论', '关键发现', '风险与分歧', '待办与责任人', '本次拿不到的信息', '来源说明']
  },
  qa: {
    kind: 'qa',
    title: '问答清单',
    system: [
      '你是一名会务助理，从这场会里把「有人问了什么、怎么答的」抽成一份清单。',
      '硬约束：',
      '1. 只收材料里真实出现的问答；没有问答就明确写「这场会没有形成问答」，不要编；',
      '2. 问题按材料出现顺序排列，答案只取材料原文要点；',
      '3. 材料里没有明确回答的问题，标成「未回答」。'
    ].join('\n'),
    sections: ['问答清单']
  }
}

export interface Material {
  text: string
  source: 'transcript' | 'minutes'
  truncated: boolean
  chars: number
  /** 素材是用户自己粘贴的原文（不是腾讯侧取回的），产出里必须写明来源 */
  providedByUser?: boolean
  /** 用户声明的来源描述，例如「手机录音转文字」 */
  providedSource?: string
}

/** 截断素材并标记；截断点在段落边界上，不切半句 */
export function trimMaterial(raw: string, source: Material['source']): Material {
  const text = String(raw || '').trim()
  if (text.length <= MAX_MATERIAL_CHARS) {
    return { text, source, truncated: false, chars: text.length }
  }
  const head = text.slice(0, MAX_MATERIAL_CHARS)
  const cut = Math.max(head.lastIndexOf('\n'), head.lastIndexOf('。'))
  const body = cut > MAX_MATERIAL_CHARS * 0.8 ? head.slice(0, cut + 1) : head
  return {
    text: `${body}\n\n（说明：素材过长，只用了前 ${body.length} 字，之后的 ${text.length - body.length} 字没有参与生成。）`,
    source,
    truncated: true,
    chars: body.length
  }
}

function promptFor(
  def: OutputDef,
  material: Material,
  meeting: { subject: string; timeRange: string; participants: string[] },
  review?: ReviewContext
): string {
  const sourceLabel = material.providedByUser
    ? `用户提供的原文（${material.providedSource || '用户提供'}）`
    : material.source === 'transcript'
      ? '逐字稿'
      : '腾讯智能纪要'
  const reviewLines =
    def.kind === 'review' && review
      ? [
          `这场会判为「${review.typeName}」，用它的框架看：${review.frame.join('、')}`,
          review.degraded
            ? '这场会素材不足，用降级版：不要套框架，按要点写；缺什么写进「本次拿不到的信息」。'
            : '材料足够时才用上面的框架；某一项材料不够就少写，不要编。'
        ]
      : []
  return [
    `会议主题：${meeting.subject}`,
    `会议时间：${meeting.timeRange}`,
    meeting.participants.length ? `参会人：${meeting.participants.join('、')}` : '参会人：材料未提及',
    `素材来源：${sourceLabel}${material.truncated ? '（已截断）' : ''}`,
    ...reviewLines,
    material.providedByUser
      ? '注意：素材来自用户自行提供，可能不是完整逐字稿；凡是材料里没写的内容一律不要补，宁可写「材料未提及」。'
      : '',
    '',
    '请严格按下面这些段落输出，段落名用 Markdown 二级标题：',
    sectionsOf(def, review).map((s) => `## ${s}`).join('\n'),
    '',
    '素材如下（原样，不要复述素材本身）：',
    '---',
    material.text,
    '---'
  ]
    .filter((x) => x !== '')
    .join('\n')
}

/** 复盘的判定上下文：来自规则层（类型/框架/降级），决定生成时看什么 */
export interface ReviewContext {
  type: string
  typeName: string
  frame: string[]
  insight: string
  degraded: boolean
  available: string[]
  missing: Array<{ what: string; why: string; how: string }>
}

export interface GenArgs {
  ctx: Context
  meetingId: string
  kind: OutputKind
  meeting: { subject: string; timeRange: string; participants: string[] }
  material: Material
  ref: ModelRef
  agentPreset: string
  signal?: AbortSignal
  /** 仅 kind=review 时有：判定结果，让生成按对的框架看 */
  review?: ReviewContext
}

/** 复盘的段落随判定与完整度变，不能写死五段 */
function sectionsOf(def: OutputDef, review?: ReviewContext): string[] {
  if (def.kind !== 'review' || !review) return def.sections
  if (review.degraded) return ['一句话结论', '要点', '本次拿不到的信息']
  return ['一句话结论', '关键发现', ...review.frame, '风险与分歧', '待办与责任人', '本次拿不到的信息', '来源说明']
}

export interface GenResult {
  ok: boolean
  output?: OutputView
  message?: string
}

export async function generateOutput(args: GenArgs): Promise<GenResult> {
  const def = OUTPUT_DEFS[args.kind]
  if (!def) return { ok: false, message: '不认识的产出类型。' }
  if (!args.material.text.trim()) {
    return { ok: false, message: '这场会没有可用的素材（既没有逐字稿，也没有智能纪要），生成不了。' }
  }
  // 生成统一走 DSH agent harness（真会话 + 工具/多步能力），不再静默降级到单发模型。
  // 失败就明确报错，不偷偷换成 ctx.llm.stream。
  const r = await harnessGenerate(args.ctx, {
    agentPreset: args.agentPreset,
    system: def.system,
    prompt: promptFor(def, args.material, args.meeting, args.review),
    signal: args.signal,
    // 长会（几万字逐字稿）+ 爱思考的模型：实测 5 分钟才刚写完。
    // 给 10 分钟上限，但等待是「安静即返回」，模型一结束就拿结果，不会真等满。
    timeoutMs: 600_000
  })
  if (!r.ok) return { ok: false, message: r.message || '生成失败' }

  const header = [
    `# ${def.title}`,
    '',
    `> ${args.meeting.subject} · ${args.meeting.timeRange}`,
    `> 素材：${
      args.material.providedByUser
        ? `据用户提供的原文生成（${args.material.providedSource || '用户提供'}）`
        : args.material.source === 'transcript'
          ? '逐字稿'
          : '腾讯智能纪要'
    }${args.material.truncated ? '（已截断）' : ''} · 模型：${r.model || '未知'} · 生成方式：DSH 助手会话`,
    ''
  ].join('\n')

  const view: OutputView = {
    kind: args.kind,
    text: `${header}${r.text}`,
    source: args.material.source,
    generatedAt: new Date().toISOString(),
    model: r.model,
    truncated: args.material.truncated,
    reviewType: args.review?.type,
    reviewDegraded: args.review?.degraded
  }
  writeStore((d) => {
    d.outputs[`${args.meetingId}:${args.kind}`] = view
  })
  return { ok: true, output: view, message: r.message || '已生成。' }
}

export function listOutputs(meetingId: string): Partial<Record<OutputKind, OutputView>> {
  const store = readStore()
  const out: Partial<Record<OutputKind, OutputView>> = {}
  for (const kind of Object.keys(OUTPUT_DEFS) as OutputKind[]) {
    const hit = store.outputs[`${meetingId}:${kind}`]
    if (hit) out[kind] = hit
  }
  return out
}

export function deleteOutput(meetingId: string, kind: OutputKind): boolean {
  const key = `${meetingId}:${kind}`
  if (!readStore().outputs[key]) return false
  writeStore((d) => {
    delete d.outputs[key]
  })
  return true
}

/**
 * 写入一份产出（供 AI 对话工具回写）。
 * 模型字段标成「DSH 会话」，与插件内生成的区分开；来源按素材类型标注。
 */
export function writeOutput(meetingId: string, kind: OutputKind, text: string, source: 'transcript' | 'minutes' = 'transcript'): void {
  const body = String(text ?? '').trim()
  if (!body) return
  const view: OutputView = {
    kind,
    text: body,
    source,
    generatedAt: new Date().toISOString(),
    model: 'DSH 会话',
    truncated: false
  }
  writeStore((d) => {
    d.outputs[`${meetingId}:${kind}`] = view
  })
}

/** 把已生成的产出拼成给工具返回值用的文本 */
export function outputAsText(view: OutputView): string {
  return view.text
}
