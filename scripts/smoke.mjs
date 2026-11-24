/**
 * 隔离冒烟：不启动整个 DSH，只验证 Node 半能加载、能注册、路由表能用。
 * 用法：node scripts/smoke.mjs
 */
import { registerTools } from '../lib/tools.js'
import { registerSkills } from '../lib/skills.js'
import { registerRoutes, buildInviteText } from '../lib/routes.js'
import { locateBinary, EXPECTED_VERSION } from '../lib/cli/locate.js'
import { sliceJson, clampWindow, quoteLongIntegers } from '../lib/cli/exec.js'
import { codeOf } from '../lib/cli/errors.js'
import { readPrefs, DEFAULT_PREFS } from '../lib/prefs.js'
import { readStore, emptyStore } from '../lib/services/store.js'
import { savePasted, getPasted, deletePasted, listPasted, pastedAsText } from '../lib/services/pasted.js'
import { upsertSnapshot } from '../lib/services/meetings.js'
import { deriveStates, pickRecordRefs } from '../lib/services/records.js'
import {
  deriveContentStates,
  enforceMonotonic,
  eventToRefetch,
  localContentSignals
} from '../lib/services/signals.js'

let failures = 0
function check(name, fn) {
  try {
    const r = fn()
    if (r === false) {
      failures += 1
      console.log(`FAIL ${name}`)
    } else {
      console.log(`ok   ${name}`)
    }
  } catch (e) {
    failures += 1
    console.log(`ERR  ${name}: ${e?.message ?? e}`)
  }
}

/** 最小 Context 桩：只提供 get() 与 effect() */
function makeCtx(services) {
  const disposers = []
  return {
    get: (n) => services[n],
    effect: (fn) => {
      const d = fn()
      if (typeof d === 'function') disposers.push(d)
      return () => {}
    },
    inject: (_deps, fn) => fn(makeCtx(services)),
    _disposers: disposers
  }
}

const registered = { tools: [], skills: [], routes: [] }

const ctx = makeCtx({
  tools: {
    register: (def) => {
      registered.tools.push(def)
      return () => {}
    }
  },
  skills: {
    register: (def) => {
      registered.skills.push(def)
      return () => {}
    }
  },
  webServer: {
    register: (route) => {
      registered.routes.push(route)
      return () => {}
    }
  },
  connection: { requestRejection: () => undefined }
})

// 1. 注册
check('tools 注册 14 个', () => {
  registerTools(ctx, { binary: '', timeoutMs: 20000, expectedVersion: EXPECTED_VERSION })
  return registered.tools.length === 14
})
check('skills 注册 7 个', () => {
  registerSkills(ctx)
  return registered.skills.length === 7
})
check('路由注册到 /tmeet/api', () => {
  registerRoutes({ ctx, getConfig: () => ({ binary: '', timeoutMs: 20000, expectedVersion: EXPECTED_VERSION }) })
  return registered.routes.length === 1 && registered.routes[0].path === '/tmeet/api'
})

// 2. 每个工具的形状
check('每个工具都有 name/description/parameters/output/execute', () => {
  return registered.tools.every(
    (t) =>
      typeof t.name === 'string' &&
      t.name.startsWith('tm_') &&
      typeof t.description === 'string' &&
      t.description.length > 20 &&
      t.parameters &&
      typeof t.parameters === 'object' &&
      t.output &&
      t.output.schema &&
      typeof t.output.schema === 'object' &&
      typeof t.output.render === 'function' &&
      typeof t.execute === 'function'
  )
})
check('输出 schema 的对象节点都声明了 additionalProperties', () => {
  const walk = (node, path) => {
    if (!node || typeof node !== 'object') return true
    if (node.type === 'object' && typeof node.additionalProperties !== 'boolean') {
      console.log(`     缺 additionalProperties: ${path}`)
      return false
    }
    let ok = true
    if (node.properties) for (const [k, v] of Object.entries(node.properties)) ok = walk(v, `${path}.${k}`) && ok
    if (node.items) ok = walk(node.items, `${path}[]`) && ok
    return ok
  }
  return registered.tools.every((t) => walk(t.output.schema, t.name))
})
check('每个工具的 output 都声明了 text 字段', () => {
  return registered.tools.every((t) => Boolean(t.output.schema.properties?.text))
})

