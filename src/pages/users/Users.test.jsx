import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Users from './Users.jsx'
import { getUsers } from '../../services/user.service.js'

vi.mock('../../services/user.service.js', () => ({ getUsers: vi.fn() }))

const user = { id: 'u1', email: 'asha@example.com', firstName: 'Asha', lastName: null, displayName: null, status: 'ACTIVE', emailVerified: true, lastLoginAt: null }
const page = (data) => ({ data: { data, pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 } } })
const renderPage = () => render(<MemoryRouter><Users /></MemoryRouter>)

describe('Users', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists users and refetches with the status filter', async () => {
    getUsers.mockResolvedValue(page([user]))
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Loading users')
    expect(await screen.findByText('asha@example.com')).toBeInTheDocument()
    expect(getUsers).toHaveBeenLastCalledWith({ page: 1, limit: 20 })

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'SUSPENDED' } })
    await screen.findByText('asha@example.com')
    expect(getUsers).toHaveBeenLastCalledWith({ page: 1, limit: 20, status: 'SUSPENDED' })
  })

  it('shows the empty state', async () => {
    getUsers.mockResolvedValue(page([]))
    renderPage()
    expect(await screen.findByText('No users found.')).toBeInTheDocument()
  })

  it('shows the server message on error', async () => {
    getUsers.mockRejectedValue({ response: { status: 400, data: { message: 'Bad status', code: 'INVALID_USER_FILTER' } } })
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Bad status')
  })
})
