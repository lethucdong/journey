import { NextRequest, NextResponse } from 'next/server'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: Record<string, string>
}

// Thứ tự ưu tiên lấy tên địa danh từ address object của Nominatim
const LOCALITY_KEYS = [
  'city', 'town', 'village', 'suburb', 'municipality',
  'city_district', 'district', 'historic', 'county', 'state',
]

function extractLocality(address: Record<string, string>): string {
  for (const key of LOCALITY_KEYS) {
    if (address[key]) return address[key]
  }
  return ''
}

// GET /api/locations/resolve?q=Ha+Giang+Vietnam
export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ success: false, error: 'Query quá ngắn' }, { status: 422 })
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', q)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '6')
    url.searchParams.set('addressdetails', '1')

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'PhotoJourney/1.0 (travel journal app)',
        'Accept-Language': 'vi,en',
      },
      next: { revalidate: 3600 }, // cache 1 giờ
    })

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Lỗi Nominatim' }, { status: 502 })
    }

    const data: NominatimResult[] = await res.json()

    const results = data.map((r) => {
      const locality = extractLocality(r.address)
      const country  = r.address.country ?? ''
      return {
        place_id:     r.place_id,
        display_name: r.display_name,
        lat:          r.lat,
        lon:          r.lon,
        locality,
        country,
        address: r.address,
      }
    })

    return NextResponse.json({ success: true, data: results })
  } catch {
    return NextResponse.json({ success: false, error: 'Không thể tìm địa điểm' }, { status: 500 })
  }
}