// 3. 纯函数
check('JSON 切片能从噪声里捞出信封', () => {
  const raw = `[提示] starting\ntrace: x\n{"trace_id":"t","message":"ok","data":{"a":1}}`
  const s = sliceJson(raw)
  const o = JSON.parse(s)
  return o.data.a === 1
})
check('JSON 切片能处理字符串里的括号', () => {
  const raw = '{"data":{"s":"a}b{c"}}'
  return JSON.parse(sliceJson(raw)).data.s === 'a}b{c'
})
check('时间窗钳制到 31 天内', () => {
  const w = clampWindow('2020-01-01T00:00:00+08:00', '2026-01-01T00:00:00+08:00')
  const span = Date.parse(w.end) - Date.parse(w.start)
  return span <= 31 * 864e5 + 1000
})
check('错误码映射', () => {
  return (
    codeOf('500246 usage limit') === 'rate-limited' &&
    codeOf('190004 greater than 31 days') === 'time-range' &&
    codeOf('500249 no permission') === 'permission' &&
    codeOf('user config is empty') === 'not-logged-in'
  )
})
check('录制引用挑取（文件 id 与录制 id 分属不同条目）', () => {
  const refs = pickRecordRefs([
    { meeting_record_id: 'r1', record_file_id: 'f1', state: '3' },
    { meeting_record_id: 'r2' }
  ])
  return refs.recordFileId === 'f1' && refs.meetingRecordId === 'r1'
})
check('派生状态：无录制 → replay none', () => {
  const s = deriveStates({
    meetingId: 'm1',
    records: [],
    ended: true,
    hasTranscript: false,
    hasTimeline: false,
    hasMinutes: false,
    gen: { company: 'idle', investor: 'idle', review: 'idle', qa: 'idle' }
  })
  return s.replay === 'none' && s.tabs.qaDisabled === true
})
check('派生状态：无观看权限 → denied + 申请卡', () => {
  const s = deriveStates({
    meetingId: 'm2',
    records: [{ meeting_record_id: 'r', record_file_id: 'f' }],
    ended: true,
    hasTranscript: false,
    hasTimeline: false,
    hasMinutes: false,
    gen: { company: 'idle', investor: 'idle', review: 'idle', qa: 'idle' },
    errorCode: 'permission'
  })
  return s.replay === 'denied' && s.blocker?.action === '提交申请'
})
check('超长整数先转字符串：会议 id 不许丢精度', () => {
  const raw = '{"meeting_id":12028297712798931974,"subject":"x"}'
  const out = JSON.parse(quoteLongIntegers(raw))
  return out.meeting_id === '12028297712798931974' && typeof out.meeting_id === 'string'
})
check('超长整数不影响正常数字与字符串', () => {
  const raw = '{"time":1762831800,"b":"18250207515056068677"}'
  const out = JSON.parse(quoteLongIntegers(raw))
  return out.time === 1762831800 && out.b === '18250207515056068677'
})
check('邀请文案必须带绝对时间', () => {
  const text = buildInviteText({
    brief: {
      subject: '测试会',
      startTime: '2026-11-20T14:00:00+08:00',
      endTime: '2026-11-20T15:00:00+08:00',
      meetingCode: '123456789',
      joinUrl: 'https://meeting.tencent.com/dm/x'
    }
  })
  return text.includes('2026-11-20') && text.includes('123456789') && !text.includes('今天')
})

// 8. 实时信号层（移植 superIR 的实测结论）
check('就绪只认真的取到内容：total=0 不算就绪', () => {
  const s = deriveContentStates({ transcriptTotal: 0, autoRecordType: 'cloud', autoAsr: true })
  return s.transcript !== 'ready'
})
check('total>0 才算转写就绪', () => {
  const s = deriveContentStates({ transcriptTotal: 12, transcriptBodyReady: true, autoRecordType: 'cloud' })
  return s.transcript === 'ready' && s.tabs.transcriptDisabled === false
})
check('转写未就绪时页签仍可点（否则永远取不到正文）', () => {
  const s = deriveContentStates({ transcriptTotal: 0, autoRecordType: 'cloud', autoAsr: true })
  return s.tabs.transcriptDisabled === false
})
check('只有确定要授权时才禁用逐字稿页签', () => {
  const s = deriveContentStates({ permission: 'denied', autoRecordType: 'cloud' })
  return s.tabs.transcriptDisabled === true && s.tabReasons.transcript.length > 4
})
check('500260/30002 判为「还没转完」而不是失败', () => {
  const s = deriveContentStates({
    transcriptTotal: 0,
    transcriptErrorCode: '500260',
    autoRecordType: 'cloud',
    autoAsr: true
  })
  return s.transcript === 'waiting' && s.disabledReason.includes('转写还没取到')
})
check('取数失败与「还没转完」理由不同', () => {
  const s = deriveContentStates({ transcriptQueryFailed: true, autoRecordType: 'cloud' })
  return s.disabledReason.includes('重试')
})
check('无云录制直接终态 none', () => {
  const s = deriveContentStates({ autoRecordType: 'none', autoAsr: false })
  return s.replay === 'none' && s.transcript === 'none'
})
check('就绪态单调：ready 不许回退成 waiting', () => {
  const prev = deriveContentStates({ transcriptTotal: 10, transcriptBodyReady: true, autoRecordType: 'cloud' })
  const next = enforceMonotonic(
    prev,
    deriveContentStates({ transcriptTotal: 0, autoRecordType: 'cloud', autoAsr: true })
  )
  return next.transcript === 'ready'
})
check('权限终态可以覆盖（对方撤回授权是真实变化）', () => {
  const prev = deriveContentStates({ transcriptTotal: 10, transcriptBodyReady: true })
  const next = enforceMonotonic(prev, deriveContentStates({ permission: 'denied' }))
  return next.transcript === 'denied'
})
check('事件映射：meeting.end 回读全部维度', () => {
  const w = eventToRefetch('meeting.end')
  return w.record && w.transcript && w.timeline && w.participants && w.minutes
})
check('事件映射：meeting.started 不烧额度', () => {
  const w = eventToRefetch('meeting.started')
  return !w.record && !w.transcript && !w.timeline && !w.minutes
})
check('本地信号 0 次调用即可派生', () => {
  const s = localContentSignals({
    records: [{ record_file_id: 'f' }],
    content: { transcript: { empty: false }, timeline: { empty: true }, minutes: { empty: false } },
    ended: true,
    autoRecordType: 'cloud',
    autoAsr: true
  })
  const d = deriveContentStates(s)
  return d.transcript === 'ready' && d.minutes === 'ready' && d.timeline !== 'ready'
})

