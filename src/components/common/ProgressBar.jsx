export default function ProgressBar({ value = 0, showLabel = true, size = 'md' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5'

  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-beige rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="mt-1 text-xs text-ink-soft/60">{pct}% o‘zlashtirildi</p>}
    </div>
  )
}
