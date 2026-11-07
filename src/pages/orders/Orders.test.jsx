import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Orders from './Orders.jsx'
import { getOrders } from '../../services/order.service.js'

vi.mock('../../services/order.service.js', () => ({ getOrders: vi.fn(), DEFAULT_ORDER_LIMIT: 10, parseOrderList: (r) => ({ items: r.data.data.items, pagination: r.data.data.pagination }) }))

const order = (id, extra = {}) => ({ id, orderNumber: `ORD-${id}`, customer: { firstName: 'Asha', lastName: 'Rao', email: `${id}@x.com` }, createdAt: '2026-01-01T00:00:00Z', status: 'PENDING', paymentStatus: 'PAID', paymentMethodSummary: null, totalAmount: '100', currency: 'INR', ...extra })
const res = (data, pagination = { hasMore: false, nextCursor: null }) => ({ data: { data: { items: data, pagination } } })
const renderPage = () => render(<MemoryRouter><Orders /></MemoryRouter>)

describe('Orders', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists orders with a details link by UUID and handles null payment method', async () => {
    getOrders.mockResolvedValue(res([order('a1')]))
    renderPage()
    expect(await screen.findByText('ORD-a1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute('href', '/orders/a1')
    expect(screen.getByText('Asha Rao')).toBeInTheDocument()
  })

  it('loads more with the untouched cursor and dedupes', async () => {
    getOrders.mockResolvedValueOnce(res([order('a1')], { hasMore: true, nextCursor: 'abc==' }))
    getOrders.mockResolvedValueOnce(res([order('a1'), order('a2')]))
    renderPage()
    fireEvent.click(await screen.findByText('Load More'))
    expect(await screen.findByText('ORD-a2')).toBeInTheDocument()
    expect(getOrders).toHaveBeenLastCalledWith({ limit: 10, status: '', paymentStatus: '', search: '', fromDate: '', toDate: '', cursor: 'abc==' })
    expect(screen.getAllByText('ORD-a1')).toHaveLength(1)
  })

  it('resets the cursor when a filter changes', async () => {
    getOrders.mockResolvedValue(res([order('a1')], { hasMore: true, nextCursor: 'c1' }))
    renderPage()
    await screen.findByText('ORD-a1')
    fireEvent.change(screen.getByLabelText('Order status'), { target: { value: 'SHIPPED' } })
    await waitFor(() => expect(getOrders).toHaveBeenCalledTimes(2))
    expect(getOrders.mock.calls[1][0]).toMatchObject({ status: 'SHIPPED' })
    expect(getOrders.mock.calls[1][0].cursor).toBeUndefined()
  })

  it('shows empty and no-match states', async () => {
    getOrders.mockResolvedValue(res([]))
    renderPage()
    expect(await screen.findByText('No orders have been placed yet.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Order status'), { target: { value: 'SHIPPED' } })
    expect(await screen.findByText('No orders match your filters.')).toBeInTheDocument()
  })

  it('shows forbidden errors', async () => {
    getOrders.mockRejectedValue({ response: { status: 403, data: {} } })
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Forbidden')
  })
})
