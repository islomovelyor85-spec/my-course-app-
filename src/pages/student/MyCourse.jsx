import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, PlayCircle, X } from 'lucide-react'
import { getCourseWithModules } from '../../lib/queries'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function toEmbedUrl(url) {
  if (!url) return null
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)
  if (yt) return { type: 'youtube', src: `https://www.youtube.com/embed/${yt[1]}` }
  return { type: 'video', src: url }
}

export default function MyCourse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openModules, setOpenModules] = useState({})
  const [activeLesson, setActiveLesson] = useState(null)

  useEffect(() => {
    if (!id) return
    localStorage.setItem('xattot_last_course_id', id)
    setLoading(true)
    setError('')
    getCourseWithModules(id)
      .then(({ course, modules }) => {
        setCourse(course)
        setModules(modules)
        if (modules[0]) setOpenModules({ [modules[0].id]: true })
      })
      .catch((err) => setError(err.message || 'Kursni yuklashda xatolik'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner fullscreen />

  if (error) {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-rose-600 text-sm mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="text-gold-dark text-sm font-medium">
          Kurslar ro'yxatiga qaytish
        </button>
      </div>
    )
  }

  if (!course) {
    return <div className="px-5 pt-10 text-center text-ink-soft/60 text-sm">Kurs topilmadi</div>
  }

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 flex items-center gap-2 mb-2">
        <button onClick={() => navigate('/')} className="p-1.5 -ml-1.5 rounded-full hover:bg-beige-soft">
          <ChevronLeft size={20} className="text-ink-soft" />
        </button>
        <h1 className="font-display text-xl font-semibold text-ink truncate">{course.title}</h1>
      </div>
      {course.description && (
        <p className="px-5 text-ink-soft/60 text-sm mb-5">{course.description}</p>
      )}

      <div className="px-5 space-y-3">
        {modules.map((mod, idx) => (
          <div key={mod.id} className="border border-beige rounded-xl2 overflow-hidden bg-paper">
            <button
              onClick={() => setOpenModules((p) => ({ ...p, [mod.id]: !p[mod.id] }))}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-beige-soft"
            >
              <span className="text-sm font-semibold text-ink">
                {idx + 1}-modul: {mod.title}
              </span>
              <ChevronDown
                size={16}
                className={`text-ink-soft/50 transition-transform ${openModules[mod.id] ? 'rotate-180' : ''}`}
              />
            </button>
            {openModules[mod.id] && (
              <div className="divide-y divide-beige">
                {(mod.lessons || []).map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-beige-soft transition-colors"
                  >
                    <PlayCircle size={18} className="text-gold-dark flex-shrink-0" />
                    <span className="text-sm text-ink flex-1 truncate">{lesson.title}</span>
                  </button>
                ))}
                {(!mod.lessons || mod.lessons.length === 0) && (
                  <p className="px-4 py-3 text-xs text-ink-soft/40">Bu modulda hali darslar yo'q</p>
                )}
              </div>
            )}
          </div>
        ))}
        {modules.length === 0 && (
          <p className="text-center text-ink-soft/40 text-sm py-10">Bu kursda hali modullar yo'q</p>
        )}
      </div>

      {activeLesson && <VideoPlayerModal lesson={activeLesson} onClose={() => setActiveLesson(null)} />}
    </div>
  )
}

function VideoPlayerModal({ lesson, onClose }) {
  const embed = toEmbedUrl(lesson.video_url)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-paper rounded-xl2 overflow-hidden shadow-soft">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-beige">
          <h3 className="font-display text-base font-semibold text-ink truncate">{lesson.title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-beige-soft flex-shrink-0">
            <X size={18} className="text-ink-soft" />
          </button>
        </div>
        <div className="aspect-video bg-ink">
          {embed?.type === 'youtube' ? (
            <iframe
              src={embed.src}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          ) : embed?.type === 'video' ? (
            <video src={embed.src} controls autoPlay className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-beige-soft/50 text-sm">
              Video havolasi mavjud emas
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
