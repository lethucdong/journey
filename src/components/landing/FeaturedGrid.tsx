'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import { mockCheckIns } from '@/data/mock'
import MoodBadge from '@/components/ui/MoodBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// Large hero card
function HeroCard({ item }: { item: (typeof mockCheckIns)[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="md:row-span-2"
    >
      <Link href={`/post/${item.id}`} className="group block h-full">
        <div className="relative rounded-3xl overflow-hidden bg-surface img-hover h-full min-h-[400px] md:min-h-[560px]">
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <MoodBadge mood={item.mood} size="sm" />
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/10 border border-white/15 text-white backdrop-blur-sm capitalize">
              {item.type}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <MapPin className="w-3 h-3 text-orange-400" />
              {item.location}, {item.country}
              <span className="text-gray-600">·</span>
              <Calendar className="w-3 h-3" />
              {formatDate(item.date)}
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
              {item.title}
            </h3>
            <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed mb-4">{item.description}</p>
            <span className="inline-flex items-center gap-1.5 text-orange-400 text-xs font-medium group-hover:gap-2.5 transition-all">
              Read story <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Small card
function SmallCard({ item, index }: { item: (typeof mockCheckIns)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: 'easeOut' }}
    >
      <Link href={`/post/${item.id}`} className="group flex gap-4 p-4 rounded-2xl border border-white/6 hover:border-white/12 bg-white/2 hover:bg-white/4 transition-all">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 img-hover">
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <MoodBadge mood={item.mood} size="sm" showLabel={false} />
            <span className="text-gray-500 text-[10px] capitalize">{item.type}</span>
          </div>
          <h4 className="text-white text-sm font-semibold truncate group-hover:text-orange-400 transition-colors">{item.title}</h4>
          <div className="flex items-center gap-1 text-gray-500 text-[10px] mt-1">
            <MapPin className="w-2.5 h-2.5" />{item.location}, {item.country}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function FeaturedGrid() {
  const [hero, ...rest] = mockCheckIns.slice(0, 5)

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <p className="text-orange-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Featured journeys</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Roads worth taking</h2>
        </div>
        <Link href="/gallery"
          className="self-start sm:self-auto inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {/* Editorial grid — large left + list right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <HeroCard item={hero} />
        <div className="flex flex-col gap-4 justify-between">
          {rest.map((item, i) => (
            <SmallCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
