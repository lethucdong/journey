'use client'

import { motion } from 'framer-motion'
import { ImageUp, Sparkles, Globe } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: ImageUp,
    title: 'Drop a photo',
    desc: 'Upload any travel photo — from your camera roll, a DSLR, or a quick phone snap. Drag & drop or tap to select.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    glow: 'shadow-orange-500/10',
  },
  {
    num: '02',
    icon: Sparkles,
    title: 'AI reads it all',
    desc: 'Our vision AI detects the location, writes the title, crafts a description, and picks the right hashtags — instantly.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    glow: 'shadow-violet-500/10',
  },
  {
    num: '03',
    icon: Globe,
    title: 'Relive your world',
    desc: 'Every check-in pins to an interactive map. Browse by mood, date, or type. Share publicly or keep it private.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    glow: 'shadow-blue-500/10',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-orange-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">How it works</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Three steps to a lifetime<br className="hidden sm:block" /> of memories
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ num, icon: Icon, title, desc, color, bg, glow }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}
              className={`relative p-6 rounded-2xl border bg-white/2 shadow-xl ${glow} group hover:-translate-y-1 transition-transform duration-300`}
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              {/* Step number */}
              <span className="absolute top-5 right-5 font-display text-5xl font-bold text-white/4 select-none">{num}</span>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl border mb-5 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>

              <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>

              {/* Connector line (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-3 w-6 border-t border-dashed border-white/10 z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
