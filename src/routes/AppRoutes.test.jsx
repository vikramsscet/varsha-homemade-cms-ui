import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AppRoutes from './AppRoutes.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { requestAccessToken } from '../services/auth.service.js'
import { clearAccessToken, getAccessToken } from '../services/access-token.js'

vi.mock('../services/auth.service.js', () => ({
  requestAccessToken: vi.fn(),
}))

vi.mock('../pages/Dashboard.jsx', () => ({
  default: () => <h1>Dashboard test page</h1>,
}))

function renderApp(path = '/dashboard') {
  window.history.replaceState({}, '', path)
  return render(<AuthProvider><AppRoutes /></AuthProvider>)
}

describe('complete authentication flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAccessToken()
  })

  it('shows authentication first when opening a CMS route without a session', () => {
    renderApp()

    expect(screen.getByRole('heading', { name: 'Connect to your CMS' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Dashboard test page' })).not.toBeInTheDocument()
  })

  it('opens the dashboard after valid credentials and clears the session on logout', async () => {
    requestAccessToken.mockResolvedValue({
      data: { access_token: 'in-memory-access-token', token_type: 'Bearer', expires_in: 900 },
    })
    renderApp('/')

    fireEvent.change(screen.getByLabelText('Client ID'), { target: { value: 'cms-client' } })
    fireEvent.change(screen.getByLabelText('Client Secret'), { target: { value: 'client-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Authenticate' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard test page' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Authenticated')
    expect(screen.queryByText('in-memory-access-token')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(await screen.findByRole('heading', { name: 'Connect to your CMS' })).toBeInTheDocument()
    expect(getAccessToken()).toBeNull()
  })

  it('keeps the authentication screen on invalid credentials', async () => {
    requestAccessToken.mockRejectedValue(new Error('invalid credentials'))
    renderApp()

    fireEvent.change(screen.getByLabelText('Client ID'), { target: { value: 'cms-client' } })
    fireEvent.change(screen.getByLabelText('Client Secret'), { target: { value: 'wrong-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Authenticate' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Unable to authenticate. Check your credentials and try again.',
    )
    expect(screen.queryByRole('heading', { name: 'Dashboard test page' })).not.toBeInTheDocument()
  })
})