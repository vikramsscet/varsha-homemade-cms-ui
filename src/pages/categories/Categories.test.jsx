import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import Categories from './Categories.jsx'
import { deleteCategory, getCategories } from '../../services/category.service.js'

const authState = vi.hoisted(() => ({ isAuthenticated: true }))

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => authState,
}))

vi.mock('../../services/category.service.js', () => ({
  getCategories: vi.fn(),
  deleteCategory: vi.fn(),
}))

function CurrentPath() {
  const location = useLocation()
  return <output data-testid="current-path">{location.pathname}</output>
}

describe('Categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.isAuthenticated = true
    getCategories.mockResolvedValue({
      data: [{ id: 'category-1', name: 'Snacks', slug: 'snacks', isActive: true }],
    })
  })

  it('redirects unauthenticated delete actions without opening the dialog or calling the API', async () => {
    authState.isAuthenticated = false

    render(
      <MemoryRouter initialEntries={['/categories']}>
        <Categories />
        <CurrentPath />
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    expect(screen.getByTestId('current-path')).toHaveTextContent('/authenticate')
    expect(screen.queryByRole('alertdialog', { name: /delete category/i })).not.toBeInTheDocument()
    expect(deleteCategory).not.toHaveBeenCalled()
  })

  it('continues to delete categories when authenticated', async () => {
    deleteCategory.mockResolvedValue({})

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete Category' }))

    expect(deleteCategory).toHaveBeenCalledWith('category-1')
  })
})