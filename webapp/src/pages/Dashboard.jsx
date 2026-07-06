import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { chapters, extras } from '../content/toc.js'
import { getChapterContent } from '../content/index.js'
import { getWorkflows } from '../content/workflows.js'
import { useProgress, chapterStats, overrideUnlock, workflowStats } from '../lib/progress.js'
import { getAccent } from '../lib/accent.js'
import ProgressRing from '../components/layout/ProgressRing.jsx'

const PDF_HREF = `${import.meta.env.BASE_URL}manual500p.pdf`
// build สาธารณะไม่แจกไฟล์หนังสือ — ซ่อนการ์ด PDF ด้วย VITE_ENABLE_PDF=false (ดู Shell.jsx)
const SHOW_PDF = import.meta.env.VITE_ENABLE_PDF !== 'false'

const EXTRA_META = {
  workflows: { icon: '🧭', accent: 'teal', desc: 'ทำตามขั้นตอนจริงทีละ workflow พร้อม prompt สำเร็จรูป' },
  cookbook: { icon: '📚', accent: 'amber', desc: 'คลัง prompt สำเร็จรูป ค้นหาและกรอกตัวแปรแล้วใช้ได้ทันที' },
  glossary: { icon: '🔤', accent: 'violet', desc: 'คำศัพท์ + Flashcard + ข้อมูลอ้างอิง API' },
}

const PATHS = [
  {
    title: 'มือใหม่',
    desc: 'เริ่มจากศูนย์ เข้าใจภาพรวมก่อนลงมือใช้งานจริง',
    order: 'บทนำ → Claude Models Family → Prompt Engineering',
  },
  {
    title: 'Knowledge Worker',
    desc: 'เน้นใช้ Claude ให้ได้งานเร็วในชีวิตประจำวัน',
    order: 'บทนำ → Prompt Engineering → 9 Features หลัก',
  },
  {
    title: 'Developer',
    desc: 'สายเทคนิค เชื่อมต่อ Claude เข้ากับระบบของตัวเอง',
    order: 'Claude Models Family → Prompt Engineering → Agent SDK',
  },
]

