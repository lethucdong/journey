'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Plus, LogOut, User, Bell, MessageCircle, CornerDownRight, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect, useRef, useCallback } from 'react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/map', label: 'Map' },
  { href: '/gallery', label: 'Gallery' },
]

interface Notif {
  id: string
  type: 'comment' | 'reply'
  read: boolean
  createdAt: string
  commentId: string | null
  sender: { id: string; displayName: string; username: string; avatar: string | null }
  checkIn: { id: string; title: string } | null
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function NotifBell({ userId }: { userId: string }) {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifs = useCallback(async () => {
    const res = await fetch('/api/notifications', { credentials: 'include' })
    const body = await res.json()
    if (body.success) { setNotifs(body.data.notifications); setUnread(body.data.unreadCount) }
  }, [])

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [fetchNotifs])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT', credentials: 'include' })
    setNotifs((p) => p.map((n) => ({ ...n, read: true })))
    setUnread(0)
  }

  const handleOpen = () => {
    setOpen((p) => !p)
    if (!open && unread > 0) markAllRead()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl hover:bg-white/8 flex items-center justify-center transition-colors"
      >
        <Bell className="w-4 h-4 text-gray-400" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 glass-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
              <h3 className="font-medium text-sm text-white">Notifications</h3>
              {notifs.some((n) => !n.read) && (
                <button onClick={markAllRead} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {notifs.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No notifications yet</div>
              ) : (
                notifs.map((n) => (
                  <Link
                    key={n.id}
                    href={n.checkIn ? `/post/${n.checkIn.id}` : '#'}
                    onClick={() => setOpen(false)}
                    className={`flex gap-3 px-4 py-3 hover:bg-white/4 transition-colors ${!n.read ? 'bg-orange-500/4' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      {n.type === 'comment'
                        ? <MessageCircle className="w-3.5 h-3.5 text-orange-400" />
                        : <CornerDownRight className="w-3.5 h-3.5 text-orange-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white leading-snug">
                        <span className="font-medium">{n.sender.displayName}</span>
                        {n.type === 'comment' ? ' commented on ' : ' replied to your comment on '}
                        <span className="text-orange-400 truncate">{n.checkIn?.title ?? 'your post'}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-2" />}
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout, openAuthModal } = useAuth()

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-[1000] glass-dark border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
            <Compass className="w-4 h-4 text-orange-400" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Journey</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`relative px-4 py-2 text-sm rounded-lg transition-colors ${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {active && (
                  <motion.span layoutId="nav-indicator" className="absolute inset-0 rounded-lg bg-white/8"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
                )}
                <span className="relative">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {user && <NotifBell userId={user.id} />}
              <Link href="/create"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />New Check-in
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.displayName} className="w-7 h-7 rounded-full object-cover" />
                    : <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center"><User className="w-3.5 h-3.5 text-orange-400" /></div>
                  }
                  <span className="text-sm text-gray-300">{user?.displayName}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 glass-dark border border-white/10 rounded-xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-sm text-white font-medium truncate">{user?.displayName}</p>
                    <p className="text-xs text-gray-400">@{user?.username}</p>
                  </div>
                  <Link href="/profile/edit"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />Edit profile
                  </Link>
                  <button onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => openAuthModal('login')} className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">Sign in</button>
              <button onClick={() => openAuthModal('register')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors">Get Started</button>
            </>
          )}
        </div>

        {/* Mobile right */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && user && <NotifBell userId={user.id} />}
          {isAuthenticated ? (
            <Link href="/create" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-medium">
              <Plus className="w-3.5 h-3.5" />Add
            </Link>
          ) : (
            <button onClick={() => openAuthModal('login')} className="px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-medium">Sign in</button>
          )}
        </div>
      </div>
    </motion.header>
  )
}
