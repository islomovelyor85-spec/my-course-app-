import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { getStudentProgress } from '../../lib/queries'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ProgressBar from '../../components/common/ProgressBar'

export default function StudentsTracking() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [approvingId, setApprovingId] = useState(null)
  const [allCourses, setAllCourses] = useState([])

  async function loadStudents() {
    setLoading(true)
    const { data: students } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .order('last_active_at', { ascending: false })

    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    const withProgress = await Promise.all(
      (students || []).map(async (s) => {
        try {
          const p = await getStudentProgress(s.id)
          return { ...s, ...p }
        } catch {
          return { ...s, courseTitle: '—', progressPercent: 0, currentLessonTitle: '—', isPaid: false }
        }
      })
    )
    setRows(withProgress)
    setAllCourses(courses || [])
    setLoading(false)
  }

  useEffect(() => {
    loadStudents()
  }, [])

  async function quickApprovePayment(student) {
    if (allCourses.length === 0) {
      alert('Hozircha chop etilgan kurs yo\'q')
      return
    }
    const courseId = allCourses.length === 1
      ? allCourses[0].id
      : prompt(
          'Qaysi kursga dostup berilsin? Kurs nomini yozing:\n' + allCourses.map((c) => c.title).join(', ')
        )
    const course = allCourses.find((c) => c.id === courseId || c.title === courseId) || allCourses[0]
    if (!course) return

    setApprovingId(student.id)
    try {
      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', student.id)
        .eq('course_id', course.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('payments')
          .update({ status: 'approved', reviewed_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await supabase.from('payments').insert({
          user_id: student.id,
          course_id: course.id,
          amount: 0,
          payment_method: 'admin_manual',
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
      }
      await loadStudents()
    } catch (err) {
      alert('Xatolik: ' + (err.message || String(err)))
    } finally {
      setApprovingId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) => r.full_name?.toLowerCase().includes(q) || r.phone?.toLowerCase().includes(q)
    )
  }, [rows, query])

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">O‘quvchilar</h1>
      <p className="text-ink-soft/50 text-sm mb-5">Har bir o‘quvchi hozir qaysi kurs va darsda ekanini kuzating</p>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ism yoki telefon bo‘yicha qidirish"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl2 border border-beige bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </div>

      <div className="border border-beige rounded-xl2 overflow-hidden bg-paper">
        <div className="hidden sm:grid grid-cols-[1fr_0.8fr_1fr_1fr_auto_auto] gap-3 px-4 py-3 bg-beige-soft text-[11px] font-medium text-ink-soft/50 uppercase tracking-wide">
          <span>O‘quvchi</span>
          <span>Kurs</span>
          <span>Joriy dars</span>
          <span>Progress</span>
          <span>To‘lov</span>
          <span></span>
        </div>
        <div className="divide-y divide-beige">
          {filtered.map((s) => (
            <div key={s.id} className="grid grid-cols-1 sm:grid-cols-[1fr_0.8fr_1fr_1fr_auto_auto] gap-2 sm:gap-3 px-4 py-3.5 items-center">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{s.full_name}</p>
                <p className="text-xs text-ink-soft/50">{s.phone || '—'}</p>
              </div>
              <p className="text-sm text-ink-soft truncate">{s.courseTitle}</p>
              <p className="text-sm text-ink-soft truncate">{s.currentLessonTitle}</p>
              <div className="max-w-[160px]">
                <ProgressBar value={s.progressPercent} size="sm" showLabel={false} />
                <span className="text-[10.5px] text-ink-soft/40">{Math.round(s.progressPercent)}%</span>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border w-fit ${
                  s.isPaid
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-beige text-ink-soft/60 border-beige'
                }`}
              >
                {s.isPaid ? 'To‘langan' : 'To‘lanmagan'}
              </span>
              {!s.isPaid && (
                <button
                  onClick={() => quickApprovePayment(s)}
                  disabled={approvingId === s.id}
                  className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 w-fit"
                >
                  {approvingId === s.id ? '...' : 'Dostup berish'}
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-ink-soft/40 text-sm py-10">O‘quvchi topilmadi</p>
          )}
        </div>
      </div>
    </div>
  )
}
