import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Products from './Products.jsx'
import { cloneProduct, deleteProduct, getProducts } from '../../services/product.service.js'

vi.mock('../../services/product.service.js', () => ({
  getProducts: vi.fn(),
  cloneProduct: vi.fn(),
  deleteProduct: vi.fn(),
}))

describe('Products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getProducts.mockResolvedValue({
      data: {
        data: [
          {
            id: 'product-1',
            title: 'Homemade Chakli',
            subtitle: 'Crispy & Fresh',
            status: 'PUBLISHED',
            isFeatured: false,
            isAvailable: true,
            price: 250,
            currency: 'INR',
            packageSize: '500 g',
            category: { id: 'category-1', name: 'Snacks' },
            images: [{ id: 'image-1', url: 'https://example.com/chakli.jpg', altText: 'Homemade Chakli', displayOrder: 1, isPrimary: true }],
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    })
  })

  it('opens a confirmation before cloning a product and calls the clone API on confirm', async () => {
    cloneProduct.mockResolvedValue({ data: { id: 'product-2' } })

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>,
    )

    const cloneButton = await screen.findByRole('button', { name: /clone product homemade chakli/i })
    fireEvent.click(cloneButton)

    expect(screen.getByRole('dialog', { name: /clone product/i })).toBeInTheDocument()
    expect(cloneProduct).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /clone product/i }))

    expect(cloneProduct).toHaveBeenCalledWith('product-1')
  })

  it('opens a confirmation before deleting a product and calls the delete API on confirm', async () => {
    deleteProduct.mockResolvedValue({})

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>,
    )

    const deleteButton = await screen.findByRole('button', { name: /delete product homemade chakli/i })
    fireEvent.click(deleteButton)

    expect(screen.getByRole('dialog', { name: /delete product/i })).toBeInTheDocument()
    expect(deleteProduct).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /delete product/i }))

    expect(deleteProduct).toHaveBeenCalledWith('product-1')
  })
})
