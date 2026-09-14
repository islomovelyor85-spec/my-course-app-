import { NavLink, Outlet } from 'react-router-dom'
import { Home, BookOpen, ClipboardCheck, TrendingUp, User } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Bosh sahifa', icon: Home, end: true },
  { to: '/course', label: 'Kursim', icon: BookOpen },
  { to: '/tasks', label: 'Vazifalar', icon: ClipboardCheck },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/profile', label: 'Profil', icon: User }
]

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <main className="flex-1 pb-24 safe-top">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-beige safe-bottom z-40">
        <div className="max-w-md mx-auto flex items-stretch justify-between px-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
                  isActive ? 'text-gold-dark' : 'text-ink-soft/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span className={`text-[10.5px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
