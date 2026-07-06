import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getChapterContent } from '../content/index.js'
import { chapters } from '../content/toc.js'
import { useProgress, setLastStep as persistLastStep, markQuiz } from '../lib/progress.js'
import { getAccent } from '../lib/accent.js'
import Stepper from '../components/steps/Stepper.jsx'
import LearnStep from '../components/steps/LearnStep.jsx'
import ExampleStep from '../components/steps/ExampleStep.jsx'
import PracticeStep from '../components/steps/PracticeStep.jsx'
import QuizStep from '../components/steps/QuizStep.jsx'
import ApplyStep from '../components/steps/ApplyStep.jsx'

export default function SectionPage() {
  const { chId, secId } = useParams()
  const navigate = useNavigate()

  const content = getChapterContent(chId)
  const chapterMeta = chapters.find((c) => c.id === chId)
  const accent = getAccent(chapterMeta?.accent)
  const section = content?.sections.find((s) => s.id === secId)

  const progress = useProgress()
  const savedProgress = progress.sections[secId]
  const hasSavedStep = !!savedProgress?.lastStep

  // 'ready' once the learner has answered (or didn't need to answer) the
  // "เรียนต่อ / เริ่มใหม่" resume prompt. All hooks below must run on every
  // render regardless of whether content/section resolve, so this and the
  // early-return "not found" check happen *after* every hook declaration.
  const [resumeChoice, setResumeChoice] = useState(() => (hasSavedStep ? null : 'ready'))
  const [stepIndex, setStepIndex] = useState(0)
  const [stepChecked, setStepChecked] = useState(false)

  useEffect(() => {
    if (resumeChoice !== 'ready' || !section) return
    setStepChecked(false)
    persistLastStep(secId, stepIndex, chId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, resumeChoice])

  if (!content || !section) {
    return (
      <div className="mx-auto max-w-lg space-y-3 py-16 text-center">
        <p className="text-gray-600 dark:text-gray-400">ไม่พบบทเรียนนี้</p>
        <Link to="/" className="text-indigo-600 hover:underline dark:text-violet-400">
          กลับหน้าหลัก
        </Link>
      </div>
    )
  }

  if (resumeChoice === null) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          คุณเรียนตอนนี้ไปถึงขั้นที่ {savedProgress.lastStep + 1} แล้ว
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">ต้องการเรียนต่อจากเดิม หรือเริ่มใหม่ตั้งแต่ต้น?</p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setStepIndex(Math.min(savedProgress.lastStep, section.steps.length - 1))
              setResumeChoice('ready')
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${accent.bg}`}
          >
            เรียนต่อ
          </button>
          <button
            type="button"
            onClick={() => {
              setStepIndex(0)
              setResumeChoice('ready')
            }}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300"
          >
            เริ่มใหม่
          </button>
        </div>
      </div>
    )
  }

  const steps = section.steps
  const totalSteps = steps.length
  const safeIndex = Math.min(stepIndex, totalSteps - 1)
  const currentStep = steps[safeIndex]
  const isApply = currentStep.type === 'apply'
  // A learner who already completed this section (revisiting/reviewing) is
  // never re-gated by practice/quiz checks.
  const alreadyCompleted = !!savedProgress?.completed
  const canGoNext =
    currentStep.type === 'practice' || currentStep.type === 'quiz' ? stepChecked || alreadyCompleted : true

  const sectionIndex = content.sections.findIndex((s) => s.id === secId)
  const nextSection = content.sections[sectionIndex + 1]

  function goPrev() {
    setStepIndex((i) => Math.max(0, i - 1))
  }

  function goNext() {
    if (!canGoNext) return
    setStepIndex((i) => Math.min(totalSteps - 1, i + 1))
  }

  function jumpTo(i) {
    setStepIndex(i)
  }

  function handleQuizComplete(scorePct) {
    markQuiz(secId, scorePct)
    setStepChecked(true)
  }

  function handleApplyNext() {
    if (nextSection) navigate(`/chapter/${chId}/${nextSection.id}`)
    else navigate(`/chapter/${chId}`)
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <Link to={`/chapter/${chId}`} className="text-sm text-gray-500 hover:underline dark:text-gray-400">
          ← {content.title}
        </Link>
        <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{section.title}</h1>
      </div>

      <Stepper steps={steps} currentIndex={safeIndex} onJump={jumpTo} />

      <div
        key={safeIndex}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 sm:p-6"
      >
        {currentStep.type === 'learn' && <LearnStep step={currentStep} />}
        {currentStep.type === 'example' && <ExampleStep step={currentStep} />}
        {currentStep.type === 'practice' && (
          <PracticeStep step={currentStep} sectionId={secId} onStatusChange={setStepChecked} />
        )}
        {currentStep.type === 'quiz' && <QuizStep step={currentStep} onComplete={handleQuizComplete} />}
        {currentStep.type === 'apply' && <ApplyStep step={currentStep} />}
      </div>

      {isApply ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleApplyNext}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm ${accent.bg}`}
          >
            {nextSection ? 'ตอนถัดไป →' : 'กลับหน้าบท'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={safeIndex === 0}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-30 dark:border-gray-700 dark:text-gray-300"
          >
            ← ก่อนหน้า
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40 ${accent.bg}`}
          >
            ถัดไป →
          </button>
        </div>
      )}
    </div>
  )
}
