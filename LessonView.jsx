import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ClipboardEdit } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'

function toEmbedUrl(url) {
  if (!url) return null
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  return url
}

export default function LessonView() {
  const { lessonId } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: lessonData, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()
      if (!error) setLesson(lessonData)

      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setSubmission(subData)
      setLoading(false)
    }
    if (profile) load()
  }, [lessonId, profile])

  if (loading) return <LoadingSpinner fullscreen />
  if (!lesson) return <div className="px-5 pt-10 text-center text-ink-soft/60 text-sm">Dars topilmadi</div>

  const embedUrl = toEmbedUrl(lesson.video_url)
  const materials = Array.isArray(lesson.materials) ? lesson.materials : []

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full hover:bg-beige-soft">
          <ChevronLeft size={20} className="text-ink-soft" />
        </button>
        <h1 className="font-display text-lg font-semibold text-ink truncate">{lesson.title}</h1>
      </div>

      {embedUrl && (
        <div className="mx-5 rounded-xl2 overflow-hidden bg-ink aspect-video mb-5">
          {embedUrl.includes('youtube.com/embed') ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          ) : (
            <video src={embedUrl} controls className="w-full h-full object-contain" />
          )}
        </div>
      )}

      {lesson.content && (
        <div className="px-5 mb-5">
          <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">{lesson.content}</p>
        </div>
      )}

      {materials.length > 0 && (
        <div className="px-5 mb-6">
          <p className="text-xs font-medium text-ink-soft/50 mb-2">Qo‘shimcha materiallar</p>
          <div className="space-y-2">
            {materials.map((m, i) => (
              <a
                key={i}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="block px-4 py-2.5 rounded-xl border border-beige bg-beige-soft text-sm text-ink hover:border-gold/50 transition-colors"
              >
                {m.name || `Material ${i + 1}`}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="px-5">
        <div className="border border-beige rounded-xl2 p-4 flex items-center justify-between mb-3">
          <span className="text-sm text-ink-soft">Vazifa holati</span>
          <StatusBadge status={submission?.status || 'pending'} />
        </div>
        {submission?.status === 'rejected' && submission?.feedback && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 mb-3">
            <p className="text-xs font-medium text-rose-700 mb-1">Ustoz izohi:</p>
            <p className="text-xs text-rose-700/90">{submission.feedback}</p>
          </div>
        )}
        <button
          onClick={() => navigate(`/tasks/submit/${lesson.id}`)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl2 bg-gold text-ink font-semibold text-sm hover:bg-gold-light transition-colors"
        >
          <ClipboardEdit size={17} />
          {submission ? 'Vazifani qayta topshirish' : 'Vazifani ko‘rish va topshirish'}
        </button>
      </div>
    </div>
  )
}
