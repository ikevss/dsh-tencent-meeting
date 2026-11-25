/**
 * 极简 Markdown → HTML，以及「产出成品」的自包含 HTML 文档。
 *
 * 为什么自己写：客户端只能 require('react') / require('react-dom')，
 * 引不进 marked 这类库。产出正文就是固定几种段落（标题、加粗、列表、引用、段落），
 * 自己处理这几种足够，也比把 Markdown 源码直接摊给用户看要好。
 *
 * 安全：先把整段文本 HTML 转义，再做标记替换，避免正文里的 <script> 之类被当真标签。
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 行内：加粗、行内代码、链接 */
function inline(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
}

export function renderMarkdown(source: string): string {
  // 用正则分行，不写字面量换行符（构建器会把 '\n' 改写成含缩进空格的模板串，导致分行失效——实测踩过）
  const lines = String(source ?? '').split(/\r?\n/)
  const out: string[] = []
  let list: 'ul' | 'ol' | null = null

  const closeList = (): void => {
    if (list) {
      out.push(list === 'ul' ? '</ul>' : '</ol>')
      list = null
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      closeList()
      continue
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      closeList()
      const level = h[1].length
      out.push(`<h${level}>${inline(escapeHtml(h[2]))}</h${level}>`)
      continue
    }
    if (/^(&gt;|>)\s?/.test(line)) {
      closeList()
      out.push(`<blockquote>${inline(escapeHtml(line.replace(/^(&gt;|>)\s?/, '')))}</blockquote>`)
      continue
    }
    const ul = /^[-*]\s+/.test(line)
    const ol = /^\d+[.、]\s+/.test(line)
    if (ul || ol) {
      const want: 'ul' | 'ol' = ul ? 'ul' : 'ol'
      if (list !== want) {
        closeList()
        out.push(want === 'ul' ? '<ul>' : '<ol>')
        list = want
      }
      const body = line.replace(/^([-*]|\d+[.、])\s+/, '')
      out.push(`<li>${inline(escapeHtml(body))}</li>`)
      continue
    }
    closeList()
    out.push(`<p>${inline(escapeHtml(line))}</p>`)
  }
  closeList()
  return out.join('\n')
}

/* ── 产出成品：自包含 HTML 文档 ──
 *
 * 产出正文是 Markdown（模型生成、可再生成、可复制），HTML 只在「导出 / 在浏览器打开」时拼一次。
 * 头部（标题 + 「主题 · 时间」「素材 · 模型 · 生成方式」两行元信息）从正文里拆出来做成文档头，
 * 这样成品打开就是一份排好版的报告，而不是一坨 Markdown 源码.
 */

export interface HtmlDocMeta {
  /** 页脚展示用：生成时间（ISO 字符串） */
  generatedAt?: string
}

interface DocHead {
  title: string
  /** 没有「标签：」的元信息行，例如「主题 · 时间」 */
  sub: string[]
  /** 「标签：值」形式的元信息，例如 素材=逐字稿 */
  fields: Array<[string, string]>
  body: string
}

/** 拆出开头的 h1 与紧跟其后的引用块（产出的元信息），其余作为正文 */
function splitDocHead(source: string, fallbackTitle: string): DocHead {
  const lines = String(source ?? '').split(/\r?\n/)
  let i = 0
  while (i < lines.length && !lines[i].trim()) i++

  let title = fallbackTitle
  const h = i < lines.length ? /^#\s+(.*)$/.exec(lines[i].trim()) : null
  if (h) {
    title = h[1].trim()
    i++
  }

  const quotes: string[] = []
  for (;;) {
    let j = i
    while (j < lines.length && !lines[j].trim()) j++
    const line = j < lines.length ? lines[j].trim() : ''
    if (/^(&gt;|>)\s?/.test(line)) {
      quotes.push(line.replace(/^(&gt;|>)\s?/, ''))
      i = j + 1
      continue
    }
    break
  }

  const sub: string[] = []
  const fields: Array<[string, string]> = []
  for (const q of quotes) {
    for (const seg of q.split(' · ')) {
      const at = seg.indexOf('：')
      if (at > 0 && at <= 8) fields.push([seg.slice(0, at).trim(), seg.slice(at + 1).trim()])
      else if (seg.trim()) sub.push(seg.trim())
    }
  }
  return { title, sub, fields, body: lines.slice(i).join('\n') }
}

/** 来源标记（【引用】【转写】【概括】【推断·高】…）：做成小徽标，报告里一眼分清事实与推断 */
function markSources(html: string): string {
  return html.replace(
    /【(引用|转写|概括|推断·[高中低])】/g,
    (_all, tag: string) => {
      const cls = tag === '引用' ? 'q' : tag === '转写' ? 't' : tag === '概括' ? 'g' : 'i'
      return `<span class="mk mk-${cls}">${tag}</span>`
    }
  )
}

