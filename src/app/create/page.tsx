'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, MapPin, X, Image as ImageIcon, Calendar, Loader2, Lock, Search, Globe, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react'
import { MOODS, type Mood } from '@/data/mock'
import MoodBadge from '@/components/ui/MoodBadge'
import { useAuth } from '@/context/AuthContext'
import { apiCreateCheckIn } from '@/lib/api/client'

const MOOD_ORDER: Mood[] = ['terrible', 'normal', 'beautiful', 'amazing', 'mustgo']
const PLACE_TYPES = ['mountain', 'beach', 'camping', 'cafe', 'roadtrip', 'adventure'] as const
const TYPE_ICONS: Record<string, string> = { mountain: '⛰️', beach: '🏖️', camping: '⛺', cafe: '☕', roadtrip: '🛣️', adventure: '🧗' }
const TYPE_LABELS: Record<string, string> = { mountain: 'Núi', beach: 'Biển', camping: 'Cắm trại', cafe: 'Cà phê', roadtrip: 'Phượt', adventure: 'Phiêu lưu' }

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  locality: string
  country: string
  address: Record<string, string>
}

interface UploadedImage { url: string; preview: string; uploading?: boolean; error?: string }
interface LocationState { query: string; location: string; country: string; lat: number | null; lng: number | null }

// ── Tìm kiếm địa điểm (qua server proxy để đảm bảo User-Agent) ───────────────
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
        const res = await fetch(`/api/locations/resolve?q=${encodeURIComponent(q)}`)
        const body = await res.json()
        if (body.success) { setResults(body.data); setOpen(body.data.length > 0) }
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 400)
  }, [])

  const select = useCallback((r: NominatimResult) => {
    onChange({
      query: r.display_name,
      location: r.locality || r.display_name.split(',')[0].trim(),
      country: r.country,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    })
    setOpen(false)
  }, [onChange])

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
          placeholder="Tìm địa điểm — thành phố, địa danh…"
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
              return (
                <li key={r.place_id}>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); select(r) }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
                    <MapPin className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{parts[0]}</p>
                      <p className="text-gray-500 text-xs truncate">{parts.slice(1, 3).join(', ')}</p>
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

// ── Auto-fill vị trí từ locationQuery (server-side) ───────────────────────────
async function resolveLocation(query: string): Promise<LocationState | null> {
  if (!query.trim()) return null
  try {
    const res = await fetch(`/api/locations/resolve?q=${encodeURIComponent(query)}`)
    const body = await res.json()
    if (!body.success || !body.data?.length) return null
    const r: NominatimResult = body.data[0]
    return {
      query: r.display_name,
      location: r.locality || r.display_name.split(',')[0].trim(),
      country: r.country,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }
  } catch {
    return null
  }
}

