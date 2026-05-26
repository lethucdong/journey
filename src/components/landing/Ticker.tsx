'use client'

const PLACES = [
  'Ha Giang · Vietnam',
  'Bali · Indonesia',
  'Amalfi Coast · Italy',
  'Patagonia · Chile',
  'Kyoto · Japan',
  'Sahara · Morocco',
  'Santorini · Greece',
  'Banff · Canada',
  'Maldives',
  'Queenstown · New Zealand',
  'Cinque Terre · Italy',
  'Machu Picchu · Peru',
]

export default function Ticker() {
  const items = [...PLACES, ...PLACES]

  return (
    <div className="border-y border-white/5 py-4 overflow-hidden select-none bg-[#0d0d0d]">
      <div className="flex animate-ticker gap-0">
        {items.map((place, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="text-gray-500 text-xs tracking-[0.15em] uppercase px-6 whitespace-nowrap">{place}</span>
            <span className="text-orange-500/40 text-xs">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
