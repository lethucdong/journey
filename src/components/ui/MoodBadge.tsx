'use client'

import { MOODS, type Mood } from '@/data/mock'

interface MoodBadgeProps {
  mood: Mood
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function MoodBadge({ mood, size = 'md', showLabel = true }: MoodBadgeProps) {
  const m = MOODS[mood]
  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  }
  const emojiSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${m.bg} ${m.text} ${m.border} ${sizes[size]}`}
    >
      <span className={emojiSizes[size]}>{m.emoji}</span>
      {showLabel && <span>{m.label}</span>}
    </span>
  )
}
