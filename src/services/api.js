import axios from 'axios'
import { getAccessToken } from './access-token.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
})

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  const requestPath = config.url?.split('?')[0].replace(/\/+$/, '')
  const isTokenRequest = requestPath?.endsWith('/oauth/token')

  if (accessToken && !isTokenRequest) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

export default api