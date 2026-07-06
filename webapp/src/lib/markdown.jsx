// Very small "markdown-lite" renderer for the `md` field used by text and
// callout blocks. Intentionally only supports what the content schema
// promises: **bold**, `inline code`, "- " bullet lines, and "### " sub-heads.
// No external markdown library — keeps the app dependency-free and the
// output 100% predictable for content authors.

function renderInline(text, keyPrefix) {
  const nodes = []
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g
  let lastIndex = 0
  let match
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    if (match[2] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${key}`} className="font-semibold text-gray-900 dark:text-gray-100">
          {match[2]}
        </strong>,
      )
    } else if (match[3] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${key}`}
          className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.85em] text-violet-700 dark:bg-gray-800 dark:text-violet-300"
        >
          {match[3]}
        </code>,
      )
    }
    key += 1
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

export function renderMarkdownLite(md) {
  const lines = String(md || '').split('\n')
  const elements = []
  let bulletBuffer = []

  function flushBullets() {
    if (bulletBuffer.length === 0) return
    elements.push(
      <ul key={`ul-${elements.length}`} className="list-disc space-y-1 pl-5">
        {bulletBuffer.map((line, i) => (
          <li key={i}>{renderInline(line, `ul-${elements.length}-${i}`)}</li>
        ))}
      </ul>,
    )
    bulletBuffer = []
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim()
    if (line === '') {
      flushBullets()
      return
    }
    if (line.startsWith('### ')) {
      flushBullets()
      elements.push(
        <h4 key={`h-${idx}`} className="mt-3 font-semibold text-gray-900 first:mt-0 dark:text-gray-100">
          {renderInline(line.slice(4), `h-${idx}`)}
        </h4>,
      )
    } else if (line.startsWith('- ')) {
      bulletBuffer.push(line.slice(2))
    } else {
      flushBullets()
      elements.push(
        <p key={`p-${idx}`} className="leading-relaxed text-gray-700 dark:text-gray-300">
          {renderInline(line, `p-${idx}`)}
        </p>,
      )
    }
  })
  flushBullets()

  return elements
}
