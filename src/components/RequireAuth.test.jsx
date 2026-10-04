import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import RequireAuth from './RequireAuth.jsx'

const authState = vi.hoisted(() => ({ isAuthenticated: false }))

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => authState,
}))

describe('RequireAuth', () => {
  it('redirects unauthenticated users to the authentication screen', () => {
    authState.isAuthenticated = false

    render(
      <MemoryRouter initialEntries={['/products/new']}>
        <Routes>
          <Route path="/products/new" element={<RequireAuth><p>Create product form</p></RequireAuth>} />
          <Route path="/authenticate" element={<p>Authentication screen</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Authentication screen')).toBeInTheDocument()
    expect(screen.queryByText('Create product form')).not.toBeInTheDocument()
  })

  it('allows authenticated users to enter protected routes', () => {
    authState.isAuthenticated = true

    render(
      <MemoryRouter initialEntries={['/products/new']}>
        <Routes>
          <Route path="/products/new" element={<RequireAuth><p>Create product form</p></RequireAuth>} />
          <Route path="/authenticate" element={<p>Authentication screen</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Create product form')).toBeInTheDocument()
  })
})