const STATUS_MAP = {
  pending: { label: 'Kutilmoqda', className: 'bg-beige text-ink-soft border-gold/40' },
  approved: { label: 'Tasdiqlandi', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Qayta ko‘rish', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  reviewing: { label: 'Tekshirilmoqda', className: 'bg-amber-50 text-amber-700 border-amber-200' }
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.pending
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
