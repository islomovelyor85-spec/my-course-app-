import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-paper rounded-t-xl2 sm:rounded-xl2 shadow-soft max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-beige">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-beige transition-colors">
            <X size={18} className="text-ink-soft" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-beige flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  )
}
