import api from './api.js'

export function getProductImages(productId) {
  return api.get(`/products/${productId}/images`)
}

export function uploadProductImage(productId, formData) {
  return api.post(`/products/${productId}/images`, formData)
}

export function deleteProductImage(productId, imageId) {
  return api.delete(`/products/${productId}/images/${imageId}`)
}
