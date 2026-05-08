import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContext {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthCtx = createContext<AuthContext>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('sarau_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('sarau_token'))

  const DEMO_EMAIL = 'admin@osarausecreto.com'
  const DEMO_PASS = 'sarau2024'

  const login = useCallback(async (email: string, password: string) => {
    // Tenta API real primeiro
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(3000),
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setToken(data.token)
        sessionStorage.setItem('sarau_user', JSON.stringify(data.user))
        sessionStorage.setItem('sarau_token', data.token)
        return
      }
    } catch {
      // API indisponível — modo demo
    }
    // Fallback demo local
    if (email.trim().toLowerCase() === DEMO_EMAIL && password.trim() === DEMO_PASS) {
      const u = { id: '1', name: 'Admin', email, role: 'admin' }
      setUser(u)
      setToken('demo-token')
      sessionStorage.setItem('sarau_user', JSON.stringify(u))
      sessionStorage.setItem('sarau_token', 'demo-token')
      return
    }
    throw new Error('Credenciais inválidas')
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('sarau_user')
    sessionStorage.removeItem('sarau_token')
  }, [])

  return (
    <AuthCtx.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
