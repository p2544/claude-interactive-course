const PHASES = [
  { type: 'learn', label: 'เรียนรู้', icon: '📘' },
  { type: 'example', label: 'ตัวอย่าง', icon: '🔍' },
  { type: 'practice', label: 'ลงมือทำ', icon: '✏️' },
  { type: 'quiz', label: 'ทดสอบ', icon: '📝' },
  { type: 'apply', label: 'สรุป', icon: '🎯' },
]

export default function Stepper({ steps, currentIndex, onJump }) {
  const list = steps || []
  const currentType = list[currentIndex]?.type
  const currentPhaseIdx = PHASES.findIndex((p) => p.type === currentType)

  const firstIndexOf = {}
  list.forEach((s, i) => {
    if (!(s.type in firstIndexOf)) firstIndexOf[s.type] = i
  })

  return (
    <ol className="flex items-start justify-between gap-1 sm:gap-2">
      {PHASES.map((phase, pIdx) => {
        const has = phase.type in firstIndexOf
        const isCurrent = pIdx === currentPhaseIdx
        const isPast = pIdx < currentPhaseIdx
        const clickable = has && pIdx <= currentPhaseIdx && !!onJump

        let circleCls = 'border-gray-200 text-gray-300 dark:border-gray-800 dark:text-gray-700'
        if (has) {
          if (isCurrent) circleCls = 'border-indigo-500 bg-indigo-500 text-white dark:border-violet-400 dark:bg-violet-500'
          else if (isPast)
            circleCls = 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
          else circleCls = 'border-gray-300 text-gray-400 dark:border-gray-700 dark:text-gray-500'
        }

        return (
          <li key={phase.type} className="flex flex-1 flex-col items-center gap-1">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump(firstIndexOf[phase.type])}
              aria-label={phase.label}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm transition sm:h-10 sm:w-10 sm:text-base ${circleCls} ${
                clickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <span aria-hidden="true">{isPast ? '✓' : phase.icon}</span>
            </button>
            <span
              className={`hidden text-[11px] sm:block ${
                isCurrent ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {phase.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
