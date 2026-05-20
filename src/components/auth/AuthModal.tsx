'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Compass, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function AuthModal() {
  const { modal, closeAuthModal, login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>(modal.tab)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Sync tab when modal opens
  useEffect(() => {
    if (modal.open) {
      setTab(modal.tab)
      setError(null)
      setShowPassword(false)
    }
  }, [modal.open, modal.tab])

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regDisplayName, setRegDisplayName] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // Lock body scroll + close on Escape
  useEffect(() => {
    if (modal.open) {
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthModal() }
      window.addEventListener('keydown', onKey)
      return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
    } else {
      document.body.style.overflow = ''
    }
  }, [modal.open, closeAuthModal])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await login(loginEmail, loginPassword)
    setLoading(false)
    if (err) setError(err)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await register({ email: regEmail, username: regUsername, displayName: regDisplayName, password: regPassword })
    setLoading(false)
    if (err) setError(err)
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm'

  return (
    <AnimatePresence>
      {modal.open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed inset-0 z-[1201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md glass-dark border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="font-display text-lg font-bold">Journey</span>
                </div>
                <button
                  onClick={closeAuthModal}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5">
                {(['login', 'register'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(null) }}
                    className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                      tab === t ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab === t && (
                      <motion.div
                        layoutId="auth-tab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                      />
                    )}
                    {t === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {tab === 'login' ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.18 }}
                      onSubmit={handleLogin}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className={inputClass + ' pr-11'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Sign In
                      </button>

                      <p className="text-center text-gray-500 text-xs">
                        No account?{' '}
                        <button type="button" onClick={() => { setTab('register'); setError(null) }} className="text-orange-400 hover:text-orange-300">
                          Create one
                        </button>
                      </p>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.18 }}
                      onSubmit={handleRegister}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Name</label>
                          <input
                            type="text"
                            required
                            value={regDisplayName}
                            onChange={(e) => setRegDisplayName(e.target.value)}
                            placeholder="Le Dong"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
                          <input
                            type="text"
                            required
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                            placeholder="traveler"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            className={inputClass + ' pr-11'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Start Your Journey
                      </button>

                      <p className="text-center text-gray-500 text-xs">
                        Already have an account?{' '}
                        <button type="button" onClick={() => { setTab('login'); setError(null) }} className="text-orange-400 hover:text-orange-300">
                          Sign in
                        </button>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
