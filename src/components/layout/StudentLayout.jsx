import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, BookOpen, ClipboardCheck, TrendingUp, User } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function StudentLayout() {
  const [myCourseId, setMyCourseId] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('xattot_last_course_id') : null
  )

  useEffect(() => {
    if (myCourseId) return
    supabase
      .from('courses')
      .select('id')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.id) {
          localStorage.setItem('xattot_last_course_id', data.id)
          setMyCourseId(data.id)
        }
      })
  }, [myCourseId])

  const NAV_ITEMS = [
    { to: '/', label: 'Bosh sahifa', icon: Home, end: true },
    { to: myCourseId ? `/course/${myCourseId}` : '/', label: 'Kursim', icon: BookOpen },
    { to: '/tasks', label: 'Vazifalar', icon: ClipboardCheck },
    { to: '/progress', label: 'Progress', icon: TrendingUp },
    { to: '/profile', label: 'Profil', icon: User }
  ]

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <main className="flex-1 pb-24 safe-top">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-beige safe-bottom z-40">
        <div className="max-w-md mx-auto flex items-stretch justify-between px-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={label}
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
