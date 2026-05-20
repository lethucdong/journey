'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X, Calendar, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { MOODS } from '@/data/mock'
import { type ApiCheckIn, apiDeleteCheckIn } from '@/lib/api/client'
import MoodBadge from '@/components/ui/MoodBadge'
import MapSidebar, { type UserSuggestion } from './MapSidebar'

interface Props {
  checkIns: ApiCheckIn[]
  view?: 'mine' | 'public'
  currentUserId?: string
  onDelete?: (id: string) => void
  onSearchChange?: (q: string) => void
  searchQuery?: string
  userSuggestions?: UserSuggestion[]
  onUserSelect?: (user: UserSuggestion) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function MapClient({ checkIns, view = 'mine', currentUserId, onDelete, onSearchChange, searchQuery, userSuggestions, onUserSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [activeItem, setActiveItem] = useState<ApiCheckIn | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!mapRef.current) return

    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return

      const Leaflet = L.default
      const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number }

      if (container._leaflet_id) delete container._leaflet_id
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const map = Leaflet.map(container, {
        center: [20, 15],
        zoom: 2.5,
        zoomControl: true,
        attributionControl: true,
      })

      Leaflet.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '© OpenStreetMap © CartoDB',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map)

      // Zoom to user's current location (zoom 8 — city level, not too close)
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          if (!cancelled) map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { animate: true, duration: 1.5 })
        },
        () => {} // silently ignore if denied
      )

      function createIcon(mood: string) {
        const m = MOODS[mood as keyof typeof MOODS]
        const size = 36
        const svg = `
          <svg width="${size}" height="${size}" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="16" fill="${m.color}" opacity="0.15" />
            <circle cx="22" cy="22" r="10" fill="${m.color}" opacity="0.9" />
            <circle cx="22" cy="22" r="4.5" fill="white" />
          </svg>
        `
        return Leaflet.divIcon({
          html: svg,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })
      }

      checkIns.forEach((item) => {
        const marker = Leaflet.marker([item.lat, item.lng], { icon: createIcon(item.mood) })
        marker.on('click', () => {
          setActiveItem(item)
          map.flyTo([item.lat, item.lng], 8, { animate: true, duration: 1.2 })
        })
        marker.addTo(map)
        markersRef.current.push({ marker, item })
      })

      mapInstanceRef.current = map
      setMapReady(true)
    })

    return () => {
      cancelled = true
      markersRef.current = []
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [checkIns])

  const handleSidebarSelect = (item: ApiCheckIn) => {
    setActiveItem(item)
    mapInstanceRef.current?.flyTo([item.lat, item.lng], 9, { animate: true, duration: 1.2 })
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Map container — isolate creates stacking context so Leaflet z-indexes (200-700) stay contained */}
      <div ref={mapRef} className="flex-1 w-full isolate" />

      {/* Sidebar */}
      {mapReady && (
        <MapSidebar
          checkIns={checkIns}
          activeId={activeItem?.id ?? null}
          onSelect={handleSidebarSelect}
          showAuthor={view === 'public'}
          searchValue={searchQuery}
          onQueryChange={onSearchChange}
          userSuggestions={userSuggestions}
          onUserSelect={onUserSelect}
        />
      )}

      {/* Active item popup card */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="absolute bottom-[calc(1.5rem+80px)] md:bottom-6 right-4 md:right-6 z-[900] w-72 rounded-2xl glass border border-white/10 overflow-hidden shadow-2xl"
          >
            {/* Image */}
            <div className="relative h-40 img-hover">
              {activeItem.images[0] ? (
                <img
                  src={activeItem.images[0]}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface-2 flex items-center justify-center text-gray-600 text-xs">No photo</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2">
                <MoodBadge mood={activeItem.mood as any} size="sm" />
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              {view === 'public' && activeItem.user && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/8">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[9px] font-bold text-orange-400">
                    {activeItem.user.displayName[0].toUpperCase()}
                  </div>
                  <span className="text-gray-400 text-xs">{activeItem.user.displayName}</span>
                </div>
              )}
              <h3 className="font-display text-lg font-bold text-white mb-1">{activeItem.title}</h3>
              <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                <MapPin className="w-3 h-3 text-orange-400" />
                {activeItem.location}, {activeItem.country}
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                <Calendar className="w-3 h-3" />
                {formatDate(activeItem.date)}
              </div>
              {activeItem.description && (
                <p className="text-gray-300 text-xs line-clamp-2 mb-3">{activeItem.description}</p>
              )}
              <div className="flex gap-2">
                <Link
                  href={`/post/${activeItem.id}`}
                  className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-medium hover:bg-orange-500/25 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Full story
                </Link>
                {(activeItem.user?.id === currentUserId || (!activeItem.user && view === 'mine')) && (
                  <>
                    <Link
                      href={`/edit/${activeItem.id}`}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-white/8 border border-white/15 text-gray-300 text-xs font-medium hover:bg-white/15 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    {confirmDeleteId === activeItem.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={async () => {
                            setDeleting(true)
                            await apiDeleteCheckIn(activeItem.id)
                            setDeleting(false)
                            setConfirmDeleteId(null)
                            setActiveItem(null)
                            onDelete?.(activeItem.id)
                          }}
                          disabled={deleting}
                          className="flex items-center justify-center px-2.5 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          {deleting ? '…' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex items-center justify-center px-2.5 py-2 rounded-xl bg-white/8 border border-white/15 text-gray-400 text-xs font-medium hover:bg-white/15 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(activeItem.id)}
                        className="flex items-center justify-center px-2.5 py-2 rounded-xl bg-white/8 border border-white/15 text-gray-400 text-xs hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
