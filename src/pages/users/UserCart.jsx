import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Plus, RefreshCw } from 'lucide-react'
import { clearCart, getCart, updateCartItems } from '../../services/cart.service.js'
import { parseApiError } from '../../utils/api-error.js'
import { MAX_QUANTITY, formatMoney, isValidQuantity, itemWarning } from '../../utils/cart.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import ProductPicker from '../../components/users/ProductPicker.jsx'

function CartItemRow({ item, currency, busy, onSetQuantity }) {
  const [draft, setDraft] = useState(String(item.quantity))
  const warning = itemWarning(item)
  const quantity = draft.trim() === '' ? NaN : Number(draft)
  const valid = isValidQuantity(quantity)

  useEffect(() => setDraft(String(item.quantity)), [item.quantity])

  return (
    <tr>
      <td className="min-w-48 px-4 py-3">
        <p className="font-medium text-text">{item.productName}</p>
        <p className="mt-1 text-xs text-muted">{item.productSlug}</p>
        {warning && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
            <AlertTriangle size={12} aria-hidden="true" />
            {warning}
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-text">{formatMoney(item.unitPrice, currency)}</td>
      <td className="px-4 py-3">
        <label className="sr-only" htmlFor={`qty-${item.id}`}>Quantity for {item.productName}</label>
        <input
          id={`qty-${item.id}`}
          type="number"
          min={0}
          max={MAX_QUANTITY}
          step={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={!valid}
          className="w-20 rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        {!valid && <p className="mt-1 text-xs text-error" role="alert">Enter 0–{MAX_QUANTITY}.</p>}
      </td>
      <td className="whitespace-nowrap px-4 py-3 font-medium text-text">{formatMoney(item.totalPrice, currency)}</td>
      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={`Update quantity for ${item.productName}`}
            onClick={() => onSetQuantity(item.productId, quantity)}
            disabled={busy || !valid || quantity === item.quantity}
            className="font-medium text-primary hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Update
          </button>
          <button
            type="button"
            aria-label={`Remove ${item.productName}`}
            onClick={() => onSetQuantity(item.productId, 0)}
            disabled={busy}
            className="text-muted hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  )
}

function UserCart() {
  const { id: userId } = useParams()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearError, setClearError] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const activeModal = confirmClear || showPicker

  useEffect(() => {
    let isCurrent = true
    setLoading(true)
    setLoadError('')

    async function loadCart() {
      try {
        const response = await getCart(userId)
        if (!response.data || !Array.isArray(response.data.items)) throw new Error('Unexpected cart response')
        if (isCurrent) setCart(response.data)
      } catch (requestError) {
        if (isCurrent) {
          const { code, message } = parseApiError(requestError, 'Unable to load cart.')
          setLoadError(code === 'USER_NOT_FOUND' ? 'User not found.' : message)
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadCart()

    return () => {
      isCurrent = false
    }
  }, [userId, refreshKey])

  // Quantities are absolute; the cart is replaced with the server's response.
  const setQuantity = async (productId, quantity) => {
    setBusy(true)
    setActionError('')
    setSuccessMessage('')

    try {
      const response = await updateCartItems(userId, [{ productId, quantity }])
      setCart(response.data)
      setShowPicker(false)
      setSuccessMessage('Cart updated.')
      return true
    } catch (requestError) {
      setActionError(parseApiError(requestError, 'Unable to update cart.').message)
      return false
    } finally {
      setBusy(false)
    }
  }

  const handleClear = async () => {
    setBusy(true)
    setClearError('')

    try {
      await clearCart(userId)
      setConfirmClear(false)
      setSuccessMessage('Cart cleared.')
      setActionError('')
      setRefreshKey((key) => key + 1)
    } catch (requestError) {
      setClearError(parseApiError(requestError, 'Unable to clear cart.').message)
    } finally {
      setBusy(false)
    }
  }

  const currency = cart?.currency || 'INR'

  return (
    <>
      <div className="space-y-6" aria-hidden={activeModal} inert={activeModal ? '' : undefined}>
        <Link to={`/users/${userId}`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to user
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-text sm:text-3xl">Cart</h1>
          {cart && !loadError && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActionError('')
                  setShowPicker(true)
                }}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={17} aria-hidden="true" />
                Add product
              </button>
              <button
                type="button"
                onClick={() => {
                  setClearError('')
                  setConfirmClear(true)
                }}
                disabled={busy || cart.items.length === 0}
                className="rounded-md border border-error/40 bg-surface px-3 py-2 text-sm font-medium text-error hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear cart
              </button>
            </div>
          )}
        </div>

        {successMessage && (
          <div className="rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success" role="status">
            {successMessage}
          </div>
        )}
        {actionError && (
          <p className="rounded-md border border-error/20 bg-error/5 px-3 py-2 text-sm text-error" role="alert">{actionError}</p>
        )}

        {loading ? (
          <div className="min-h-48 rounded-lg border border-border bg-surface p-6 text-sm text-muted" role="status">
            Loading cart...
          </div>
        ) : loadError ? (
          <div className="flex min-h-40 flex-col items-start justify-center gap-4 rounded-lg border border-border bg-surface p-6">
            <p className="text-sm text-error" role="alert">{loadError}</p>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background"
            >
              <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-border bg-surface p-6 text-sm font-medium text-text">
            This user has no items in their cart.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-background text-xs font-medium uppercase text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">Product</th>
                    <th scope="col" className="px-4 py-3.5">Unit price</th>
                    <th scope="col" className="px-4 py-3.5">Quantity</th>
                    <th scope="col" className="px-4 py-3.5">Total</th>
                    <th scope="col" className="px-4 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cart.items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      currency={currency}
                      busy={busy}
                      onSetQuantity={setQuantity}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto w-full max-w-xs space-y-2 rounded-lg border border-border bg-surface p-4 text-sm">
              {[
                ['Items', cart.itemCount],
                ['Subtotal', formatMoney(cart.subtotal, currency)],
                ['Discount', formatMoney(cart.discountAmount, currency)],
                ['Tax', formatMoney(cart.taxAmount, currency)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-text">{value}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <dt className="text-text">Total</dt>
                <dd className="text-text">{formatMoney(cart.totalAmount, currency)}</dd>
              </div>
            </dl>
          </>
        )}
      </div>

      {confirmClear && (
        <ConfirmDialog
          title="Clear cart?"
          confirmLabel="Clear cart"
          busyLabel="Clearing..."
          busy={busy}
          error={clearError}
          onConfirm={handleClear}
          onCancel={() => {
            setConfirmClear(false)
            setClearError('')
          }}
        >
          <p>This deletes the user's active cart and all of its items.</p>
        </ConfirmDialog>
      )}

      {showPicker && cart && (
        <ProductPicker
          cartItems={cart.items}
          busy={busy}
          error={actionError}
          onAdd={setQuantity}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}

export default UserCart
