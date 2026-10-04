import axios from 'axios'
import { clearAccessToken, getAccessToken, publishAuthEvent } from './access-token.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
})

function isTokenRequest(url = '') {
  return url.split('?')[0].replace(/\/+$/, '').endsWith('/oauth/token')
}

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken && !isTokenRequest(config.url)) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401 && !isTokenRequest(error.config?.url)) {
      const authorization = error.config?.headers?.get?.('Authorization')
        ?? error.config?.headers?.Authorization
      const requestToken = typeof authorization === 'string'
        ? authorization.match(/^Bearer\s+(.+)$/i)?.[1]
        : null

      if (requestToken && requestToken === getAccessToken()) {
        clearAccessToken()
        publishAuthEvent({ type: 'expired' })
      }
    } else if (status === 403) {
      publishAuthEvent({ type: 'forbidden' })
    }

    return Promise.reject(error)
  },
)

export default api