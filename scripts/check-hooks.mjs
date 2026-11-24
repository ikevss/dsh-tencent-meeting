/**
 * 静态检查：组件里不能有「条件调用 hook」。
 *
 * 这次的故障（React #310 → 整屏空白）就是 renderHome 里放了一个 useMemo：
 * renderHome 只在部分分支被调用，hook 数量在两次渲染间不一致。
 * 这条检查扫所有 render* / 内部函数体内出现的 use* 调用，发现即报。
 */
import fs from 'node:fs'
import path from 'node:path'

const root = 'D:/ZP/DSH-腾讯会议插件/packages/dsh-tencent-meeting/src/client'
const files = []
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.tsx?$/.test(e.name)) files.push(p)
  }
}
walk(root)

let bad = 0
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n')
  // 跟踪嵌套函数：顶层组件是 export function X(...)
  // 简化判定：出现缩进 4 空格以上（函数体内）且以 function 定义的局部函数，其内部不允许 hook
  let depth = 0
  const stack = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // 检测局部函数定义（顶层组件之外）
    const local = /^  (?:async )?function (\w+)/.exec(line)
    if (local) stack.push({ name: local[1], line: i + 1, depth: 1 })
    // 检测局部函数结束（以两个空格 + } 结束）
    if (stack.length && /^  \}/.test(line)) {
      const done = stack.pop()
      void done
    }
    // 在局部函数体内出现 hook
    if (stack.length) {
      const hook = /\buse[A-Z]\w*\s*\(|React\.use[A-Z]\w*\s*\(/.exec(line)
      if (hook) {
        console.log(`FAIL ${path.relative(root, f)}:${i + 1} 在局部函数 ${stack[stack.length - 1].name} 内调用 ${hook[0].trim()}`)
        bad++
      }
    }
  }
}
console.log(bad ? `\n发现 ${bad} 处条件 hook` : '\n未发现局部函数里的 hook')
process.exit(bad ? 1 : 0)
