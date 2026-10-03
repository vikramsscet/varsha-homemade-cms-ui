import api from './api.js'

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

export function cloneProduct(id) {
	return api.post(`/products/${id}/clone`)
}