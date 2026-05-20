export type Mood = 'terrible' | 'normal' | 'beautiful' | 'amazing' | 'mustgo'
export type PlaceType = 'mountain' | 'beach' | 'camping' | 'cafe' | 'roadtrip' | 'adventure'

export interface CheckIn {
  id: string
  title: string
  location: string
  country: string
  coordinates: [number, number]
  date: string
  mood: Mood
  description: string
  story: string
  images: string[]
  tags: string[]
  type: PlaceType
}

export const MOODS: Record<Mood, { label: string; emoji: string; color: string; bg: string; text: string; border: string }> = {
  terrible: { label: 'Terrible', emoji: '😭', color: '#EF4444', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  normal:   { label: 'Normal',   emoji: '😐', color: '#9CA3AF', bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  beautiful:{ label: 'Beautiful',emoji: '😊', color: '#60A5FA', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  amazing:  { label: 'Amazing',  emoji: '🤩', color: '#A78BFA', bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
  mustgo:   { label: 'Must-go',  emoji: '🔥', color: '#F97316', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
}

export const mockCheckIns: CheckIn[] = [
  {
    id: '1',
    title: 'Ha Giang Loop',
    location: 'Ha Giang',
    country: 'Vietnam',
    coordinates: [23.0825, 105.0678],
    date: '2024-03-15',
    mood: 'mustgo',
    description: 'The most breathtaking mountain roads I\'ve ever ridden. Endless switchbacks, karst peaks, and clouds at 2000m.',
    story: 'Four days on a semi-automatic motorbike through northern Vietnam\'s most remote corner. The Dong Van Karst Plateau Geopark stretches endlessly — layer after layer of limestone peaks disappearing into morning fog. I stopped the bike at Ma Pi Leng Pass and stood at the edge for twenty minutes, not thinking, just breathing. H\'Mong villages cling to hillsides with vegetable gardens shaped like terraced steps. Children run barefoot on dirt paths. An old woman in traditional indigo dress waves from a doorway. This is why I travel. Not for Instagram. For these moments that press themselves permanently into your chest.',
    images: [
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    ],
    tags: ['motorbike', 'mountains', 'loop', 'vietnam', 'adventure', 'remote'],
    type: 'mountain',
  },
  {
    id: '2',
    title: 'Tegalalang Rice Terraces',
    location: 'Ubud, Bali',
    country: 'Indonesia',
    coordinates: [-8.4314, 115.2770],
    date: '2024-01-22',
    mood: 'amazing',
    description: 'Morning mist curling over a thousand-year-old Subak irrigation system. Pure Bali magic.',
    story: 'Arrived before sunrise and found myself completely alone on the ridge. As the light changed from purple to gold, the terraces caught each new colour differently. A Balinese farmer named Made showed up with a machete and a thermos of black coffee. He didn\'t speak much English. I didn\'t speak Balinese. We stood side by side watching the sun rise and shared the coffee. His family has farmed this same land for seventeen generations. He pointed at me, then at the rice, then gave a thumbs up. I understood perfectly.',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1600&q=80',
    ],
    tags: ['bali', 'terraces', 'sunrise', 'rice', 'culture', 'indonesia'],
    type: 'mountain',
  },
  {
    id: '3',
    title: 'Amalfi Coast Drive',
    location: 'Positano',
    country: 'Italy',
    coordinates: [40.6281, 14.4850],
    date: '2023-09-08',
    mood: 'mustgo',
    description: 'Cliffside villages, impossible roads, and the most electric blue sea I\'ve ever seen.',
    story: 'Rented a Vespa in Naples and rode the SS163 for three consecutive days. The road is equal parts terrifying and magnificent — it hugs cliffs 200 meters above the Tyrrhenian Sea with no guardrails and local buses taking hairpin corners at full speed. In Ravello I sat in the Villa Cimbrone gardens and looked out at the Belvedere of Infinity. Lemons the size of grapefruit hang from every trellis. The food is obscenely good. Even the petrol station had incredible espresso.',
    images: [
      'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=1600&q=80',
    ],
    tags: ['italy', 'vespa', 'coast', 'amalfi', 'roadtrip', 'mediterranean'],
    type: 'roadtrip',
  },
  {
    id: '4',
    title: 'Torres del Paine',
    location: 'Patagonia',
    country: 'Chile',
    coordinates: [-51.0000, -73.0000],
    date: '2023-12-01',
    mood: 'amazing',
    description: 'Camping at the foot of granite towers in the windiest place on earth. Raw, brutal, unforgettable.',
    story: 'The W Trek took five days. On day three the weather broke and the Towers appeared through clouds for exactly forty-seven minutes before disappearing again. I know it was forty-seven minutes because I sat perfectly still the entire time, watching, afraid that if I moved they would vanish. Glacial lakes of impossible turquoise. Condors riding thermals overhead. Wind so strong you have to lean into it at 30 degrees just to walk. At night in the tent, the sound of calving glaciers echoed across the valley like distant thunder. Patagonia doesn\'t care whether you\'re there or not. That\'s exactly why it\'s perfect.',
    images: [
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
    ],
    tags: ['patagonia', 'camping', 'trek', 'chile', 'mountains', 'wild'],
    type: 'camping',
  },
  {
    id: '5',
    title: 'Arashiyama Bamboo Grove',
    location: 'Kyoto',
    country: 'Japan',
    coordinates: [35.0094, 135.6717],
    date: '2024-04-03',
    mood: 'beautiful',
    description: 'Walked through a cathedral of bamboo at dawn. The sound of wind through stalks is unlike anything else.',
    story: 'I arrived at 5:30am in early April, before the tour groups. For about twenty minutes I had the entire grove to myself. The bamboo towers thirty meters overhead, close-packed enough to filter all direct sunlight into a diffuse green glow. The sound is the thing — a dry, papery rustling that builds as the wind increases, like thousands of pages turning at once. Found a tiny tofu restaurant down a side alley afterward and had the best breakfast of my life: silken tofu in dashi broth, pickled plum, and green tea. ¥600. Walked back through sakura petals falling like slow snow.',
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=1600&q=80',
    ],
    tags: ['japan', 'kyoto', 'bamboo', 'dawn', 'culture', 'sakura'],
    type: 'cafe',
  },
  {
    id: '6',
    title: 'Sahara Desert Camp',
    location: 'Merzouga, Erg Chebbi',
    country: 'Morocco',
    coordinates: [31.0800, -4.0130],
    date: '2023-11-14',
    mood: 'amazing',
    description: 'Slept under 100 billion stars in the silence of the Sahara. The largest desert on earth, distilled into one perfect night.',
    story: 'Camel trekked two hours into the dunes at sunset, reached the camp just as the last light went. No electricity. No phone signal. No noise except wind. Ate tagine by firelight with a Berber guide named Hassan who had crossed the Sahara six times on foot. He showed me how to navigate by the stars. Slept in a traditional tent on carpets. Woke at 3am to step outside: the Milky Way was so bright it cast a faint shadow. In the morning, I climbed a 150m dune to watch the sun come up over Algeria. The rippled sand goes to every horizon. Utterly humbling.',
    images: [
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    ],
    tags: ['sahara', 'desert', 'camping', 'stars', 'morocco', 'camel'],
    type: 'camping',
  },
  {
    id: '7',
    title: 'Mui Ne Sand Dunes',
    location: 'Mui Ne',
    country: 'Vietnam',
    coordinates: [10.9430, 108.2860],
    date: '2024-02-10',
    mood: 'beautiful',
    description: 'Red dunes at golden hour, followed by a seafood feast and the most vivid sunset of the trip.',
    story: 'Rented a quad bike and rode the Red Dunes as the sun dropped. The sand shifts from burnt sienna to deep crimson as the light changes. Ran down the white dunes barefoot — the sand is powdery fine and cool despite the heat. Found a beach shack serving grilled clams with lemongrass and beer for about $3. The owner\'s daughter, maybe six years old, practiced her English numbers by counting the clam shells on my plate. Left with sand in every pocket and couldn\'t have cared less.',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1600&q=80',
    ],
    tags: ['vietnam', 'dunes', 'beach', 'roadtrip', 'sunset', 'seafood'],
    type: 'beach',
  },
  {
    id: '8',
    title: 'Phong Nha Cave',
    location: 'Quảng Bình',
    country: 'Vietnam',
    coordinates: [17.5833, 106.2833],
    date: '2024-02-18',
    mood: 'mustgo',
    description: 'Kayaked into a cave system so large it has its own weather. Darkness, silence, and ancient limestone.',
    story: 'Paddled a kayak through the mouth of Phong Nha cave as a rainstorm began outside. Inside: total silence except for water dripping and the echo of our paddles. The cave roof soars 100 meters overhead. Stalactites that took 100 million years to form hang like frozen chandeliers. Our headlamps only lit a small circle — everything beyond was absolute black. At one point the guide turned off all lights. Three seconds of the most complete darkness I\'ve ever experienced. Then everyone started laughing nervously. That shared laughter in total darkness with strangers is one of my favourite travel memories.',
    images: [
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1504567961542-e24d9439a724?auto=format&fit=crop&w=1600&q=80',
    ],
    tags: ['cave', 'kayak', 'vietnam', 'adventure', 'underground', 'phong-nha'],
    type: 'adventure',
  },
  {
    id: '9',
    title: 'Santorini Caldera Sunset',
    location: 'Oia, Santorini',
    country: 'Greece',
    coordinates: [36.4618, 25.3753],
    date: '2023-08-21',
    mood: 'amazing',
    description: 'The cliché is completely earned. The most cinematic sunset on the planet.',
    story: 'Every travel photographer has shot this sunset. That doesn\'t make it less extraordinary. The caldera is the submerged crater of a volcano that erupted 3,600 years ago — the same eruption that may have inspired the Atlantis myth. Standing on the white-domed rooftops of Oia at 8pm, the whole town facing west, hundreds of people holding their breath simultaneously as the sun touches the horizon. The light turns everything gold, then apricot, then deep amber. The sea is perfectly still. Someone nearby started clapping and everyone joined in. Applauding a sunset. Fully rational response.',
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80',
    ],
    tags: ['greece', 'santorini', 'sunset', 'caldera', 'island', 'aegean'],
    type: 'beach',
  },
  {
    id: '10',
    title: 'Scottish Highlands Road',
    location: 'Glencoe, Scotland',
    country: 'United Kingdom',
    coordinates: [56.6800, -5.0000],
    date: '2023-07-05',
    mood: 'beautiful',
    description: 'Three days driving the A82 through moody glens, lochs, and mist that turns ordinary mountains into myth.',
    story: 'Hired a campervan in Glasgow and drove north. The weather was typically Scottish — four seasons in a single afternoon. Glencoe stopped me cold: the valley is so dramatic, so abruptly vertical, that it feels like you\'ve driven into a film set. Parked the van at the Three Sisters viewpoint at dusk. Low clouds dragged through the ridgelines. A stag appeared on the hillside above and stood completely still for a long moment, then walked slowly back into the heather. Found a pub in Ballachulish that served cullen skink and live folk music on a Tuesday night. Scotland does remoteness better than anywhere.',
    images: [
      'https://images.unsplash.com/photo-1499678329028-101435549a4e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80',
    ],
    tags: ['scotland', 'highlands', 'campervan', 'roadtrip', 'glencoe', 'moody'],
    type: 'roadtrip',
  },
]
