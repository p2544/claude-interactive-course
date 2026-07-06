export default function PracticeActions({ checked, disabled, onCheck, onReset, checkLabel = 'ตรวจคำตอบ' }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      {!checked ? (
        <button
          type="button"
          onClick={onCheck}
          disabled={disabled}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-violet-600 dark:hover:bg-violet-700"
        >
          {checkLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          ลองใหม่
        </button>
      )}
    </div>
  )
}
