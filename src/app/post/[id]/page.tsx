'use client'

import { use, useRef, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MapPin, Calendar, ArrowLeft, Tag, Loader2, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import MoodBadge from '@/components/ui/MoodBadge'
import CommentSection from '@/components/comments/CommentSection'
import { type ApiCheckIn, apiDeleteCheckIn } from '@/lib/api/client'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

// Parallax hero needs its own component so hooks always run
function HeroSection({ item, onImageClick }: { item: ApiCheckIn; onImageClick?: () => void }) {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section ref={heroRef} className="relative h-screen min-h-[640px] flex items-end overflow-hidden">
      <motion.div style={{ y: imgY }} className="absolute inset-0 z-0">
        {item.images[0] ? (
          <img
            src={item.images[0]} alt={item.title}
            className={`w-full h-[130%] object-cover object-center${onImageClick ? ' cursor-zoom-in' : ''}`}
            onClick={onImageClick}
          />
        ) : (
          <div className="w-full h-full bg-surface-2" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/30 to-transparent" />
      </motion.div>

      <motion.div style={{ opacity: textOpacity }} className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-16">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to gallery
        </Link>
        <div className="mb-4"><MoodBadge mood={item.mood as Parameters<typeof MoodBadge>[0]['mood']} size="lg" /></div>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">{item.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-orange-400" />{item.location}, {item.country}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-500" />{formatDate(item.date)}
          </span>
        </div>
      </motion.div>
    </section>
  )
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [item, setItem] = useState<ApiCheckIn | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  useEffect(() => {
    if (lightboxIdx === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null)
      if (e.key === 'ArrowRight') setLightboxIdx((i) => i !== null ? Math.min(i + 1, (item?.images.length ?? 1) - 1) : null)
      if (e.key === 'ArrowLeft')  setLightboxIdx((i) => i !== null ? Math.max(i - 1, 0) : null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIdx, item])

  useEffect(() => {
    fetch(`/api/checkins/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((body) => {
        if (body.success && body.data?.checkIn) {
          setItem(body.data.checkIn)
          setIsOwner(body.data.isOwner === true)
        } else {
          setMissing(true)
        }
      })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
    </div>
  )

  if (missing) return notFound()

  if (!item) return null

  return (
    <article className="pb-24 md:pb-8">
      <HeroSection item={item} onImageClick={() => setLightboxIdx(0)} />

      <div className="max-w-4xl mx-auto px-6">
        {/* Description lead */}
        {item.description && (
          <motion.p
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl text-gray-200 italic leading-relaxed py-12 border-b border-white/8"
          >
            &ldquo;{item.description}&rdquo;
          </motion.p>
        )}

        {/* Story body */}
        {item.story && (
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="py-10 border-b border-white/8"
          >
            <p className="text-gray-300 text-lg leading-[1.85] whitespace-pre-line">{item.story}</p>
          </motion.div>
        )}

        {/* Photo gallery */}
        {item.images.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="py-10 border-b border-white/8"
          >
            <h2 className="font-display text-2xl font-bold mb-6">Photographs</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0">
              {item.images.map((src, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="shrink-0 snap-center w-[280px] md:w-[360px] aspect-[4/3] rounded-2xl overflow-hidden img-hover cursor-zoom-in"
                  onClick={() => setLightboxIdx(i)}
                >
                  <img src={src} alt={`${item.title} — ${i + 1}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="py-8 border-b border-white/8 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">{item.location}, {item.country}</p>
              <p className="text-gray-500 text-xs mt-0.5">{item.lat.toFixed(4)}°, {item.lng.toFixed(4)}°</p>
            </div>
          </div>
          <Link href="/map" className="inline-flex items-center gap-1.5 text-orange-400 text-xs hover:text-orange-300 transition-colors shrink-0">
            View on map<MapPin className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="py-10"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-gray-500" />
              {item.tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-gray-400 text-sm hover:border-orange-500/30 hover:text-orange-400 transition-colors cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comments */}
        <CommentSection checkInId={item.id} isPublic={item.isPublic} checkInOwnerId={item.user?.id} />

        {/* Back link + owner actions */}
        <div className="border-t border-white/8 pt-8 pb-4 flex items-center justify-between">
          <Link href="/gallery" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to gallery
          </Link>
          {isOwner && (
            <div className="flex items-center gap-2">
              {confirmDelete ? (
                <>
                  <span className="text-gray-400 text-sm">Delete this check-in?</span>
                  <button
                    onClick={async () => {
                      setDeleting(true)
                      await apiDeleteCheckIn(id)
                      router.push('/gallery')
                    }}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 rounded-xl bg-white/8 border border-white/15 text-gray-400 text-sm font-medium hover:bg-white/15 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/edit/${item.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 border border-white/15 text-gray-300 text-sm font-medium hover:bg-white/15 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 border border-white/15 text-gray-400 text-sm font-medium hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightboxIdx(null)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-gray-400 text-sm tabular-nums">
            {lightboxIdx + 1} / {item.images.length}
          </div>

          {/* Prev */}
          {lightboxIdx > 0 && (
            <button
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1) }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next */}
          {lightboxIdx < item.images.length - 1 && (
            <button
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1) }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={item.images[lightboxIdx]}
            alt={`${item.title} — ${lightboxIdx + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  )
}
