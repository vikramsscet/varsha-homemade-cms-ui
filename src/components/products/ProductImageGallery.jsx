import { useCallback, useEffect, useMemo, useState } from 'react'
import { Image as ImageIcon, Trash2, X } from 'lucide-react'
import ProductImageUpload from './ProductImageUpload.jsx'
import { deleteProductImage, getProductImages } from '../../services/product-image.service.js'

const FALLBACK_ALT_TEXT = 'Product image'

function extractImageList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.images)) return payload.images
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.images)) return payload.data.images
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.data?.data?.images)) return payload.data.data.images
  return []
}

function sortImages(images = []) {
  return [...images].sort((left, right) => {
    const leftOrder = Number.isFinite(Number(left?.displayOrder)) ? Number(left.displayOrder) : Number.MAX_SAFE_INTEGER
    const rightOrder = Number.isFinite(Number(right?.displayOrder)) ? Number(right.displayOrder) : Number.MAX_SAFE_INTEGER

    if (leftOrder !== rightOrder) return leftOrder - rightOrder

    return String(left?.id ?? '').localeCompare(String(right?.id ?? ''))
  })
}

function ProductImageGallery({ productId }) {
  const [images, setImages] = useState([])
  const [status, setStatus] = useState('loading')
  const [previewImage, setPreviewImage] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [brokenImages, setBrokenImages] = useState(new Set())

  const loadImages = useCallback(async () => {
    if (!productId) {
      setImages([])
      setStatus('empty')
      return
    }

    setStatus('loading')
    setBrokenImages(new Set())

    try {
      const response = await getProductImages(productId)
      const imageList = extractImageList(response?.data)

      if (!Array.isArray(imageList)) {
        throw new Error('Unexpected image response')
      }

      setImages(sortImages(imageList))
      setStatus(imageList.length === 0 ? 'empty' : 'ready')
    } catch (error) {
      console.error('Product images request failed:', error)

      if (error?.response?.status === 404) {
        setImages([])
        setStatus('empty')
        return
      }

      setImages([])
      setStatus('error')
    }
  }, [productId])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  const retryLoad = () => {
    loadImages()
  }

  const normalizedImages = useMemo(() => {
    return images.map((image) => ({
      ...image,
      url: image?.url ?? image?.asset?.url ?? '',
      altText: image?.altText || FALLBACK_ALT_TEXT,
      displayOrder: Number.isFinite(Number(image?.displayOrder)) ? Number(image.displayOrder) : Number.MAX_SAFE_INTEGER,
    }))
  }, [images])

  const handleImageError = (imageId) => {
    setBrokenImages((current) => new Set([...current, imageId]))
  }

  const handleDeleteImage = async () => {
    if (!productId || !deleteTarget?.id) return

    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteProductImage(productId, deleteTarget.id)
      setDeleteTarget(null)
      setSuccessMessage('Image deleted successfully.')
      await loadImages()
    } catch (error) {
      console.error('Product image delete failed:', error)
      setDeleteError('Unable to delete image. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-text">Product Images</h2>
        {status === 'ready' && normalizedImages.length > 0 && (
          <span className="text-xs font-medium text-muted">{normalizedImages.length} image{normalizedImages.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
          {successMessage}
        </div>
      )}

      <ProductImageUpload
        productId={productId}
        currentImages={normalizedImages}
        onUploadSuccess={loadImages}
      />

      {status === 'loading' ? (
        <p className="text-sm text-muted" role="status">Loading images...</p>
      ) : status === 'error' ? (
        <div className="space-y-4 rounded-md border border-border bg-background p-4">
          <p className="text-sm text-error" role="alert">Unable to load product images.</p>
          <button
            type="button"
            onClick={retryLoad}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Retry
          </button>
        </div>
      ) : status === 'empty' ? (
        <div className="rounded-md border border-dashed border-border bg-background p-6 text-center">
          <p className="text-sm text-muted">No images available for this product.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {normalizedImages.map((image) => {
            const imageSource = image.url || ''
            const imageKey = image.id ?? imageSource ?? `${image.displayOrder}-${image.altText}`
            const isBroken = brokenImages.has(image.id ?? imageSource)
            const imageLabel = image.altText || FALLBACK_ALT_TEXT

            return (
              <div key={imageKey} className="overflow-hidden rounded-lg border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setPreviewImage(image)}
                  aria-label={`Open image: ${imageLabel}`}
                  className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-background">
                    {!isBroken && imageSource ? (
                      <img
                        src={imageSource}
                        alt={imageLabel}
                        loading="lazy"
                        onError={() => handleImageError(image.id ?? imageSource)}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-background text-muted">
                        <ImageIcon size={28} strokeWidth={1.6} aria-hidden="true" />
                      </div>
                    )}
                    {image.isPrimary && (
                      <span className="absolute left-2 top-2 inline-flex rounded-full bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Primary
                      </span>
                    )}
                  </div>
                </button>

                <div className="space-y-3 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {image.isPrimary && (
                      <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">Alt Text: {imageLabel}</p>
                  <p className="text-xs text-muted">Order: {image.displayOrder}</p>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(image)}
                      className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError('')
                        setDeleteTarget(image)
                      }}
                      aria-label={`Delete image ${imageLabel}`}
                      className="inline-flex items-center gap-1 rounded-md border border-error/30 bg-error/5 px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                    >
                      <Trash2 size={13} strokeWidth={1.8} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-text/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Delete image"
            className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
              <h3 className="text-lg font-semibold text-text">Delete Image</h3>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null)
                  setDeleteError('')
                }}
                aria-label="Close delete dialog"
                className="grid size-8 place-items-center rounded-md border border-border bg-surface text-text hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {deleteTarget.url && (
                <div className="overflow-hidden rounded-md border border-border bg-background">
                  <img
                    src={deleteTarget.url}
                    alt={deleteTarget.altText || FALLBACK_ALT_TEXT}
                    className="h-36 w-full object-cover"
                  />
                </div>
              )}

              <p className="text-sm text-text">
                {deleteTarget.isPrimary
                  ? 'This is currently the primary image. Are you sure you want to delete it?'
                  : 'Are you sure you want to delete this image?'}
              </p>

              <p className="text-sm text-muted">This action cannot be undone.</p>

              {deleteError && (
                <p className="text-sm text-error" role="alert">{deleteError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(null)
                    setDeleteError('')
                  }}
                  disabled={isDeleting}
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  disabled={isDeleting}
                  className="rounded-md bg-error px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-text/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Product image preview"
            className="w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
              <h3 className="text-lg font-semibold text-text">Image Preview</h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                aria-label="Close preview"
                className="grid size-9 place-items-center rounded-md border border-border bg-surface text-text hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center justify-center bg-background p-4 sm:p-6">
              {previewImage.url && !brokenImages.has(previewImage.id ?? previewImage.url) ? (
                <img
                  src={previewImage.url}
                  alt={previewImage.altText || FALLBACK_ALT_TEXT}
                  className="max-h-[70vh] w-full rounded-md object-contain"
                  onError={() => handleImageError(previewImage.id ?? previewImage.url)}
                />
              ) : (
                <div className="flex h-72 w-full items-center justify-center rounded-md border border-dashed border-border bg-background text-muted">
                  <ImageIcon size={42} strokeWidth={1.6} aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="border-t border-border px-4 py-3 sm:px-5">
              <p className="text-sm font-medium text-text">{previewImage.altText || FALLBACK_ALT_TEXT}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProductImageGallery
