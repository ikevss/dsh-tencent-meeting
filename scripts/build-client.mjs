/**
 * 打浏览器半：src/client/index.tsx → lib/client.js
 *
 * 为什么必须自己套信封：DSH 的浏览器半不是普通入口，而是一段工厂函数
 *   window.__ModuleLoader__.load({ id, factory: (require) => 模块导出 })
 * require 由宿主提供，只认 react / react-dom。所以：
 *
 *  1. bun build 出 CJS，--external react --external react-dom（这两条 require 留给宿主）；
 *  2. Radix 等第三方库正常打进 bundle（宿主模块表里没有它们，不打包就是运行时报错）；
 *  3. CSS 必须变成字符串，apply 里插 <style>。不能让 bun 产出独立 .css 资产 ——
 *     ModuleLoader 不会加载它，用户看到的是一屏没样式的裸 DOM；
 *  4. 把 bundle 正文整段贴进 factory，前面先摆好 module/exports，最后 return module.exports。
 *
 * 关于 CSS：SPEC 写的是 `--loader:.css=text`。实测 bun 1.3 对 .css 不认这个 loader
 * （仍会切出独立 .css 资产，模块值退化成空对象），所以改用等价的 onLoad 插件把 CSS
 * 读成 `export default "<css>"` —— 语义与 text loader 一致，且产物里只有 JS。
 *
 * JSX 必须走 classic（React.createElement）：react/jsx-runtime 不在宿主模块表里，
 * 自动运行时会 require 它，浏览器里直接「找不到模块」。这里 tsconfig 覆盖 + onResolve 兜底。
 *
 * 脚本可重复跑、失败非零退出、最后打印产物大小。
 */
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

// fileURLToPath 而不是 import.meta.dir：后者只有 bun 有，脚本要能在 node 下跑
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const ENTRY = path.join(ROOT, 'src', 'client', 'index.tsx')
const OUT_DIR = path.join(ROOT, 'lib')
const OUT_FILE = path.join(OUT_DIR, 'client.js')
const PANEL_ID = 'dsh-tencent-meeting'

const JSX_RUNTIME_SHIM = `var React = require('react');
export const Fragment = React.Fragment;
export function jsx(type, props, key) {
  return React.createElement(type, key == null ? props : Object.assign({ key: key }, props));
}
export const jsxs = jsx;
export const jsxDEV = jsx;
`

/**
 * 交给 bun 跑的构建脚本。
 * 输出目录走环境变量传，不拼进源码 —— Windows 路径里的反斜杠会被当成转义符，
 * 拼进字符串字面量就变成 `C:UsersEDYAppDataLocalTemp...`（实测踩过）。
 */
const INNER_SCRIPT = `import { build } from 'bun'
import { readFile } from 'node:fs/promises'

const OUT = process.env.TMEET_BUILD_OUT
const ENTRY = process.env.TMEET_BUILD_ENTRY
const JSX_SHIM = process.env.TMEET_BUILD_SHIM

const result = await build({
  entrypoints: [ENTRY],
  outdir: OUT,
  target: 'browser',
  format: 'cjs',
  splitting: false,
  sourcemap: 'none',
  minify: false,
  external: ['react', 'react-dom'],
  tsconfig: {
    compilerOptions: {
      jsx: 'react',
      jsxFactory: 'React.createElement',
      jsxFragmentFactory: 'React.Fragment'
    }
  },
  plugins: [
    {
      name: 'tm-css-as-text',
      setup(b) {
        b.onLoad({ filter: /\\.css$/ }, async (args) => {
          const css = await readFile(args.path, 'utf8')
          return { contents: 'export default ' + JSON.stringify(css) + ';', loader: 'js' }
        })
        b.onResolve({ filter: /^react\\/jsx(-dev)?-runtime$/ }, () => ({
          path: 'jsx-runtime-shim',
          namespace: 'tm-shim'
        }))
        b.onLoad({ filter: /.*/, namespace: 'tm-shim' }, () => ({
          contents: JSX_SHIM,
          loader: 'js'
        }))
      }
    }
  ]
})

if (!result.success) {
  for (const log of result.logs) console.error(String(log))
  process.exit(2)
}
const js = result.outputs.find((o) => o.path.endsWith('.js'))
if (!js) {
  console.error('bun 没产出 js 文件')
  process.exit(3)
}
console.log('OUTPUT:' + js.path)
`

function probe(cmd) {
  try {
    return spawnSync(cmd, ['--version'], { encoding: 'utf8' }).status === 0 ? cmd : null
  } catch {
    return null
  }
}

