'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'

export default function LandingCTA() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/4 to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-orange-500/8 blur-[100px] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-orange-400 text-xs font-semibold tracking-[0.2em] uppercase mb-5">Start today</p>

          <h2 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] mb-6">
            Ready to document<br />
            <span className="text-gradient">your next adventure?</span>
          </h2>

          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Free to use. No credit card. Just your memories,<br className="hidden sm:block" />
            beautifully preserved for a lifetime.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/create"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] shadow-2xl shadow-orange-500/25 text-sm"
            >
              Create your first check-in
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/gallery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border border-white/10 text-gray-300 hover:text-white hover:border-white/20 font-medium transition-all text-sm"
            >
              Browse the gallery
            </Link>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-gray-600 text-xs">
            <Lock className="w-3 h-3" />
            Private by default · Your data stays yours
          </p>
        </motion.div>
      </div>
    </section>
  )
}
