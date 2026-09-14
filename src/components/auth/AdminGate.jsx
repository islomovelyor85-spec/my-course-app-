import { useState } from 'react'
import { Lock, PenTool } from 'lucide-react'

const STORAGE_KEY = 'xattot_admin_gate_unlocked'
const GATE_PASSWORD = import.meta.env.VITE_ADMIN_GATE_PASSWORD || 'admin123'

// Bu — admin panelga QO'SHIMCHA, oddiy parol bilan kirish "eshigi".
// DIQQAT: bu haqiqiy xavfsizlik emas (parol frontend kodida ko'rinadi va har
// kim brauzer konsolida ko'ra oladi) — asosiy xavfsizlik users.role='admin'
// va Supabase RLS orqali ta'minlanadi (bu tekshiruv RequireAdmin'da bor).
// Bu gate faqat "tasodifan admin panelga kirib qolmaslik" uchun qo'shimcha
// UX to'sig'i sifatida ishlatiladi, brifda so'ralganidek.
export default function AdminGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (input === GATE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setUnlocked(true)
    } else {
      setError('Parol noto‘g‘ri')
    }
  }

  if (unlocked) return children

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
      <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold flex items-center justify-center mb-4">
        <PenTool size={22} className="text-gold-light" />
      </div>
      <h1 className="font-display text-xl font-semibold text-beige-soft mb-1">Ustoz paneli</h1>
      <p className="text-beige-soft/50 text-sm mb-6">Davom etish uchun panel parolini kiriting</p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <div className="relative mb-3">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-beige-soft/40" />
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Panel paroli"
            className="w-full pl-10 pr-4 py-3 rounded-xl2 bg-white/5 border border-white/10 text-beige-soft placeholder:text-beige-soft/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        {error && <p className="text-rose-400 text-xs mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 rounded-xl2 bg-gold text-ink font-semibold text-sm hover:bg-gold-light transition-colors"
        >
          Kirish
        </button>
      </form>
    </div>
  )
}
