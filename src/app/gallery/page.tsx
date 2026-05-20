'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiGetCheckIns, type ApiCheckIn } from '@/lib/api/client'
import MasonryGrid from '@/components/gallery/MasonryGrid'

export default function GalleryPage() {
  const { isAuthenticated, isLoading: authLoading, openAuthModal } = useAuth()
  const [checkIns, setCheckIns] = useState<ApiCheckIn[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    setLoading(true)
    apiGetCheckIns({ limit: 50 }).then((res) => {
      if (res.ok) setCheckIns(res.data.checkIns)
      setLoading(false)
    })
  }, [isAuthenticated])

  return (
    <div className="pt-20 pb-24 md:pb-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">
            Photography
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
            The Archive
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Every frame a memory. Every photo a door back to the exact moment it was taken.
          </p>
        </motion.div>

        {authLoading || loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
          </div>
        ) : !isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-2">
              <ImageIcon className="w-7 h-7 text-orange-400" />
            </div>
            <h2 className="font-display text-xl font-bold">Your Photo Archive</h2>
            <p className="text-gray-400 max-w-sm text-sm">Sign in to view all your travel photos in a cinematic gallery.</p>
            <button
              onClick={() => openAuthModal('login')}
              className="mt-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-colors"
            >
              Sign in to view photos
            </button>
          </div>
        ) : (
          <MasonryGrid checkIns={checkIns} />
        )}
      </div>
    </div>
  )
}
