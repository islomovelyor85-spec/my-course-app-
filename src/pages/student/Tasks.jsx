import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ClipboardList } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getMyActiveCourseOverview } from '../../lib/queries'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'

export default function Tasks() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    getMyActiveCourseOverview(profile.id).then(setOverview).finally(() => setLoading(false))
  }, [profile])

  if (loading) return <LoadingSpinner fullscreen />

  const lessons = overview?.allLessons || []

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="font-display text-xl font-semibold text-ink mb-1">Vazifalar</h1>
      <p className="text-ink-soft/60 text-sm mb-5">Barcha darslar bo‘yicha topshiriqlaringiz</p>

      {lessons.length === 0 && (
        <div className="text-center py-16">
          <ClipboardList size={32} className="text-ink-soft/20 mx-auto mb-3" />
          <p className="text-ink-soft/50 text-sm">Hozircha vazifalar mavjud emas</p>
        </div>
      )}

      <div className="space-y-2.5">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => !lesson.locked && navigate(`/tasks/submit/${lesson.id}`)}
            disabled={lesson.locked}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl2 border border-beige bg-paper text-left transition-colors ${
              lesson.locked ? 'opacity-50' : 'hover:border-gold/50'
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{lesson.title}</p>
              <div className="mt-1.5">
                <StatusBadge status={lesson.locked ? 'pending' : lesson.submission?.status || 'pending'} />
              </div>
            </div>
            {!lesson.locked && <ChevronRight size={16} className="text-ink-soft/30 flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  )
}
