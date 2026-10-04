let accessToken = null
const authEventListeners = new Set()

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function clearAccessToken() {
  accessToken = null
}

export function subscribeToAuthEvents(listener) {
  authEventListeners.add(listener)
  return () => authEventListeners.delete(listener)
}

export function publishAuthEvent(event) {
  authEventListeners.forEach((listener) => listener(event))
}