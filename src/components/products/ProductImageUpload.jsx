import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Image as ImageIcon, UploadCloud } from 'lucide-react'
import { uploadProductImage } from '../../services/product-image.service.js'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function ProductImageUpload({ productId, currentImages = [], onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [displayOrder, setDisplayOrder] = useState(1)
  const [isPrimary, setIsPrimary] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const objectUrlRef = useRef('')

  const defaultDisplayOrder = useMemo(() => {
    if (!Array.isArray(currentImages) || currentImages.length === 0) return 1

    const maxOrder = currentImages.reduce((highest, image) => {
      const order = Number(image?.displayOrder)
      return Number.isFinite(order) ? Math.max(highest, order) : highest
    }, 0)

    return maxOrder + 1
  }, [currentImages])

  useEffect(() => {
    setDisplayOrder((currentValue) => (currentValue > 0 ? currentValue : defaultDisplayOrder))
  }, [defaultDisplayOrder])

  useEffect(() => {
    if (!selectedFile) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = ''
      }
      setPreviewUrl('')
      return undefined
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile)
    objectUrlRef.current = nextPreviewUrl
    setPreviewUrl(nextPreviewUrl)

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = ''
      }
    }
  }, [selectedFile])

  const resetForm = () => {
    setSelectedFile(null)
    setAltText('')
    setDisplayOrder(defaultDisplayOrder)
    setIsPrimary(false)
    setError('')
    setSuccess('')
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = ''
    }
    setPreviewUrl('')
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setSuccess('')

    if (!file) {
      setSelectedFile(null)
      setError('')
      return
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setSelectedFile(null)
      setError('Please select a JPEG, PNG, or WebP image.')
      event.target.value = ''
      return
    }

    setSelectedFile(file)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!productId) {
      setError('Unable to upload image without a product ID.')
      return
    }

    if (!selectedFile) {
      setError('Please select an image to upload.')
      return
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError('Please select a JPEG, PNG, or WebP image.')
      return
    }

    const trimmedAltText = altText.trim()
    if (!trimmedAltText) {
      setError('Alt text is required.')
      return
    }

    const numericOrder = Number(displayOrder)
    if (!Number.isInteger(numericOrder) || numericOrder <= 0) {
      setError('Display order must be a positive number.')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('altText', trimmedAltText)
    formData.append('isPrimary', String(Boolean(isPrimary)))
    formData.append('displayOrder', String(numericOrder))

    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      await uploadProductImage(productId, formData)
      setSuccess('Image uploaded successfully.')
      if (typeof onUploadSuccess === 'function') {
        await onUploadSuccess()
      }
      resetForm()
    } catch (uploadError) {
      console.error('Product image upload failed:', uploadError)
      const backendMessage = uploadError?.response?.data?.message || uploadError?.response?.data?.error
      const validationMessage = typeof backendMessage === 'string' && backendMessage.trim()
        ? backendMessage
        : 'Unable to upload image. Please try again.'
      setError(validationMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mb-6 rounded-lg border border-border bg-background p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <UploadCloud size={18} strokeWidth={1.8} className="text-primary" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-text">Upload Product Image</h3>
      </div>

      {error && (
        <p className="mb-4 text-sm text-error" role="alert">{error}</p>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="product-image-upload" className="block text-sm font-medium text-text">Choose Image</label>
          <input
            id="product-image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full cursor-pointer rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-white file:hover:bg-primary-hover"
          />
        </div>

        {previewUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-text">Selected Image</p>
            <div className="overflow-hidden rounded-md border border-border bg-surface">
              <img src={previewUrl} alt="Selected preview" className="h-40 w-full object-cover" />
            </div>
            <p className="text-xs text-muted">{selectedFile?.name || 'Selected image'}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="product-image-alt-text" className="block text-sm font-medium text-text">Alt Text</label>
          <input
            id="product-image-alt-text"
            type="text"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            disabled={isUploading}
            placeholder="Homemade Chakli"
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="product-image-display-order" className="block text-sm font-medium text-text">Display Order</label>
          <input
            id="product-image-display-order"
            type="number"
            min="1"
            step="1"
            value={displayOrder}
            onChange={(event) => setDisplayOrder(event.target.value)}
            disabled={isUploading}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(event) => setIsPrimary(event.target.checked)}
            disabled={isUploading}
            className="size-4 rounded border-border text-primary focus:ring-primary/15"
          />
          Set as Primary Image
        </label>

        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
    </form>
  )
}

export default ProductImageUpload