function formatGeneratedAt(iso: string): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  const d = new Date(t)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const DOC_CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    padding: 40px 20px 64px;
    background: #f2f4f8;
    color: #1c2534;
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC",
      -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 15.5px;
    line-height: 1.85;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  .doc {
    max-width: 780px;
    margin: 0 auto;
    background: #fff;
    border: 1px solid #e4e8ef;
    border-radius: 14px;
    box-shadow: 0 1px 2px rgba(16, 24, 40, .04), 0 16px 40px -16px rgba(16, 24, 40, .10);
    overflow: hidden;
  }
  .doc-head { padding: 44px 48px 24px; border-bottom: 1px solid #eef1f6; }
  .doc-kicker {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px;
    font-size: 12px; letter-spacing: .16em; color: #8a94a6;
  }
  .doc-kicker::before { content: ""; width: 18px; height: 2px; border-radius: 2px; background: #2f5fd0; }
  .doc-title {
    margin: 0 0 10px;
    font-size: 26px; line-height: 1.4; font-weight: 650; letter-spacing: .01em; color: #141b28;
  }
  .doc-sub { margin: 0 0 20px; font-size: 14px; color: #5b6b82; }
  .doc-meta {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px 24px; margin: 0; padding-top: 16px; border-top: 1px dashed #e8ecf3;
  }
  .doc-meta-item { display: flex; gap: 8px; align-items: baseline; min-width: 0; }
  .doc-meta-item dt { flex: none; font-size: 12.5px; color: #8a94a6; }
  .doc-meta-item dd { margin: 0; font-size: 13.5px; font-weight: 500; color: #2a3547; overflow-wrap: anywhere; }
  .doc-body { padding: 10px 48px 40px; }
  .doc-body h2 {
    margin: 34px 0 12px; padding-left: 12px;
    border-left: 3px solid #2f5fd0; line-height: 1.45;
    font-size: 18px; font-weight: 650; color: #182030;
  }
  .doc-body h3 { margin: 24px 0 10px; font-size: 15.5px; font-weight: 650; color: #1c2534; }
  .doc-body h4 { margin: 20px 0 8px; font-size: 14.5px; font-weight: 650; color: #1c2534; }
  .doc-body p { margin: 10px 0; }
  .doc-body ul, .doc-body ol { margin: 10px 0; padding-left: 24px; }
  .doc-body li { margin: 6px 0; }
  .doc-body li::marker { color: #2f5fd0; }
  .doc-body strong { font-weight: 650; color: #141b28; }
  .doc-body blockquote {
    margin: 16px 0; padding: 12px 16px;
    background: #f7f9fc; border-left: 3px solid #c3ccd9; border-radius: 0 8px 8px 0;
    color: #3b4759;
  }
  .doc-body code {
    padding: 2px 6px; border-radius: 6px; background: #f4f6f9;
    font-size: .9em; color: #334155;
  }
  .doc-body a { color: #2f5fd0; text-decoration: none; border-bottom: 1px solid rgba(47, 95, 208, .3); }
  .doc-body hr { margin: 28px 0; border: 0; border-top: 1px solid #eef1f6; }
  .mk {
    display: inline-block; margin-right: 4px; padding: 1px 7px;
    border-radius: 999px; font-size: 11.5px; line-height: 1.7; font-weight: 600;
    vertical-align: 1px; letter-spacing: .02em;
  }
  .mk-q { background: #eef3fe; color: #2b57b8; }
  .mk-t { background: #e9f6f4; color: #1f7a6d; }
  .mk-g { background: #f1f3f6; color: #5b6b82; }
  .mk-i { background: #fdf4e5; color: #a1681a; }
  .doc-foot {
    display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
    padding: 16px 48px; border-top: 1px solid #eef1f6; background: #fafbfd;
    color: #8a94a6; font-size: 12.5px;
  }
  @media (max-width: 640px) {
    body { padding: 16px 10px 40px; }
    .doc { border-radius: 10px; }
    .doc-head { padding: 28px 22px 16px; }
    .doc-title { font-size: 21px; }
    .doc-body { padding: 4px 22px 28px; }
    .doc-foot { padding: 14px 22px; }
  }
  @media print {
    body { padding: 0; background: #fff; }
    .doc { max-width: 100%; border: 0; border-radius: 0; box-shadow: none; }
    .doc-body { padding: 0 6px; }
    .doc-foot { background: #fff; }
    .doc-body h2, .doc-body h3 { break-after: avoid; }
    .doc-body li, .doc-body blockquote { break-inside: avoid; }
  }
  @page { margin: 16mm; }
`

/** 导出成自包含 HTML 文件的内容（导出 / 在浏览器打开共用这一份） */
export function markdownToHtmlDocument(source: string, title: string, meta: HtmlDocMeta = {}): string {
  const head = splitDocHead(source, title)
  const body = markSources(renderMarkdown(head.body))

  const sub = head.sub.length
    ? `<p class="doc-sub">${head.sub.map((s) => escapeHtml(s)).join(' · ')}</p>`
    : ''
  const fields = head.fields.length
    ? `<dl class="doc-meta">${head.fields
        .map(([k, v]) => `<div class="doc-meta-item"><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`)
        .join('')}</dl>`
    : ''
  const when = meta.generatedAt ? formatGeneratedAt(meta.generatedAt) : ''

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${DOC_CSS}</style>
</head>
<body>
<article class="doc">
  <header class="doc-head">
    <div class="doc-kicker">腾讯会议 · 会后产出</div>
    <h1 class="doc-title">${escapeHtml(head.title)}</h1>
    ${sub}
    ${fields}
  </header>
  <div class="doc-body">
${body}
  </div>
  <footer class="doc-foot">
    <span>由 DSH 腾讯会议插件生成</span>
    <span>${when ? `生成于 ${when}` : '内容以素材为准，标注来源层级'}</span>
  </footer>
</article>
</body>
</html>
`
}
