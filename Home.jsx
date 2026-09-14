import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenTool, ChevronRight, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getMyCourseOverview } from '../../lib/queries'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import ProgressBar from '../../components/common/ProgressBar'

export default function Home() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    getMyCourseOverview(profile.id)
      .then(setOverview)
      .finally(() => setLoading(false))
  }, [profile])

  if (loading) return <LoadingSpinner fullscreen />

  const currentLesson = overview?.allLessons?.find((l) => l.status === 'unlocked')
  const lastActivity = profile?.last_active_at
    ? new Date(profile.last_active_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })
    : '—'

  return (
    <div className="px-5 pt-6">
      {/* Sarlavha */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-14 h-14 rounded-full bg-beige border-2 border-gold/30 overflow-hidden flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <PenTool size={22} className="text-gold-dark" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-ink-soft/50 text-xs">Assalomu alaykum,</p>
          <h1 className="font-display text-xl font-semibold text-ink truncate">{profile?.full_name}</h1>
        </div>
      </div>

      {overview?.course ? (
        <>
          {/* Kurs kartasi */}
          <div className="bg-ink rounded-xl2 p-5 mb-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gold/10 blur-2xl" />
            <p className="text-gold-light/70 text-xs mb-1">Joriy kurs</p>
            <h2 className="font-display text-lg font-semibold text-beige-soft mb-4">{overview.course.title}</h2>
            <ProgressBar value={overview.progressPercent} />
            <p className="text-beige-soft/50 text-[11px] mt-2">
              {overview.completedCount} / {overview.totalLessons} dars tugallandi
            </p>
          </div>

          {/* Joriy dars */}
          {currentLesson && (
            <button
              onClick={() => navigate(`/course/lesson/${currentLesson.id}`)}
              className="w-full bg-beige-soft border border-beige rounded-xl2 p-4 flex items-center justify-between mb-5 hover:border-gold/50 transition-colors"
            >
              <div className="text-left min-w-0">
                <p className="text-[11px] text-ink-soft/50 mb-0.5">Joriy dars</p>
                <p className="font-medium text-ink text-sm truncate">{currentLesson.title}</p>
              </div>
              <ChevronRight size={18} className="text-gold-dark flex-shrink-0" />
            </button>
          )}

          {/* Vazifa holati */}
          {currentLesson && (
            <div className="flex items-center justify-between bg-paper border border-beige rounded-xl2 p-4 mb-5">
              <div>
                <p className="text-[11px] text-ink-soft/50 mb-1">Vazifa holati</p>
                <StatusBadge status={currentLesson.submission?.status || 'pending'} />
              </div>
              <Clock size={18} className="text-ink-soft/30" />
            </div>
          )}
        </>
      ) : (
        <div className="bg-beige-soft border border-beige rounded-xl2 p-6 text-center mb-5">
          <p className="text-ink-soft/60 text-sm">Hozircha faol kurs mavjud emas. Tez orada yangilanadi.</p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-ink-soft/40 px-1">
        <span>Oxirgi faollik: {lastActivity}</span>
      </div>
    </div>
  )
}
