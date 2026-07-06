import { Link } from 'react-router-dom'
import { getWorkflows } from '../content/workflows.js'
import { useProgress, workflowStats } from '../lib/progress.js'

export default function Workflows() {
  const workflows = getWorkflows()
  const progress = useProgress()

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Workflows W1–W16</h1>
        <p className="mt-1 text-sm text-teal-100">
          ทำตามขั้นตอนจริงทีละ workflow ตั้งแต่ต้นจนได้ผลลัพธ์ พร้อม prompt สำเร็จรูปที่ปรับแต่งได้
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-300">
        ℹ️ <strong>W11 (Subtitles)</strong> ถูกอ้างถึงในหนังสือแต่ไม่มีหน้าเนื้อหาจริงในเล่ม — เป็นความคลาดเคลื่อนของต้นฉบับ
        ไม่ใช่ workflow ที่หายไปจากแอปนี้
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workflows.map((wf) => {
          const stats = workflowStats(wf, progress)
          const done = stats.total > 0 && stats.done === stats.total
          return (
            <Link
              key={wf.id}
              to={`/workflows/${wf.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-teal-600 dark:text-teal-300">{wf.num}</p>
                  {done && <span className="text-xs font-medium text-emerald-500">✓ ทำครบแล้ว</span>}
                </div>
                <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">{wf.title}</p>
                {wf.goal && <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{wf.goal}</p>}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-400">
                  {wf.time && <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">⏱ {wf.time}</span>}
                  {wf.pages && <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">หน้า {wf.pages}</span>}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>ความคืบหน้า</span>
                  <span>
                    {stats.done}/{stats.total} ขั้นตอน
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${stats.pct}%` }} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
