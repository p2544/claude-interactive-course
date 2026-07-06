import { useMemo, useState } from 'react'
import { getGlossaryData } from '../content/glossaryData.js'
import { seededShuffle } from '../lib/shuffle.js'
import { BlockList } from '../components/blocks/BlockRenderer.jsx'

function TermsList({ terms }) {
  const [query, setQuery] = useState('')

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = terms.filter(
      (t) =>
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.thai.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q),
    )
    const sorted = [...filtered].sort((a, b) => a.term.localeCompare(b.term))
    const byLetter = new Map()
    sorted.forEach((t) => {
      const letter = (t.letter || t.term[0] || '#').toUpperCase()
      if (!byLetter.has(letter)) byLetter.set(letter, [])
      byLetter.get(letter).push(t)
    })
    return Array.from(byLetter.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [terms, query])

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหาคำศัพท์..."
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-600"
      />
      {grouped.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          ไม่พบคำศัพท์ที่ตรงกับคำค้นหา
        </p>
      )}
      {grouped.map(([letter, items]) => (
        <div key={letter} className="space-y-2">
          <h3 className="text-sm font-bold text-violet-600 dark:text-violet-300">{letter}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((t) => (
              <div
                key={t.term}
                className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900/50"
              >
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {t.term} <span className="font-normal text-gray-400">· {t.thai}</span>
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t.definition}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Flashcards({ terms }) {
  const [attempt, setAttempt] = useState(1)
  const [pool, setPool] = useState(null) // null = use all terms
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState({ known: [], unknown: [] })

  const roundTerms = useMemo(
    () => seededShuffle(pool || terms, `glossary-flashcard-${attempt}`).map((x) => x.value),
    [pool, terms, attempt],
  )

  const finished = idx >= roundTerms.length
  const current = roundTerms[idx]

  function markCard(known) {
    setResults((r) => (known ? { ...r, known: [...r.known, current] } : { ...r, unknown: [...r.unknown, current] }))
    setFlipped(false)
    setIdx((i) => i + 1)
  }

  function restart(nextPool) {
    setPool(nextPool)
    setAttempt((a) => a + 1)
    setIdx(0)
    setFlipped(false)
    setResults({ known: [], unknown: [] })
  }

  if (roundTerms.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">ไม่มีคำศัพท์สำหรับโหมด Flashcard</p>
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">จบรอบแล้ว</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          รู้แล้ว {results.known.length} คำ · ยังไม่รู้ {results.unknown.length} คำ
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {results.unknown.length > 0 && (
            <button
              type="button"
              onClick={() => restart(results.unknown)}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              ลองใหม่เฉพาะคำที่ยังไม่รู้ ({results.unknown.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => restart(null)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300"
          >
            เริ่มรอบใหม่ทั้งหมด
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <p className="text-center text-xs text-gray-400">
        การ์ดที่ {idx + 1} / {roundTerms.length} {attempt > 1 && `· รอบที่ ${attempt}`}
      </p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex h-56 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-violet-300 bg-white p-6 text-center shadow-sm transition hover:shadow-md dark:border-violet-700 dark:bg-gray-900/60"
      >
        {!flipped ? (
          <>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{current.term}</p>
            <p className="text-sm text-gray-400">{current.thai}</p>
            <p className="mt-4 text-xs text-gray-400">(แตะเพื่อดูคำอธิบาย)</p>
          </>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300">{current.definition}</p>
        )}
      </button>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => markCard(false)}
          className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/20"
        >
          ยังไม่รู้
        </button>
        <button
          type="button"
          onClick={() => markCard(true)}
          className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
        >
          รู้แล้ว
        </button>
      </div>
    </div>
  )
}

function TermsTab({ terms }) {
  const [mode, setMode] = useState('list')
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setMode((m) => (m === 'list' ? 'flashcard' : 'list'))}
          className="rounded-xl border border-violet-300 px-3 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-900/20"
        >
          {mode === 'list' ? '🃏 โหมด Flashcard' : '📋 กลับไปโหมดรายการ'}
        </button>
      </div>
      {mode === 'list' ? <TermsList terms={terms} /> : <Flashcards terms={terms} />}
    </div>
  )
}

function ReferenceTab({ sections }) {
  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div key={s.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">{s.title}</h3>
          <BlockList blocks={s.blocks} />
        </div>
      ))}
    </div>
  )
}

export default function Glossary() {
  const { terms, sections } = getGlossaryData()
  const [tab, setTab] = useState('terms')

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Glossary & Reference</h1>
        <p className="mt-1 text-sm text-violet-100">ภาคผนวก ข — คำศัพท์และข้อมูลอ้างอิงที่ใช้บ่อยตลอดทั้งเล่ม</p>
      </header>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'terms', label: 'คำศัพท์' },
          { id: 'reference', label: 'API Reference' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? 'border-violet-600 text-violet-700 dark:border-violet-400 dark:text-violet-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'terms' ? <TermsTab terms={terms} /> : <ReferenceTab sections={sections} />}
    </div>
  )
}
