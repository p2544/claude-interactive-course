// Workflow content loader. wf-a.json holds W1-W8, wf-b.json holds W9, W10,
// W12-W16 (W11 "Subtitles" is referenced in the book but was never actually
// written — the book's own bug, not something to invent content for here).
import wfA from './wf-a.json'
import wfB from './wf-b.json'

const ALL_WORKFLOWS = [...wfA, ...wfB]

export function getWorkflows() {
  return ALL_WORKFLOWS
}

export function getWorkflow(wfId) {
  return ALL_WORKFLOWS.find((w) => w.id === wfId) || null
}
