'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, X, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { MOODS, type Mood } from '@/data/mock'
import { type ApiCheckIn } from '@/lib/api/client'
import MoodBadge from '@/components/ui/MoodBadge'

const ALL_MOODS: Mood[] = ['mustgo', 'amazing', 'beautiful', 'normal', 'terrible']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export interface UserSuggestion {
  id: string
  username: string
  displayName: string
  avatar: string | null
}

interface Props {
  checkIns: ApiCheckIn[]
  activeId: string | null
  onSelect: (item: ApiCheckIn) => void
  showAuthor?: boolean
  searchValue?: string
  onQueryChange?: (q: string) => void
  userSuggestions?: UserSuggestion[]
  onUserSelect?: (user: UserSuggestion) => void
}

export default function MapSidebar({
  checkIns, activeId, onSelect, showAuthor = false,
  searchValue, onQueryChange,
  userSuggestions = [], onUserSelect,
}: Props) {
  const [search, setSearch] = useState('')
  const [moodFilter, setMoodFilter] = useState<Mood | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(window.innerWidth >= 768)
  }, [])

  useEffect(() => {
    if (searchValue !== undefined) setSearch(searchValue)
  }, [searchValue])

  const filtered = checkIns.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch = !q || !q.startsWith('@') && (
      item.title.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q)
    )
    const matchMood = !moodFilter || item.mood === moodFilter
    return matchSearch && matchMood
  })

  const showSuggestions = search.startsWith('@') && userSuggestions.length > 0

  const SIDEBAR_W = 300

  return (
    <>
      {/* Animated slide tab — always visible */}
      <motion.button
        initial={false}
        animate={{ left: open ? SIDEBAR_W : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={() => setOpen((p) => !p)}
        style={{ top: '50%', translateY: '-50%' }}
        className="absolute z-[900] w-5 h-14 rounded-r-xl bg-black/70 backdrop-blur-md border border-white/15 border-l-0 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/15 transition-colors shadow-xl"
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {open ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -SIDEBAR_W }}
            animate={{ x: 0 }}
            exit={{ x: -SIDEBAR_W }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ width: SIDEBAR_W }}
            className="absolute top-0 left-0 bottom-0 z-[800] flex flex-col glass-dark border-r border-white/5"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5">
              <h2 className="font-display text-lg font-bold mb-3">{showAuthor ? 'Public check-ins' : 'My Journey'}</h2>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={showAuthor ? 'Search or @email to find a user…' : 'Search destinations…'}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    onQueryChange?.(e.target.value)
                  }}
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-gray-500 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                />

                {/* User suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      {userSuggestions.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); onUserSelect?.(u) }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 text-xs font-bold text-orange-400">
                              {u.avatar
                                ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                                : <User className="w-4 h-4" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{u.displayName}</p>
                              <p className="text-gray-500 text-xs">@{u.username}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Mood filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {ALL_MOODS.map((m) => {
                  const mood = MOODS[m]
                  const active = moodFilter === m
                  return (
                    <button
                      key={m}
                      onClick={() => setMoodFilter(active ? null : m)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        active
                          ? `${mood.bg} ${mood.text} ${mood.border}`
                          : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                      }`}
                    >
                      {mood.emoji} {mood.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 pb-[80px] md:pb-0">
              {checkIns.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  <p className="mb-1">No check-ins yet</p>
                  <p className="text-xs">Add your first destination to see it here</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No check-ins found</div>
              ) : (
                filtered.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`w-full text-left flex gap-3 p-4 transition-colors group hover:bg-white/4 ${
                      activeId === item.id ? 'bg-orange-500/8 border-l-2 border-orange-500' : ''
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 img-hover">
                      {item.images[0] ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-surface-2 flex items-center justify-center text-gray-600 text-xs">?</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-sm text-white truncate">{item.title}</h3>
                        <MoodBadge mood={item.mood as any} size="sm" showLabel={false} />
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                        <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                        <span className="truncate">{item.location}, {item.country}</span>
                      </div>
                      <p className="text-gray-500 text-xs">{formatDate(item.date)}</p>
                      {showAuthor && item.user && (
                        <p className="text-orange-400/70 text-xs mt-0.5">@{item.user.username}</p>
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {/* Footer count */}
            <div className="p-3 border-t border-white/5 text-center">
              <p className="text-gray-500 text-xs">{filtered.length} of {checkIns.length} destinations</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
