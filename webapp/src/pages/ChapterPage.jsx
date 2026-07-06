import { Link, useParams, useNavigate } from 'react-router-dom'
import { chapters } from '../content/toc.js'
import { getChapterContent } from '../content/index.js'
import { useProgress, chapterStats } from '../lib/progress.js'
import { getAccent } from '../lib/accent.js'

export default function ChapterPage() {
  const { chId } = useParams()
  const navigate = useNavigate()
  const meta = chapters.find((c) => c.id === chId)
  const content = getChapterContent(chId)
  const progress = useProgress()
  const accent = getAccent(meta?.accent)

  if (!meta || !content) {
    return (
      <div className="mx-auto max-w-lg space-y-3 py-16 text-center">
        <p className="text-gray-600 dark:text-gray-400">ยังไม่มีเนื้อหาบทนี้</p>
        <Link to="/" className="text-indigo-600 hover:underline dark:text-violet-400">
          กลับหน้าหลัก
        </Link>
      </div>
    )
  }

  const stats = chapterStats(content, progress)

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
          ← หน้าหลัก
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase ${accent.text}`}>บทที่ {meta.number}</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{content.title}</h1>
            {content.subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{content.subtitle}</p>}
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              {stats.done} / {stats.total} ตอน
            </p>
            <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div className={`h-full rounded-full ${accent.bg}`} style={{ width: `${stats.pct}%` }} />
            </div>
          </div>
        </div>
        {content.description && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{content.description}</p>}
      </div>

      <div className="space-y-3">
        {content.sections.map((sec) => {
          const sp = progress.sections[sec.id]
          const status = sp?.completed ? 'done' : sp?.lastStep ? 'inprogress' : 'todo'
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => navigate(`/chapter/${chId}/${sec.id}`)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    status === 'done'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : status === 'inprogress'
                        ? accent.chip
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {status === 'done' ? '✓' : sec.id}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-800 dark:text-gray-100">{sec.title}</p>
                  <p className="text-xs text-gray-400">
                    {sec.minutes} นาที
                    {sp?.bestScore != null ? ` · คะแนนล่าสุด ${sp.bestScore}%` : ''}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-gray-400">
                {status === 'done' ? 'จบแล้ว' : status === 'inprogress' ? 'กำลังเรียน' : 'ยังไม่เริ่ม'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
