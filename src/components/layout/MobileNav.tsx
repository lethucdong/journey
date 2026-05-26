'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Map, ImageIcon, Plus, User, LogIn, LogOut, X, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect, useRef } from 'react'

export default function MobileNav() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout, openAuthModal } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const tabs = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/map', icon: Map, label: 'Map' },
    { href: '/gallery', icon: ImageIcon, label: 'Gallery' },
    { href: '/create', icon: Plus, label: 'Add', accent: true },
  ]

  return (
    <>
      {/* User sheet */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              ref={menuRef}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed bottom-[72px] left-4 right-4 z-[1200] md:hidden rounded-2xl glass-dark border border-white/10 shadow-2xl overflow-hidden pb-safe"
            >
              {/* User info */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                    : <User className="w-4 h-4 text-orange-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{user?.displayName}</p>
                  <p className="text-gray-500 text-xs">@{user?.username}</p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Edit profile */}
              <Link
                href="/profile/edit"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-4 text-gray-300 hover:bg-white/5 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Chỉnh sửa hồ sơ</span>
              </Link>

              {/* Sign out */}
              <button
                onClick={async () => { setMenuOpen(false); await logout() }}
                className="w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:bg-red-500/8 transition-colors border-t border-white/8"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Đăng xuất</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden glass-dark border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map(({ href, icon: Icon, label, accent }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 min-w-[56px]">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    accent
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : active
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    active && !accent ? 'text-white' : accent ? 'text-orange-400' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </Link>
            )
          })}

          {/* Auth tab */}
          {isAuthenticated ? (
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="flex flex-col items-center gap-1 min-w-[56px]"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${menuOpen ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  : <User className="w-5 h-5" />
                }
              </div>
              <span className={`text-[10px] font-medium ${menuOpen ? 'text-white' : 'text-gray-500'}`}>Account</span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex flex-col items-center gap-1 min-w-[56px]"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500">
                <LogIn className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-gray-500">Sign in</span>
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
