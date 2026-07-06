import { useMemo, useState } from 'react'
import { getCookbook } from '../content/cookbookData.js'
import PromptTemplate from '../components/practice/PromptTemplate.jsx'

export default function Cookbook() {
  const { categories, prompts } = getCookbook()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [openIds, setOpenIds] = useState(() => new Set())

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return prompts.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.template.toLowerCase().includes(q)
      )
    })
  }, [prompts, query, activeCategory])

  function toggleOpen(id) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Prompt Cookbook</h1>
        <p className="mt-1 text-sm text-amber-100">ภาคผนวก ก — คลัง prompt สำเร็จรูปพร้อมใช้ กรอกตัวแปรแล้วคัดลอกไปใช้ได้ทันที</p>
      </header>

      <div className="space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหา prompt จากชื่อ คำอธิบาย หรือเนื้อหา..."
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-600"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeCategory === null
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory((cur) => (cur === c.id ? null : c.id))}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                activeCategory === c.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {c.label} <span className="opacity-70">{c.range}</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400">พบ {filtered.length} prompt</p>
      </div>

      <div className="space-y-3">
        {filtered.map((p) => {
          const open = openIds.has(p.id)
          const cat = categories.find((c) => c.id === p.category)
          return (
            <div
              key={p.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50"
            >
              <button
                type="button"
                onClick={() => toggleOpen(p.id)}
                aria-expanded={open}
                className="flex w-full items-start justify-between gap-3 p-4 text-left"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-300">
                      #{String(p.id).padStart(2, '0')}
                    </span>
                    {cat && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                        {cat.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">{p.title}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{p.description}</p>
                </div>
                <span className="shrink-0 text-gray-400" aria-hidden="true">
                  {open ? '−' : '+'}
                </span>
              </button>
              {open && (
                <div className="border-t border-gray-100 p-4 dark:border-gray-800">
                  <PromptTemplate prompt={p} />
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            ไม่พบ prompt ที่ตรงกับคำค้นหา
          </p>
        )}
      </div>
    </div>
  )
}
