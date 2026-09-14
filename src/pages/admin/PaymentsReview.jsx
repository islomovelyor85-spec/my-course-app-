import { useEffect, useState } from 'react'
import { Check, X, Receipt } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'

const TABS = [
  { id: 'pending', label: 'Kutilmoqda' },
  { id: 'approved', label: 'Tasdiqlangan' },
  { id: 'rejected', label: 'Rad etilgan' }
]

export default function PaymentsReview() {
  const [tab, setTab] = useState('pending')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('payments')
      .select('*, users(full_name, phone), courses(title)')
      .eq('status', tab)
      .order('created_at', { ascending: true })
    setPayments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  async function decide(payment, status) {
    await supabase
      .from('payments')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', payment.id)
    load()
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">To‘lovlar</h1>
      <p className="text-ink-soft/50 text-sm mb-5">O‘quvchilar yuborgan to‘lov cheklarini tasdiqlang</p>

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
      ) : payments.length === 0 ? (
        <p className="text-center text-ink-soft/40 text-sm py-16">Bu bo‘limda hozircha to‘lovlar yo‘q</p>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4 border border-beige rounded-xl2 p-4 bg-paper">
              <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-beige-soft flex items-center justify-center flex-shrink-0">
                {p.receipt_url ? (
                  <a href={p.receipt_url} target="_blank" rel="noreferrer" className="w-full h-full block">
                    <img src={p.receipt_url} alt="chek" className="w-full h-full object-cover" />
                  </a>
                ) : (
                  <Receipt size={22} className="text-ink-soft/30" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{p.users?.full_name}</p>
                <p className="text-xs text-ink-soft/50 mt-0.5">{p.users?.phone}</p>
                <p className="text-xs text-ink-soft/50 mt-0.5">{p.courses?.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-semibold text-gold-dark">
                    {new Intl.NumberFormat('uz-UZ').format(p.amount)} so‘m
                  </span>
                  <span className="text-xs text-ink-soft/40">{p.payment_method}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>

              {tab === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => decide(p, 'rejected')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl2 border border-rose-300 text-rose-600 text-sm font-medium hover:bg-rose-50"
                  >
                    <X size={15} /> Rad etish
                  </button>
                  <button
                    onClick={() => decide(p, 'approved')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl2 bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                  >
                    <Check size={15} /> Tasdiqlash
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
