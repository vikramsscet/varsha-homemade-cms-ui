import api from './api.js'

export function requestAccessToken(clientId, clientSecret) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  })

  return api.post('/oauth/token', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}