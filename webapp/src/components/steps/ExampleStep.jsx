export default function ExampleStep({ step }) {
  const items = step?.compare || []

  return (
    <div className="space-y-3">
      {step?.title && <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{step.title}</h3>}
      {step?.intro && <p className="text-sm text-gray-600 dark:text-gray-400">{step.intro}</p>}
      <div className={`grid gap-3 ${items.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {items.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 ${
              item.good
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/10'
                : 'border-rose-300 bg-rose-50 dark:border-rose-700/60 dark:bg-rose-900/10'
            }`}
          >
            <div
              className={`mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                item.good
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
              }`}
            >
              <span aria-hidden="true">{item.good ? '✓' : '✕'}</span>
              <span>{item.label}</span>
            </div>
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-white/70 p-3 text-sm font-mono text-gray-800 dark:bg-black/20 dark:text-gray-200">
              {item.content}
            </pre>
            {item.explanation && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.explanation}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
