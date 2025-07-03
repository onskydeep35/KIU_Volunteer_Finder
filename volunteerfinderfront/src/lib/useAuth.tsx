import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  user_id: number
  name: string
  email: string
}

interface AuthContextValue {
  user: User | null
  login: (data: { user_identifier: string; password: string }) => Promise<void>
  register: (data: {
    name: string
    surname: string
    email: string
    dob: string
    sex: string
    password: string
    user_id?: string
    username?: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.warn('Failed to parse stored user, clearing it', err)
        localStorage.removeItem('user')
      }}
  }, [])

  const login: AuthContextValue['login'] = async (data) => {
    const params = new URLSearchParams({ user_identifier: data.user_identifier, password: data.password });
    const res = await fetch(`/api/users/login?${params.toString()}`, {
      method: 'GET',
    });

    if (!res.ok) throw new Error('Login failed')
    const user = await res.json()
    setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const register: AuthContextValue['register'] = async (data) => {
    const res = await fetch('/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Registration failed')
    const result = await res.json()
    setUser(result.user)
    localStorage.setItem('user', JSON.stringify(result.user))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

