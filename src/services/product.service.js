import api from './api.js'
import { getProductImages, uploadProductImage } from './product-image.service.js'

export function getProducts(params) {
	return api.get('/products', { params })
}

export function getProduct(id) {
	return api.get(`/products/${id}`)
}

export function createProduct(data) {
	return api.post('/products', data)
}

export function updateProduct(id, data) {
	return api.patch(`/products/${id}`, data)
}

function extractImageList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.images)) return payload.images
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.images)) return payload.data.images
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.data?.data?.images)) return payload.data.data.images
  return []
}

function normalizeDescription(description) {
  if (description && typeof description === 'object') {
    return description
  }

  return { type: 'doc', content: [] }
}

function slugify(value) {
  return String(value || 'product')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'product'
}

function generateCloneSlug(baseValue, attempt = 1) {
  const baseSlug = slugify(baseValue)
  const suffix = attempt === 1 ? '-copy' : `-copy-${attempt}`
  return `${baseSlug}${suffix}`
}

async function downloadImageFile(imageUrl, fallbackName = 'product-image') {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error('Failed to download source image.')
  }

  const blob = await response.blob()
  const pathName = (() => {
    try {
      return new URL(imageUrl).pathname
    } catch {
      return ''
    }
  })()

  const fileNameFromPath = pathName.split('/').filter(Boolean).pop() || fallbackName
  const fileName = fileNameFromPath.includes('.')
    ? fileNameFromPath
    : `${fallbackName}.${blob.type?.split('/')?.[1] || 'jpg'}`

  return new File([blob], fileName, {
    type: blob.type || 'image/jpeg',
  })
}

export async function cloneProduct(productId) {
  const sourceResponse = await getProduct(productId)
  const sourceProduct = sourceResponse?.data ?? sourceResponse

  if (!sourceProduct || typeof sourceProduct !== 'object') {
    throw new Error('Unable to fetch product details.')
  }

  const categoryId = sourceProduct.category?.id ?? sourceProduct.categoryId ?? ''
  const sourceDescription = normalizeDescription(sourceProduct.description)
  const titleValue = sourceProduct.title?.trim() || 'Product'
  const baseSlug = sourceProduct.slug || titleValue

  let cloneAttempt = 1
  let createdProduct = null
  let createdProductId = null

  while (cloneAttempt <= 50) {
    const payload = {
      title: titleValue,
      slug: generateCloneSlug(baseSlug, cloneAttempt),
      subtitle: sourceProduct.subtitle ?? '',
      description: sourceDescription,
      price: Number(sourceProduct.price ?? 0),
      currency: sourceProduct.currency ?? 'INR',
      packageSize: sourceProduct.packageSize ?? '',
      categoryId,
      status: 'DRAFT',
      isFeatured: Boolean(sourceProduct.isFeatured),
      isAvailable: Boolean(sourceProduct.isAvailable),
      displayOrder: Number(sourceProduct.displayOrder ?? 1),
    }

    try {
      const createResponse = await createProduct(payload)
      createdProduct = createResponse?.data ?? createResponse
      createdProductId = createdProduct?.id ?? createdProduct?._id
      break
    } catch (error) {
      const statusCode = error?.response?.status
      const backendMessage = error?.response?.data?.message

      if (statusCode === 409) {
        cloneAttempt += 1
        continue
      }

      const message = typeof backendMessage === 'string' && backendMessage.trim()
        ? backendMessage
        : 'Unable to create cloned product.'
      throw new Error(message)
    }
  }

  if (!createdProductId) {
    throw new Error('Unable to create cloned product.')
  }

  let copiedImageCount = 0
  let failedImageCount = 0

  try {
    const imageResponse = await getProductImages(productId)
    const images = extractImageList(imageResponse?.data)

    for (const image of images) {
      const imageUrl = image?.url || image?.asset?.url
      if (!imageUrl) continue

      try {
        const file = await downloadImageFile(imageUrl, image?.altText || 'product-image')
        const formData = new FormData()
        formData.append('file', file)
        formData.append('altText', image?.altText || '')
        formData.append('isPrimary', String(Boolean(image?.isPrimary)))
        formData.append('displayOrder', String(Number.isFinite(Number(image?.displayOrder)) ? Number(image.displayOrder) : 1))

        await uploadProductImage(createdProductId, formData)
        copiedImageCount += 1
      } catch {
        failedImageCount += 1
      }
    }
  } catch {
    return {
      product: createdProduct,
      copiedImageCount,
      failedImageCount: failedImageCount + 1,
      partialFailure: true,
      warning: 'Product cloned successfully, but some images could not be copied.',
    }
  }

  return {
    product: createdProduct,
    copiedImageCount,
    failedImageCount,
    partialFailure: failedImageCount > 0,
    warning: failedImageCount > 0 ? 'Product cloned successfully, but some images could not be copied.' : undefined,
  }
}