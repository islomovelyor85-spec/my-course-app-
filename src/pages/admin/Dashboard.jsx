import { useEffect, useState } from 'react'
import { Users, ClipboardCheck, Wallet, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function StatCard({ icon: Icon, label, value, accent = false }) {
  return (
    <div className={`rounded-xl2 p-5 border ${accent ? 'bg-ink border-ink' : 'bg-paper border-beige'}`}>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${
          accent ? 'bg-gold/20 text-gold-light' : 'bg-beige text-gold-dark'
        }`}
      >
        <Icon size={17} />
      </div>
      <p className={`font-display text-2xl font-semibold ${accent ? 'text-beige-soft' : 'text-ink'}`}>{value}</p>
      <p className={`text-xs mt-1 ${accent ? 'text-beige-soft/50' : 'text-ink-soft/50'}`}>{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: totalStudents },
        { count: pendingSubmissions },
        { count: rejectedSubmissions },
        { count: pendingPayments },
        { data: approvedPayments },
        { count: totalCourses }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payments').select('amount, created_at').eq('status', 'approved'),
        supabase.from('courses').select('*', { count: 'exact', head: true })
      ])

      const totalRevenue = (approvedPayments || []).reduce((sum, p) => sum + Number(p.amount), 0)
      const now = new Date()
      const monthRevenue = (approvedPayments || [])
        .filter((p) => {
          const d = new Date(p.created_at)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        .reduce((sum, p) => sum + Number(p.amount), 0)

      setStats({
        totalStudents: totalStudents || 0,
        pendingSubmissions: pendingSubmissions || 0,
        rejectedSubmissions: rejectedSubmissions || 0,
        pendingPayments: pendingPayments || 0,
        totalCourses: totalCourses || 0,
        totalRevenue,
        monthRevenue
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Boshqaruv paneli</h1>
      <p className="text-ink-soft/50 text-sm mb-6">Platformaning umumiy holati</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <StatCard icon={Users} label="Jami o‘quvchilar" value={stats.totalStudents} />
        <StatCard icon={ClipboardCheck} label="Tekshirish kutmoqda" value={stats.pendingSubmissions} accent />
        <StatCard icon={ClipboardCheck} label="Qaytarilgan vazifalar" value={stats.rejectedSubmissions} />
        <StatCard icon={Wallet} label="Tasdiq kutayotgan to‘lovlar" value={stats.pendingPayments} accent />
        <StatCard icon={BookOpen} label="Jami kurslar" value={stats.totalCourses} />
        <StatCard
          icon={Wallet}
          label="Shu oy tushumi"
          value={new Intl.NumberFormat('uz-UZ').format(stats.monthRevenue) + ' so‘m'}
        />
      </div>

      <div className="mt-6 rounded-xl2 border border-beige bg-paper p-5">
        <p className="text-xs text-ink-soft/50 mb-1">Jami tushum</p>
        <p className="font-display text-3xl font-semibold text-ink">
          {new Intl.NumberFormat('uz-UZ').format(stats.totalRevenue)} so‘m
        </p>
      </div>
    </div>
  )
}