export default function Dashboard() {
  const progress = useProgress()
  const [confirmChId, setConfirmChId] = useState(null)

  // Chapters that both have content and are marked available in toc.js,
  // in chapter order — used to compute the "unlock next chapter" chain.
  const withContent = useMemo(
    () =>
      chapters
        .filter((c) => c.available)
        .map((meta) => ({ meta, content: getChapterContent(meta.id) }))
        .filter((c) => c.content),
    [],
  )

  const overallStats = useMemo(() => {
    let total = 0
    let done = 0
    withContent.forEach(({ content }) => {
      const s = chapterStats(content, progress)
      total += s.total
      done += s.done
    })
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [withContent, progress])

  const allWorkflows = useMemo(() => getWorkflows(), [])
  const workflowsDoneCount = useMemo(
    () => allWorkflows.filter((wf) => { const s = workflowStats(wf, progress); return s.total > 0 && s.done === s.total }).length,
    [allWorkflows, progress],
  )

  function isUnlocked(idx) {
    if (idx === 0) return true
    const chId = withContent[idx]?.meta.id
    if (chId && progress.unlockOverrides.includes(chId)) return true
    const prevContent = withContent[idx - 1]?.content
    if (!prevContent) return true
    const s = chapterStats(prevContent, progress)
    return s.total > 0 && s.done === s.total
  }

  function handleSkip(chId) {
    overrideUnlock(chId)
    setConfirmChId(null)
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">คู่มือ Claude Interactive</h1>
          <p className="mt-1 text-sm text-indigo-100">เรียนรู้การใช้งาน Claude อย่างมีประสิทธิภาพ ทีละขั้นตอน</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <ProgressRing pct={overallStats.pct} size={64} />
          <div className="text-sm text-indigo-100">
            <p className="font-semibold text-white">
              {overallStats.done} / {overallStats.total} ตอน
            </p>
            <p>ความคืบหน้ารวม</p>
          </div>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">บทเรียน</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((ch) => {
            const accent = getAccent(ch.accent)
            const contentIdx = withContent.findIndex((c) => c.meta.id === ch.id)
            const contentEntry = contentIdx >= 0 ? withContent[contentIdx] : null

            if (!ch.available || !contentEntry) {
              return (
                <div
                  key={ch.id}
                  className="flex flex-col justify-between rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-5 opacity-70 dark:border-gray-700 dark:bg-gray-900/30"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">บทที่ {ch.number}</p>
                    <p className="mt-1 font-semibold text-gray-500 dark:text-gray-500">{ch.title}</p>
                  </div>
                  <span className="mt-4 inline-block w-fit rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    เร็วๆ นี้
                  </span>
                </div>
              )
            }

            const unlocked = isUnlocked(contentIdx)
            const stats = chapterStats(contentEntry.content, progress)

            if (!unlocked) {
              return (
                <div
                  key={ch.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/50"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">บทที่ {ch.number}</p>
                    <p className="mt-1 font-semibold text-gray-700 dark:text-gray-300">{ch.title}</p>
                    <p className="mt-2 text-xs text-gray-400">🔒 เรียนบทก่อนหน้าให้จบก่อน</p>
                  </div>
                  {confirmChId === ch.id ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">ข้ามไปเรียนบทนี้เลยไหม?</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSkip(ch.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${accent.bg}`}
                        >
                          ยืนยัน
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmChId(null)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmChId(ch.id)}
                      className="mt-4 w-fit text-xs font-medium text-indigo-600 hover:underline dark:text-violet-400"
                    >
                      ข้ามไปเรียนเลย
                    </button>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={ch.id}
                to={`/chapter/${ch.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold uppercase ${accent.text}`}>บทที่ {ch.number}</p>
                    {stats.total > 0 && stats.done === stats.total && (
                      <span className="text-xs font-medium text-emerald-500">✓ จบแล้ว</span>
                    )}
                  </div>
                  <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">{ch.title}</p>
                  <p className="mt-1 text-xs text-gray-400">{stats.total} ตอน</p>
                </div>
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className={`h-full rounded-full ${accent.bg}`} style={{ width: `${stats.pct}%` }} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">เส้นทางแนะนำ</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PATHS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/50"
            >
              <p className="font-semibold text-gray-800 dark:text-gray-100">{p.title}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{p.desc}</p>
              <p className="mt-3 text-xs text-indigo-600 dark:text-violet-400">{p.order}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">เนื้อหาเสริม</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {extras.map((ex) => {
            const meta = EXTRA_META[ex.id] || {}
            const accent = getAccent(meta.accent)

            if (!ex.available || !ex.path) {
              return (
                <div
                  key={ex.id}
                  className="flex flex-col justify-between rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-5 opacity-70 dark:border-gray-700 dark:bg-gray-900/30"
                >
                  <p className="font-semibold text-gray-500 dark:text-gray-500">{ex.title}</p>
                  <span className="mt-4 inline-block w-fit rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    เร็วๆ นี้
                  </span>
                </div>
              )
            }

            return (
              <Link
                key={ex.id}
                to={ex.path}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
              >
                <div>
                  <p className={`text-2xl ${accent.text}`} aria-hidden="true">
                    {meta.icon || '✨'}
                  </p>
                  <p className="mt-2 font-semibold text-gray-800 dark:text-gray-100">{ex.title}</p>
                  {meta.desc && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{meta.desc}</p>}
                </div>
                {ex.id === 'workflows' && (
                  <p className="mt-4 text-xs font-medium text-gray-400">
                    ทำครบแล้ว {workflowsDoneCount} / {allWorkflows.length} workflow
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      </section>

      {SHOW_PDF && (
        <section>
          <a
            href={PDF_HREF}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
          >
            <span className="text-2xl" aria-hidden="true">
              📖
            </span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">คู่มือ PDF ต้นฉบับ</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">เปิดไฟล์ PDF เต็มเล่มในแท็บใหม่</p>
            </div>
          </a>
        </section>
      )}
    </div>
  )
}
