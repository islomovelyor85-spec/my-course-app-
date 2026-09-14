import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle2, PlayCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getMyCourseOverview, uploadReceiptFile, submitPayment } from '../../lib/queries'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import StatusBadge from '../../components/common/StatusBadge'

function LessonRow({ lesson, onClick }) {
  const icon =
    lesson.status === 'completed' ? (
      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
    ) : lesson.status === 'unlocked' ? (
      <PlayCircle size={18} className="text-gold-dark flex-shrink-0" />
    ) : (
      <Lock size={16} className="text-ink-soft/30 flex-shrink-0" />
    )

  return (
    <button
      onClick={() => !lesson.locked && onClick(lesson)}
      disabled={lesson.locked}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        lesson.locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-beige-soft'
      }`}
    >
      {icon}
      <span className={`text-sm flex-1 truncate ${lesson.locked ? 'text-ink-soft/50' : 'text-ink'}`}>
        {lesson.title}
      </span>
      {lesson.submission && !lesson.locked && <StatusBadge status={lesson.submission.status} />}
    </button>
  )
}

export default function MyCourse() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openModules, setOpenModules] = useState({})
  const [payOpen, setPayOpen] = useState(false)

  async function refresh() {
    if (!profile) return
    const data = await getMyCourseOverview(profile.id)
    setOverview(data)
    if (data.modules[0]) setOpenModules({ [data.modules[0].id]: true })
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  if (loading) return <LoadingSpinner fullscreen />

  if (!overview?.course) {
    return (
      <div className="px-5 pt-10 text-center text-ink-soft/60 text-sm">Hozircha faol kurs mavjud emas.</div>
    )
  }

  return (
    <div className="pb-4">
      <div className="px-5 pt-6 mb-4">
        <h1 className="font-display text-xl font-semibold text-ink">{overview.course.title}</h1>
        {overview.course.description && (
          <p className="text-ink-soft/60 text-sm mt-1">{overview.course.description}</p>
        )}
      </div>

      {!overview.isPaid && (
        <div className="mx-5 mb-5 relative">
          <div className="bg-beige border border-gold/30 rounded-xl2 p-5 text-center">
            <Lock size={20} className="text-gold-dark mx-auto mb-2" />
            <p className="text-sm text-ink-soft mb-3">
              {overview.payment?.status === 'pending'
                ? 'To‘lov cheki yuborildi, ustoz tomonidan tasdiqlanishini kuting.'
                : overview.payment?.status === 'rejected'
                ? 'To‘lov tasdiqlanmadi. Iltimos, qaytadan urinib ko‘ring.'
                : 'Darslarni ochish uchun kurs to‘lovini amalga oshiring.'}
            </p>
            {overview.payment?.status !== 'pending' && (
              <button
                onClick={() => setPayOpen(true)}
                className="px-5 py-2.5 rounded-full bg-gold text-ink text-sm font-semibold hover:bg-gold-light transition-colors"
              >
                To‘lov chekini yuklash
              </button>
            )}
          </div>
        </div>
      )}

      <div className="px-5 space-y-3">
        {overview.modules.map((mod, idx) => (
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
                {mod.lessons.map((lesson) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    onClick={(l) => navigate(`/course/lesson/${l.id}`)}
                  />
                ))}
                {mod.lessons.length === 0 && (
                  <p className="px-4 py-3 text-xs text-ink-soft/40">Bu modulda hali darslar yo‘q</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        courseId={overview.course.id}
        userId={profile.id}
        onSuccess={() => {
          setPayOpen(false)
          refresh()
        }}
      />
    </div>
  )
}

function PaymentModal({ open, onClose, courseId, userId, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Payme')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!file || !amount) {
      setError('Summa va chek rasmini kiriting')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const receiptUrl = await uploadReceiptFile(file, userId)
      await submitPayment({ userId, courseId, amount: Number(amount), paymentMethod: method, receiptUrl })
      onSuccess()
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="To‘lov chekini yuklash"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm text-ink-soft">
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-full bg-ink text-beige-soft text-sm font-medium disabled:opacity-60"
          >
            {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-ink-soft/70 mb-1.5 block">To‘langan summa</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Masalan: 350000"
            className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink-soft/70 mb-1.5 block">To‘lov usuli</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          >
            <option>Payme</option>
            <option>Click</option>
            <option>Bank kartasi</option>
            <option>Naqd</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-ink-soft/70 mb-1.5 block">Chek rasmi</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
          {file && (
            <img
              src={URL.createObjectURL(file)}
              alt="chek"
              className="mt-2 max-h-40 rounded-xl object-contain border border-beige"
            />
          )}
        </div>
        {error && <p className="text-rose-600 text-xs">{error}</p>}
      </div>
    </Modal>
  )
}
