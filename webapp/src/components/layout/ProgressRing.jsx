export default function ProgressRing({ pct = 0, size = 56, strokeWidth = 6, label, trackClassName, indicatorClassName }) {
  const clamped = Math.min(100, Math.max(0, pct))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={trackClassName || 'fill-none stroke-white/25 dark:stroke-gray-700'}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`fill-none transition-all duration-500 ${indicatorClassName || 'stroke-white dark:stroke-violet-300'}`}
        />
      </svg>
      <span className="absolute text-xs font-bold">{label ?? `${clamped}%`}</span>
    </div>
  )
}
