import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Authenticate from './Authenticate.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { requestAccessToken } from '../services/auth.service.js'

vi.mock('../services/auth.service.js', () => ({
  requestAccessToken: vi.fn(),
}))

describe('Authenticate', () => {
  it('shows required-field validation and keeps the secret hidden by default', async () => {
    render(<MemoryRouter><AuthProvider><Authenticate /></AuthProvider></MemoryRouter>)

    expect(screen.getByLabelText('Client Secret')).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: 'Authenticate' }))

    expect(await screen.findByText('Client ID is required.')).toBeInTheDocument()
    expect(screen.getByText('Client Secret is required.')).toBeInTheDocument()
  })

  it('toggles secret visibility and submits credentials through authentication state', async () => {
    requestAccessToken.mockResolvedValue({
      data: { access_token: 'access-token', token_type: 'Bearer', expires_in: 900 },
    })
    render(<MemoryRouter><AuthProvider><Authenticate /></AuthProvider></MemoryRouter>)

    const secretInput = screen.getByLabelText('Client Secret')
    fireEvent.change(screen.getByLabelText('Client ID'), { target: { value: 'client-123' } })
    fireEvent.change(secretInput, { target: { value: 'private-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Show Client Secret' }))

    expect(secretInput).toHaveAttribute('type', 'text')
    fireEvent.click(screen.getByRole('button', { name: 'Authenticate' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Authentication successful.')
    expect(requestAccessToken).toHaveBeenCalledWith('client-123', 'private-secret')
  })
})