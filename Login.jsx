import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PenTool, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { isRunningInTelegram } from '../../lib/telegram'

export default function Login() {
  const { loginWithPhone } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const inTelegram = isRunningInTelegram()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await loginWithPhone({ phone, password })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Kirishda xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  if (inTelegram) {
    // Telegram ichida ochilganda AuthProvider avtomatik login qiladi —
    // bu sahifa faqat shu jarayon davomida ko'rinadi.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6 gap-4">
        <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold flex items-center justify-center animate-pulse">
          <PenTool size={24} className="text-gold-dark" />
        </div>
        <p className="text-ink-soft/70 text-sm">Telegram orqali kirilmoqda...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center px-6 py-10">
      <div className="max-w-sm mx-auto w-full">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-beige border border-gold/40 flex items-center justify-center mb-4">
            <PenTool size={26} className="text-gold-dark" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Xush kelibsiz</h1>
          <p className="text-ink-soft/60 text-sm mt-1">Arab xattotligi ta'lim platformasi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-soft/70 mb-1.5 block">Telefon raqam</label>
            <div className="relative">
              <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full pl-10 pr-4 py-3 rounded-xl2 border border-beige bg-beige-soft focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-soft/70 mb-1.5 block">Parol</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl2 border border-beige bg-beige-soft focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-rose-600 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl2 bg-ink text-beige-soft font-medium text-sm hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {submitting ? 'Tekshirilmoqda...' : 'Kirish'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft/60 mt-6">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="text-gold-dark font-medium">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </div>
    </div>
  )
}
