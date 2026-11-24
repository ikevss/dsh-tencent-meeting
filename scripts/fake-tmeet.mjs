/**
 * 只用于截「未登录引导」图的替身 CLI。
 * 它不碰真实 ~/.tmeet，不联网、不发任何请求，只是按 tmeet 的输出形状回话。
 * 真实插件永远指向腾讯官方 CLI；这个文件只在隔离 profile 里手动配置给 tmeetBinary。
 */
const args = process.argv.slice(2)
if (args.includes('--version') || args.includes('-V')) {
  console.log('tmeet version v1.1.0')
  process.exit(0)
}
if (args[0] === 'auth' && args[1] === 'status') {
  // 真实 CLI 未登录时就是「纯文本 + 退出码 0」
  console.log('Not logged in')
  process.exit(0)
}
if (args[0] === 'auth' && args[1] === 'login') {
  console.log('Open this URL to authorize: https://meeting.tencent.com/authorize-demo')
  process.exit(0)
}
if (args.includes('--format')) {
  console.log(JSON.stringify({ trace_id: 'fake', message: 'ok', data: {} }))
} else {
  console.log('ok')
}
