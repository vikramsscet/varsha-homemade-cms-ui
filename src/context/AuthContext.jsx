import { createContext, useContext, useState } from 'react'
import { requestAccessToken } from '../services/auth.service.js'
import { clearAccessToken, setAccessToken } from '../services/access-token.js'

const unauthenticatedState = {
  accessToken: null,
  tokenType: null,
  expiresAt: null,
  isAuthenticated: false,
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(unauthenticatedState)

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
    setAuthState({
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresAt: Date.now() + expiresIn * 1000,
      isAuthenticated: true,
    })
  }

  const logout = () => {
    clearAccessToken()
    setAuthState(unauthenticatedState)
  }

  return (
    <AuthContext.Provider value={{ ...authState, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider.')
  return context
}