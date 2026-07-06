import { useState } from 'react'
import PracticeActions from './PracticeActions.jsx'

export default function FillBlank({ practice, onChecked }) {
  const { textParts = [], blanks = [] } = practice || {}
  const [answers, setAnswers] = useState(() => blanks.map(() => null))
  const [checked, setChecked] = useState(false)

  const allFilled = answers.length > 0 && answers.every((a) => a !== null)

  function setAnswer(i, value) {
    if (checked) return
    setAnswers((prev) => {
      const next = [...prev]
      next[i] = value === '' ? null : Number(value)
      return next
    })
  }

  function handleCheck() {
    if (!allFilled) return
    setChecked(true)
    onChecked?.(true)
  }

  function handleReset() {
    setAnswers(blanks.map(() => null))
    setChecked(false)
    onChecked?.(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-xl bg-gray-50 p-4 text-sm leading-8 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200">
        {textParts.map((part, i) => (
          <span key={i} className="contents">
            <span>{part}</span>
            {blanks[i] && (
              <select
                value={answers[i] ?? ''}
                disabled={checked}
                onChange={(e) => setAnswer(i, e.target.value)}
                className={`mx-1 rounded-lg border px-2 py-1 text-sm font-medium ${
                  checked
                    ? Number(answers[i]) === blanks[i].answer
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                      : 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
                    : 'border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
                }`}
              >
                <option value="" disabled>
                  เลือก...
                </option>
                {blanks[i].options.map((opt, oi) => (
                  <option key={oi} value={oi}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </span>
        ))}
      </div>
      {checked && (
        <div className="space-y-2">
          {blanks.map((blank, i) => {
            const correct = Number(answers[i]) === blank.answer
            return (
              <div
                key={i}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  correct
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/10 dark:text-emerald-300'
                    : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/60 dark:bg-rose-900/10 dark:text-rose-300'
                }`}
              >
                ช่องที่ {i + 1}: {correct ? 'ถูกต้อง' : `ที่ถูกคือ "${blank.options[blank.answer]}"`}
                {blank.explanation ? ` — ${blank.explanation}` : ''}
              </div>
            )
          })}
        </div>
      )}
      <PracticeActions checked={checked} disabled={!allFilled} onCheck={handleCheck} onReset={handleReset} />
    </div>
  )
}
