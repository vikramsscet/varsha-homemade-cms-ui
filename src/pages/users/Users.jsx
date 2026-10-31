import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { getUsers } from '../../services/user.service.js'
import { parseApiError } from '../../utils/api-error.js'
import UserStatusBadge, { formatDateTime, userLabel } from '../../components/users/UserStatusBadge.jsx'

const PAGE_SIZE = 20
const STATUS_OPTIONS = ['ACTIVE', 'SUSPENDED', 'DELETED']
const initialPagination = { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 }

function Users() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    setLoading(true)
    setError('')

    async function loadUsers() {
      try {
        const params = { page, limit: PAGE_SIZE }
        if (status) params.status = status
        const response = await getUsers(params)
        const { data, pagination: responsePagination } = response.data

        if (!Array.isArray(data) || !responsePagination) {
          throw new Error('Unexpected users response')
        }

        if (isCurrent) {
          setUsers(data)
          setPagination(responsePagination)
        }
      } catch (requestError) {
        if (isCurrent) setError(parseApiError(requestError, 'Unable to load users.').message)
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadUsers()

    return () => {
      isCurrent = false
    }
  }, [page, status, refreshKey])

  const firstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const lastItem = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Users</h1>
        <div className="flex items-center gap-3">
          <label htmlFor="user-status-filter" className="text-sm font-medium text-text">Status</label>
          <select
            id="user-status-filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-48 rounded-lg border border-border bg-surface p-6 text-sm text-muted" role="status">
          Loading users...
        </div>
      ) : error ? (
        <div className="flex min-h-40 flex-col items-start justify-center gap-4 rounded-lg border border-border bg-surface p-6">
          <p className="text-sm text-error" role="alert">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background"
          >
            <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-border bg-surface p-6 text-sm font-medium text-text">
          No users found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="min-w-full divide-y divide-border text-left text-sm">
              <thead className="bg-background text-xs font-medium uppercase text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3.5">User</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">Email verified</th>
                  <th scope="col" className="px-4 py-3.5">Last login</th>
                  <th scope="col" className="px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="min-w-48 px-4 py-3">
                      <p className="font-medium text-text">{userLabel(user)}</p>
                      <p className="mt-1 text-xs text-muted">{user.email}</p>
                    </td>
                    <td className="px-4 py-3"><UserStatusBadge status={user.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-text">{user.emailVerified ? 'Yes' : 'No'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(user.lastLoginAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/users/${user.id}`}
                          aria-label={`View user ${userLabel(user)}`}
                          className="font-medium text-primary hover:text-primary-hover"
                        >
                          View
                        </Link>
                        <Link
                          to={`/users/${user.id}/cart`}
                          aria-label={`View cart for ${userLabel(user)}`}
                          className="font-medium text-primary hover:text-primary-hover"
                        >
                          Cart
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Showing {firstItem}–{lastItem} of {pagination.total} users
            </p>
            <nav aria-label="User pages" className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
                className="rounded-md border border-border px-3 py-2 text-sm text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {pagination.page} of {Math.max(1, pagination.totalPages)}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-md border border-border px-3 py-2 text-sm text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}

export default Users
