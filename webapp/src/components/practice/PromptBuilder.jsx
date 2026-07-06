import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PracticeActions from './PracticeActions.jsx'

function evaluateSlot(slot, value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return slot.required ? 'empty' : 'neutral'
  const keywords = slot.keywords || []
  const lower = trimmed.toLowerCase()
  const matched = keywords.some((k) => lower.includes(String(k).toLowerCase()))
  return matched ? 'match' : 'unsure'
}

const STATUS_STYLE = {
  empty: { border: 'border-rose-400', badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-300', label: 'ต้องกรอกช่องนี้' },
  match: { border: 'border-emerald-400', badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300', label: 'เข้าเค้า' },
  unsure: { border: 'border-amber-400', badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-300', label: 'ลองเทียบกับเฉลย' },
  neutral: { border: 'border-gray-200 dark:border-gray-700', badge: 'bg-gray-500/10 text-gray-500 dark:text-gray-400', label: 'ไม่บังคับ' },
}

export default function PromptBuilder({ practice, onChecked }) {
  const { scenario, slots = [], modelAnswer } = practice || {}
  const [values, setValues] = useState(() => Object.fromEntries(slots.map((s) => [s.id, ''])))
  const [checked, setChecked] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  function setValue(id, v) {
    if (checked) return
    setValues((prev) => ({ ...prev, [id]: v }))
  }

  function handleCheck() {
    setChecked(true)
    onChecked?.(true)
  }

  function handleReset() {
    setValues(Object.fromEntries(slots.map((s) => [s.id, ''])))
    setChecked(false)
    setShowAnswer(false)
    onChecked?.(false)
  }

  const composed = slots
    .map((s) => values[s.id]?.trim())
    .filter(Boolean)
    .join('\n\n')

  function handleCopy() {
    if (!navigator.clipboard) return
    navigator.clipboard
      .writeText(composed)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {})
  }

  function handleTryClaude() {
    try {
      sessionStorage.setItem('playground-prefill', composed)
    } catch {
      // sessionStorage unavailable — playground still works, just unfilled
    }
    navigate('/playground')
  }

  return (
    <div className="space-y-4">
      {scenario && (
        <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">{scenario}</p>
      )}

      <div className="space-y-3">
        {slots.map((slot) => {
          const status = checked ? evaluateSlot(slot, values[slot.id]) : 'idle'
          const style = STATUS_STYLE[status]
          return (
            <div key={slot.id} className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {slot.label} {slot.required && <span className="text-rose-500">*</span>}
                </label>
                {slot.hint && <span className="text-xs text-gray-500 dark:text-gray-400">{slot.hint}</span>}
              </div>
              <textarea
                value={values[slot.id] || ''}
                disabled={checked}
                onChange={(e) => setValue(slot.id, e.target.value)}
                placeholder={slot.placeholder}
                rows={2}
                className={`w-full rounded-xl border bg-white p-2.5 text-sm text-gray-800 placeholder:text-gray-400 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-600 ${
                  checked ? style.border : 'border-gray-300 dark:border-gray-700'
                }`}
              />
              {checked && (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                  {style.label}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <PracticeActions
        checked={checked}
        disabled={false}
        onCheck={handleCheck}
        onReset={handleReset}
        checkLabel="ประกอบ prompt"
      />

      {checked && (
        <div className="space-y-2 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Prompt ที่ประกอบแล้ว</p>
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-sm font-mono text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
            {composed || '(ยังไม่ได้กรอกข้อมูล)'}
          </pre>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {copied ? 'คัดลอกแล้ว' : 'คัดลอก prompt'}
            </button>
            <button
              type="button"
              onClick={handleTryClaude}
              className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-900/20"
            >
              ลองกับ Claude จริง →
            </button>
            {modelAnswer && (
              <button
                type="button"
                onClick={() => setShowAnswer((s) => !s)}
                className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-900/20"
              >
                {showAnswer ? 'ซ่อนเฉลย' : 'ดูตัวอย่างเฉลย'}
              </button>
            )}
          </div>
          {showAnswer && modelAnswer && (
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-indigo-50 p-3 text-sm font-mono text-indigo-800 dark:bg-violet-900/10 dark:text-violet-200">
              {modelAnswer}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
