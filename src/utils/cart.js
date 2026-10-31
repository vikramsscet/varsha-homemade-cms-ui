export const MAX_QUANTITY = 99

export function formatMoney(value, currency = 'INR') {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

export function isValidQuantity(value) {
  return Number.isInteger(value) && value >= 0 && value <= MAX_QUANTITY
}

// An item needs a warning when the product is gone, unpublished or unavailable.
export function itemWarning(item) {
  const { product } = item
  if (!product) return 'Product no longer exists'
  if (!product.isPublished) return 'Product not published'
  if (!product.isAvailable) return 'Product unavailable'
  return null
}
