import { renderMarkdownLite } from '../../lib/markdown.jsx'

const VARIANTS = {
  tip: {
    wrap: 'border-emerald-300/60 bg-emerald-50 dark:border-emerald-700/50 dark:bg-emerald-900/20',
    title: 'text-emerald-800 dark:text-emerald-300',
    icon: '💡',
    fallbackLabel: 'เคล็ดลับ',
  },
  warning: {
    wrap: 'border-amber-300/60 bg-amber-50 dark:border-amber-700/50 dark:bg-amber-900/20',
    title: 'text-amber-800 dark:text-amber-300',
    icon: '⚠️',
    fallbackLabel: 'ข้อควรระวัง',
  },
  info: {
    wrap: 'border-sky-300/60 bg-sky-50 dark:border-sky-700/50 dark:bg-sky-900/20',
    title: 'text-sky-800 dark:text-sky-300',
    icon: 'ℹ️',
    fallbackLabel: 'ข้อมูลเพิ่มเติม',
  },
}

export default function Callout({ block }) {
  const variant = VARIANTS[block?.variant] || VARIANTS.info
  return (
    <div className={`my-1 rounded-xl border px-4 py-3 ${variant.wrap}`}>
      <div className={`flex items-center gap-2 text-sm font-semibold ${variant.title}`}>
        <span aria-hidden="true">{variant.icon}</span>
        <span>{block?.title || variant.fallbackLabel}</span>
      </div>
      <div className="mt-1 space-y-2 text-sm text-gray-700 dark:text-gray-300">
        {renderMarkdownLite(block?.md)}
      </div>
    </div>
  )
}
