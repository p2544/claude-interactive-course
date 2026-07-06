// Per-chapter accent colors (see content/toc.js). Tailwind v4 scans source
// text for class names it needs to generate, so we keep every class name
// spelled out literally here (not built with template strings) — that way
// picking a chapter's accent dynamically at runtime still works after build.

const ACCENTS = {
  slate: {
    bg: 'bg-slate-500',
    text: 'text-slate-600 dark:text-slate-300',
    soft: 'bg-slate-100 dark:bg-slate-800/40',
    border: 'border-slate-300 dark:border-slate-700',
    chip: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-300',
    soft: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-700',
    chip: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  },
  violet: {
    bg: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-300',
    soft: 'bg-violet-100 dark:bg-violet-900/30',
    border: 'border-violet-300 dark:border-violet-700',
    chip: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-300',
    soft: 'bg-emerald-100 dark:bg-emerald-900/30',
    border: 'border-emerald-300 dark:border-emerald-700',
    chip: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-300',
    soft: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-300 dark:border-amber-700',
    chip: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  rose: {
    bg: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-300',
    soft: 'bg-rose-100 dark:bg-rose-900/30',
    border: 'border-rose-300 dark:border-rose-700',
    chip: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  },
  cyan: {
    bg: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-300',
    soft: 'bg-cyan-100 dark:bg-cyan-900/30',
    border: 'border-cyan-300 dark:border-cyan-700',
    chip: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-300',
    soft: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-700',
    chip: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  },
  teal: {
    bg: 'bg-teal-500',
    text: 'text-teal-600 dark:text-teal-300',
    soft: 'bg-teal-100 dark:bg-teal-900/30',
    border: 'border-teal-300 dark:border-teal-700',
    chip: 'bg-teal-500/15 text-teal-700 dark:text-teal-300',
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-600 dark:text-red-300',
    soft: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-300 dark:border-red-700',
    chip: 'bg-red-500/15 text-red-700 dark:text-red-300',
  },
}

export function getAccent(name) {
  return ACCENTS[name] || ACCENTS.slate
}
