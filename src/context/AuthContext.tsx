'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  apiGetMe,
  apiLogin,
  apiLogout,
  apiRefresh,
  apiRegister,
  type ApiUser,
} from '@/lib/api/client'

interface AuthState {
  user: ApiUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<string | null>
  register: (data: { email: string; username: string; displayName: string; password: string }) => Promise<string | null>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  openAuthModal: (tab?: 'login' | 'register') => void
  closeAuthModal: () => void
}

interface AuthModalState {
  open: boolean
  tab: 'login' | 'register'
}

const AuthContext = createContext<AuthState & AuthActions & { modal: AuthModalState } | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState<AuthModalState>({ open: false, tab: 'login' })

  // Load session on mount
  useEffect(() => {
    let active = true

    async function loadSession() {
      // Try /me first; if 401, try refresh
      const me = await apiGetMe()
      if (me.ok) {
        if (active) setUser(me.data.user)
      } else {
        const refresh = await apiRefresh()
        if (refresh.ok && active) setUser(refresh.data.user)
      }
      if (active) setIsLoading(false)
    }

    loadSession()
    return () => { active = false }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await apiLogin(email, password)
    if (!res.ok) return res.error
    setUser(res.data.user)
    setModal({ open: false, tab: 'login' })
    return null
  }, [])

  const register = useCallback(async (data: {
    email: string; username: string; displayName: string; password: string
  }): Promise<string | null> => {
    const res = await apiRegister(data)
    if (!res.ok) return res.error
    setUser(res.data.user)
    setModal({ open: false, tab: 'login' })
    return null
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    window.location.href = '/'
  }, [])

  const refresh = useCallback(async () => {
    const res = await apiRefresh()
    if (res.ok) setUser(res.data.user)
    else setUser(null)
  }, [])

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setModal({ open: true, tab })
  }, [])

  const closeAuthModal = useCallback(() => {
    setModal((m) => ({ ...m, open: false }))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refresh,
        modal,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
