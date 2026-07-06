import { useMemo, useState } from 'react'
import PracticeActions from './PracticeActions.jsx'
import { seededShuffle } from '../../lib/shuffle.js'

export default function Ordering({ practice, sectionId, onChecked }) {
  const steps = practice?.steps || []
  // Deterministic shuffle seeded from the section id — never Math.random()
  // during render, so the initial order is stable across re-renders.
  const shuffled = useMemo(() => seededShuffle(practice?.steps || [], `${sectionId}-ordering`), [practice, sectionId])
  const initialOrder = useMemo(() => shuffled.map((s) => s.originalIndex), [shuffled])

  const [order, setOrder] = useState(initialOrder)
  const [checked, setChecked] = useState(false)

  function move(pos, dir) {
    if (checked) return
    setOrder((prev) => {
      const target = pos + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const tmp = next[pos]
      next[pos] = next[target]
      next[target] = tmp
      return next
    })
  }

  function handleCheck() {
    setChecked(true)
    onChecked?.(true)
  }

  function handleReset() {
    setOrder(initialOrder)
    setChecked(false)
    onChecked?.(false)
  }

  const allCorrect = checked && order.every((origIdx, pos) => origIdx === pos)

  return (
    <div className="space-y-3">
      <ol className="space-y-2">
        {order.map((origIdx, pos) => {
          const isCorrectPos = origIdx === pos
          return (
            <li
              key={origIdx}
              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                checked
                  ? isCorrectPos
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/10'
                    : 'border-rose-300 bg-rose-50 dark:border-rose-700/60 dark:bg-rose-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {pos + 1}
              </span>
              <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{steps[origIdx]}</span>
              {!checked && (
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    aria-label="เลื่อนขึ้น"
                    onClick={() => move(pos, -1)}
                    disabled={pos === 0}
                    className="rounded border border-gray-300 px-1.5 text-xs text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:text-gray-300"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="เลื่อนลง"
                    onClick={() => move(pos, 1)}
                    disabled={pos === order.length - 1}
                    className="rounded border border-gray-300 px-1.5 text-xs text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:text-gray-300"
                  >
                    ↓
                  </button>
                </div>
              )}
              {checked && <span className="shrink-0">{isCorrectPos ? '✓' : '✕'}</span>}
            </li>
          )
        })}
      </ol>
      {checked && !allCorrect && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
          <p className="mb-1 font-semibold text-gray-700 dark:text-gray-300">ลำดับที่ถูกต้อง</p>
          <ol className="list-decimal space-y-0.5 pl-5">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}
      <PracticeActions checked={checked} disabled={false} onCheck={handleCheck} onReset={handleReset} />
    </div>
  )
}
