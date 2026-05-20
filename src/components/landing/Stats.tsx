'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Globe2, MapPin, Camera, Footprints } from 'lucide-react'

function CountUp({ end, duration = 1.5 }: { end: number; duration?: number }) {
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

  return <span ref={ref}>{count}</span>
}

const stats = [
  { icon: Footprints, label: 'Trips taken', value: 10, suffix: '' },
  { icon: Globe2, label: 'Countries visited', value: 10, suffix: '' },
  { icon: MapPin, label: 'Places checked in', value: 34, suffix: '+' },
  { icon: Camera, label: 'Photos captured', value: 2800, suffix: '+' },
]

export default function Stats() {
  return (
    <section className="py-16 px-6 border-y border-white/5">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ icon: Icon, label, value, suffix }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-3 mx-auto">
              <Icon className="w-5 h-5 text-orange-400" />
            </div>
            <div className="font-display text-4xl font-bold mb-1">
              <CountUp end={value} />
              <span className="text-orange-400">{suffix}</span>
            </div>
            <p className="text-gray-400 text-sm">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
