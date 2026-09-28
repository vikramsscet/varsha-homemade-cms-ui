import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, Plus, RefreshCw } from 'lucide-react'
import { getProducts } from '../../services/product.service.js'

const PAGE_SIZE = 20
const initialPagination = { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 }

function formatPrice(price, currency) {
  const numericPrice = Number(price)
  if (!Number.isFinite(numericPrice) || typeof currency !== 'string') return '—'

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericPrice)
  } catch {
    return `${currency} ${numericPrice}`
  }
}

function ProductStatus({ status }) {
  const normalizedStatus = String(status || 'UNKNOWN').toUpperCase()
  const colorClass = normalizedStatus === 'PUBLISHED'
    ? 'bg-success/10 text-success'
    : normalizedStatus === 'ARCHIVED'
      ? 'bg-background text-muted'
      : 'bg-warning/10 text-warning'

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${colorClass}`}>
      {normalizedStatus}
    </span>
  )
}

function Products() {
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isCurrent = true
    setLoading(true)
    setError(false)

    async function loadProducts() {
      try {
        const response = await getProducts({ page, limit: PAGE_SIZE })
        const { data, pagination: responsePagination } = response.data

        if (!Array.isArray(data) || !responsePagination) {
          throw new Error('Unexpected products response')
        }

        if (isCurrent) {
          setProducts(data)
          setPagination(responsePagination)
        }
      } catch (requestError) {
        console.error('Products request failed:', requestError)
        if (isCurrent) setError(true)
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadProducts()

    return () => {
      isCurrent = false
    }
  }, [page, refreshKey])

  const firstPage = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4))
  const lastPage = Math.min(pagination.totalPages, firstPage + 4)
  const pageNumbers = Array.from(
    { length: Math.max(0, lastPage - firstPage + 1) },
    (_, index) => firstPage + index,
  )
  const firstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const lastItem = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Products</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
            Refresh
          </button>
          <Link
            to="/products/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus size={17} strokeWidth={2} aria-hidden="true" />
            Add Product
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="min-h-48 rounded-lg border border-border bg-surface p-6 text-sm text-muted" role="status">
          Loading products...
        </div>
      ) : error ? (
        <div className="flex min-h-40 flex-col items-start justify-center gap-4 rounded-lg border border-border bg-surface p-6">
          <p className="text-sm text-error" role="alert">
            Unable to load products.
          </p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-sm font-medium text-text">No products found.</p>
          <Link
            to="/products/new"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="min-w-full divide-y divide-border text-left text-sm">
              <thead className="bg-background text-xs font-medium uppercase text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Image</th>
                  <th scope="col" className="px-4 py-3.5">Product</th>
                  <th scope="col" className="px-4 py-3.5">Category</th>
                  <th scope="col" className="px-4 py-3.5">Price</th>
                  <th scope="col" className="px-4 py-3.5">Package Size</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">Availability</th>
                  <th scope="col" className="px-4 py-3.5">Featured</th>
                  <th scope="col" className="px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => {
                  const image = product.images?.find((item) => item.isPrimary) ?? product.images?.[0]

                  return (
                    <tr key={product.id}>
                      <td className="px-4 py-3">
                        {image?.url ? (
                          <img
                            src={image.url}
                            alt={image.altText || product.title || ''}
                            loading="lazy"
                            className="size-12 rounded-md border border-border object-cover"
                          />
                        ) : (
                          <span className="grid size-12 place-items-center rounded-md border border-border bg-background text-muted">
                            <ImageIcon size={20} strokeWidth={1.6} aria-hidden="true" />
                          </span>
                        )}
                      </td>
                      <td className="min-w-48 px-4 py-3">
                        <p className="font-medium text-text">{product.title}</p>
                        {product.subtitle && (
                          <p className="mt-1 text-xs text-muted">{product.subtitle}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text">
                        {product.category?.name || 'No category'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-text">
                        {formatPrice(product.price, product.currency)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {product.packageSize || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <ProductStatus status={product.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-text">
                          <span className={`size-2 rounded-full ${product.isAvailable ? 'bg-success' : 'bg-muted'}`} />
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {product.isFeatured ? 'Featured' : 'Not Featured'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="font-medium text-primary hover:text-primary-hover"
                          >
                            Edit
                          </Link>
                          <button type="button" disabled className="text-muted opacity-60">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Showing {firstItem}–{lastItem} of {pagination.total} products
            </p>
            <nav aria-label="Product pages" className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
                className="rounded-md border border-border px-3 py-2 text-sm text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  aria-current={pagination.page === pageNumber ? 'page' : undefined}
                  className={`size-9 rounded-md text-sm ${
                    pagination.page === pageNumber
                      ? 'bg-primary text-white'
                      : 'border border-border text-text hover:bg-surface'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
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

export default Products