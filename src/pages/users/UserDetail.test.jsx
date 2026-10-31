import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import UserDetail from './UserDetail.jsx'
import { deleteUser, getUser, updateUser } from '../../services/user.service.js'

vi.mock('../../services/user.service.js', () => ({ getUser: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn() }))

const base = { id: 'u1', email: 'asha@example.com', firstName: 'Asha', lastName: null, displayName: null, profileImageUrl: null, emailVerified: true, status: 'ACTIVE', lastLoginAt: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }
const renderPage = () => render(
  <MemoryRouter initialEntries={['/users/u1']}>
    <Routes><Route path="/users/:id" element={<UserDetail />} /></Routes>
  </MemoryRouter>,
)

describe('UserDetail', () => {
  beforeEach(() => vi.clearAllMocks())

  it('patches only changed fields', async () => {
    getUser.mockResolvedValue({ data: base })
    updateUser.mockResolvedValue({ data: { ...base, lastName: 'Rao' } })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Rao' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(updateUser).toHaveBeenCalledWith('u1', { lastName: 'Rao' }))
    expect(await screen.findByText('User updated successfully.')).toBeInTheDocument()
  })

  it('suspends via PATCH status', async () => {
    getUser.mockResolvedValue({ data: base })
    updateUser.mockResolvedValue({ data: { ...base, status: 'SUSPENDED' } })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Suspend' }))
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith('u1', { status: 'SUSPENDED' }))
    expect(deleteUser).not.toHaveBeenCalled()
  })

  it('confirms deletion with soft-delete wording', async () => {
    getUser.mockResolvedValue({ data: base })
    deleteUser.mockResolvedValue({})
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent(/soft-deleted.*cart is abandoned/)
    expect(deleteUser).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Delete user' }))
    await waitFor(() => expect(deleteUser).toHaveBeenCalledWith('u1'))
    expect(await screen.findByText(/soft-deleted and the active cart was abandoned/)).toBeInTheDocument()
  })

  it('disables edit and delete for deleted users', async () => {
    getUser.mockResolvedValue({ data: { ...base, status: 'DELETED' } })
    renderPage()
    expect(await screen.findByRole('button', { name: 'Edit' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })

  it('shows an error with retry when loading fails', async () => {
    getUser.mockRejectedValue({ response: { status: 404, data: { message: 'User not found', code: 'USER_NOT_FOUND' } } })
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('User not found')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
})
