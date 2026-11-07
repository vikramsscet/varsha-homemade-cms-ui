import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import UserOrders from './UserOrders.jsx'
import { getUserOrders } from '../../services/order.service.js'
import { getUser } from '../../services/user.service.js'

vi.mock('../../services/order.service.js', () => ({ getUserOrders: vi.fn(), DEFAULT_ORDER_LIMIT: 10, MAX_ORDER_LIMIT: 50, parseOrderList: (r) => ({ items: r.data.data.items, pagination: r.data.data.pagination }) }))
vi.mock('../../services/user.service.js', () => ({ getUser: vi.fn() }))

const order = (id) => ({ id, orderNumber: `ORD-${id}`, createdAt: '2026-01-01T00:00:00Z', status: 'PENDING', paymentStatus: 'PAID', paymentMethodSummary: null, totalAmount: '100', currency: 'INR' })
const res = (data, pagination = { hasMore: false, nextCursor: null }) => ({ data: { data: { items: data, pagination } } })
const renderPage = () => render(
  <MemoryRouter initialEntries={['/users/u-1/orders']}>
    <Routes><Route path="/users/:id/orders" element={<UserOrders />} /></Routes>
  </MemoryRouter>,
)

describe('UserOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUser.mockResolvedValue({ data: { data: { id: 'u-1', firstName: 'Asha', lastName: 'Rao', email: 'asha@x.com' } } })
  })

  it('uses the route user id, shows header and details link', async () => {
    getUserOrders.mockResolvedValue(res([order('o1')]))
    renderPage()
    expect(await screen.findByText('ORD-o1')).toBeInTheDocument()
    expect(getUserOrders).toHaveBeenCalledWith('u-1', { limit: 10, status: '', paymentStatus: '' })
    expect(await screen.findByText('asha@x.com')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute('href', '/orders/o1')
    expect(screen.getByRole('link', { name: /back to users/i })).toHaveAttribute('href', '/users')
  })

  it('paginates with the cursor and resets it on filter change', async () => {
    getUserOrders.mockResolvedValue(res([order('o1')], { hasMore: true, nextCursor: 'cur' }))
    renderPage()
    fireEvent.click(await screen.findByText('Load More'))
    await waitFor(() => expect(getUserOrders).toHaveBeenCalledTimes(2))
    expect(getUserOrders.mock.calls[1][1]).toMatchObject({ cursor: 'cur' })
    fireEvent.change(screen.getByLabelText('Payment status'), { target: { value: 'CAPTURED' } })
    await waitFor(() => expect(getUserOrders).toHaveBeenCalledTimes(3))
    expect(getUserOrders.mock.calls[2][1].cursor).toBeUndefined()
    expect(getUserOrders.mock.calls[2][1].paymentStatus).toBe('CAPTURED')
  })

  it('shows empty, not-found and forbidden states', async () => {
    getUserOrders.mockResolvedValueOnce(res([]))
    renderPage()
    expect(await screen.findByText('This user has no orders.')).toBeInTheDocument()
    getUserOrders.mockRejectedValueOnce({ response: { status: 404, data: {} } })
    fireEvent.click(screen.getByText('Refresh'))
    expect(await screen.findByText('User not found.')).toBeInTheDocument()
    getUserOrders.mockRejectedValueOnce({ response: { status: 403, data: {} } })
    fireEvent.click(screen.getByText('Refresh'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Forbidden')
  })
})
