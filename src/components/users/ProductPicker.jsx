import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { getProducts } from '../../services/product.service.js'
import { parseApiError } from '../../utils/api-error.js'
import { MAX_QUANTITY, isValidQuantity } from '../../utils/cart.js'

const PICKER_LIMIT = 100

function ProductPicker({ cartItems, busy, error, onAdd, onClose }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [query, setQuery] = useState('')
  const [quantity, setQuantity] = useState('1')

  useEffect(() => {
    let isCurrent = true
    setLoading(true)
    setLoadError('')

    getProducts({ page: 1, limit: PICKER_LIMIT })
      .then((response) => {
        if (!Array.isArray(response.data?.data)) throw new Error('Unexpected products response')
        if (isCurrent) setProducts(response.data.data)
      })
      .catch((requestError) => {
        if (isCurrent) setLoadError(parseApiError(requestError, 'Unable to load products.').message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [refreshKey])

  const visible = products.filter((product) =>
    String(product.title ?? '').toLowerCase().includes(query.trim().toLowerCase()),
  )
  const amount = quantity.trim() === '' ? NaN : Number(quantity)
  const validAmount = isValidQuantity(amount) && amount > 0

  // Quantities are absolute, so adding to a product already in the cart sums the two.
  const handleAdd = (product) => {
    const existing = cartItems.find((item) => item.productId === product.id)?.quantity ?? 0
    onAdd(product.id, Math.min(MAX_QUANTITY, existing + amount))
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-text/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Add product to cart"
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg border border-border bg-surface p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-text">Add product</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add product dialog"
            className="grid size-8 place-items-center rounded-md border border-border bg-surface text-text hover:bg-background"
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="flex-1">
            <label htmlFor="picker-search" className="sr-only">Search products</label>
            <input
              id="picker-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label htmlFor="picker-quantity" className="sr-only">Quantity to add</label>
            <input
              id="picker-quantity"
              type="number"
              min={1}
              max={MAX_QUANTITY}
              step={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              aria-invalid={!validAmount}
              className="w-20 rounded-md border border-border bg-surface px-2 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
        {!validAmount && <p className="mt-1 text-xs text-error" role="alert">Quantity must be 1–{MAX_QUANTITY}.</p>}
        {error && <p className="mt-3 text-sm text-error" role="alert">{error}</p>}

        <div className="mt-4 min-h-24 flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted" role="status">Loading products...</p>
          ) : loadError ? (
            <div className="space-y-3">
              <p className="text-sm text-error" role="alert">{loadError}</p>
              <button
                type="button"
                onClick={() => setRefreshKey((key) => key + 1)}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:bg-background"
              >
                Retry
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className="text-sm text-muted">No products found.</p>
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{product.title}</p>
                    <p className="text-xs text-muted">
                      {product.status}{product.isAvailable ? '' : ' · Unavailable'}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Add ${product.title}`}
                    onClick={() => handleAdd(product)}
                    disabled={busy || !validAmount}
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default ProductPicker
