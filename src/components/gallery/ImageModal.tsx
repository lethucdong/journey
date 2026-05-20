'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, MapPin, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { type CheckIn } from '@/data/mock'
import MoodBadge from '@/components/ui/MoodBadge'

interface Props {
  item: CheckIn | null
  imageIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function ImageModal({ item, imageIndex, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    if (!item) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [item, onClose, onPrev, onNext])

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative z-10 w-full max-w-5xl mx-4 rounded-2xl overflow-hidden glass border border-white/10 flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image side */}
            <div className="relative md:w-3/5 aspect-[4/3] md:aspect-auto">
              <motion.img
                key={imageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={item.images[imageIndex] ?? item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Nav arrows */}
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={onPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Dots */}
              {item.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {item.images.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === imageIndex ? 'w-4 bg-orange-400' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info side */}
            <div className="md:w-2/5 p-6 flex flex-col overflow-y-auto">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4"><MoodBadge mood={item.mood} /></div>

              <h2 className="font-display text-2xl font-bold text-white mb-2">{item.title}</h2>

              <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
                <MapPin className="w-4 h-4 text-orange-400" />
                {item.location}, {item.country}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">{item.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {item.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-gray-400 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>

              <Link
                href={`/post/${item.id}`}
                className="mt-auto flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Read Full Story
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
