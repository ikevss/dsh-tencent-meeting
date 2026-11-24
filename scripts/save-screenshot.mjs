import fs from 'node:fs'
import path from 'node:path'

const [, , spill, out] = process.argv
if (!spill || !out) {
  console.error('usage: node scripts/save-screenshot.mjs <spill.txt> <out.png>')
  process.exit(1)
}
const text = fs.readFileSync(spill, 'utf8')
const m = /"data_base64":"([A-Za-z0-9+/=]+)"/.exec(text)
if (!m) {
  console.error('no base64 screenshot found in spill')
  process.exit(1)
}
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, Buffer.from(m[1], 'base64'))
console.log('wrote', out, fs.statSync(out).size, 'bytes')
