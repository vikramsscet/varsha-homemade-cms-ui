import api from './api.js'

export function getUsers(params) {
	return api.get('/users', { params })
}

export function getUser(id) {
	return api.get(`/users/${encodeURIComponent(id)}`)
}

export function updateUser(id, data) {
	return api.patch(`/users/${encodeURIComponent(id)}`, data)
}

export function deleteUser(id) {
	return api.delete(`/users/${encodeURIComponent(id)}`)
}