// ── Trang tạo check-in ────────────────────────────────────────────────────────
export default function CreatePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, openAuthModal } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationState, setLocationState] = useState<LocationState>({ query: '', location: '', country: '', lat: null, lng: null })
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [mood, setMood] = useState<Mood>('beautiful')
  const [placeType, setPlaceType] = useState<string>('mountain')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [dragging, setDragging] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiApplied, setAiApplied] = useState(false)
  const analyzedUrlRef = useRef<string | null>(null)

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')
  }

  const analyzeImage = useCallback(async (imageUrl: string) => {
    if (analyzedUrlRef.current === imageUrl) return
    analyzedUrlRef.current = imageUrl
    setAnalyzing(true)
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      const body = await res.json()
      if (!res.ok || !body.success) return

      const ai = body.data as { title: string; description: string; tags: string[]; type: string; locationQuery: string; mood: string }

      if (ai.title)       setTitle((prev) => prev || ai.title)
      if (ai.description) setDescription((prev) => prev || ai.description)
      if (ai.tags?.length) setTags((prev) => prev.length ? prev : ai.tags)
      if (ai.type && PLACE_TYPES.includes(ai.type as typeof PLACE_TYPES[number])) setPlaceType(ai.type)
      if (ai.mood && MOOD_ORDER.includes(ai.mood as Mood)) setMood(ai.mood as Mood)

      if (ai.locationQuery) {
        const loc = await resolveLocation(ai.locationQuery)
        if (loc) setLocationState((cur) => cur.lat !== null ? cur : loc)
      }

      setAiApplied(true)
    } catch {
      // AI là best-effort, lỗi thì bỏ qua
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const handleAiFill = useCallback(() => {
    const firstValidUrl = images.find((img) => img.url && !img.error && !img.uploading)?.url
    if (!firstValidUrl) return
    analyzedUrlRef.current = null
    analyzeImage(firstValidUrl)
  }, [images, analyzeImage])

  const uploadFile = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file)
    setImages((prev) => [...prev, { url: '', preview, uploading: true }])
    try {
      const sigRes = await fetch('/api/upload/sign', { method: 'POST', credentials: 'include' })
      const sigBody = await sigRes.json()
      if (!sigRes.ok || !sigBody.success) throw new Error(sigBody.error ?? 'Không lấy được upload token')
      const { timestamp, signature, apiKey, cloudName, folder, transformation } = sigBody.data

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', String(timestamp))
      formData.append('signature', signature)
      formData.append('folder', folder)
      formData.append('transformation', transformation)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData })
      const uploadBody = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadBody.error?.message ?? 'Upload thất bại')

      const url: string = uploadBody.secure_url
      setImages((prev) => prev.map((img) => img.preview === preview ? { ...img, url, uploading: false } : img))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload thất bại'
      setImages((prev) => prev.map((img) => img.preview === preview ? { ...img, uploading: false, error: msg } : img))
    }
  }, [analyzeImage])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((f) => { if (f.type.startsWith('image/')) uploadFile(f) })
  }, [uploadFile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!locationState.lat || !locationState.lng) {
      setError('Vui lòng chọn địa điểm từ kết quả tìm kiếm')
      return
    }
    if (images.some((img) => img.uploading)) {
      setError('Vui lòng chờ tất cả ảnh upload xong')
      return
    }
    setSubmitting(true)
    const res = await apiCreateCheckIn({
      title, description,
      location: locationState.location,
      country: locationState.country,
      lat: locationState.lat,
      lng: locationState.lng,
      date: new Date(date).toISOString(),
      mood, type: placeType,
      images: images.filter((img) => img.url && !img.error).map((img) => img.url),
      tags,
      isPublic,
    })
    setSubmitting(false)
    if (!res.ok) { setError(res.error); return }
    router.push('/map')
  }

  const previewImageSrc = images[0]?.preview ?? null

  if (authLoading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
    </div>
  )

  if (!isAuthenticated) return (
    <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-2">
        <Lock className="w-7 h-7 text-orange-400" />
      </div>
      <h2 className="font-display text-2xl font-bold">Đăng nhập để tạo check-in</h2>
      <p className="text-gray-400 max-w-sm">Tạo tài khoản để bắt đầu lưu giữ hành trình du lịch của bạn.</p>
      <div className="flex gap-3">
        <button onClick={() => openAuthModal('login')} className="px-6 py-3 rounded-xl bg-white/8 hover:bg-white/12 text-white font-medium text-sm transition-colors">Đăng nhập</button>
        <button onClick={() => openAuthModal('register')} className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-colors">Tạo tài khoản</button>
      </div>
    </div>
  )

  return (
    <div className="pt-16 min-h-screen pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 py-6 border-b border-white/5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold">Check-in mới</h1>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* LEFT — Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-5">

            {/* ── Ảnh — đầu tiên ── */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Ảnh <span className="text-gray-500 font-normal text-xs ml-1">tuỳ chọn</span>
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragging ? 'border-orange-500 bg-orange-500/8' : 'border-white/15 hover:border-white/30'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Nhấn hoặc kéo & thả ảnh vào đây</p>
                  <p className="text-gray-500 text-xs mt-0.5">PNG, JPG, WEBP · tối đa 50 MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
              </div>

              {images.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img) => (
                      <div key={img.preview} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        {img.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                        {img.error && (
                          <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center px-1">
                            <p className="text-red-200 text-[9px] text-center leading-tight">Lỗi</p>
                          </div>
                        )}
                        <button type="button" onClick={() => setImages((p) => p.filter((i) => i.preview !== img.preview))}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black/90">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {images.some((img) => img.url && !img.error && !img.uploading) && (
                    <button
                      type="button"
                      onClick={handleAiFill}
                      disabled={analyzing}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {analyzing
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        : <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      }
                      {analyzing ? 'Đang phân tích…' : 'AI tự động điền'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Banner trạng thái AI ── */}
            <AnimatePresence>
              {(analyzing || aiApplied) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                  {analyzing ? (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>AI đang phân tích ảnh và điền thông tin…</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>AI đã điền thông tin — bạn có thể chỉnh sửa tuỳ ý.</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Tiêu đề <span className="text-orange-400">*</span>
                {aiApplied && title && <span className="ml-2 text-xs text-purple-400 font-normal"><Sparkles className="w-3 h-3 inline" /> AI</span>}
              </label>
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Bình minh trên đèo Mã Pí Lèng, Hà Giang…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
              />
            </div>

            {/* Địa điểm */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Địa điểm <span className="text-orange-400">*</span>
                {aiApplied && locationState.lat && <span className="ml-2 text-xs text-purple-400 font-normal"><Sparkles className="w-3 h-3 inline" /> AI</span>}
              </label>
              <LocationSearch value={locationState} onChange={setLocationState} />
            </div>

            {/* Ngày + Loại địa điểm */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />Ngày <span className="text-orange-400">*</span>
                </label>
                <input
                  type="date" required value={date} max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors text-sm [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Loại địa điểm
                  {aiApplied && <span className="ml-2 text-xs text-purple-400 font-normal"><Sparkles className="w-3 h-3 inline" /> AI</span>}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PLACE_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setPlaceType(t)} title={TYPE_LABELS[t]}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${placeType === t ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'}`}>
                      <span>{TYPE_ICONS[t]}</span><span>{TYPE_LABELS[t]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cảm xúc */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cảm xúc <span className="text-gray-500 font-normal text-xs ml-1">{MOODS[mood].emoji} {MOODS[mood].label}</span>
                {aiApplied && <span className="ml-2 text-xs text-purple-400 font-normal"><Sparkles className="w-3 h-3 inline" /> AI</span>}
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

            {/* Câu chuyện */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Câu chuyện <span className="text-gray-500 font-normal text-xs ml-1">tuỳ chọn</span>
                {aiApplied && description && <span className="ml-2 text-xs text-purple-400 font-normal"><Sparkles className="w-3 h-3 inline" /> AI</span>}
              </label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows={3} placeholder="Kể lại khoảnh khắc này…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm resize-none"
              />
            </div>

            {/* Hashtag */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Hashtag <span className="text-gray-500 font-normal text-xs ml-1">tuỳ chọn</span>
                {aiApplied && tags.length > 0 && <span className="ml-2 text-xs text-purple-400 font-normal"><Sparkles className="w-3 h-3 inline" /> AI</span>}
              </label>
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
                placeholder="Nhập hashtag và nhấn Enter…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
              />
            </div>

            {/* Chế độ hiển thị */}
            <button
              type="button"
              onClick={() => setIsPublic((p) => !p)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isPublic ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-white/4 border-white/10 text-gray-400 hover:border-white/20'}`}
            >
              {isPublic ? <Globe className="w-4 h-4 shrink-0" /> : <EyeOff className="w-4 h-4 shrink-0" />}
              <div className="text-left flex-1">
                <p className="text-sm font-medium">{isPublic ? 'Công khai' : 'Chỉ mình tôi'}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isPublic ? 'Mọi người có thể thấy check-in này trên bản đồ' : 'Chỉ có bạn mới nhìn thấy'}
                </p>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${isPublic ? 'bg-orange-500' : 'bg-white/15'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>

            {/* Lỗi */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <X className="w-4 h-4 shrink-0 mt-0.5" />{error}
              </div>
            )}

            {/* Nút lưu */}
            <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Đang lưu…' : 'Lưu check-in'}
            </motion.button>
          </motion.div>

          {/* RIGHT — Xem trước */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Xem trước</p>

            <div className="rounded-2xl overflow-hidden border border-white/8 glass">
              <div className="relative aspect-[4/3] bg-surface-2">
                {previewImageSrc
                  ? <img src={previewImageSrc} alt="Preview" className="w-full h-full object-cover" />
                  : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1.5" />
                        <p className="text-xs">Chưa có ảnh</p>
                      </div>
                    </div>
                  )
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-3 right-3"><MoodBadge mood={mood} size="sm" /></div>
                {analyzing && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>Đang phân tích…</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-xl font-bold text-white mb-1">
                    {title || <span className="text-gray-400 font-normal text-base italic">Tiêu đề hành trình…</span>}
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
                    {date ? new Date(date + 'T12:00:00').toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                  {placeType && <span className="ml-auto text-xs text-gray-500">{TYPE_ICONS[placeType]} {TYPE_LABELS[placeType]}</span>}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed min-h-[48px]">
                  {description || <span className="text-gray-600 italic text-xs">Câu chuyện sẽ hiển thị ở đây…</span>}
                </p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.slice(0, 5).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-500 text-xs">#{t}</span>
                    ))}
                    {tags.length > 5 && <span className="px-2 py-0.5 text-gray-600 text-xs">+{tags.length - 5}</span>}
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
