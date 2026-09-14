import { PenTool, Phone, LogOut, CreditCard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { profile, logout } = useAuth()

  const accessLabel = profile?.access_until
    ? new Date(profile.access_until).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Cheklanmagan'

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="font-display text-xl font-semibold text-ink mb-6">Profil</h1>

      <div className="flex flex-col items-center mb-7">
        <div className="w-20 h-20 rounded-full bg-beige border-2 border-gold/30 overflow-hidden flex items-center justify-center mb-3">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <PenTool size={28} className="text-gold-dark" />
          )}
        </div>
        <h2 className="font-display text-lg font-semibold text-ink">{profile?.full_name}</h2>
        {profile?.phone && (
          <p className="text-ink-soft/50 text-sm flex items-center gap-1.5 mt-0.5">
            <Phone size={13} /> {profile.phone}
          </p>
        )}
      </div>

      <div className="border border-beige rounded-xl2 divide-y divide-beige mb-6">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="flex items-center gap-2.5 text-sm text-ink-soft">
            <CreditCard size={16} className="text-gold-dark" /> Kursga kirish muddati
          </span>
          <span className="text-sm text-ink font-medium">{accessLabel}</span>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl2 border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors"
      >
        <LogOut size={16} /> Chiqish
      </button>
    </div>
  )
}
