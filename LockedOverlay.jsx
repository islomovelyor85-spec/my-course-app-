import { Lock } from 'lucide-react'

export default function LockedOverlay({ message = 'Kursga kirish uchun to‘lovni tasdiqlating', onUnlockClick }) {
  return (
    <div className="absolute inset-0 bg-ink/70 backdrop-blur-[2px] rounded-xl2 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold flex items-center justify-center">
        <Lock size={20} className="text-gold-light" />
      </div>
      <p className="text-beige-soft text-sm font-medium">{message}</p>
      {onUnlockClick && (
        <button
          onClick={onUnlockClick}
          className="px-4 py-2 rounded-full bg-gold text-ink text-sm font-semibold hover:bg-gold-light transition-colors"
        >
          To‘lov chekini yuklash
        </button>
      )}
    </div>
  )
}
