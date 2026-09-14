import { useEffect, useState } from 'react'
import { Plus, ChevronDown, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'

export default function CourseManager() {
  const [courses, setCourses] = useState([])
  const [activeCourseId, setActiveCourseId] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [openModules, setOpenModules] = useState({})

  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [moduleModalOpen, setModuleModalOpen] = useState(false)
  const [lessonModal, setLessonModal] = useState({ open: false, moduleId: null, lesson: null })

  async function loadCourses() {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: true })
    setCourses(data || [])
    if (data?.length && !activeCourseId) setActiveCourseId(data[0].id)
    setLoading(false)
  }

  async function loadModules(courseId) {
    if (!courseId) return
    const { data } = await supabase
      .from('modules')
      .select('*, lessons(*)')
      .eq('course_id', courseId)
      .order('order', { ascending: true })
    const sorted = (data || []).map((m) => ({ ...m, lessons: [...(m.lessons || [])].sort((a, b) => a.order - b.order) }))
    setModules(sorted)
  }

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    loadModules(activeCourseId)
  }, [activeCourseId])

  async function togglePublish(course) {
    await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', course.id)
    loadCourses()
  }

  async function deleteModule(id) {
    if (!confirm('Modulni va undagi barcha darslarni o‘chirishni tasdiqlaysizmi?')) return
    await supabase.from('modules').delete().eq('id', id)
    loadModules(activeCourseId)
  }

  async function deleteLesson(id) {
    if (!confirm('Darsni o‘chirishni tasdiqlaysizmi?')) return
    await supabase.from('lessons').delete().eq('id', id)
    loadModules(activeCourseId)
  }

  async function moveModule(mod, direction) {
    const idx = modules.findIndex((m) => m.id === mod.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= modules.length) return
    const other = modules[swapIdx]
    await Promise.all([
      supabase.from('modules').update({ order: other.order }).eq('id', mod.id),
      supabase.from('modules').update({ order: mod.order }).eq('id', other.id)
    ])
    loadModules(activeCourseId)
  }

  async function moveLesson(lesson, moduleId, direction) {
    const mod = modules.find((m) => m.id === moduleId)
    const idx = mod.lessons.findIndex((l) => l.id === lesson.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= mod.lessons.length) return
    const other = mod.lessons[swapIdx]
    await Promise.all([
      supabase.from('lessons').update({ order: other.order }).eq('id', lesson.id),
      supabase.from('lessons').update({ order: lesson.order }).eq('id', other.id)
    ])
    loadModules(activeCourseId)
  }

  if (loading) return <LoadingSpinner fullscreen />

  const activeCourse = courses.find((c) => c.id === activeCourseId)

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Darslar boshqaruvi</h1>
          <p className="text-ink-soft/50 text-sm mt-0.5">Kurs, modul va darslarni shu yerdan boshqaring</p>
        </div>
        <button
          onClick={() => setCourseModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-ink text-beige-soft text-sm font-medium"
        >
          <Plus size={15} /> Yangi kurs
        </button>
      </div>

      {courses.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCourseId(c.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
                c.id === activeCourseId
                  ? 'bg-gold/15 border-gold text-gold-dark font-medium'
                  : 'border-beige text-ink-soft/60'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {activeCourse && (
        <div className="flex items-center justify-between bg-beige-soft border border-beige rounded-xl2 px-5 py-4 mb-6">
          <div>
            <p className="font-medium text-ink">{activeCourse.title}</p>
            <p className="text-xs text-ink-soft/50 mt-0.5">{activeCourse.description}</p>
          </div>
          <button
            onClick={() => togglePublish(activeCourse)}
            className={`px-4 py-2 rounded-full text-xs font-medium border ${
              activeCourse.is_published
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-ink/5 text-ink-soft border-beige'
            }`}
          >
            {activeCourse.is_published ? 'Chop etilgan' : 'Qoralama'}
          </button>
        </div>
      )}

      {activeCourseId && (
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setModuleModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gold/40 text-gold-dark text-xs font-medium hover:bg-gold/5"
          >
            <Plus size={14} /> Yangi modul
          </button>
        </div>
      )}

      <div className="space-y-3">
        {modules.map((mod, idx) => (
          <div key={mod.id} className="border border-beige rounded-xl2 overflow-hidden bg-paper">
            <button
              onClick={() => setOpenModules((p) => ({ ...p, [mod.id]: !p[mod.id] }))}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-beige-soft"
            >
              <span className="text-sm font-semibold text-ink">
                {idx + 1}. {mod.title}
              </span>
              <div className="flex items-center gap-1">
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); moveModule(mod, 'up') }}
                  className="p-1.5 rounded hover:bg-beige"
                ><ArrowUp size={14} className="text-ink-soft/50" /></span>
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); moveModule(mod, 'down') }}
                  className="p-1.5 rounded hover:bg-beige"
                ><ArrowDown size={14} className="text-ink-soft/50" /></span>
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); deleteModule(mod.id) }}
                  className="p-1.5 rounded hover:bg-rose-50"
                ><Trash2 size={14} className="text-rose-500" /></span>
                <ChevronDown
                  size={16}
                  className={`text-ink-soft/50 transition-transform ml-1 ${openModules[mod.id] ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {openModules[mod.id] && (
              <div className="divide-y divide-beige">
                {mod.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-ink truncate">{lesson.title}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => moveLesson(lesson, mod.id, 'up')} className="p-1.5 rounded hover:bg-beige-soft">
                        <ArrowUp size={13} className="text-ink-soft/50" />
                      </button>
                      <button onClick={() => moveLesson(lesson, mod.id, 'down')} className="p-1.5 rounded hover:bg-beige-soft">
                        <ArrowDown size={13} className="text-ink-soft/50" />
                      </button>
                      <button
                        onClick={() => setLessonModal({ open: true, moduleId: mod.id, lesson })}
                        className="p-1.5 rounded hover:bg-beige-soft"
                      >
                        <Pencil size={13} className="text-ink-soft/50" />
                      </button>
                      <button onClick={() => deleteLesson(lesson.id)} className="p-1.5 rounded hover:bg-rose-50">
                        <Trash2 size={13} className="text-rose-500" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setLessonModal({ open: true, moduleId: mod.id, lesson: null })}
                  className="w-full flex items-center gap-1.5 px-4 py-3 text-gold-dark text-xs font-medium hover:bg-beige-soft"
                >
                  <Plus size={14} /> Yangi dars qo‘shish
                </button>
              </div>
            )}
          </div>
        ))}
        {activeCourseId && modules.length === 0 && (
          <p className="text-center text-ink-soft/40 text-sm py-10">Hali modullar qo‘shilmagan</p>
        )}
      </div>

      <CourseModal open={courseModalOpen} onClose={() => setCourseModalOpen(false)} onSaved={loadCourses} />
      <ModuleModal
        open={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        courseId={activeCourseId}
        nextOrder={modules.length}
        onSaved={() => loadModules(activeCourseId)}
      />
      <LessonModal
        open={lessonModal.open}
        onClose={() => setLessonModal({ open: false, moduleId: null, lesson: null })}
        moduleId={lessonModal.moduleId}
        lesson={lessonModal.lesson}
        nextOrder={modules.find((m) => m.id === lessonModal.moduleId)?.lessons.length || 0}
        onSaved={() => loadModules(activeCourseId)}
      />
    </div>
  )
}

function CourseModal({ open, onClose, onSaved }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!title.trim()) return
    setSaving(true)
    await supabase.from('courses').insert({ title, description, is_published: false })
    setSaving(false)
    setTitle('')
    setDescription('')
    onSaved()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yangi kurs yaratish"
      footer={
        <button onClick={save} disabled={saving} className="px-5 py-2 rounded-full bg-ink text-beige-soft text-sm font-medium">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      }
    >
      <div className="space-y-3.5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Kurs nomi"
          className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Qisqacha tavsif"
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </div>
    </Modal>
  )
}

function ModuleModal({ open, onClose, courseId, nextOrder, onSaved }) {
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!title.trim()) return
    setSaving(true)
    await supabase.from('modules').insert({ course_id: courseId, title, order: nextOrder })
    setSaving(false)
    setTitle('')
    onSaved()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yangi modul"
      footer={
        <button onClick={save} disabled={saving} className="px-5 py-2 rounded-full bg-ink text-beige-soft text-sm font-medium">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      }
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Modul nomi (masalan: 1-modul — Asosiy shakllar)"
        className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
      />
    </Modal>
  )
}

function LessonModal({ open, onClose, moduleId, lesson, nextOrder, onSaved }) {
  const [title, setTitle] = useState(lesson?.title || '')
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '')
  const [content, setContent] = useState(lesson?.content || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(lesson?.title || '')
    setVideoUrl(lesson?.video_url || '')
    setContent(lesson?.content || '')
  }, [lesson, open])

  async function save() {
    if (!title.trim()) return
    setSaving(true)
    if (lesson) {
      await supabase.from('lessons').update({ title, video_url: videoUrl, content }).eq('id', lesson.id)
    } else {
      await supabase.from('lessons').insert({ module_id: moduleId, title, video_url: videoUrl, content, order: nextOrder })
    }
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lesson ? 'Darsni tahrirlash' : 'Yangi dars'}
      footer={
        <button onClick={save} disabled={saving} className="px-5 py-2 rounded-full bg-ink text-beige-soft text-sm font-medium">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      }
    >
      <div className="space-y-3.5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Dars sarlavhasi"
          className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Video URL (YouTube yoki to‘g‘ridan-to‘g‘ri link)"
          className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Dars matni / tavsifi va vazifa mezonlari"
          rows={5}
          className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </div>
    </Modal>
  )
}
