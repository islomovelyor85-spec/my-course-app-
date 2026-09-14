import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, BookOpen, ClipboardCheck, Wallet, LogOut, PenTool, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', label: 'Boshqaruv paneli', icon: LayoutDashboard, end: true },
  { to: '/admin/courses', label: 'Darslar boshqaruvi', icon: BookOpen },
  { to: '/admin/students', label: 'O‘quvchilar', icon: Users },
  { to: '/admin/submissions', label: 'Vazifalarni tekshirish', icon: ClipboardCheck },
  { to: '/admin/payments', label: 'To‘lovlar', icon: Wallet }
]

export default function AdminLayout() {
  const { profile, logout } = useAuth()

  return (
    <div className="min-h-screen bg-beige-soft flex">
      <aside className="w-64 bg-ink text-beige-soft flex-col hidden md:flex">
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold flex items-center justify-center">
            <PenTool size={16} className="text-gold-light" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-none">Xattot</p>
            <p className="text-[11px] text-beige-soft/50 mt-0.5">Ustoz paneli</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-gold/15 text-gold-light font-medium' : 'text-beige-soft/70 hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-white/10">
          <p className="text-sm font-medium truncate">{profile?.full_name}</p>
          <button
            onClick={logout}
            className="mt-3 flex items-center gap-2 text-xs text-beige-soft/60 hover:text-gold-light transition-colors"
          >
            <LogOut size={14} /> Chiqish
          </button>
        </div>
      </aside>

      {/* Mobil uchun soddalashtirilgan yuqori panel */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-ink text-beige-soft px-4 py-3 flex items-center justify-between safe-top">
        <span className="font-display font-semibold">Xattot — Ustoz paneli</span>
        <button onClick={logout}><LogOut size={18} /></button>
      </div>

      <main className="flex-1 md:ml-0 pt-16 md:pt-0 pb-20 md:pb-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobil pastki navigatsiya */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ink border-t border-white/10 safe-bottom z-40">
        <div className="flex items-stretch justify-between px-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2.5 ${isActive ? 'text-gold-light' : 'text-beige-soft/40'}`
              }
            >
              <Icon size={19} />
              <span className="text-[9.5px] font-medium text-center leading-tight px-0.5">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
