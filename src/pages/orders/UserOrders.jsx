import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { getUserOrders, parseOrderList, DEFAULT_ORDER_LIMIT, MAX_ORDER_LIMIT } from '../../services/order.service.js'
import { getUser } from '../../services/user.service.js'
import { parseApiError } from '../../utils/api-error.js'
import { userLabel } from '../../components/users/UserStatusBadge.jsx'
import OrdersTable from '../../components/orders/OrdersTable.jsx'
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS, statusLabel } from '../../components/orders/OrderBadges.jsx'

const LIMIT_OPTIONS = [10, 20, MAX_ORDER_LIMIT]
const emptyFilters = { status: '', paymentStatus: '' }
const selectClass = 'rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

function errorText(error) {
  const prefix = error.status === 401 ? 'Unauthorized. ' : error.status === 403 ? 'Forbidden. ' : ''
  return `${prefix}${error.message}`
}

function UserOrders() {
  const { id: userId } = useParams()
  const [filters, setFilters] = useState(emptyFilters)
  const [limit, setLimit] = useState(DEFAULT_ORDER_LIMIT)
  const [refreshKey, setRefreshKey] = useState(0)
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [moreError, setMoreError] = useState('')
  const inFlight = useRef(false)

  // Customer header info; failure here is non-fatal unless the user doesn't exist.
  useEffect(() => {
    let isCurrent = true
    setCustomer(null)
    getUser(userId)
      .then((response) => {
        if (isCurrent) setCustomer(response.data?.data ?? response.data)
      })
      .catch(() => {})
    return () => {
      isCurrent = false
    }
  }, [userId])

  useEffect(() => {
    let isCurrent = true
    inFlight.current = true
    setLoading(true)
    setError(null)
    setMoreError('')
    setOrders([])
    setPagination({ hasMore: false, nextCursor: null })

    async function load() {
      try {
        const response = await getUserOrders(userId, { limit, ...filters })
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
  }, [userId, filters, limit, refreshKey])

  const loadMore = useCallback(async () => {
    if (inFlight.current || !pagination.hasMore || !pagination.nextCursor) return
    inFlight.current = true
    setLoadingMore(true)
    setMoreError('')
    try {
      const response = await getUserOrders(userId, { limit, ...filters, cursor: pagination.nextCursor })
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
  }, [userId, limit, filters, pagination])

  const hasActiveFilters = Object.values(filters).some(Boolean)
  const notFound = error?.status === 404
  const customerName = customer ? userLabel(customer) : null

  return (
    <div className="space-y-6">
      <Link to="/users" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover">
        <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
        Back to Users
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text sm:text-3xl">Orders</h1>
          {customerName && <p className="mt-1 text-sm font-medium text-text">{customerName}</p>}
          {customer?.email && <p className="text-sm text-muted">{customer.email}</p>}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="user-order-status" className="text-sm font-medium text-text">Order status</label>
            <select id="user-order-status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className={selectClass}>
              <option value="">All</option>
              {ORDER_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{statusLabel(o)}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-order-payment" className="text-sm font-medium text-text">Payment status</label>
            <select id="user-order-payment" value={filters.paymentStatus} onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))} className={selectClass}>
              <option value="">All</option>
              {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{statusLabel(o)}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-order-limit" className="text-sm font-medium text-text">Per page</label>
            <select id="user-order-limit" value={limit} onChange={(e) => setLimit(Number(e.target.value))} className={selectClass}>
              {LIMIT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background disabled:cursor-not-allowed disabled:opacity-60">
            <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-48 rounded-lg border border-border bg-surface p-6 text-sm text-muted" role="status">Loading orders...</div>
      ) : notFound ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-border bg-surface p-6 text-sm font-medium text-text" role="alert">
          User not found.
        </div>
      ) : error ? (
        <div className="flex min-h-40 flex-col items-start justify-center gap-4 rounded-lg border border-border bg-surface p-6">
          <p className="text-sm text-error" role="alert">{errorText(error)}</p>
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
          {hasActiveFilters ? 'No orders match your filters.' : 'This user has no orders.'}
        </div>
      ) : (
        <>
          <OrdersTable orders={orders} linkState={{ from: `/users/${userId}/orders` }} />
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

export default UserOrders
