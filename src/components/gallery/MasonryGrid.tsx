'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { type ApiCheckIn } from '@/lib/api/client'
import { MOODS } from '@/data/mock'
import MoodBadge from '@/components/ui/MoodBadge'
import ImageModal from './ImageModal'

// Shape that ImageModal still expects (subset of CheckIn)
type ModalItem = {
  id: string
  title: string
  location: string
  country: string
  mood: string
  images: string[]
  description?: string | null
  tags: string[]
}

interface Props {
  checkIns: ApiCheckIn[]
}

export default function MasonryGrid({ checkIns }: Props) {
  const [selected, setSelected] = useState<{ item: ModalItem; imgIndex: number } | null>(null)

  const allImages = checkIns.flatMap((item) =>
    item.images.map((src, imgIndex) => ({ src, item, imgIndex }))
  )

  const handlePrev = () => {
    if (!selected) return
    const cur = allImages.findIndex((x) => x.item.id === selected.item.id && x.imgIndex === selected.imgIndex)
    const prev = allImages[(cur - 1 + allImages.length) % allImages.length]
    setSelected({ item: prev.item, imgIndex: prev.imgIndex })
  }

  const handleNext = () => {
    if (!selected) return
    const cur = allImages.findIndex((x) => x.item.id === selected.item.id && x.imgIndex === selected.imgIndex)
    const next = allImages[(cur + 1) % allImages.length]
    setSelected({ item: next.item, imgIndex: next.imgIndex })
  }

  if (allImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <MapPin className="w-7 h-7 text-gray-600" />
        </div>
        <p className="text-gray-400 font-medium mb-1">No photos yet</p>
        <p className="text-gray-600 text-sm">Add check-ins with photos to fill your archive</p>
      </div>
    )
  }

  return (
    <>
      <div className="masonry-grid">
        {allImages.map(({ src, item, imgIndex }, i) => (
          <motion.div
            key={`${item.id}-${imgIndex}`}
            className="masonry-item"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: (i % 4) * 0.07, duration: 0.5 }}
          >
            <button
              onClick={() => setSelected({ item, imgIndex })}
              className="group relative w-full rounded-2xl overflow-hidden bg-surface block cursor-zoom-in"
            >
              <img
                src={src}
                alt={item.title}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h3 className="font-display font-bold text-white text-sm mb-1 line-clamp-1">{item.title}</h3>
                <div className="flex items-center gap-1 text-gray-300 text-xs">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  {item.location}
                </div>
              </div>

              <div className="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <MoodBadge mood={item.mood as any} size="sm" showLabel={false} />
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <ImageModal
        item={selected?.item as any ?? null}
        imageIndex={selected?.imgIndex ?? 0}
        onClose={() => setSelected(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  )
}
