export default function LoadingSpinner({ fullscreen = false, label = 'Yuklanmoqda...' }) {
  const wrapClass = fullscreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-paper gap-3 z-50'
    : 'flex flex-col items-center justify-center gap-3 py-10'

  return (
    <div className={wrapClass}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-beige"></div>
        <div className="absolute inset-0 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm text-ink-soft/70 font-body">{label}</p>
    </div>
  )
}
