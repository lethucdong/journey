'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

function CountUp({ end, duration = 1.6 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

const STATS = [
  { value: 10,   suffix: '',  label: 'Countries explored' },
  { value: 34,   suffix: '+', label: 'Places checked in' },
  { value: 2800, suffix: '+', label: 'Photos captured' },
  { value: 100,  suffix: '%', label: 'Memories preserved' },
]

export default function Stats() {
  return (
    <section className="py-16 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-violet-500/5 border-y border-white/5" />

      <div className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
        {STATS.map(({ value, suffix, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center px-4"
          >
            <div className="font-display text-5xl md:text-6xl font-bold mb-1 leading-none">
              <CountUp end={value} />
              <span className="text-orange-400">{suffix}</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
