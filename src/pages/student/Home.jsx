import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenTool, BookOpen, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getPublishedCourses } from '../../lib/queries'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Home() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublishedCourses()
      .then(setCourses)
      .catch((err) => setError(err.message || 'Kurslarni yuklashda xatolik'))
      .finally(() => setLoading(false))
  }, [])

  function openCourse(course) {
    localStorage.setItem('xattot_last_course_id', course.id)
    navigate(`/course/${course.id}`)
  }

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <div className="px-5 pt-6 pb-4">
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

      <h2 className="font-display text-lg font-semibold text-ink mb-4">Mavjud kurslar</h2>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl2 p-4 mb-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!error && courses.length === 0 && (
        <div className="bg-beige-soft border border-beige rounded-xl2 p-8 text-center">
          <BookOpen size={28} className="text-ink-soft/30 mx-auto mb-3" />
          <p className="text-ink-soft/60 text-sm">Hozircha chop etilgan kurs mavjud emas.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => openCourse(course)}
            className="text-left bg-ink rounded-xl2 p-5 relative overflow-hidden hover:brightness-110 transition-all"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gold/10 blur-2xl" />
            <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mb-4">
              <BookOpen size={18} className="text-gold-light" />
            </div>
            <h3 className="font-display text-lg font-semibold text-beige-soft mb-1.5 line-clamp-2">
              {course.title}
            </h3>
            {course.description && (
              <p className="text-beige-soft/50 text-xs line-clamp-2 mb-4">{course.description}</p>
            )}
            <div className="flex items-center gap-1 text-gold-light text-xs font-medium">
              Kursni ochish <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
