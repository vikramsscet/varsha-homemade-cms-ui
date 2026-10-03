import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductImageGallery from './ProductImageGallery.jsx'
import { deleteProductImage, getProductImages } from '../../services/product-image.service.js'

vi.mock('../../services/product-image.service.js', () => ({
  getProductImages: vi.fn(),
  deleteProductImage: vi.fn(),
}))

describe('ProductImageGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and sorts product images, shows the primary badge, and opens a preview modal', async () => {
    getProductImages.mockResolvedValue({
      data: {
        images: [
          { id: '2', url: 'https://example.com/second.jpg', altText: 'Second image', displayOrder: 2, isPrimary: false },
          { id: '1', url: 'https://example.com/first.jpg', altText: 'First image', displayOrder: 1, isPrimary: true },
        ],
      },
    })

    render(<ProductImageGallery productId="product-1" />)

    expect(screen.getByText(/loading images/i)).toBeInTheDocument()

    const firstImage = await screen.findByAltText('First image')
    expect(firstImage).toBeInTheDocument()
    expect(screen.getAllByText(/Primary/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Order: 1/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /open image: first image/i }))

    expect(screen.getByRole('dialog', { name: /product image preview/i })).toBeInTheDocument()
    expect(screen.getByText('First image')).toBeInTheDocument()
  })

  it('asks for confirmation before deleting an image', async () => {
    getProductImages.mockResolvedValue({
      data: {
        images: [
          { id: 'image-1', url: 'https://example.com/delete-me.jpg', altText: 'Delete me', displayOrder: 1, isPrimary: false },
        ],
      },
    })

    render(<ProductImageGallery productId="product-1" />)

    const deleteButton = await screen.findByRole('button', { name: /delete image/i })
    fireEvent.click(deleteButton)

    expect(screen.getByRole('dialog', { name: /delete image/i })).toBeInTheDocument()
    expect(deleteProductImage).not.toHaveBeenCalled()
  })
})
