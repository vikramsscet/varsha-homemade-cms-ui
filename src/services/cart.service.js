import api from './api.js'

export function getCart(userId) {
	return api.get('/cart', { params: { userId } })
}

export function updateCartItems(userId, items) {
	return api.patch('/cart', { items }, { params: { userId } })
}

export function clearCart(userId) {
	return api.delete('/cart', { params: { userId } })
}
