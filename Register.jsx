import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PenTool, User, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { registerWithPhone } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo‘lishi kerak')
      return
    }
    if (password !== confirmPassword) {
      setError('Parollar bir-biriga mos emas — diqqat bilan qayta kiriting')
      return
    }
    setSubmitting(true)
    try {
      await registerWithPhone({ fullName, phone, password })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center px-6 py-10">
      <div className="max-w-sm mx-auto w-full">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-beige border border-gold/40 flex items-center justify-center mb-4">
            <PenTool size={26} className="text-gold-dark" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Ro'yxatdan o'tish</h1>
          <p className="text-ink-soft/60 text-sm mt-1">Xattotlik san'atini o'rganishni boshlang</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-soft/70 mb-1.5 block">To'liq ism</label>
            <div className="relative">
              <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ism Familiya"
                className="w-full pl-10 pr-4 py-3 rounded-xl2 border border-beige bg-beige-soft focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold text-sm"
              />
            </div>
          </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
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

          <div>
            <label className="text-xs font-medium text-ink-soft/70 mb-1.5 block">Parolni tasdiqlang</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Parolni qayta kiriting"
                className="w-full pl-10 pr-4 py-3 rounded-xl2 border border-beige bg-beige-soft focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold text-sm"
              />
            </div>
            <p className="text-[11px] text-ink-soft/40 mt-1.5">
              ⚠️ Parolni eslab qoling — hozircha "parolni tiklash" funksiyasi mavjud emas.
            </p>
          </div>

          {error && <p className="text-rose-600 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 rounded-xl2 bg-ink text-beige-soft font-medium text-sm hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {submitting ? 'Yaratilmoqda...' : 'Ro‘yxatdan o‘tish'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft/60 mt-6">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="text-gold-dark font-medium">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
