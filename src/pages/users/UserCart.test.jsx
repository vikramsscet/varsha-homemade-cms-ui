import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import UserCart from './UserCart.jsx'
import { clearCart, getCart, updateCartItems } from '../../services/cart.service.js'

vi.mock('../../services/cart.service.js', () => ({ getCart: vi.fn(), updateCartItems: vi.fn(), clearCart: vi.fn() }))
vi.mock('../../services/product.service.js', () => ({ getProducts: vi.fn() }))

const item = (over) => ({
  id: 'i1', productId: 'p1', productName: 'Mango Pickle', productSlug: 'mango-pickle', unitPrice: 100, quantity: 2, totalPrice: 200,
  product: { status: 'PUBLISHED', isAvailable: true, isPublished: true }, ...over,
})
const cart = (items) => ({ id: 'c1', currency: 'INR', subtotal: 200, discountAmount: 0, taxAmount: 0, totalAmount: 200, itemCount: items.length, items })
const renderPage = () => render(
  <MemoryRouter initialEntries={['/users/u1/cart']}>
    <Routes><Route path="/users/:id/cart" element={<UserCart />} /></Routes>
  </MemoryRouter>,
)

describe('UserCart', () => {
  beforeEach(() => vi.clearAllMocks())

  it('warns on unpublished, unavailable and missing products', async () => {
    getCart.mockResolvedValue({ data: cart([
      item({ id: 'a', productName: 'A' }),
      item({ id: 'b', productName: 'B', product: { status: 'DRAFT', isAvailable: true, isPublished: false } }),
      item({ id: 'c', productName: 'C', product: { status: 'PUBLISHED', isAvailable: false, isPublished: true } }),
      item({ id: 'd', productName: 'D', product: null }),
    ]) })
    renderPage()

    expect(await screen.findByText('Product not published')).toBeInTheDocument()
    expect(screen.getByText('Product unavailable')).toBeInTheDocument()
    expect(screen.getByText('Product no longer exists')).toBeInTheDocument()
  })

  it('sends only productId and absolute quantity, then shows the server response', async () => {
    getCart.mockResolvedValue({ data: cart([item()]) })
    updateCartItems.mockResolvedValue({ data: { ...cart([item({ quantity: 5, totalPrice: 500 })]), totalAmount: 500 } })
    renderPage()

    fireEvent.change(await screen.findByLabelText('Quantity for Mango Pickle'), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update quantity for Mango Pickle' }))

    expect(updateCartItems).toHaveBeenCalledWith('u1', [{ productId: 'p1', quantity: 5 }])
    expect(await screen.findAllByText('₹500.00')).not.toHaveLength(0)
  })

  it('removes an item with quantity 0', async () => {
    getCart.mockResolvedValue({ data: cart([item()]) })
    updateCartItems.mockResolvedValue({ data: cart([]) })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Remove Mango Pickle' }))
    expect(updateCartItems).toHaveBeenCalledWith('u1', [{ productId: 'p1', quantity: 0 }])
    expect(await screen.findByText(/no items in their cart/i)).toBeInTheDocument()
  })

  it('rejects out-of-range quantities client-side', async () => {
    getCart.mockResolvedValue({ data: cart([item()]) })
    renderPage()

    fireEvent.change(await screen.findByLabelText('Quantity for Mango Pickle'), { target: { value: '100' } })
    expect(screen.getByRole('button', { name: 'Update quantity for Mango Pickle' })).toBeDisabled()
  })

  it('requires confirmation before clearing the cart', async () => {
    getCart.mockResolvedValue({ data: cart([item()]) })
    clearCart.mockResolvedValue({})
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Clear cart' }))
    expect(clearCart).not.toHaveBeenCalled()
    fireEvent.click(within_dialog())
    await waitFor(() => expect(clearCart).toHaveBeenCalledWith('u1'))
  })

  it('shows a 404 as user not found', async () => {
    getCart.mockRejectedValue({ response: { status: 404, data: { message: 'x', code: 'USER_NOT_FOUND' } } })
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('User not found.')
  })
})

function within_dialog() {
  const dialog = screen.getByRole('alertdialog', { name: 'Clear cart?' })
  return Array.from(dialog.querySelectorAll('button')).find((b) => b.textContent === 'Clear cart')
}
