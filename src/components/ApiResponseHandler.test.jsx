import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ApiResponseHandler from './ApiResponseHandler.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { publishAuthEvent } from '../services/access-token.js'
import Authenticate from '../pages/Authenticate.jsx'

function ProductScreen() {
  return (
    <>
      <p>Products screen</p>
      <button onClick={() => publishAuthEvent({ type: 'expired' })}>Trigger expiry</button>
      <button onClick={() => publishAuthEvent({ type: 'forbidden' })}>Trigger forbidden</button>
    </>
  )
}

function renderResponseRoutes() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/products']}>
        <ApiResponseHandler />
        <Routes>
          <Route path="/products" element={<ProductScreen />} />
          <Route path="/authenticate" element={<Authenticate />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ApiResponseHandler', () => {
  it('redirects to authentication and displays the expired-session message on 401', async () => {
    renderResponseRoutes()

    fireEvent.click(screen.getByRole('button', { name: 'Trigger expiry' }))

    expect(await screen.findByText('Your authentication has expired. Please authenticate again.'))
      .toBeInTheDocument()
  })

  it('displays the 403 message without redirecting', async () => {
    renderResponseRoutes()

    fireEvent.click(screen.getByRole('button', { name: 'Trigger forbidden' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You do not have permission to perform this action.',
    )
    expect(screen.getByText('Products screen')).toBeInTheDocument()
  })
})