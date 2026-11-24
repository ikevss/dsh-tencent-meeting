/**
 * 极简 Markdown → HTML。
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

/** 导出成自包含 HTML 文件的内容 */
export function markdownToHtmlDocument(source: string, title: string): string {
  const body = renderMarkdown(source)
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light; }
  body { font: 15px/1.75 -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
         color: #1f2937; background: #f7f8fa; margin: 0; padding: 32px 20px; }
  .page { max-width: 760px; margin: 0 auto; background: #fff; padding: 28px 32px;
          border: 1px solid #e5e7eb; border-radius: 12px; }
  h1 { font-size: 22px; margin: 0 0 6px; }
  h2 { font-size: 17px; margin: 22px 0 8px; padding-bottom: 6px; border-bottom: 1px solid #eef0f4; }
  h3 { font-size: 15px; margin: 16px 0 6px; }
  p { margin: 8px 0; }
  ul, ol { margin: 8px 0; padding-left: 22px; }
  li { margin: 4px 0; }
  blockquote { margin: 10px 0; padding: 8px 12px; border-left: 3px solid #d97706;
               background: #fffbeb; color: #92400e; border-radius: 0 6px 6px 0; }
  code { background: #f3f4f6; padding: 1px 5px; border-radius: 4px; font-size: 13px; }
  a { color: #2563eb; }
  .meta { color: #6b7280; font-size: 13px; }
</style>
</head>
<body>
<div class="page">
${body}
</div>
</body>
</html>
`
}
