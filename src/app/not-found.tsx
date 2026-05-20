'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Compass, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      {/* Animated compass */}
      <motion.div
        animate={{ rotate: [0, 15, -10, 20, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        className="mb-8 w-24 h-24 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"
      >
        <Compass className="w-10 h-10 text-orange-400" />
      </motion.div>

      {/* 404 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">Lost in transit</p>
        <h1 className="font-display text-8xl font-bold text-white mb-4 leading-none">404</h1>
        <p className="text-gray-400 text-lg max-w-sm mx-auto mb-10">
          This destination doesn&apos;t exist on the map. Maybe it was never checked in.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-colors shadow-lg shadow-orange-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/8 hover:bg-white/12 text-white font-medium text-sm transition-colors"
        >
          <MapPin className="w-4 h-4 text-orange-400" />
          View the map
        </Link>
      </motion.div>

    </div>
  )
}
