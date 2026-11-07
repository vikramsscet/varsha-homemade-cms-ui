import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getOrders, parseOrderList, DEFAULT_ORDER_LIMIT } from '../../services/order.service.js'
import { parseApiError } from '../../utils/api-error.js'
import OrdersTable from '../../components/orders/OrdersTable.jsx'
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS, statusLabel } from '../../components/orders/OrderBadges.jsx'

const emptyFilters = { status: '', paymentStatus: '', search: '', fromDate: '', toDate: '' }
const inputClass = 'rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

function Orders() {
  const [draft, setDraft] = useState(emptyFilters)
  const [filters, setFilters] = useState(emptyFilters)
  const [refreshKey, setRefreshKey] = useState(0)
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [moreError, setMoreError] = useState('')
  const inFlight = useRef(false)

  // First page: runs whenever applied filters change (cursor is never carried over).
  useEffect(() => {
    let isCurrent = true
    inFlight.current = true
    setLoading(true)
    setError(null)
    setMoreError('')

    async function load() {
      try {
        const response = await getOrders({ limit: DEFAULT_ORDER_LIMIT, ...filters })
        const { items: data, pagination: p } = parseOrderList(response)
        if (!isCurrent) return
        setOrders(data)
        setPagination({ hasMore: Boolean(p?.hasMore), nextCursor: p?.nextCursor ?? null })
      } catch (requestError) {
        if (isCurrent) setError(parseApiError(requestError, 'Unable to load orders.'))
      } finally {
        if (isCurrent) {
          setLoading(false)
          inFlight.current = false
        }
      }
    }
    load()
    return () => {
      isCurrent = false
      inFlight.current = false
    }
  }, [filters, refreshKey])

  const loadMore = useCallback(async () => {
    if (inFlight.current || !pagination.hasMore || !pagination.nextCursor) return
    inFlight.current = true
    setLoadingMore(true)
    setMoreError('')
    try {
      const response = await getOrders({ limit: DEFAULT_ORDER_LIMIT, ...filters, cursor: pagination.nextCursor })
      const { items: data, pagination: p } = parseOrderList(response)
      setOrders((current) => {
        const seen = new Set(current.map((order) => order.id))
        return [...current, ...data.filter((order) => !seen.has(order.id))]
      })
      setPagination({ hasMore: Boolean(p?.hasMore), nextCursor: p?.nextCursor ?? null })
    } catch (requestError) {
      setMoreError(parseApiError(requestError, 'Unable to load more orders.').message)
    } finally {
      inFlight.current = false
      setLoadingMore(false)
    }
  }, [filters, pagination])

  const hasActiveFilters = Object.values(filters).some(Boolean)
  const applyFilters = (next) => setFilters({ ...next })
  const changeDraft = (key, value, applyNow) => {
    const next = { ...draft, [key]: value }
    setDraft(next)
    if (applyNow) applyFilters(next)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Orders</h1>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          applyFilters(draft)
        }}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="order-search" className="text-sm font-medium text-text">Search</label>
          <input id="order-search" type="search" value={draft.search} placeholder="Order no., name, email, phone"
            onChange={(e) => changeDraft('search', e.target.value)} className={`${inputClass} w-64`} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="order-status-filter" className="text-sm font-medium text-text">Order status</label>
          <select id="order-status-filter" value={draft.status} onChange={(e) => changeDraft('status', e.target.value, true)} className={inputClass}>
            <option value="">All</option>
            {ORDER_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{statusLabel(o)}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="order-payment-filter" className="text-sm font-medium text-text">Payment status</label>
          <select id="order-payment-filter" value={draft.paymentStatus} onChange={(e) => changeDraft('paymentStatus', e.target.value, true)} className={inputClass}>
            <option value="">All</option>
            {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{statusLabel(o)}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="order-from-date" className="text-sm font-medium text-text">From date</label>
          <input id="order-from-date" type="date" value={draft.fromDate} max={draft.toDate || undefined}
            onChange={(e) => changeDraft('fromDate', e.target.value, true)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="order-to-date" className="text-sm font-medium text-text">To date</label>
          <input id="order-to-date" type="date" value={draft.toDate} min={draft.fromDate || undefined}
            onChange={(e) => changeDraft('toDate', e.target.value, true)} className={inputClass} />
        </div>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">Search</button>
        {(hasActiveFilters || Object.values(draft).some(Boolean)) && (
          <button type="button" onClick={() => { setDraft(emptyFilters); applyFilters(emptyFilters) }}
            className="rounded-md border border-border px-3 py-2 text-sm text-text hover:bg-background">
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div className="min-h-48 rounded-lg border border-border bg-surface p-6 text-sm text-muted" role="status">Loading orders...</div>
      ) : error ? (
        <div className="flex min-h-40 flex-col items-start justify-center gap-4 rounded-lg border border-border bg-surface p-6">
          <p className="text-sm text-error" role="alert">
            {error.status === 401 ? 'Unauthorized. ' : error.status === 403 ? 'Forbidden. ' : ''}{error.message}
          </p>
          {error.status !== 401 && error.status !== 403 && (
            <button type="button" onClick={() => setRefreshKey((key) => key + 1)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background">
              <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
              Retry
            </button>
          )}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-border bg-surface p-6 text-sm font-medium text-text">
          {hasActiveFilters ? 'No orders match your filters.' : 'No orders have been placed yet.'}
        </div>
      ) : (
        <>
          <OrdersTable orders={orders} showCustomer />

          <div className="flex flex-col items-center gap-3">
            {moreError && <p className="text-sm text-error" role="alert">{moreError}</p>}
            {pagination.hasMore ? (
              <button type="button" onClick={loadMore} disabled={loadingMore}
                className="rounded-md border border-border px-4 py-2 text-sm text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50">
                {loadingMore ? 'Loading more...' : 'Load More'}
              </button>
            ) : (
              <p className="text-sm text-muted">Showing all {orders.length} orders</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Orders
