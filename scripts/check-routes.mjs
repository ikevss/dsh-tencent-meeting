/**
 * 路由与客户端调用面的交叉核对：客户端 api.ts 里出现的每个 /tmeet/api 路径，
 * 都必须在 routes.ts 里有对应分支。反向不要求（有些路由只给工具用）。
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const routes = fs.readFileSync(path.join(root, 'src/routes.ts'), 'utf8')
const clientFiles = ['src/client/lib/api.ts']

const needed = new Set()
for (const rel of clientFiles) {
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) continue
  const text = fs.readFileSync(full, 'utf8')
  for (const m of text.matchAll(/request<[^>]*>\(\s*['"`]([^'"`]+)/g)) needed.add(m[1])
}

let bad = 0
for (const p of [...needed].sort()) {
  const needle = `path === '${p}'`
  if (!routes.includes(needle)) {
    console.log(`MISSING route for client path ${p}`)
    bad += 1
  }
}

// 三个已知的实现必须存在的分支（防手滑删掉）
for (const p of [
  '/status',
  '/meetings',
  '/meeting',
  '/meeting/create',
  '/meeting/cancel',
  '/meeting/content',
  '/meeting/states',
  '/meeting/participants',
  '/meeting/output',
  '/meeting/invite-text',
  '/meeting/permission',
  '/meeting/replay',
  '/settings',
  '/setup/install',
  '/auth/start',
  '/auth/poll',
  '/auth/logout'
]) {
  if (!routes.includes(`path === '${p}'`)) {
    console.log(`MISSING required route ${p}`)
    bad += 1
  }
}

console.log(bad ? `路由核对失败 ${bad} 项` : `路由核对通过（客户端用到 ${needed.size} 条）`)
process.exit(bad ? 1 : 0)
