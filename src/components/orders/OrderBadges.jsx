const STATUS_STYLES = {
  PENDING_PAYMENT: 'bg-warning/10 text-warning',
  CREATED: 'bg-warning/10 text-warning',
  PENDING: 'bg-warning/10 text-warning',
  CONFIRMED: 'bg-primary/10 text-primary',
  PROCESSING: 'bg-primary/10 text-primary',
  SHIPPED: 'bg-primary/10 text-primary',
  DELIVERED: 'bg-success/10 text-success',
  COMPLETED: 'bg-success/10 text-success',
  PAID: 'bg-success/10 text-success',
  FAILED: 'bg-error/10 text-error',
  SUCCESS: 'bg-success/10 text-success',
  CAPTURED: 'bg-success/10 text-success',
  CANCELLED: 'bg-background text-muted',
}

export const ORDER_STATUS_OPTIONS = ['PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']
export const PAYMENT_STATUS_OPTIONS = ['CREATED', 'CAPTURED', 'FAILED', 'REFUNDED']

export function statusLabel(value) {
  if (!value) return '—'
  return String(value).toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function StatusBadge({ status }) {
  if (!status) return <span className="text-muted">—</span>
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-background text-muted'}`}>
      {statusLabel(status)}
    </span>
  )
}
