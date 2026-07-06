import { useState } from 'react'
import McqScenario from '../practice/McqScenario.jsx'
import Classify from '../practice/Classify.jsx'
import Ordering from '../practice/Ordering.jsx'
import FillBlank from '../practice/FillBlank.jsx'
import PromptBuilder from '../practice/PromptBuilder.jsx'

const KIND_COMPONENTS = {
  'mcq-scenario': McqScenario,
  classify: Classify,
  ordering: Ordering,
  'fill-blank': FillBlank,
  'prompt-builder': PromptBuilder,
}

export default function PracticeStep({ step, sectionId, onStatusChange }) {
  const [skipped, setSkipped] = useState(false)
  const Kind = KIND_COMPONENTS[step?.kind]

  function handleSkip() {
    setSkipped(true)
    onStatusChange?.(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          {step?.title && <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{step.title}</h3>}
          {step?.instructions && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{step.instructions}</p>}
        </div>
        {!skipped && (
          <button
            type="button"
            onClick={handleSkip}
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            ข้ามแบบฝึกหัด
          </button>
        )}
      </div>

      {skipped ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          ข้ามแบบฝึกหัดนี้แล้ว — ไปขั้นถัดไปได้เลย
        </div>
      ) : Kind ? (
        <Kind practice={step} sectionId={sectionId} onChecked={onStatusChange} />
      ) : (
        <p className="text-sm text-rose-500">ไม่รู้จักชนิดแบบฝึกหัด: {String(step?.kind)}</p>
      )}
    </div>
  )
}