// 3.5 素材补录（用户自己粘的原文）
check('粘贴素材能存能取，且记来源与字数', () => {
  const env = { ...process.env }
  process.env.DSH_HOME = process.env.TEMP || '/tmp'
  const id = 'test-meeting-pasted'
  savePasted({ meetingId: id, kind: 'transcript', text: '张三：第一件事。\n李四：第二件事。', source: '手机录音转文字' })
  const got = getPasted(id, 'transcript')
  deletePasted(id, 'transcript')
  process.env = env
  return Boolean(got) && got.chars > 0 && got.source === '手机录音转文字' && got.text.includes('第一件事')
})
check('已有素材时不覆盖要拦下', () => {
  const env = { ...process.env }
  process.env.DSH_HOME = process.env.TEMP || '/tmp'
  const id = 'test-meeting-overwrite'
  savePasted({ meetingId: id, kind: 'minutes', text: '第一版', source: '手打' })
  const blocked = savePasted({ meetingId: id, kind: 'minutes', text: '第二版', source: '手打' })
  const forced = savePasted({ meetingId: id, kind: 'minutes', text: '第二版', source: '手打', overwrite: true })
  const meta = listPasted(id)
  deletePasted(id, 'minutes')
  process.env = env
  return blocked.ok === false && blocked.replaced === true && forced.ok === true && meta.length === 1
})
check('粘贴的素材能作为产出原文来源', () => {
  const env = { ...process.env }
  process.env.DSH_HOME = process.env.TEMP || '/tmp'
  const id = 'test-meeting-material'
  savePasted({ meetingId: id, kind: 'transcript', text: '原文正文', source: '录音' })
  const m = pastedAsText(id)
  deletePasted(id, 'transcript')
  process.env = env
  return m.transcript === '原文正文' && m.sources.length === 1 && m.sources[0].includes('用户提供')
})

// 3.6 建会/改会后立刻进列表（不二次拉接口）
check('写操作后快照就地更新，同 id 不重复', () => {
  const env = { ...process.env }
  process.env.DSH_HOME = process.env.TEMP || '/tmp'
  const brief = {
    meetingId: 'smoke-upsert-1',
    meetingCode: '123456789',
    subject: '冒烟测试会',
    startTime: '2026-12-01T10:00:00+08:00',
    endTime: '2026-12-01T11:00:00+08:00'
  }
  upsertSnapshot('upcoming', brief)
  upsertSnapshot('upcoming', { ...brief, subject: '冒烟测试会（改过）' })
  const list = readStore().snapshot.upcoming
  const hits = list.filter((m) => m.meetingId === 'smoke-upsert-1')
  const ok = hits.length === 1 && hits[0].subject === '冒烟测试会（改过）'
  // 收尾：把这行从快照里去掉，别污染后续检查
  const store = readStore()
  store.snapshot.upcoming = store.snapshot.upcoming.filter((m) => m.meetingId !== 'smoke-upsert-1')
  process.env = env
  return ok
})

// 4. 偏好与存储默认值
check('偏好默认值可用', () => {  const p = readPrefs()
  return typeof p === 'object' && Array.isArray(p.outputSkills)
})
check('存储默认为空快照', () => {
  const s = readStore()
  return s && typeof s === 'object' && Array.isArray(s.transcriptReady)
})
check('emptyStore 形状正确', () => {
  const s = emptyStore()
  return s.snapshot && Array.isArray(s.snapshot.upcoming) && typeof s.outputs === 'object'
})

// 5. 二进制定位（只读探测，不 spawn）
check('二进制定位返回结构', () => {
  const loc = locateBinary('')
  return typeof loc.binary === 'string' && typeof loc.source === 'string'
})

// 6. 技能正文非空
check('每个技能都有正文与触发条件', () => {
  return registered.skills.every((s) => s.name && s.description && s.whenToUse && s.content && s.content.length > 100)
})

// 7. 工具描述里没有英文堆栈样板
check('工具描述里不含占位文案', () => {
  return registered.tools.every((t) => !/TODO|FIXME|REPLACE_ME/.test(t.description))
})

console.log('')
if (failures) {
  console.log(`失败 ${failures} 项`)
  process.exit(1)
}
console.log('全部通过')
