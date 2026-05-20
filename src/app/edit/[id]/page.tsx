'use client'

import { useState, useCallback, useRef, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, MapPin, X, Calendar, Loader2, Globe, Search, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MOODS, type Mood } from '@/data/mock'
import MoodBadge from '@/components/ui/MoodBadge'
import { useAuth } from '@/context/AuthContext'
import { apiGetCheckIn, apiUpdateCheckIn } from '@/lib/api/client'
import { notFound } from 'next/navigation'

const MOOD_ORDER: Mood[] = ['terrible', 'normal', 'beautiful', 'amazing', 'mustgo']
const PLACE_TYPES = ['mountain', 'beach', 'camping', 'cafe', 'roadtrip', 'adventure'] as const
const TYPE_ICONS: Record<string, string> = { mountain: '⛰️', beach: '🏖️', camping: '⛺', cafe: '☕', roadtrip: '🛣️', adventure: '🧗' }

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    city?: string; town?: string; village?: string
    county?: string; state?: string; country?: string
  }
}

interface UploadedImage { url: string; preview: string; uploading?: boolean; error?: string }
interface LocationState { query: string; location: string; country: string; lat: number | null; lng: number | null }

// ── Location Search ────────────────────────────────────────────────────────────
function LocationSearch({ value, onChange }: { value: LocationState; onChange: (v: LocationState) => void }) {
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim() || q.length < 2) { setResults([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data: NominatimResult[] = await res.json()
        setResults(data); setOpen(data.length > 0)
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 400)
  }, [])

  const select = (r: NominatimResult) => {
    const locality = r.address.city ?? r.address.town ?? r.address.village ?? r.address.county ?? r.address.state ?? ''
    onChange({
      query: r.display_name,
      location: locality || r.display_name.split(',')[0].trim(),
      country: r.address.country ?? '',
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    })
    setOpen(false)
  }

  const clear = () => { onChange({ query: '', location: '', country: '', lat: null, lng: null }); setResults([]); setOpen(false) }

  if (value.lat !== null) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/8 border border-orange-500/30 rounded-xl">
        <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{value.location}{value.country ? `, ${value.country}` : ''}</p>
          <p className="text-gray-500 text-xs mt-0.5">{value.lat.toFixed(4)}, {value.lng?.toFixed(4)}</p>
        </div>
        <button type="button" onClick={clear} className="w-6 h-6 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-gray-400 transition-colors shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text" value={value.query} autoComplete="off"
          onChange={(e) => { onChange({ ...value, query: e.target.value }); search(e.target.value) }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search a place — city, landmark…"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
        />
        {searching
          ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 animate-spin" />
          : value.query && <button type="button" onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"><X className="w-4 h-4" /></button>
        }
      </div>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
            className="absolute z-50 top-full mt-1.5 w-full bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {results.map((r) => {
              const parts = r.display_name.split(',').map((s) => s.trim())
              const locality = r.address.city ?? r.address.town ?? r.address.village ?? r.address.county ?? r.address.state
              return (
                <li key={r.place_id}>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); select(r) }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
                    <MapPin className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {parts[0]}{locality && locality !== parts[0] ? `, ${locality}` : ''}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{parts.slice(1, 3).join(', ') || r.address.country}</p>
                    </div>
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fetching, setFetching] = useState(true)
  const [missing, setMissing] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [story, setStory] = useState('')
  const [locationState, setLocationState] = useState<LocationState>({ query: '', location: '', country: '', lat: null, lng: null })
  const [date, setDate] = useState('')
  const [mood, setMood] = useState<Mood>('beautiful')
  const [placeType, setPlaceType] = useState<string>('mountain')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing check-in
  useEffect(() => {
    if (!isAuthenticated) return
    apiGetCheckIn(id).then((res) => {
      if (!res.ok) { setMissing(true); setFetching(false); return }
      const c = res.data.checkIn
      setTitle(c.title)
      setDescription(c.description ?? '')
      setStory(c.story ?? '')
      setLocationState({
        query: `${c.location}, ${c.country}`,
        location: c.location,
        country: c.country,
        lat: c.lat,
        lng: c.lng,
      })
      setDate(new Date(c.date).toISOString().slice(0, 10))
      setMood(c.mood as Mood)
      setPlaceType(c.type)
      setTags(c.tags ?? [])
      setImages(c.images.map((url) => ({ url, preview: url })))
      setIsPublic(c.isPublic)
      setFetching(false)
    })
  }, [id, isAuthenticated])

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')
  }

  const uploadFile = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file)
    setImages((prev) => [...prev, { url: '', preview, uploading: true }])
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' })
      const body = await res.json()
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Upload failed')
      const url: string = body.data?.url ?? body.url
      setImages((prev) => prev.map((img) => img.preview === preview ? { ...img, url, uploading: false } : img))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setImages((prev) => prev.map((img) => img.preview === preview ? { ...img, uploading: false, error: msg } : img))
    }
  }, [])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((f) => { if (f.type.startsWith('image/')) uploadFile(f) })
  }, [uploadFile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!locationState.lat || !locationState.lng) {
      setError('Please select a location from the search results')
      return
    }
    if (images.some((img) => img.uploading)) {
      setError('Please wait for all photos to finish uploading')
      return
    }
    setSubmitting(true)
    const res = await apiUpdateCheckIn(id, {
      title,
      description,
      story,
      location: locationState.location,
      country: locationState.country,
      lat: locationState.lat,
      lng: locationState.lng,
      date: new Date(date).toISOString(),
      mood,
      type: placeType,
      images: images.filter((img) => img.url && !img.error).map((img) => img.url),
      tags,
      isPublic,
    })
    setSubmitting(false)
    if (!res.ok) { setError(res.error); return }
    router.push(`/post/${id}`)
  }

  if (authLoading || fetching) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
    </div>
  )

  if (missing) return notFound()

  const previewImageSrc = images[0]?.preview ?? null

  return (
    <div className="pt-16 min-h-screen pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 py-6 border-b border-white/5 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold">Edit check-in</h1>
        </motion.div>
        <Link href={`/post/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* LEFT — Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Title <span className="text-orange-400">*</span></label>
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Dawn at Ma Pi Leng, Ha Giang…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Location <span className="text-orange-400">*</span></label>
              <LocationSearch value={locationState} onChange={setLocationState} />
            </div>

            {/* Date + Place type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />Date <span className="text-orange-400">*</span>
                </label>
                <input
                  type="date" required value={date} max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors text-sm [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Place type</label>
                <div className="flex flex-wrap gap-1.5">
                  {PLACE_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setPlaceType(t)} title={t}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${placeType === t ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'}`}>
                      <span>{TYPE_ICONS[t]}</span><span className="capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mood <span className="text-gray-500 font-normal text-xs ml-1">{MOODS[mood].emoji} {MOODS[mood].label}</span>
              </label>
              <div className="flex gap-2">
                {MOOD_ORDER.map((m) => (
                  <button key={m} type="button" onClick={() => setMood(m)} title={MOODS[m].label}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${mood === m ? 'bg-white/8 border-white/20' : 'border-transparent hover:bg-white/4'}`}>
                    <span className={`text-2xl leading-none transition-transform ${mood === m ? 'scale-110' : 'opacity-50'}`}>{MOODS[m].emoji}</span>
                    <span className={`text-[10px] ${mood === m ? MOODS[m].text : 'text-gray-600'}`}>{MOODS[m].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Photos <span className="text-gray-500 font-normal text-xs ml-1">optional</span></label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-dashed border-white/15 hover:border-white/30 cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Click to add more photos</p>
                  <p className="text-gray-500 text-xs mt-0.5">PNG, JPG, WEBP · max 50 MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
              </div>

              {images.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {images.map((img, i) => (
                    <div key={img.preview} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                      )}
                      {img.error && (
                        <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center px-1">
                          <p className="text-red-200 text-[9px] text-center leading-tight">Failed</p>
                        </div>
                      )}
                      <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black/90">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description <span className="text-gray-500 font-normal text-xs ml-1">short teaser</span></label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows={2} placeholder="A short teaser for this moment…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm resize-none"
              />
            </div>

            {/* Story */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Story <span className="text-gray-500 font-normal text-xs ml-1">full narrative</span></label>
              <textarea
                value={story} onChange={(e) => setStory(e.target.value)}
                rows={5} placeholder="Tell the full story of this journey…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags <span className="text-gray-500 font-normal text-xs ml-1">optional</span></label>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs">
                      #{t}
                      <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))} className="w-3.5 h-3.5 rounded-full hover:bg-orange-500/30 flex items-center justify-center">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
                placeholder="Type a tag and press Enter…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
              />
            </div>

            {/* Visibility */}
            <button
              type="button"
              onClick={() => setIsPublic((p) => !p)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isPublic
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                  : 'bg-white/4 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {isPublic ? <Globe className="w-4 h-4 shrink-0" /> : <EyeOff className="w-4 h-4 shrink-0" />}
              <div className="text-left flex-1">
                <p className="text-sm font-medium">{isPublic ? 'Public' : 'Private'}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isPublic ? 'Anyone can see this check-in on the map' : 'Only visible to you'}
                </p>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${isPublic ? 'bg-orange-500' : 'bg-white/15'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </div>
            </button>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <X className="w-4 h-4 shrink-0 mt-0.5" />{error}
              </div>
            )}

            {/* Submit */}
            <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Saving…' : 'Save changes'}
            </motion.button>
          </motion.div>

          {/* RIGHT — Preview */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Preview</p>
            <div className="rounded-2xl overflow-hidden border border-white/8 glass">
              <div className="relative aspect-[4/3] bg-surface-2">
                {previewImageSrc
                  ? <img src={previewImageSrc} alt="Preview" className="w-full h-full object-cover" />
                  : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No photo</div>
                  )
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-3 right-3"><MoodBadge mood={mood} size="sm" /></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-xl font-bold text-white mb-1">
                    {title || <span className="text-gray-400 font-normal text-base italic">Journey title…</span>}
                  </h3>
                  {(locationState.location || locationState.country) && (
                    <div className="flex items-center gap-1 text-gray-300 text-xs">
                      <MapPin className="w-3 h-3 text-orange-400" />
                      {[locationState.location, locationState.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-500 text-xs">
                    {date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                  {placeType && <span className="ml-auto text-xs text-gray-500 capitalize">{TYPE_ICONS[placeType]} {placeType}</span>}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed min-h-[40px]">
                  {description || <span className="text-gray-600 italic text-xs">Description will appear here…</span>}
                </p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.slice(0, 5).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-500 text-xs">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  )
}
