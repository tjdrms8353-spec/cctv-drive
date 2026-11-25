import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('parkpick_user'))
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('parkpick_token'))

  const persist = (t, u) => {
    localStorage.setItem('parkpick_token', t)
    localStorage.setItem('parkpick_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const login = useCallback(async (email, password) => {
    const data = await api('/api/auth/login', { method: 'POST', body: { email, password } })
    persist(data.token, data.user)
    return data.user
  }, [])

  const loginTest = useCallback(async (role) => {
    const data = await api('/api/auth/test-login', { method: 'POST', body: { role } })
    persist(data.token, data.user)
    return data.user
  }, [])

  const loginAdmin = useCallback(async (secret) => {
    const data = await api('/api/auth/admin-login', { method: 'POST', body: { secret } })
    persist(data.token, data.user)
    return data.user
  }, [])

  const loginOAuth = useCallback(async (provider) => {
    const data = await api(`/api/auth/oauth/${provider}`, { method: 'POST' })
    persist(data.token, data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('parkpick_token')
    localStorage.removeItem('parkpick_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, loginTest, loginAdmin, loginOAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
