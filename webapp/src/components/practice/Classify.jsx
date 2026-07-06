import { useState } from 'react'
import PracticeActions from './PracticeActions.jsx'

export default function Classify({ practice, onChecked }) {
  const { categories = [], items = [] } = practice || {}
  const [assignments, setAssignments] = useState({})
  const [checked, setChecked] = useState(false)

  function assign(itemIndex, catId) {
    if (checked) return
    setAssignments((prev) => ({ ...prev, [itemIndex]: catId }))
  }

  const allAssigned = items.length > 0 && items.every((_, i) => assignments[i])

  function handleCheck() {
    if (!allAssigned) return
    setChecked(true)
    onChecked?.(true)
  }

  function handleReset() {
    setAssignments({})
    setChecked(false)
    onChecked?.(false)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {items.map((item, i) => {
          const chosen = assignments[i]
          const isCorrect = chosen === item.category
          return (
            <div
              key={i}
              className={`rounded-xl border p-3 transition ${
                checked
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/10'
                    : 'border-rose-300 bg-rose-50 dark:border-rose-700/60 dark:bg-rose-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="text-sm text-gray-800 dark:text-gray-200">{item.text}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const active = chosen === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={checked}
                      onClick={() => assign(i, cat.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-default ${
                        active
                          ? 'border-indigo-400 bg-indigo-100 text-indigo-700 dark:border-violet-500 dark:bg-violet-900/40 dark:text-violet-200'
                          : 'border-gray-300 text-gray-600 hover:border-indigo-300 dark:border-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
              {checked && (
                <p
                  className={`mt-2 text-xs ${
                    isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isCorrect
                    ? '✓ ถูกต้อง'
                    : `✕ ที่ถูกคือ "${categories.find((c) => c.id === item.category)?.label ?? item.category}"`}
                  {item.explanation ? ` — ${item.explanation}` : ''}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <PracticeActions checked={checked} disabled={!allAssigned} onCheck={handleCheck} onReset={handleReset} />
    </div>
  )
}
