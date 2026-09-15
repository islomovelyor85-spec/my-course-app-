import { useEffect, useState } from 'react'
import { Check, X, Image as ImageIcon, FileText, Video } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'

const TABS = [
  { id: 'pending', label: 'Kutilmoqda' },
  { id: 'approved', label: 'Tasdiqlangan' },
  { id: 'rejected', label: 'Qaytarilgan' }
]

function isImage(url) {
  return url && /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url)
}
function isVideo(url) {
  return url && /\.(mp4|mov|webm)(\?.*)?$/i.test(url)
}

export default function SubmissionsReview() {
  const [tab, setTab] = useState('pending')
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('submissions')
      .select('*, users(full_name, phone), lessons(title)')
      .eq('status', tab)
      .order('created_at', { ascending: true })
    setSubmissions(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  async function decide(status, feedback) {
    await supabase
      .from('submissions')
      .update({ status, feedback: feedback || null, reviewed_at: new Date().toISOString() })
      .eq('id', active.id)
    setActive(null)
    load()
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Vazifalarni tekshirish</h1>
      <p className="text-ink-soft/50 text-sm mb-5">O‘quvchilar topshirgan xattotlik mashqlari</p>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              tab === t.id ? 'bg-gold/15 border-gold text-gold-dark font-medium' : 'border-beige text-ink-soft/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : submissions.length === 0 ? (
        <p className="text-center text-ink-soft/40 text-sm py-16">Bu bo‘limda hozircha vazifalar yo‘q</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {submissions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              className="text-left border border-beige rounded-xl2 overflow-hidden bg-paper hover:border-gold/50 transition-colors"
            >
              <div className="aspect-video bg-beige-soft flex items-center justify-center">
                {isImage(s.file_url) ? (
                  <img src={s.file_url} alt="" className="w-full h-full object-cover" />
                ) : isVideo(s.file_url) ? (
                  <Video size={24} className="text-ink-soft/30" />
                ) : s.file_url ? (
                  <FileText size={24} className="text-ink-soft/30" />
                ) : (
                  <ImageIcon size={24} className="text-ink-soft/30" />
                )}
              </div>
              <div className="p-3.5">
                <p className="text-sm font-medium text-ink truncate">{s.users?.full_name}</p>
                <p className="text-xs text-ink-soft/50 truncate mt-0.5">{s.lessons?.title}</p>
                <div className="mt-2">
                  <StatusBadge status={s.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <ReviewModal submission={active} onClose={() => setActive(null)} onDecide={decide} />
    </div>
  )
}

function ReviewModal({ submission, onClose, onDecide }) {
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    setFeedback('')
  }, [submission])

  if (!submission) return null

  return (
    <Modal open={!!submission} onClose={onClose} title={submission.users?.full_name || 'Vazifa'}>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-ink-soft/50 mb-1">Dars</p>
          <p className="text-sm text-ink font-medium">{submission.lessons?.title}</p>
        </div>

        {submission.file_url && (
          <div className="rounded-xl overflow-hidden border border-beige">
            {isImage(submission.file_url) ? (
              <img src={submission.file_url} alt="" className="w-full max-h-80 object-contain bg-beige-soft" />
            ) : isVideo(submission.file_url) ? (
              <video src={submission.file_url} controls className="w-full max-h-80" />
            ) : (
              <a
                href={submission.file_url}
                target="_blank"
                rel="noreferrer"
                className="block p-4 text-sm text-gold-dark underline"
              >
                Faylni ko‘rish
              </a>
            )}
          </div>
        )}

        {submission.comment && (
          <div>
            <p className="text-xs text-ink-soft/50 mb-1">O‘quvchi izohi</p>
            <p className="text-sm text-ink-soft bg-beige-soft rounded-xl p-3">{submission.comment}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-ink-soft/50 mb-1.5">Ustoz izohi (qaytarilsa majburiy)</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="Nima yaxshi, nimani tuzatish kerak..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-beige-soft text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (!feedback.trim()) {
                alert('Qaytarish uchun izoh yozish shart')
                return
              }
              onDecide('rejected', feedback)
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl2 border border-rose-300 text-rose-600 text-sm font-medium hover:bg-rose-50"
          >
            <X size={16} /> Qayta ko‘rish
          </button>
          <button
            onClick={() => onDecide('approved', feedback)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl2 bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            <Check size={16} /> Tasdiqlash
          </button>
        </div>
      </div>
    </Modal>
  )
}
