import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getWorkflow } from '../content/workflows.js'
import { useProgress, toggleWorkflowStep, workflowStats } from '../lib/progress.js'
import { renderMarkdownLite } from '../lib/markdown.jsx'
import PromptTemplate from '../components/practice/PromptTemplate.jsx'

function MistakesAccordion({ mistakes }) {
  const [openIdx, setOpenIdx] = useState(null)
  return (
    <div className="space-y-2">
      {mistakes.map((m, i) => {
        const open = openIdx === i
        return (
          <div key={i} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 bg-rose-50/60 px-4 py-3 text-left text-sm font-semibold text-rose-700 dark:bg-rose-900/10 dark:text-rose-300"
            >
              <span>⚠️ {m.title}</span>
              <span aria-hidden="true">{open ? '−' : '+'}</span>
            </button>
            {open && (
              <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{m.detail}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function WorkflowRunner() {
  const { wfId } = useParams()
  const workflow = getWorkflow(wfId)
  const progress = useProgress()

  if (!workflow) {
    return (
      <div className="mx-auto max-w-lg space-y-3 py-16 text-center">
        <p className="text-gray-600 dark:text-gray-400">ไม่พบ workflow นี้</p>
        <Link to="/workflows" className="text-teal-600 hover:underline dark:text-teal-400">
          ← กลับหน้า Workflows
        </Link>
      </div>
    )
  }

  const doneSteps = progress.workflows[workflow.id]?.done || []
  const stats = workflowStats(workflow, progress)

  return (
    <div className="space-y-6 pb-16">
      <div>
        <Link to="/workflows" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
          ← Workflows
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-600 dark:text-teal-300">{workflow.num}</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{workflow.title}</h1>
            {workflow.subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{workflow.subtitle}</p>}
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              {stats.done} / {stats.total} ขั้นตอน
            </p>
            <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-full rounded-full bg-teal-500" style={{ width: `${stats.pct}%` }} />
            </div>
          </div>
        </div>
        {workflow.goal && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">🎯 {workflow.goal}</p>}
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
          {workflow.time && <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">⏱ {workflow.time}</span>}
          {workflow.pages && <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">อ้างอิงหน้า {workflow.pages}</span>}
        </div>
      </div>

      <ol className="space-y-4">
        {(workflow.steps || []).map((step, idx) => {
          const done = doneSteps.includes(idx)
          return (
            <li
              key={idx}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/60"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleWorkflowStep(workflow.id, idx)}
                  aria-pressed={done}
                  aria-label={`ขั้นตอนที่ ${idx + 1}: ${step.title} — ${done ? 'ทำแล้ว' : 'ยังไม่ได้ทำ'}`}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-sm font-bold transition ${
                    done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-gray-300 text-transparent hover:border-teal-400 dark:border-gray-600'
                  }`}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1 space-y-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    ขั้นที่ {idx + 1}: {step.title}
                  </h3>
                  {step.detail && <div className="space-y-2 text-sm">{renderMarkdownLite(step.detail)}</div>}

                  {Array.isArray(step.checklist) && step.checklist.length > 0 && (
                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                      <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        ผลลัพธ์ที่ควรได้ก่อนไปขั้นถัดไป
                      </p>
                      <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        {step.checklist.map((c, ci) => (
                          <li key={ci} className="flex gap-1.5">
                            <span aria-hidden="true">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(step.prompts) && step.prompts.length > 0 && (
                    <div className="space-y-4">
                      {step.prompts.map((p, pi) => (
                        <div key={pi} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                          <PromptTemplate prompt={p} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {Array.isArray(workflow.mistakes) && workflow.mistakes.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">ข้อผิดพลาดที่พบบ่อย</h2>
          <MistakesAccordion mistakes={workflow.mistakes} />
        </section>
      )}

      {Array.isArray(workflow.quickRef) && workflow.quickRef.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Quick Reference</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full border-collapse text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-200">
                      ใช้เมื่อไหร่
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-200">
                      Prompt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workflow.quickRef.map((q, i) => (
                    <tr key={i} className="odd:bg-white even:bg-gray-50/60 dark:odd:bg-transparent dark:even:bg-gray-800/30">
                      <td className="border-b border-gray-100 px-3 py-2 align-top text-gray-700 dark:border-gray-800/60 dark:text-gray-300">
                        {q.useCase}
                      </td>
                      <td className="border-b border-gray-100 px-3 py-2 align-top font-mono text-xs text-gray-700 dark:border-gray-800/60 dark:text-gray-300">
                        {q.prompt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
