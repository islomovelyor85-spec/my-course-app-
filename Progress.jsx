import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getMyCourseOverview } from '../../lib/queries'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const MILESTONES = [25, 50, 75, 100]
const MILESTONE_LABELS = {
  25: 'Birinchi qadam',
  50: 'Yarim yo‘l',
  75: 'Ustachilikka yaqin',
  100: 'Xattot ustasi'
}

export default function Progress() {
  const { profile } = useAuth()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    getMyCourseOverview(profile.id).then(setOverview).finally(() => setLoading(false))
  }, [profile])

  if (loading) return <LoadingSpinner fullscreen />

  const pct = Math.round(overview?.progressPercent || 0)
  const circumference = 2 * Math.PI * 54

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="font-display text-xl font-semibold text-ink mb-6">Mening progressim</h1>

      <div className="flex flex-col items-center mb-8">
        <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#F5EFE6" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#C9A24B"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (pct / 100) * circumference}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="-mt-[92px] flex flex-col items-center">
          <span className="font-display text-3xl font-semibold text-ink">{pct}%</span>
          <span className="text-[11px] text-ink-soft/50 mt-0.5">o‘zlashtirildi</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-beige-soft rounded-xl2 p-3.5 text-center">
          <p className="font-display text-xl font-semibold text-ink">{overview?.completedCount || 0}</p>
          <p className="text-[10.5px] text-ink-soft/50 mt-0.5">Tugallangan</p>
        </div>
        <div className="bg-beige-soft rounded-xl2 p-3.5 text-center">
          <p className="font-display text-xl font-semibold text-ink">{overview?.totalLessons || 0}</p>
          <p className="text-[10.5px] text-ink-soft/50 mt-0.5">Jami dars</p>
        </div>
        <div className="bg-beige-soft rounded-xl2 p-3.5 text-center">
          <p className="font-display text-xl font-semibold text-ink">
            {(overview?.totalLessons || 0) - (overview?.completedCount || 0)}
          </p>
          <p className="text-[10.5px] text-ink-soft/50 mt-0.5">Qoldi</p>
        </div>
      </div>

      <p className="text-xs font-medium text-ink-soft/60 mb-3">Erishilgan nishonlar</p>
      <div className="space-y-2.5">
        {MILESTONES.map((m) => {
          const achieved = pct >= m
          return (
            <div
              key={m}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl2 border ${
                achieved ? 'border-gold/40 bg-gold/5' : 'border-beige'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  achieved ? 'bg-gold/20 text-gold-dark' : 'bg-beige text-ink-soft/30'
                }`}
              >
                <Award size={17} />
              </div>
              <div>
                <p className={`text-sm font-medium ${achieved ? 'text-ink' : 'text-ink-soft/40'}`}>
                  {MILESTONE_LABELS[m]}
                </p>
                <p className="text-[10.5px] text-ink-soft/40">{m}% dars yakunlanganda</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
