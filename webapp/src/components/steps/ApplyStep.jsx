export default function ApplyStep({ step }) {
  const takeaways = step?.takeaways || []

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">สรุปประเด็นสำคัญ</h3>
      <ul className="space-y-2">
        {takeaways.map((t, i) => (
          <li
            key={i}
            className="flex gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800/50 dark:text-gray-300"
          >
            <span className="shrink-0 text-indigo-500 dark:text-violet-400" aria-hidden="true">
              ✓
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      {step?.tryThis && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-violet-700/50 dark:bg-violet-900/10">
          <p className="mb-1 text-sm font-semibold text-indigo-700 dark:text-violet-300">ลองทำดู</p>
          <p className="text-sm text-indigo-900/80 dark:text-violet-200/80">{step.tryThis}</p>
        </div>
      )}
    </div>
  )
}
