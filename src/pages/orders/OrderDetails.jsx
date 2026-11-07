import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { getOrderById } from '../../services/order.service.js'
import { parseApiError } from '../../utils/api-error.js'
import { formatMoney } from '../../utils/cart.js'
import { UUID_PATTERN, methodDetailRows, minorToMajor, newestFirst, safeBackTarget } from '../../utils/order-details.js'
import { formatDateTime } from '../../components/users/UserStatusBadge.jsx'
import { StatusBadge, statusLabel } from '../../components/orders/OrderBadges.jsx'

const dash = (v) => (v === null || v === undefined || v === '' ? '—' : v)
const cardClass = 'rounded-lg border border-border bg-surface p-4 sm:p-6'
const th = 'whitespace-nowrap px-4 py-3.5'

function Section({ title, children }) {
  return (
    <section className={cardClass}>
      <h2 className="mb-4 text-base font-semibold text-text">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-text">{children}</dd>
    </div>
  )
}

function Table({ headers, children, label }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table aria-label={label} className="min-w-full divide-y divide-border text-left text-sm">
        <thead className="bg-background text-xs font-medium uppercase text-muted">
          <tr>{headers.map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  )
}

function OrderDetails() {
  const { orderId } = useParams()
  const location = useLocation()
  const backTo = safeBackTarget(location.state?.from)
  const validId = UUID_PATTERN.test(orderId ?? '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(validId)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!validId) return undefined
    let isCurrent = true
    setLoading(true)
    setError(null)
    getOrderById(orderId)
      .then((response) => {
        const body = response.data?.data ?? response.data
        if (!body || typeof body !== 'object') throw new Error('Unexpected order response')
        if (isCurrent) setOrder(body)
      })
      .catch((e) => isCurrent && setError(parseApiError(e, 'Unable to load order.')))
      .finally(() => isCurrent && setLoading(false))
    return () => {
      isCurrent = false
    }
  }, [orderId, validId, refreshKey])

  const back = (
    <Link to={backTo} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover">
      <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
      Back
    </Link>
  )
  const notice = (text, retry) => (
    <div className="space-y-6">
      {back}
      <div className="flex min-h-40 flex-col items-start justify-center gap-4 rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-error" role="alert">{text}</p>
        {retry && (
          <button type="button" onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background">
            <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
            Retry
          </button>
        )}
      </div>
    </div>
  )

  if (!validId) return notice('Invalid order ID.')
  if (loading) {
    return (
      <div className="space-y-6">
        {back}
        <div className="min-h-48 rounded-lg border border-border bg-surface p-6 text-sm text-muted" role="status">Loading order...</div>
      </div>
    )
  }
  if (error?.status === 404) return notice('Order not found.')
  if (error?.status === 401) return notice(`Unauthorized. ${error.message}`)
  if (error?.status === 403) return notice(`Forbidden. ${error.message}`)
  if (error) return notice(error.message, true)
  if (!order) return null

  const currency = order.currency
  const money = (v) => formatMoney(v, currency)
  const customer = order.customer ?? {}
  const address = order.shippingAddress ?? {}
  const items = Array.isArray(order.items) ? order.items : []
  const attempts = newestFirst(order.payments ?? order.paymentAttempts)
  const fullName = (o) => [o?.firstName, o?.lastName].filter(Boolean).join(' ')
  // Payment-level amounts arrive in minor units.
  const payMoney = (v, cur) => {
    const major = minorToMajor(v)
    return major === null ? '—' : formatMoney(major, cur ?? currency)
  }

  return (
    <div className="space-y-6">
      {back}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Order {dash(order.orderNumber)}</h1>
        <StatusBadge status={order.status} />
      </div>

      <Section title="Order information">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Order number">{dash(order.orderNumber)}</Field>
          <Field label="Order date">{formatDateTime(order.createdAt)}</Field>
          <Field label="Order status"><StatusBadge status={order.status} /></Field>
          <Field label="Payment status"><StatusBadge status={order.paymentStatus} /></Field>
          <Field label="Confirmed">{formatDateTime(order.confirmedAt)}</Field>
          <Field label="Paid">{formatDateTime(order.paidAt)}</Field>
          {order.cancelledAt && <Field label="Cancelled">{formatDateTime(order.cancelledAt)}</Field>}
          {order.paymentExpiresAt && <Field label="Payment expires">{formatDateTime(order.paymentExpiresAt)}</Field>}
        </dl>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Customer">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name">{dash(fullName(customer))}</Field>
            <Field label="Email">{dash(customer.email)}</Field>
            <Field label="Phone">{dash(customer.phone)}</Field>
          </dl>
        </Section>
        <Section title="Shipping address">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name">{dash(address.firstName)}</Field>
            <Field label="Last name">{dash(address.lastName)}</Field>
            <Field label="Phone">{dash(address.phone)}</Field>
            <Field label="Address line 1">{dash(address.addressLine1)}</Field>
            <Field label="Address line 2">{dash(address.addressLine2)}</Field>
            <Field label="City">{dash(address.city)}</Field>
            <Field label="State">{dash(address.state)}</Field>
            <Field label="Postal code">{dash(address.postalCode)}</Field>
            <Field label="Country">{dash(address.country)}</Field>
          </dl>
        </Section>
      </div>

      <Section title="Items">
        {items.length === 0 ? <p className="text-sm text-muted">No items.</p> : (
          <Table label="Order items" headers={['Product Name', 'Product Slug', 'Unit Price', 'Quantity', 'Total Price']}>
            {items.map((item, i) => (
              <tr key={item.id ?? i}>
                <td className="min-w-40 px-4 py-3 font-medium text-text">{dash(item.productName)}</td>
                <td className="px-4 py-3 text-muted">{dash(item.productSlug)}</td>
                <td className="whitespace-nowrap px-4 py-3">{money(item.unitPrice)}</td>
                <td className="px-4 py-3">{dash(item.quantity)}</td>
                <td className="whitespace-nowrap px-4 py-3">{money(item.totalPrice)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      <Section title="Pricing summary">
        <dl className="ml-auto max-w-sm space-y-2 text-sm">
          {[['Subtotal', order.subtotalAmount ?? order.subtotal], ['Discount', order.discountAmount ?? order.discount],
            ['Tax', order.taxAmount ?? order.tax], ['Shipping', order.shippingAmount ?? order.shipping]].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4"><dt className="text-muted">{label}</dt><dd className="text-text">{money(value)}</dd></div>
          ))}
          <div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold">
            <dt>Total Amount</dt><dd>{money(order.totalAmount)}</dd>
          </div>
        </dl>
      </Section>

      <Section title="Payment attempts">
        {attempts.length === 0 ? <p className="text-sm text-muted">No payment attempts.</p> : (
          <Table label="Payment attempts" headers={['Attempt', 'Payment ID', 'Razorpay Payment ID', 'Status', 'Method', 'Amount', 'Refunded', 'Created', 'Captured', 'Failure Reason']}>
            {attempts.map((p, i) => {
              const rows = methodDetailRows(p)
              return (
                <tr key={p.id ?? i} className="align-top">
                  <td className="px-4 py-3">{dash(p.attemptNumber)}</td>
                  <td className="break-all px-4 py-3 text-xs text-muted">{dash(p.id)}</td>
                  <td className="break-all px-4 py-3 text-xs text-muted">{dash(p.razorpayPaymentId)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="min-w-32 px-4 py-3">
                    <p className="text-text">{p.method ? statusLabel(p.method) : '—'}</p>
                    {rows.map(([k, v]) => <p key={k} className="text-xs text-muted">{k}: {v}</p>)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{payMoney(p.amount, p.currency)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{payMoney(p.amountRefunded, p.currency)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(p.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(p.capturedAt)}</td>
                  <td className="min-w-40 px-4 py-3 text-muted">{dash(p.failureReason)}</td>
                </tr>
              )
            })}
          </Table>
        )}
      </Section>

      <Section title="Payment transactions">
        {(() => {
          const txs = attempts.flatMap((p) => newestFirst(p.transactions).map((t) => ({ ...t, attempt: p })))
            .sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0))
          if (txs.length === 0) return <p className="text-sm text-muted">No transactions.</p>
          return (
            <Table label="Payment transactions" headers={['Attempt', 'Transaction ID', 'Type', 'Status', 'Amount', 'Currency', 'Payment ID', 'Refund ID', 'Source', 'Error Code', 'Error Description', 'Created']}>
              {txs.map((t, i) => (
                <tr key={t.id ?? i} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3">#{dash(t.attempt.attemptNumber)}</td>
                  <td className="break-all px-4 py-3 text-xs text-muted">{dash(t.id)}</td>
                  <td className="px-4 py-3">{t.type ? statusLabel(t.type) : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3">{payMoney(t.amount, t.currency)}</td>
                  <td className="px-4 py-3">{dash(t.currency)}</td>
                  <td className="break-all px-4 py-3 text-xs text-muted">{dash(t.razorpayPaymentId ?? t.paymentId)}</td>
                  <td className="break-all px-4 py-3 text-xs text-muted">{dash(t.razorpayRefundId ?? t.refundId)}</td>
                  <td className="px-4 py-3">{dash(t.source)}</td>
                  <td className="px-4 py-3">{dash(t.errorCode)}</td>
                  <td className="min-w-40 px-4 py-3 text-muted">{dash(t.errorDescription)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(t.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )
        })()}
      </Section>
    </div>
  )
}

export default OrderDetails
