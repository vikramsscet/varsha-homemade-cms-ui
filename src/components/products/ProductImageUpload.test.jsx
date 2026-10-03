import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductImageUpload from './ProductImageUpload.jsx'
import { uploadProductImage } from '../../services/product-image.service.js'

vi.mock('../../services/product-image.service.js', () => ({
  uploadProductImage: vi.fn(),
}))

describe('ProductImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads a selected image as multipart form data', async () => {
    uploadProductImage.mockResolvedValue({ data: { success: true } })

    render(<ProductImageUpload productId="product-1" currentImages={[]} onUploadSuccess={vi.fn()} />)

    const input = screen.getByLabelText(/choose image/i)
    const file = new File(['image-bytes'], 'brandlogo.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })

    fireEvent.change(screen.getByLabelText(/Alt Text/i), {
      target: { value: 'Homemade Chakli' },
    })

    fireEvent.click(screen.getByRole('button', { name: /upload image/i }))

    expect(uploadProductImage).toHaveBeenCalledTimes(1)

    const [productId, formData] = uploadProductImage.mock.calls[0]
    expect(productId).toBe('product-1')
    expect(formData.get('altText')).toBe('Homemade Chakli')
    expect(formData.get('isPrimary')).toBe('false')
    expect(formData.get('displayOrder')).toBe('1')
    expect(formData.get('file')).toBe(file)
  })
})
