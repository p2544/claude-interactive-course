import { BlockList } from '../blocks/BlockRenderer.jsx'

export default function LearnStep({ step }) {
  return (
    <div className="space-y-3">
      {step?.title && <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{step.title}</h3>}
      <BlockList blocks={step?.blocks} />
    </div>
  )
}
