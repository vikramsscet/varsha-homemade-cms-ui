import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import OrderDetails from './OrderDetails.jsx'
import { getOrderById } from '../../services/order.service.js'
import { safeBackTarget } from '../../utils/order-details.js'

vi.mock('../../services/order.service.js', () => ({ getOrderById: vi.fn() }))

const ID = '11111111-2222-3333-4444-555555555555'
const order = {
  id: ID, orderNumber: 'ORD-1', status: 'CONFIRMED', paymentStatus: 'PAID', currency: 'INR', createdAt: '2026-01-01T00:00:00Z',
  customer: { firstName: 'Asha', lastName: 'Rao', email: 'a@x.com', phone: '999' },
  shippingAddress: { firstName: 'Asha', city: 'Pune', addressLine2: null },
  items: [{ id: 'i1', productName: 'Pickle', productSlug: 'pickle', unitPrice: '100', quantity: 2, totalPrice: '200' }],
  subtotalAmount: '200', discountAmount: '0', taxAmount: '10', shippingAmount: '20', totalAmount: '230',
  payments: [
    { id: 'p1', attemptNumber: 1, status: 'FAILED', method: 'card', amount: 23000, amountRefunded: 0, createdAt: '2026-01-01T00:01:00Z', failureReason: 'Declined',
      methodDetails: { cardNetwork: 'Visa', cardLast4: '4242', cardNumber: '4111111111111111', cvv: '123' }, transactions: [{ id: 't1', type: 'FAILURE', status: 'FAILED', createdAt: '2026-01-01T00:01:00Z', gatewayResponse: { secret: 'SECRET' } }] },
    { id: 'p2', attemptNumber: 2, status: 'CAPTURED', method: 'upi', amount: 23000, createdAt: '2026-01-01T00:05:00Z', methodDetails: null,
      transactions: [{ id: 't2', type: 'CAPTURE', status: 'SUCCESS', createdAt: '2026-01-01T00:06:00Z', amount: 23000, currency: 'INR' }] },
  ],
}
const renderAt = (id = ID, state) => render(
  <MemoryRouter initialEntries={[{ pathname: `/orders/${id}`, state }]}>
    <Routes><Route path="/orders/:orderId" element={<OrderDetails />} /></Routes>
  </MemoryRouter>,
)

describe('OrderDetails', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders details, newest-first attempts, safe card data only, and no gateway data', async () => {
    getOrderById.mockResolvedValue({ data: { data: order } })
    renderAt(ID, { from: '/users/u1/orders' })
    expect(await screen.findByText('Order ORD-1')).toBeInTheDocument()
    expect(getOrderById).toHaveBeenCalledWith(ID)
    expect(screen.getByText('Pickle')).toBeInTheDocument()
    expect(screen.getByText('Pune')).toBeInTheDocument()
    const rows = within(screen.getByRole('table', { name: 'Payment attempts' })).getAllByRole('row')
    expect(rows[1]).toHaveTextContent('p2')
    expect(rows[2]).toHaveTextContent('p1')
    expect(screen.getByText('Last 4: 4242')).toBeInTheDocument()
    const html = document.body.innerHTML
    for (const bad of ['4111111111111111', '123</', 'SECRET']) expect(html).not.toContain(bad)
    const tx = within(screen.getByRole('table', { name: 'Payment transactions' })).getAllByRole('row')
    expect(tx[1]).toHaveTextContent('t2')
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/users/u1/orders')
  })

  it('defaults Back to /orders and rejects unsafe targets', async () => {
    getOrderById.mockResolvedValue({ data: { data: order } })
    renderAt(ID, { from: 'https://evil.example' })
    await screen.findByText('Order ORD-1')
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/orders')
    expect(safeBackTarget('/users/a/orders')).toBe('/users/a/orders')
    expect(safeBackTarget('//evil.com')).toBe('/orders')
  })

  it('handles invalid id, 404 and 403', async () => {
    renderAt('not-a-uuid')
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid order ID.')
    expect(getOrderById).not.toHaveBeenCalled()
  })

  it('shows not found and forbidden', async () => {
    getOrderById.mockRejectedValue({ response: { status: 404, data: {} } })
    const { unmount } = renderAt()
    expect(await screen.findByRole('alert')).toHaveTextContent('Order not found.')
    unmount()
    getOrderById.mockRejectedValue({ response: { status: 403, data: {} } })
    renderAt()
    expect(await screen.findByRole('alert')).toHaveTextContent('Forbidden')
  })
})