function findBun() {
  const explicit = process.env.BUN_BINARY || process.env.BUN
  if (explicit && existsSync(explicit)) return explicit

  // Windows 上 bun 常由 npm 全局安装：PATH 里是 bun.cmd 垫片，直接 spawn .cmd 需要 shell
  //（还有注入风险），所以顺着垫片找到真正的 bun.exe。
  if (process.platform === 'win32') {
    const candidates = []
    const where = spawnSync('where', ['bun'], { encoding: 'utf8' })
    if (where.status === 0) {
      for (const line of String(where.stdout || '').split(/\r?\n/)) {
        const p = line.trim()
        if (!p) continue
        if (p.toLowerCase().endsWith('.exe')) candidates.push(p)
        else candidates.push(path.join(path.dirname(p), 'node_modules', 'bun', 'bin', 'bun.exe'))
      }
    }
    if (process.env.APPDATA) candidates.push(path.join(process.env.APPDATA, 'npm', 'node_modules', 'bun', 'bin', 'bun.exe'))
    candidates.push(path.join(ROOT, 'node_modules', 'bun', 'bin', 'bun.exe'))
    for (const c of candidates) {
      if (c && existsSync(c)) {
        const ok = probe(c)
        if (ok) return ok
      }
    }
  }

  const local = path.join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'bun.exe' : 'bun')
  if (existsSync(local)) {
    const ok = probe(local)
    if (ok) return ok
  }
  return probe('bun')
}

function indent(text, prefix) {
  return text
    .split('\n')
    .map((line) => (line.length ? prefix + line : line))
    .join('\n')
}

function envelope(bundleCode) {
  return `// dsh-tencent-meeting · 浏览器半（由 scripts/build-client.mjs 生成，勿手改）
// 形态：宿主 __ModuleLoader__ 信封 + factory 内 return module.exports
window.__ModuleLoader__.load({ id: ${JSON.stringify(PANEL_ID)}, factory: (require) => {
  'use strict'
  var module = { exports: {} }
  var exports = module.exports
${indent(bundleCode, '  ')}
  return module.exports
} })
`
}

async function main() {
  if (!existsSync(ENTRY)) {
    console.error(`[build-client] 找不到入口：${ENTRY}`)
    process.exit(1)
  }
  const bun = findBun()
  if (!bun) {
    console.error('[build-client] 找不到 bun。装一个（https://bun.sh）或把路径放进环境变量 BUN_BINARY。')
    process.exit(1)
  }

  const tmp = await mkdtemp(path.join(os.tmpdir(), 'tm-client-'))
  try {
    const innerPath = path.join(tmp, 'build.inner.mjs')
    const shimPath = path.join(tmp, 'jsx-runtime-shim.mjs')
    await writeFile(innerPath, INNER_SCRIPT, 'utf8')
    await writeFile(shimPath, JSX_RUNTIME_SHIM, 'utf8')

    const run = spawnSync(bun, ['run', innerPath], {
      encoding: 'utf8',
      cwd: ROOT,
      env: {
        ...process.env,
        TMEET_BUILD_OUT: tmp,
        TMEET_BUILD_ENTRY: ENTRY,
        TMEET_BUILD_SHIM: JSX_RUNTIME_SHIM
      }
    })
    if (run.status !== 0) {
      const detail = [run.stdout, run.stderr].filter(Boolean).join('\n').trim()
      console.error('[build-client] 打包失败：')
      console.error(detail || `bun 退出码 ${run.status}`)
      process.exit(1)
    }

    const marker = /^OUTPUT:(.+)$/m.exec(run.stdout || '')
    const jsPath = marker ? marker[1].trim() : null
    if (!jsPath || !existsSync(jsPath)) {
      console.error(`[build-client] bun 没报错但找不到产物：${jsPath || '(空)'}`)
      process.exit(1)
    }

    const bundle = await readFile(jsPath, 'utf8')

    // 自检 1：除了 react / react-dom，产物里不能有别的裸 require（Radix 必须是打包进去的）
    const requires = new Set()
    for (const m of bundle.matchAll(/\brequire\(\s*["']([^"']+)["']\s*\)/g)) requires.add(m[1])
    const bad = [...requires].filter((r) => r !== 'react' && r !== 'react-dom')
    if (bad.length) {
      console.error(`[build-client] 产物里还有未打包的外部依赖：${bad.join(', ')}`)
      process.exit(1)
    }
    if (!requires.has('react')) {
      console.error('[build-client] 产物里没有 require("react")，入口是不是没用到 React？')
      process.exit(1)
    }

    // 自检 2：CSS 必须已内联（否则就是一屏没样式的裸 DOM）
    if (!bundle.includes('.tm-surface')) {
      console.error('[build-client] 产物里找不到样式表内容，CSS 内联失败')
      process.exit(1)
    }

    await mkdir(OUT_DIR, { recursive: true })
    const final = envelope(bundle)
    await writeFile(OUT_FILE, final, 'utf8')

    const bytes = Buffer.byteLength(final, 'utf8')
    console.log(`[build-client] ok → ${path.relative(ROOT, OUT_FILE)}  ${(bytes / 1024).toFixed(1)} KB`)
    console.log(`[build-client] 外部依赖只剩：${[...requires].join(', ')}`)
  } finally {
    await rm(tmp, { recursive: true, force: true })
  }
}

main().catch((e) => {
  console.error('[build-client] 意外失败：', e?.stack || String(e))
  process.exit(1)
})
