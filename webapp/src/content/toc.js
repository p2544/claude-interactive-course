// Table of contents: chapter/extra metadata. Content JSON lives in
// sibling files (ch0.json, ch1.json, ...) and is wired up in index.js.
// `accent` picks a color family from lib/accent.js for chapter cards,
// progress bars, and section-page CTAs.

export const chapters = [
  { id: 'ch0', number: 0, title: 'บทนำ', available: true, accent: 'slate' },
  { id: 'ch1', number: 1, title: 'Claude Models Family', available: true, accent: 'blue' },
  { id: 'ch2', number: 2, title: 'Prompt Engineering', available: true, accent: 'violet' },
  { id: 'ch3', number: 3, title: '9 Features หลักของ Claude', available: true, accent: 'teal' },
  { id: 'ch4', number: 4, title: 'Products ทั้งหมดของ Claude', available: true, accent: 'amber' },
  { id: 'ch5', number: 5, title: 'Custom Skills', available: true, accent: 'rose' },
  { id: 'ch6', number: 6, title: 'Agent SDK', available: true, accent: 'cyan' },
  { id: 'ch7', number: 7, title: 'Safety & Pitfalls', available: true, accent: 'red' },
]

// `path` is the route each extra section lives at — used both by the
// sidebar/mobile nav (Shell.jsx) and the Dashboard cards.
export const extras = [
  { id: 'workflows', title: 'Workflows W1–W16', available: true, path: '/workflows' },
  { id: 'cookbook', title: 'Prompt Cookbook — 90 Prompts', available: true, path: '/cookbook' },
  { id: 'glossary', title: 'Glossary & Cheatsheet', available: true, path: '/glossary' },
]
