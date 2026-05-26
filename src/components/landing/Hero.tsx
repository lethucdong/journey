'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Map, ArrowDown, Compass, MapPin, Camera } from 'lucide-react'
import { MOODS } from '@/data/mock'

const FLOATING_CARDS = [
  {
    title: 'Ha Giang Loop',
    location: 'Ha Giang, Vietnam',
    mood: 'mustgo' as const,
    photos: 12,
    img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=400&q=80',
    cls: 'float-a',
    style: { top: '22%', left: '-6%', zIndex: 10 },
  },
  {
    title: 'Amalfi Coast Drive',
    location: 'Positano, Italy',
    mood: 'mustgo' as const,
    photos: 31,
    img: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=400&q=80',
    cls: 'float-b',
    style: { top: '18%', right: '-4%', zIndex: 10 },
  },
  {
    title: 'Tegalalang Terraces',
    location: 'Ubud, Bali',
    mood: 'amazing' as const,
    photos: 24,
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80',
    cls: 'float-c',
    style: { bottom: '22%', right: '-2%', zIndex: 10 },
  },
]

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y       = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">

      {/* Parallax background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2400&q=85"
          alt="Cinematic landscape"
          className="w-full h-[130%] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/70 via-[#0B0B0B]/30 to-[#0B0B0B]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/60 via-transparent to-[#0B0B0B]/40" />
      </motion.div>

      {/* Gradient orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb-pulse absolute w-[500px] h-[500px] rounded-full bg-orange-500/20 blur-[120px] -top-20 -left-20" />
        <div className="orb-pulse absolute w-[400px] h-[400px] rounded-full bg-violet-500/15 blur-[100px] bottom-0 right-10" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating preview cards — desktop only */}
      <div className="absolute inset-0 z-20 hidden xl:block pointer-events-none">
        {FLOATING_CARDS.map((card) => {
          const mood = MOODS[card.mood]
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.7, ease: 'easeOut' }}
              className={`absolute w-44 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#111827]/90 backdrop-blur-md ${card.cls}`}
              style={card.style}
            >
              <img src={card.img} alt={card.title} className="w-full aspect-[4/3] object-cover" />
              <div className="p-2.5 space-y-1.5">
                <p className="text-white text-xs font-semibold truncate leading-tight">{card.title}</p>
                <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                  <MapPin className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                  <span className="truncate">{card.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${mood.bg} ${mood.text} border ${mood.border}`}>
                    {mood.emoji} {mood.label}
                  </span>
                  <span className="flex items-center gap-0.5 text-gray-500 text-[10px]">
                    <Camera className="w-2.5 h-2.5" />{card.photos}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Main content */}
      <motion.div style={{ opacity }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full glass border border-orange-500/25 text-orange-400 text-sm font-medium"
        >
          <Compass className="w-3.5 h-3.5" />
          AI-powered travel journal · Free to use
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[0.92] tracking-tight mb-6"
        >
          Every journey
          <br />
          <span className="text-gradient">deserves a story.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Drop a photo — AI reads the location, writes the title, description and hashtags.
          Your travel journal, beautifully archived.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/create"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-orange-500/30 text-sm"
          >
            Start your journal
          </Link>
          <Link
            href="/map"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl glass border border-white/12 text-white font-semibold transition-all hover:border-white/25 hover:scale-[1.03] active:scale-[0.97] text-sm"
          >
            <Map className="w-4 h-4" />
            Explore the map
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-gray-500"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  )
}
