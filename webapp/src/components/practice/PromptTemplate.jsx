import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Shared by the Workflow Runner and the Cookbook: renders a prompt template
// with a form of {{var}} inputs above and a live-filled preview below. Any
// var left empty shows as "[label]" in the preview so it's obvious what's
// still missing when copying.
function fillTemplate(template, values, vars) {
  return String(template || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, name) => {
    const value = values[name]
    if (value && value.trim()) return value.trim()
    const varDef = vars.find((v) => v.name === name)
    return `[${varDef?.label || name}]`
  })
}

export default function PromptTemplate({ prompt, className = '' }) {
  const { label, template, vars = [], tips } = prompt || {}
  const [values, setValues] = useState(() => Object.fromEntries(vars.map((v) => [v.name, ''])))
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  const preview = useMemo(() => fillTemplate(template, values, vars), [template, values, vars])

  function setValue(name, v) {
    setValues((prev) => ({ ...prev, [name]: v }))
  }

  function handleCopy() {
    if (!navigator.clipboard) return
    navigator.clipboard
      .writeText(preview)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {})
  }

  function handleTryClaude() {
    try {
      sessionStorage.setItem('playground-prefill', preview)
    } catch {
      // sessionStorage unavailable — playground still works, just unfilled
    }
    navigate('/playground')
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>}

      {vars.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {vars.map((v) => (
            <div key={v.name} className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400" htmlFor={`pt-${label}-${v.name}`}>
                {v.label}
              </label>
              <input
                id={`pt-${label}-${v.name}`}
                type="text"
                value={values[v.name] || ''}
                onChange={(e) => setValue(v.name, e.target.value)}
                placeholder={v.placeholder}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-600"
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">พรีวิว prompt</p>
        <pre className="whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-3 text-sm font-mono text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
          {preview}
        </pre>
      </div>

      {tips && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          💡 {tips}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
        </button>
        <button
          type="button"
          onClick={handleTryClaude}
          className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-900/20"
        >
          ลองกับ Claude จริง →
        </button>
      </div>
    </div>
  )
}
