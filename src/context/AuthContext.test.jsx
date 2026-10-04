import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import { requestAccessToken } from '../services/auth.service.js'

vi.mock('../services/auth.service.js', () => ({
  requestAccessToken: vi.fn(),
}))

function AuthStateProbe() {
  const { accessToken, tokenType, expiresAt, isAuthenticated, authenticate, logout } = useAuth()

  return (
    <>
      <output data-testid="auth-state">
        {JSON.stringify({ accessToken, tokenType, expiresAt, isAuthenticated })}
      </output>
      <button onClick={() => authenticate('client-id', 'client-secret').catch(() => {})}>Authenticate test</button>
      <button onClick={logout}>Logout test</button>
    </>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores token state and calculates expiry using the response duration', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    requestAccessToken.mockResolvedValue({
      data: { access_token: 'access-token', token_type: 'Bearer', expires_in: 1200 },
    })

    render(<AuthProvider><AuthStateProbe /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Authenticate test' }))

    expect(await screen.findByTestId('auth-state')).toHaveTextContent(JSON.stringify({
      accessToken: 'access-token',
      tokenType: 'Bearer',
      expiresAt: 1_700_001_200_000,
      isAuthenticated: true,
    }))
    expect(requestAccessToken).toHaveBeenCalledWith('client-id', 'client-secret')
  })

  it('clears the in-memory authentication state on logout', async () => {
    requestAccessToken.mockResolvedValue({
      data: { access_token: 'access-token', token_type: 'Bearer', expires_in: 1200 },
    })

    render(<AuthProvider><AuthStateProbe /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Authenticate test' }))
    await screen.findByText(/access-token/)
    fireEvent.click(screen.getByRole('button', { name: 'Logout test' }))

    expect(screen.getByTestId('auth-state')).toHaveTextContent(JSON.stringify({
      accessToken: null,
      tokenType: null,
      expiresAt: null,
      isAuthenticated: false,
    }))
  })

  it('does not mark the user authenticated when the token request fails', async () => {
    requestAccessToken.mockRejectedValue(new Error('request failed'))

    render(<AuthProvider><AuthStateProbe /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Authenticate test' }))

    expect(await screen.findByTestId('auth-state')).toHaveTextContent(JSON.stringify({
      accessToken: null,
      tokenType: null,
      expiresAt: null,
      isAuthenticated: false,
    }))
  })
})