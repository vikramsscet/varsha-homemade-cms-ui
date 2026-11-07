import api from './api.js'

export const DEFAULT_ORDER_LIMIT = 10
export const MAX_ORDER_LIMIT = 50

const FILTER_KEYS = ['status', 'paymentStatus', 'search', 'fromDate', 'toDate', 'cursor']

// Builds query params, dropping empty values and clamping limit to 1..50.
export function getOrders({ limit = DEFAULT_ORDER_LIMIT, ...rest } = {}) {
	const safeLimit = Math.min(MAX_ORDER_LIMIT, Math.max(1, Number(limit) || DEFAULT_ORDER_LIMIT))
	const params = { limit: safeLimit }
	for (const key of FILTER_KEYS) {
		const value = typeof rest[key] === 'string' ? rest[key].trim() : rest[key]
		if (value) params[key] = value
	}
	return api.get('/orders', { params })
}

const USER_FILTER_KEYS = ['status', 'paymentStatus', 'cursor']

// User-specific orders. userId always comes from the caller (route param) and is URL-encoded.
export function getUserOrders(userId, { limit = DEFAULT_ORDER_LIMIT, ...rest } = {}) {
	const safeLimit = Math.min(MAX_ORDER_LIMIT, Math.max(1, Number(limit) || DEFAULT_ORDER_LIMIT))
	const params = { limit: safeLimit }
	for (const key of USER_FILTER_KEYS) {
		if (rest[key]) params[key] = rest[key]
	}
	return api.get(`/users/${encodeURIComponent(userId)}/orders`, { params })
}

export function getOrderById(orderId) {
	return api.get(`/orders/${encodeURIComponent(orderId)}`)
}

// List responses are { success, data: { items, pagination: { nextCursor, hasMore } } }.
export function parseOrderList(response) {
	const body = response?.data?.data
	if (!body || !Array.isArray(body.items)) throw new Error('Unexpected orders response')
	return { items: body.items, pagination: body.pagination ?? {} }
}
