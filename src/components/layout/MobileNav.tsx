'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Map, ImageIcon, Plus, User, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated, openAuthModal } = useAuth()

  const tabs = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/map', icon: Map, label: 'Map' },
    { href: '/gallery', icon: ImageIcon, label: 'Gallery' },
    { href: '/create', icon: Plus, label: 'Add', accent: true },
  ]

  return (
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
          <Link href="/profile" className="flex flex-col items-center gap-1 min-w-[56px]">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${pathname === '/profile' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
              <User className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium ${pathname === '/profile' ? 'text-white' : 'text-gray-500'}`}>Profile</span>
          </Link>
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
  )
}
