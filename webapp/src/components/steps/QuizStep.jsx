import { useState } from 'react'

// Retry reshuffling is a deliberate user action (not part of the initial
// deterministic render), so a plain Math.random-based shuffle is fine here —
// the "no Math.random in render" rule from the spec targets the Ordering
// practice's initial layout, not this explicit "ลองใหม่" action.
function shuffleIndexes(n) {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

export default function QuizStep({ step, onComplete }) {
  const questions = step?.questions || []
  const total = questions.length

  const [order, setOrder] = useState(() => questions.map((_, i) => i))
  const [qi, setQi] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [attempt, setAttempt] = useState(1)

  if (!total) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">ไม่มีคำถามแบบทดสอบสำหรับตอนนี้</p>
  }

  const currentIndex = order[qi]
  const current = questions[currentIndex]
  const scorePct = Math.round((correctCount / total) * 100)
  const passed = scorePct >= 70

  function handleSelect(i) {
    if (revealed) return
    setSelected(i)
  }

  function handleReveal() {
    if (selected === null) return
    setRevealed(true)
    if (selected === current.answer) setCorrectCount((c) => c + 1)
  }

  function handleNext() {
    if (qi + 1 >= total) {
      setFinished(true)
      onComplete?.(Math.round((correctCount / total) * 100))
    } else {
      setQi((v) => v + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  function handleRetry() {
    setOrder(shuffleIndexes(total))
    setQi(0)
    setSelected(null)
    setRevealed(false)
    setCorrectCount(0)
    setFinished(false)
    setAttempt((a) => a + 1)
  }

  if (finished) {
    return (
      <div className="space-y-4 py-4 text-center">
        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 text-2xl font-bold ${
            passed
              ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400'
              : 'border-rose-400 text-rose-600 dark:text-rose-400'
          }`}
        >
          {scorePct}%
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ตอบถูก {correctCount} จาก {total} ข้อ
        </p>
        {passed ? (
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">ผ่านแล้ว เก่งมาก! ไปขั้นสรุปต่อได้เลย</p>
        ) : (
          <div className="space-y-3">
            <p className="font-semibold text-rose-500 dark:text-rose-400">
              ยังไม่ถึงเกณฑ์ 70% ลองใหม่อีกครั้งนะ (ยังไปขั้นสรุปต่อได้)
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-700"
            >
              ลองใหม่
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          ข้อ {qi + 1} / {total}
        </span>
        {attempt > 1 && <span>ครั้งที่ {attempt}</span>}
      </div>
      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{current.q}</p>
      <div className="space-y-2">
        {current.choices.map((choice, i) => {
          let cls = 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-violet-500'
          if (revealed) {
            if (i === current.answer) cls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
            else if (i === selected) cls = 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'
          } else if (i === selected) {
            cls = 'border-indigo-400 bg-indigo-50 dark:border-violet-500 dark:bg-violet-900/20'
          }
          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => handleSelect(i)}
              className={`w-full rounded-xl border p-3 text-left text-sm transition disabled:cursor-default ${cls}`}
            >
              {choice}
              {revealed && i === current.answer && <span className="ml-2">✓</span>}
              {revealed && i === selected && i !== current.answer && <span className="ml-2">✕</span>}
            </button>
          )
        })}
      </div>
      {revealed && current.explanation && (
        <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
          {current.explanation}
        </p>
      )}
      <div className="flex justify-end">
        {!revealed ? (
          <button
            type="button"
            onClick={handleReveal}
            disabled={selected === null}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-violet-600"
          >
            ตรวจคำตอบ
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-700"
          >
            {qi + 1 >= total ? 'ดูผลคะแนน' : 'ข้อถัดไป'}
          </button>
        )}
      </div>
    </div>
  )
}
