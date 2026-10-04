import { createContext, useContext, useEffect, useState } from 'react'
import { requestAccessToken } from '../services/auth.service.js'
import {
  clearAccessToken,
  setAccessToken,
  subscribeToAuthEvents,
} from '../services/access-token.js'

const unauthenticatedState = {
  accessToken: null,
  tokenType: null,
  expiresAt: null,
  isAuthenticated: false,
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(unauthenticatedState)
  const [authExpired, setAuthExpired] = useState(false)
  const [apiMessage, setApiMessage] = useState('')

  useEffect(() => subscribeToAuthEvents((event) => {
    if (event.type === 'expired') {
      clearAccessToken()
      setAuthState(unauthenticatedState)
      setAuthExpired(true)
      setApiMessage('')
    } else if (event.type === 'forbidden') {
      setApiMessage('You do not have permission to perform this action.')
    }
  }), [])

  const authenticate = async (clientId, clientSecret) => {
    const response = await requestAccessToken(clientId, clientSecret)
    const tokenData = response?.data
    const expiresIn = Number(tokenData?.expires_in)

    if (
      typeof tokenData?.access_token !== 'string' ||
      !tokenData.access_token ||
      typeof tokenData.token_type !== 'string' ||
      !tokenData.token_type ||
      tokenData.expires_in === undefined ||
      tokenData.expires_in === null ||
      !Number.isFinite(expiresIn) ||
      expiresIn < 0
    ) {
      throw new Error('Invalid authentication response.')
    }

    setAccessToken(tokenData.access_token)
    setAuthExpired(false)
    setApiMessage('')
    setAuthState({
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresAt: Date.now() + expiresIn * 1000,
      isAuthenticated: true,
    })
  }

  const logout = () => {
    clearAccessToken()
    setAuthExpired(false)
    setApiMessage('')
    setAuthState(unauthenticatedState)
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      authExpired,
      apiMessage,
      authenticate,
      logout,
      clearApiMessage: () => setApiMessage(''),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider.')
  return context
}