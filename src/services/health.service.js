import api from './api.js'

export function getHealth() {
  return api.get('/health')
}