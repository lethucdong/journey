'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Loader2, Globe, User, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiGetCheckIns, apiSearchUsers, type ApiCheckIn } from '@/lib/api/client'
import type { UserSuggestion } from '@/components/map/MapSidebar'

const MapClient = dynamic(() => import('@/components/map/MapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#0B0B0B]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading map…</p>
      </div>
    </div>
  ),
})

type ViewMode = 'mine' | 'public'

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: React.ElementType }[] = [
  { value: 'mine',   label: 'Mine',     icon: User  },
  { value: 'public', label: 'Everyone', icon: Globe },
]

interface UserFilter {
  userId: string
  displayName: string
  username: string
}

export default function MapPage() {
  const { user, isAuthenticated, isLoading: authLoading, openAuthModal } = useAuth()
  const [baseCheckIns, setBaseCheckIns] = useState<ApiCheckIn[]>([])
  const [filteredCheckIns, setFilteredCheckIns] = useState<ApiCheckIn[]>([])
  const [loading, setLoading] = useState(false)
  const [filterLoading, setFilterLoading] = useState(false)
  const [view, setView] = useState<ViewMode>('mine')
  const [userFilter, setUserFilter] = useState<UserFilter | null>(null)
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const fetchCheckIns = useCallback(async (v: ViewMode) => {
    setLoading(true)
    setUserFilter(null)
    if (v === 'public') {
      const [mineRes, publicRes] = await Promise.all([
        apiGetCheckIns({ limit: 200, view: 'mine' }),
        apiGetCheckIns({ limit: 200, view: 'public' }),
      ])
      if (mineRes.ok && publicRes.ok) {
        const mine = mineRes.data.checkIns
        const mineIds = new Set(mine.map((c) => c.id))
        const others = publicRes.data.checkIns.filter((c) => !mineIds.has(c.id))
        setBaseCheckIns([...mine, ...others])
      }
    } else {
      const res = await apiGetCheckIns({ limit: 200, view: v })
      if (res.ok) setBaseCheckIns(res.data.checkIns)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchCheckIns(view)
  }, [isAuthenticated, view, fetchCheckIns])

  // When view changes to 'mine', email search doesn't apply
  useEffect(() => {
    if (view !== 'public') setUserFilter(null)
  }, [view])

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q)
    if (view !== 'public') return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    // @localpart triggers user search
    if (q.startsWith('@') && q.length > 1) {
      const localPart = q.slice(1)
      debounceRef.current = setTimeout(async () => {
        const res = await apiSearchUsers(localPart)
        setUserSuggestions(res.ok ? res.data.users : [])
      }, 300)
    } else {
      setUserSuggestions([])
    }
  }, [view])

  const handleUserSelect = useCallback(async (u: UserSuggestion) => {
    setUserSuggestions([])
    setSearchQuery('')
    setFilterLoading(true)
    const ckRes = await apiGetCheckIns({ view: 'public', userId: u.id, limit: 200 })
    if (ckRes.ok) {
      setUserFilter({ userId: u.id, displayName: u.displayName, username: u.username })
      setFilteredCheckIns(ckRes.data.checkIns)
    }
    setFilterLoading(false)
  }, [])

  const clearUserFilter = () => {
    setUserFilter(null)
    setUserSuggestions([])
    setSearchQuery('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  const displayedCheckIns = userFilter ? filteredCheckIns : baseCheckIns

  if (authLoading) {
    return (
      <div className="pt-16 h-screen overflow-hidden flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-16 h-screen overflow-hidden flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-2">
          <MapPin className="w-7 h-7 text-orange-400" />
        </div>
        <h2 className="font-display text-2xl font-bold">Your Journey Map</h2>
        <p className="text-gray-400 max-w-sm">Sign in to see your personal travel map and all your check-ins plotted across the world.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-colors"
        >
          Sign in to explore
        </button>
      </div>
    )
  }

  return (
    <div className="pt-16 h-screen overflow-hidden relative">
      {/* View toggle + user filter badge */}
      <div className="absolute top-20 right-4 z-[1000] flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 shadow-xl">
          {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setView(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === value ? 'bg-orange-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
          {(loading || filterLoading) && <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin ml-1" />}
        </div>

        {/* Active user filter badge */}
        {userFilter && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-medium backdrop-blur-md shadow-xl">
            <span>@{userFilter.username}</span>
            <button onClick={clearUserFilter} className="hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <MapClient
        checkIns={displayedCheckIns}
        view={view}
        currentUserId={user?.id}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        userSuggestions={userSuggestions}
        onUserSelect={handleUserSelect}
        onDelete={(id) => {
          setBaseCheckIns((prev) => prev.filter((c) => c.id !== id))
          setFilteredCheckIns((prev) => prev.filter((c) => c.id !== id))
        }}
      />
    </div>
  )
}
