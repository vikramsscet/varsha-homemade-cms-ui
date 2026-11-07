// Presentation helpers for the order details page.
// NOTE: payment/transaction field names are centralised here so they are easy to align with the backend contract.

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Only same-app order list URLs are accepted as a Back target.
export function safeBackTarget(from) {
  if (typeof from === 'string' && (from === '/orders' || /^\/users\/[^/?#]+\/orders$/.test(from))) return from
  return '/orders'
}

// Payment-level amounts are gateway minor units (paise); order-level amounts are rupees.
export function minorToMajor(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n / 100 : null
}

const byNewest = (a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0)
export const newestFirst = (list) => (Array.isArray(list) ? [...list].sort(byNewest) : [])

// Returns display rows for method-specific details. Never includes card numbers, CVV, PIN, OTP or full UPI handles.
export function methodDetailRows(payment) {
  const d = payment?.methodDetails ?? payment ?? {}
  const method = String(payment?.method ?? '').toLowerCase()
  const rows = []
  if (method === 'card') {
    rows.push(['Network', d.cardNetwork], ['Last 4', d.cardLast4], ['Card type', d.cardType], ['Issuer', d.cardIssuer ?? d.issuer])
  } else if (method === 'netbanking') {
    rows.push(['Bank code', d.bank ?? d.bankCode])
  } else if (method === 'wallet') {
    rows.push(['Wallet', d.wallet ?? d.walletName])
  } else if (method === 'upi') {
    rows.push(['UPI', d.maskedVpa ?? d.vpaMasked ?? d.upiMasked])
  }
  return rows.filter(([, v]) => v !== null && v !== undefined && v !== '')
}
