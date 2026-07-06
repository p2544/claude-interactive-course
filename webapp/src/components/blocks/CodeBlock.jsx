import { useState } from 'react'

export default function CodeBlock({ block }) {
  const { lang, caption, code = '' } = block || {}
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!navigator.clipboard) return
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {})
  }

  return (
    <div className="my-1 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2 border-b border-gray-800 px-3 py-1.5 text-xs text-gray-400">
        <span className="truncate">
          {lang || 'text'}
          {caption ? ` · ${caption}` : ''}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded px-2 py-0.5 text-gray-300 hover:bg-gray-800"
        >
          {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed text-gray-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}
