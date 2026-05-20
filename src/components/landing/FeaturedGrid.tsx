'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'
import { mockCheckIns } from '@/data/mock'
import MoodBadge from '@/components/ui/MoodBadge'

const featured = mockCheckIns.slice(0, 6)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function JourneyCard({ item, index }: { item: (typeof mockCheckIns)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
    >
      <Link href={`/post/${item.id}`} className="group block">
        <div className="relative rounded-2xl overflow-hidden bg-surface img-hover aspect-[4/3]">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          {/* Hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          {/* Mood badge */}
          <div className="absolute top-3 right-3">
            <MoodBadge mood={item.mood} size="sm" showLabel={false} />
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-display text-lg font-bold text-white mb-1 line-clamp-1">
              {item.title}
            </h3>
            <div className="flex items-center gap-3 text-gray-300 text-xs">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-400" />
                {item.location}, {item.country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(item.date)}
              </span>
            </div>
          </div>

          {/* View overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="px-4 py-2 rounded-full glass text-white text-xs font-medium border border-white/20">
              Read Story
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function FeaturedGrid() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">
            Featured Journeys
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Roads worth taking
          </h2>
        </div>
        <Link
          href="/gallery"
          className="self-start sm:self-auto text-sm text-gray-400 hover:text-white transition-colors border-b border-gray-700 hover:border-orange-500 pb-0.5"
        >
          View all →
        </Link>
      </motion.div>

      {/* Grid — 3 col desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {featured.map((item, i) => (
          <JourneyCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}
