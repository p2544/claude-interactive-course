import { useSyncExternalStore } from 'react'

// Progress is persisted to a single localStorage key as one JSON blob.
// Shape:
// {
//   sections: { "2.1": { completed: true, bestScore: 80, lastStep: 3 } },
//   unlockOverrides: ["ch2"],
//   lastVisited: { chId: "ch2", secId: "2.1" },
//   workflows: { "w1": { done: [0, 2] } }
// }

const KEY = 'stag-claude-progress-v1'
const EVENT = 'stag-progress-changed'

function defaultProgress() {
  return { sections: {}, unlockOverrides: [], lastVisited: null, workflows: {} }
}

function normalize(data) {
  if (!data || typeof data !== 'object') return defaultProgress()
  return {
    sections: data.sections && typeof data.sections === 'object' ? data.sections : {},
    unlockOverrides: Array.isArray(data.unlockOverrides) ? data.unlockOverrides : [],
    lastVisited: data.lastVisited || null,
    workflows: data.workflows && typeof data.workflows === 'object' ? data.workflows : {},
  }
}

// Cache the last parsed snapshot so repeated getProgress() calls (e.g. from
// useSyncExternalStore) return the *same object reference* until the
// underlying storage actually changes. Without this, every render would
// produce a new object and React would think the store changes forever.
let cachedRaw
let cachedSnapshot

function readSnapshot() {
  let raw = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    raw = null
  }
  if (raw === cachedRaw) return cachedSnapshot
  cachedRaw = raw
  let parsed = null
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    parsed = null
  }
  cachedSnapshot = normalize(parsed)
  return cachedSnapshot
}

function write(next) {
  cachedSnapshot = normalize(next)
  cachedRaw = JSON.stringify(cachedSnapshot)
  try {
    localStorage.setItem(KEY, cachedRaw)
  } catch {
    // ignore quota / privacy-mode errors — app still works for the session
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Read the current progress snapshot (non-reactive). */
export function getProgress() {
  return readSnapshot()
}

/** Subscribe to any progress change. Returns an unsubscribe function. */
export function subscribeProgress(callback) {
  window.addEventListener(EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

/** React hook: re-renders the component whenever progress changes. */
export function useProgress() {
  return useSyncExternalStore(subscribeProgress, readSnapshot, readSnapshot)
}

export function getSectionProgress(secId) {
  const data = getProgress()
  return data.sections[secId] || { completed: false, bestScore: undefined, lastStep: 0 }
}

/** Record a quiz attempt. Section is marked completed once any attempt reaches >=70%. */
export function markQuiz(secId, scorePct) {
  const data = getProgress()
  const prev = data.sections[secId] || {}
  const passed = scorePct >= 70
  write({
    ...data,
    sections: {
      ...data.sections,
      [secId]: {
        ...prev,
        completed: passed || !!prev.completed,
        bestScore: Math.max(prev.bestScore ?? 0, scorePct),
      },
    },
  })
}

/** Remember which step index the learner is on, and (optionally) which chapter/section was last opened. */
export function setLastStep(secId, stepIndex, chId) {
  const data = getProgress()
  const prev = data.sections[secId] || {}
  write({
    ...data,
    sections: {
      ...data.sections,
      [secId]: { ...prev, lastStep: stepIndex },
    },
    lastVisited: chId ? { chId, secId } : data.lastVisited,
  })
}

export function setLastVisited(chId, secId) {
  const data = getProgress()
  write({ ...data, lastVisited: { chId, secId } })
}

/** "ข้ามไปเรียนเลย" — force-unlock a chapter regardless of prerequisite completion. */
export function overrideUnlock(chId) {
  const data = getProgress()
  if (data.unlockOverrides.includes(chId)) return
  write({ ...data, unlockOverrides: [...data.unlockOverrides, chId] })
}

/**
 * Completion stats for a chapter's content object ({ sections: [...] }).
 * Pass a progress snapshot (e.g. from useProgress()) to keep this reactive;
 * otherwise it reads the store directly.
 */
export function chapterStats(content, progress) {
  const p = progress || getProgress()
  const sections = content?.sections || []
  const total = sections.length
  const done = sections.filter((s) => p.sections[s.id]?.completed).length
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}

export function resetAll() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  cachedRaw = undefined
  cachedSnapshot = undefined
  window.dispatchEvent(new Event(EVENT))
}

/** "ทำแล้ว" checkbox on a workflow step — toggles that step index for wfId. */
export function toggleWorkflowStep(wfId, stepIndex) {
  const data = getProgress()
  const prev = data.workflows[wfId] || { done: [] }
  const doneSet = new Set(prev.done)
  if (doneSet.has(stepIndex)) doneSet.delete(stepIndex)
  else doneSet.add(stepIndex)
  write({
    ...data,
    workflows: {
      ...data.workflows,
      [wfId]: { done: Array.from(doneSet).sort((a, b) => a - b) },
    },
  })
}

export function getWorkflowProgress(wfId) {
  const data = getProgress()
  return data.workflows[wfId] || { done: [] }
}

/**
 * Completion stats for a single workflow's steps ({ id, steps: [...] }).
 * Pass a progress snapshot (e.g. from useProgress()) to keep this reactive;
 * otherwise it reads the store directly.
 */
export function workflowStats(workflow, progress) {
  const p = progress || getProgress()
  const total = workflow?.steps?.length || 0
  const doneArr = p.workflows[workflow?.id]?.done || []
  const done = doneArr.filter((i) => i < total).length
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}

/** Serialize the whole progress blob for download as `claude-course-progress.json`. */
export function exportProgressJSON() {
  return JSON.stringify(getProgress(), null, 2)
}

/**
 * Parse+validate an imported progress file and, if valid, overwrite the
 * current progress with it. Returns { ok: true } or { ok: false, error }.
 */
export function importProgressFromJSON(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'ไฟล์ที่เลือกไม่ใช่ JSON ที่ถูกต้อง กรุณาเลือกไฟล์ที่ส่งออกจากแอปนี้' }
  }
  if (!parsed || typeof parsed !== 'object' || !('sections' in parsed)) {
    return { ok: false, error: 'ไฟล์นี้ไม่ใช่ไฟล์ความคืบหน้าที่ถูกต้อง (ไม่พบ key "sections")' }
  }
  write(normalize(parsed))
  return { ok: true }
}
