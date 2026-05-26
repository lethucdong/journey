'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Sparkles, Map, EyeOff, Images, Smartphone } from 'lucide-react'

const CARD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number) => ({ opacity: 1, y: 0, transition: { delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

export default function FeaturesBento() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div variants={CARD_VARIANTS} initial="hidden" whileInView="visible" custom={0} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-orange-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Features</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Built for the way<br className="hidden sm:block" /> you actually travel
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* AI auto-fill — big */}
          <motion.div variants={CARD_VARIANTS} initial="hidden" whileInView="visible" custom={0.05} viewport={{ once: true, margin: '-40px' }}
            className="md:col-span-2 relative rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#1a1128] to-[#111827] p-7 group min-h-[280px] flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-500/25 mb-4">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">AI does the writing</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Drop a photo — our vision model detects the location, writes a title, crafts a story, suggests hashtags, and even picks your mood. One tap, full journal entry.
              </p>
            </div>
            {/* Fake AI output preview */}
            <div className="mt-6 p-4 rounded-xl bg-white/4 border border-white/8 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-violet-400 shrink-0" />
                <span className="text-xs text-violet-300 font-medium">AI suggestion</span>
              </div>
              <p className="text-white text-sm font-semibold">Dawn at Ma Pi Leng Pass</p>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                Standing at 1,500m above the Nho Que River, the fog rolls in from the valley floor as golden light breaks across the karst peaks…
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {['#hagiang', '#vietnam', '#mountain', '#adventure'].map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">{t}</span>
                ))}
              </div>
            </div>
            {/* Glow */}
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
          </motion.div>

          {/* Map */}
          <motion.div variants={CARD_VARIANTS} initial="hidden" whileInView="visible" custom={0.1} viewport={{ once: true, margin: '-40px' }}
            className="relative rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#0f1a24] to-[#111827] p-7 group min-h-[280px] flex flex-col"
          >
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/25 mb-4">
              <Map className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">Your world, pinned</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every check-in drops a pin. See your entire travel history on one interactive globe.
            </p>
            {/* Map dots preview */}
            <div className="mt-auto pt-6 relative h-24">
              {[
                { top: '10%', left: '20%', size: 'w-2 h-2', delay: '0s' },
                { top: '30%', left: '55%', size: 'w-3 h-3', delay: '0.3s' },
                { top: '60%', left: '35%', size: 'w-2 h-2', delay: '0.6s' },
                { top: '20%', left: '75%', size: 'w-2.5 h-2.5', delay: '0.9s' },
                { top: '70%', left: '70%', size: 'w-2 h-2', delay: '1.2s' },
              ].map((dot, i) => (
                <div key={i} className={`absolute ${dot.size} rounded-full bg-orange-400`}
                  style={{ top: dot.top, left: dot.left, boxShadow: '0 0 8px #f97316', animation: `orb-pulse 3s ease-in-out ${dot.delay} infinite` }} />
              ))}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(96,165,250,0.05)_0%,transparent_70%)]" />
            </div>
            <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />
          </motion.div>

          {/* Private */}
          <motion.div variants={CARD_VARIANTS} initial="hidden" whileInView="visible" custom={0.15} viewport={{ once: true, margin: '-40px' }}
            className="relative rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#111520] to-[#111827] p-7 group"
          >
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gray-500/15 border border-gray-500/25 mb-4">
              <EyeOff className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Private by default</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your journal is yours alone. Toggle individual check-ins public when you're ready to share.
            </p>
          </motion.div>

          {/* Gallery */}
          <motion.div variants={CARD_VARIANTS} initial="hidden" whileInView="visible" custom={0.2} viewport={{ once: true, margin: '-40px' }}
            className="relative rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#101820] to-[#111827] p-7 group"
          >
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 mb-4">
              <Images className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Visual archive</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Masonry gallery of every photo, filterable by mood, type, and destination.
            </p>
            {/* Mini photo grid */}
            <div className="mt-4 grid grid-cols-3 gap-1.5">
              {[
                'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=120&q=70',
                'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=120&q=70',
                'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=120&q=70',
              ].map((src, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover opacity-70" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Mobile */}
          <motion.div variants={CARD_VARIANTS} initial="hidden" whileInView="visible" custom={0.25} viewport={{ once: true, margin: '-40px' }}
            className="relative rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#1a1510] to-[#111827] p-7 group"
          >
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/25 mb-4">
              <Smartphone className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Works everywhere</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fully responsive. Check in right after landing, from any device, anywhere in the world.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
