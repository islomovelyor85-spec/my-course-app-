import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Image, Video, FileText, Type, Check } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { uploadSubmissionFile, submitTask } from '../../lib/queries'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const FORMATS = [
  { id: 'image', label: 'Rasm', icon: Image, accept: 'image/*' },
  { id: 'video', label: 'Video', icon: Video, accept: 'video/*' },
  { id: 'file', label: 'Fayl', icon: FileText, accept: '.pdf,.doc,.docx,.zip' },
  { id: 'text', label: 'Matn', icon: Type, accept: null }
]

export default function TaskSubmit() {
  const { lessonId } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)

  const [format, setFormat] = useState('image')
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: lessonData } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
      setLesson(lessonData)
      // MVP: bitta lesson uchun bitta "vazifa tavsifi" — lesson.content ichida saqlanadi,
      // agar alohida "tasks" jadvalidagi yozuv kerak bo'lsa, shu yerga so'rov qo'shiladi.
      setLoading(false)
    }
    load()
  }, [lessonId])

  async function handleSubmit() {
    setError('')
    if (format !== 'text' && !file) {
      setError('Iltimos, fayl tanlang')
      return
    }
    if (format === 'text' && !text.trim()) {
      setError('Iltimos, matn kiriting')
      return
    }
    setSubmitting(true)
    try {
      let fileUrl = null
      if (file) fileUrl = await uploadSubmissionFile(file, profile.id)
      await submitTask({
        userId: profile.id,
        lessonId,
        fileUrl,
        comment: format === 'text' ? text : null
      })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Yuborishda xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner fullscreen />

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
          <Check size={26} className="text-emerald-600" />
        </div>
        <h2 className="font-display text-xl font-semibold text-ink">Vazifangiz yuborildi!</h2>
        <p className="text-ink-soft/60 text-sm max-w-xs">
          Kuratoringiz tez orada tekshiradi va tasdiqlangach keyingi darsingiz ochiladi.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-6 py-3 rounded-full bg-ink text-beige-soft text-sm font-medium"
        >
          Kursga qaytish
        </button>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <div className="px-5 pt-6 flex items-center gap-2 mb-5">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full hover:bg-beige-soft">
          <ChevronLeft size={20} className="text-ink-soft" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] text-ink-soft/50">Vazifa topshirish</p>
          <h1 className="font-display text-lg font-semibold text-ink truncate">{lesson?.title}</h1>
        </div>
      </div>

      <div className="px-5">
        <p className="text-xs font-medium text-ink-soft/60 mb-2.5">Topshirish formati</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {FORMATS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setFormat(id)
                setFile(null)
                setError('')
              }}
              className={`flex flex-col items-center gap-1.5 py-3.5 rounded-xl2 border transition-colors ${
                format === id ? 'bg-gold/10 border-gold text-gold-dark' : 'border-beige text-ink-soft/60'
              } ${id === 'image' ? 'ring-1 ring-gold/20' : ''}`}
            >
              <Icon size={20} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-ink-soft/40 -mt-4 mb-6">
          ✍️ Xattotlik mashqlari uchun <b>rasm</b> formati tavsiya etiladi
        </p>

        {format === 'text' ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Vazifangiz matnini shu yerga yozing..."
            className="w-full px-4 py-3 rounded-xl2 border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        ) : (
          <label className="block border-2 border-dashed border-beige rounded-xl2 p-4 text-center cursor-pointer hover:border-gold/50 transition-colors overflow-hidden">
            <input
              type="file"
              accept={FORMATS.find((f) => f.id === format)?.accept}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {file && format === 'image' ? (
              <img
                src={URL.createObjectURL(file)}
                alt="tanlangan rasm"
                className="max-h-52 mx-auto rounded-xl object-contain mb-2"
              />
            ) : null}
            {file ? (
              <p className="text-sm text-ink font-medium truncate">{file.name}</p>
            ) : (
              <p className="text-sm text-ink-soft/50 py-4">Fayl tanlash uchun bosing</p>
            )}
          </label>
        )}

        {(format === 'image' || format === 'video' || format === 'file') && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Izoh qoldirishingiz mumkin (ixtiyoriy)"
            className="w-full mt-3 px-4 py-3 rounded-xl2 border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        )}

        {error && <p className="text-rose-600 text-xs mt-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-6 py-3.5 rounded-xl2 bg-ink text-beige-soft font-medium text-sm hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {submitting ? 'Yuborilmoqda...' : 'Vazifani yuborish'}
        </button>
      </div>
    </div>
  )
}
