import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { chapters, extras } from '../../content/toc.js'
import { resetAll, exportProgressJSON, importProgressFromJSON } from '../../lib/progress.js'
import DarkModeToggle from './DarkModeToggle.jsx'

const PDF_HREF = `${import.meta.env.BASE_URL}manual500p.pdf`
// ปุ่มเปิด PDF ต้นฉบับแสดงเฉพาะเมื่อมีไฟล์ (build สาธารณะตั้ง VITE_ENABLE_PDF=false
// เพราะไม่แจกไฟล์หนังสือ — ดู README หัวข้อ "รันบนเครื่องตัวเอง")
const SHOW_PDF = import.meta.env.VITE_ENABLE_PDF !== 'false'

function NavLinks({ onNavigate }) {
  const location = useLocation()
  const isDashboard = location.pathname === '/'

  return (
    <nav className="flex flex-col gap-1">
      <Link
        to="/"
        onClick={onNavigate}
        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
          isDashboard
            ? 'bg-indigo-50 text-indigo-700 dark:bg-violet-900/30 dark:text-violet-300'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
      >
        หน้าหลัก
      </Link>
      {chapters.map((ch) => {
        const active = location.pathname.startsWith(`/chapter/${ch.id}`)
        if (!ch.available) {
          return (
            <span
              key={ch.id}
              className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-700"
            >
              <span className="truncate">บท {ch.number} · {ch.title}</span>
              <span className="shrink-0 text-[10px]">เร็วๆ นี้</span>
            </span>
          )
        }
        return (
          <Link
            key={ch.id}
            to={`/chapter/${ch.id}`}
            onClick={onNavigate}
            className={`truncate rounded-xl px-3 py-2 text-sm font-medium transition ${
              active
                ? 'bg-indigo-50 text-indigo-700 dark:bg-violet-900/30 dark:text-violet-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            บท {ch.number} · {ch.title}
          </Link>
        )
      })}

      <p className="mt-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-600">
        เนื้อหาเสริม
      </p>
      {extras.map((ex) => {
        const active = ex.path && location.pathname.startsWith(ex.path)
        if (!ex.available || !ex.path) {
          return (
            <span
              key={ex.id}
              className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-700"
            >
              <span className="truncate">{ex.title}</span>
              <span className="shrink-0 text-[10px]">เร็วๆ นี้</span>
            </span>
          )
        }
        return (
          <Link
            key={ex.id}
            to={ex.path}
            onClick={onNavigate}
            className={`truncate rounded-xl px-3 py-2 text-sm font-medium transition ${
              active
                ? 'bg-indigo-50 text-indigo-700 dark:bg-violet-900/30 dark:text-violet-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            {ex.title}
          </Link>
        )
      })}
    </nav>
  )
}

function MenuFooter({ onNavigate }) {
  const fileInputRef = useRef(null)
  const [importError, setImportError] = useState('')

  function handleReset() {
    if (window.confirm('ล้างความคืบหน้าทั้งหมด? การกระทำนี้ย้อนกลับไม่ได้')) {
      resetAll()
      onNavigate?.()
    }
  }

  function handleExport() {
    const blob = new Blob([exportProgressJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'claude-course-progress.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    setImportError('')
    fileInputRef.current?.click()
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importProgressFromJSON(String(reader.result || ''))
      if (result.ok) {
        window.location.reload()
      } else {
        setImportError(result.error)
      }
    }
    reader.onerror = () => setImportError('อ่านไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    reader.readAsText(file)
  }

  return (
    <div className="space-y-2">
      <DarkModeToggle />
      <Link
        to="/playground"
        onClick={onNavigate}
        className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        🧪 ทดลองกับ Claude จริง
      </Link>
      {SHOW_PDF && (
        <a
          href={PDF_HREF}
          target="_blank"
          rel="noopener"
          className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          📖 คู่มือ PDF ต้นฉบับ
        </a>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="flex-1 rounded-xl border border-gray-200 px-2 py-2 text-[11px] font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          ส่งออกความคืบหน้า
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="flex-1 rounded-xl border border-gray-200 px-2 py-2 text-[11px] font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          นำเข้าความคืบหน้า
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
      </div>
      {importError && <p className="text-xs text-rose-500 dark:text-rose-400">{importError}</p>}
      <button
        type="button"
        onClick={handleReset}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        ล้างความคืบหน้า
      </button>
    </div>
  )
}

export default function Shell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto flex max-w-6xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-gray-200 p-4 dark:border-gray-800 md:flex">
          <div>
            <Link to="/" className="mb-6 flex items-center gap-2 px-2">
              {/* Claude spark logo สวมหมวกปริญญา (inline SVG — ห้ามโหลด asset ภายนอก) */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                {/* พื้นหลังสี terra cotta ของแบรนด์ Claude */}
                <rect x="2" y="6" width="28" height="24" rx="7" fill="#D97757" />
                {/* Claude spark — รัศมี 12 แฉก */}
                <g stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="19" y1="19.5" x2="23" y2="19.5" />
                  <line x1="18.6" y1="18" x2="22.06" y2="16" />
                  <line x1="17.5" y1="16.9" x2="19.5" y2="13.44" />
                  <line x1="16" y1="16.5" x2="16" y2="12.5" />
                  <line x1="14.5" y1="16.9" x2="12.5" y2="13.44" />
                  <line x1="13.4" y1="18" x2="9.94" y2="16" />
                  <line x1="13" y1="19.5" x2="9" y2="19.5" />
                  <line x1="13.4" y1="21" x2="9.94" y2="23" />
                  <line x1="14.5" y1="22.1" x2="12.5" y2="25.56" />
                  <line x1="16" y1="22.5" x2="16" y2="26.5" />
                  <line x1="17.5" y1="22.1" x2="19.5" y2="25.56" />
                  <line x1="18.6" y1="21" x2="22.06" y2="23" />
                </g>
                {/* หมวกปริญญา (mortarboard) */}
                <path
                  d="M16 1 L29 6 L16 11 L3 6 Z"
                  fill="#1F2937"
                  stroke="#9CA3AF"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />
                {/* พู่หมวกสีทอง */}
                <path d="M16 6 L27 8.5 L27 12.5" stroke="#FBBF24" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <circle cx="27" cy="13.6" r="1.6" fill="#FBBF24" />
              </svg>
              <span className="text-sm font-bold leading-tight text-gray-900 dark:text-gray-100">เรียน Claude แบบ Interactive ด้วยตนเอง</span>
            </Link>
            <NavLinks />
          </div>
          <div className="px-2 pt-4">
            <MenuFooter />
          </div>
        </aside>

        <div className="flex min-h-screen w-full flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="เปิดเมนู"
              aria-expanded={mobileOpen}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="text-sm font-bold text-gray-900 dark:text-gray-100">
              เรียน Claude แบบ Interactive ด้วยตนเอง
            </Link>
            <DarkModeToggle compact />
          </header>

          {mobileOpen && (
            <div className="max-h-[calc(100vh-57px)] overflow-y-auto border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950 md:hidden">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              <div className="mt-3">
                <MenuFooter onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          )}

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
