import { useState } from 'react'
import PracticeActions from './PracticeActions.jsx'

export default function McqScenario({ practice, onChecked }) {
  const { scenario, choices = [] } = practice || {}
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)

  function handleCheck() {
    if (selected === null) return
    setChecked(true)
    onChecked?.(true)
  }

  function handleReset() {
    setSelected(null)
    setChecked(false)
    onChecked?.(false)
  }

  return (
    <div className="space-y-3">
      {scenario && (
        <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">{scenario}</p>
      )}
      <div className="space-y-2">
        {choices.map((choice, i) => {
          const isSelected = selected === i
          let cls = 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-violet-500'
          if (checked && isSelected) {
            cls = choice.correct
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'
          } else if (checked && choice.correct) {
            cls = 'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/10'
          } else if (isSelected) {
            cls = 'border-indigo-400 bg-indigo-50 dark:border-violet-500 dark:bg-violet-900/20'
          }
          return (
            <button
              key={i}
              type="button"
              disabled={checked}
              onClick={() => setSelected(i)}
              className={`w-full rounded-xl border p-3 text-left text-sm transition disabled:cursor-default ${cls}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-800 dark:text-gray-200">{choice.text}</span>
                {checked && isSelected && <span className="shrink-0">{choice.correct ? '✓' : '✕'}</span>}
                {checked && !isSelected && choice.correct && (
                  <span className="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400">คำตอบที่ถูก</span>
                )}
              </div>
              {checked && isSelected && choice.feedback && (
                <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">{choice.feedback}</p>
              )}
            </button>
          )
        })}
      </div>
      <PracticeActions checked={checked} disabled={selected === null} onCheck={handleCheck} onReset={handleReset} />
    </div>
  )
}
