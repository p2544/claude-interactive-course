// Validator for content JSON per SPEC-content-schema.md
import fs from 'fs'

const file = process.argv[2]
const errs = [], warns = []
const E = (m) => errs.push(m)
const W = (m) => warns.push(m)

const ch = JSON.parse(fs.readFileSync(file, 'utf8'))
for (const k of ['id', 'number', 'title', 'description', 'sections']) {
  if (ch[k] === undefined) E(`chapter missing ${k}`)
}
if (!Array.isArray(ch.sections) || ch.sections.length === 0) E('no sections')

const STEP_TYPES = ['learn', 'example', 'practice', 'quiz', 'apply']
const KINDS = ['mcq-scenario', 'classify', 'ordering', 'fill-blank', 'prompt-builder']
const BLOCKS = ['text', 'table', 'code', 'callout']

for (const s of ch.sections || []) {
  const p = `sec ${s.id}`
  if (!s.id || !s.title || !Array.isArray(s.steps)) { E(`${p}: missing id/title/steps`); continue }
  const types = s.steps.map(st => st.type)
  for (const t of types) if (!STEP_TYPES.includes(t)) E(`${p}: unknown step type ${t}`)
  const count = t => types.filter(x => x === t).length
  if (count('learn') < 1) E(`${p}: no learn`)
  if (count('quiz') !== 1) E(`${p}: quiz count = ${count('quiz')}`)
  if (count('apply') !== 1) E(`${p}: apply count = ${count('apply')}`)
  if (types[types.length - 1] !== 'apply') E(`${p}: last step not apply`)
  if (types[types.length - 2] !== 'quiz') E(`${p}: quiz not before apply`)
  if (count('practice') < 1) W(`${p}: no practice (allowed only for summary sections)`)
  if (count('example') < 1) W(`${p}: no example`)

  for (const [i, st] of s.steps.entries()) {
    const q = `${p} step[${i}] ${st.type}`
    if (st.type === 'learn') {
      if (!Array.isArray(st.blocks) || !st.blocks.length) E(`${q}: no blocks`)
      for (const b of st.blocks || []) {
        if (!BLOCKS.includes(b.type)) E(`${q}: bad block type ${b.type}`)
        if (b.type === 'text' && typeof b.md !== 'string') E(`${q}: text block no md`)
        if (b.type === 'table' && (!Array.isArray(b.headers) || !Array.isArray(b.rows))) E(`${q}: bad table`)
        if (b.type === 'table' && b.rows?.some(r => r.length !== b.headers.length)) W(`${q}: table row width mismatch`)
        if (b.type === 'code' && typeof b.code !== 'string') E(`${q}: code block no code`)
        if (b.type === 'callout' && (typeof b.md !== 'string' || !['tip','warning','info'].includes(b.variant))) E(`${q}: bad callout`)
      }
      if ((st.blocks || []).length > 6) W(`${q}: ${st.blocks.length} blocks (>5 spec limit)`)
    }
    if (st.type === 'example') {
      if (!Array.isArray(st.compare) || !st.compare.length) E(`${q}: no compare`)
      for (const c of st.compare || []) {
        if (typeof c.content !== 'string' || typeof c.explanation !== 'string' || typeof c.good !== 'boolean' || !c.label) E(`${q}: bad compare item`)
      }
    }
    if (st.type === 'practice') {
      if (!KINDS.includes(st.kind)) { E(`${q}: bad kind ${st.kind}`); continue }
      if (!st.title || !st.instructions) W(`${q}: missing title/instructions`)
      if (st.kind === 'mcq-scenario') {
        if (!st.scenario || !Array.isArray(st.choices) || st.choices.length < 2) E(`${q}: bad mcq`)
        const ok = (st.choices || []).filter(c => c.correct === true).length
        if (ok !== 1) E(`${q}: correct choices = ${ok}`)
        if ((st.choices || []).some(c => !c.feedback)) E(`${q}: choice missing feedback`)
      }
      if (st.kind === 'classify') {
        if (!Array.isArray(st.categories) || st.categories.length < 2) E(`${q}: bad categories`)
        const ids = new Set((st.categories || []).map(c => c.id))
        for (const it of st.items || []) if (!ids.has(it.category)) E(`${q}: item category '${it.category}' not in categories`)
        if (!Array.isArray(st.items) || st.items.length < 3) E(`${q}: <3 items`)
      }
      if (st.kind === 'ordering') {
        if (!Array.isArray(st.steps) || st.steps.length < 3 || st.steps.length > 6) E(`${q}: ordering steps ${st.steps?.length}`)
      }
      if (st.kind === 'fill-blank') {
        if (!Array.isArray(st.textParts) || !Array.isArray(st.blanks)) E(`${q}: bad fill-blank`)
        else if (st.textParts.length !== st.blanks.length + 1) E(`${q}: textParts ${st.textParts.length} != blanks+1 ${st.blanks.length + 1}`)
        for (const b of st.blanks || []) {
          if (!Array.isArray(b.options) || typeof b.answer !== 'number' || b.answer < 0 || b.answer >= b.options.length) E(`${q}: bad blank`)
        }
      }
      if (st.kind === 'prompt-builder') {
        if (!st.scenario || !Array.isArray(st.slots) || !st.slots.length || !st.modelAnswer) E(`${q}: bad prompt-builder`)
        for (const sl of st.slots || []) {
          if (!sl.id || !sl.label || !Array.isArray(sl.keywords) || !sl.keywords.length) E(`${q}: bad slot ${sl.id}`)
          if ((sl.keywords || []).length < 3) W(`${q}: slot ${sl.id} only ${sl.keywords?.length} keywords (may be too strict)`)
        }
        if (!(st.slots || []).some(sl => sl.required)) W(`${q}: no required slot`)
      }
    }
    if (st.type === 'quiz') {
      if (!Array.isArray(st.questions) || st.questions.length < 3 || st.questions.length > 5) E(`${q}: ${st.questions?.length} questions`)
      for (const [j, qq] of (st.questions || []).entries()) {
        if (!qq.q || !Array.isArray(qq.choices) || qq.choices.length < 2) E(`${q} Q${j}: malformed`)
        if (typeof qq.answer !== 'number' || qq.answer < 0 || qq.answer >= (qq.choices || []).length) E(`${q} Q${j}: bad answer idx`)
        if (!qq.explanation) E(`${q} Q${j}: no explanation`)
      }
    }
    if (st.type === 'apply') {
      if (!Array.isArray(st.takeaways) || st.takeaways.length < 2) E(`${q}: takeaways < 2`)
    }
  }
}

console.log(`== ${file}`)
console.log(`sections: ${ch.sections?.length}, steps: ${ch.sections?.reduce((a, s) => a + (s.steps?.length || 0), 0)}`)
console.log(`practice kinds:`, JSON.stringify(Object.fromEntries(KINDS.map(k => [k, ch.sections.flatMap(s => s.steps).filter(st => st.type === 'practice' && st.kind === k).length]))))
console.log(`quiz questions total: ${ch.sections.flatMap(s => s.steps).filter(st => st.type === 'quiz').reduce((a, st) => a + st.questions.length, 0)}`)
if (errs.length) { console.log(`\nERRORS (${errs.length}):`); errs.forEach(e => console.log('  ✗', e)) }
if (warns.length) { console.log(`\nWARNINGS (${warns.length}):`); warns.forEach(w => console.log('  ⚠', w)) }
if (!errs.length) console.log('\nSCHEMA OK')
process.exit(errs.length ? 1 : 0)
