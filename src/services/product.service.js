import api from './api.js'

export function getProducts() {
	return api.get('/products')
}