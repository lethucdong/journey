import { NextRequest } from 'next/server'
import { Mood, PlaceType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { ok, created, apiError, handleError } from '@/lib/api/response'
import { embed, vecStr, updateCheckInEmbeddings } from '@/lib/embedding'

const SELECT_PUBLIC = {
  id: true, title: true, location: true, country: true,
  lat: true, lng: true, date: true, mood: true, type: true,
  images: true, tags: true, isPublic: true, createdAt: true,
  user: { select: { id: true, username: true, displayName: true, avatar: true } },
} as const

const SELECT_MINE = {
  id: true, title: true, location: true, country: true,
  lat: true, lng: true, date: true, mood: true, type: true,
  images: true, tags: true, isPublic: true, createdAt: true,
} as const

// ─── GET /api/checkins ────────────────────────────────────────────────────────
// ?view=mine (default) — own check-ins
// ?view=public         — all public check-ins from every user
// ?view=public&userId= — public check-ins from a specific user
//
// When ?q= is provided, tries semantic vector search first (requires Ollama).
// Falls back to text search if Ollama is unavailable.

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req)
    const { searchParams } = new URL(req.url)

    const view   = searchParams.get('view') ?? 'mine'
    const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))
    const mood   = searchParams.get('mood') as Mood | null
    const type   = searchParams.get('type') as PlaceType | null
    const query  = searchParams.get('q')?.trim() ?? ''
    const userId = searchParams.get('userId')?.trim() ?? ''

    // ── Semantic (vector) search ──────────────────────────────────────────────
    if (query) {
      const queryVec = await embed(query).catch(() => null)
      if (queryVec) {
        const vs      = vecStr(queryVec)
        const skip    = (page - 1) * limit
        const moodSQL = mood && Object.values(Mood).includes(mood)
          ? Prisma.sql`AND mood = ${mood}::"Mood"` : Prisma.sql``
        const typeSQL = type && Object.values(PlaceType).includes(type)
          ? Prisma.sql`AND type = ${type}::"PlaceType"` : Prisma.sql``

        // Combined cosine distance: 60% title weight, 40% description weight.
        // Rows without embeddings default to distance 1.5 (ranked last).
        const scoreSQL = Prisma.sql`(
          COALESCE("titleEmbedding"       <=> ${vs}::vector, 1.5) * 0.6 +
          COALESCE("descriptionEmbedding" <=> ${vs}::vector, 1.5) * 0.4
        )`

        if (view === 'public') {
          const ownerSQL = userId
            ? Prisma.sql`"isPublic" = true AND "userId" = ${userId}`
            : Prisma.sql`"isPublic" = true`

          const [[{ count }], idRows] = await Promise.all([
            prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
              SELECT COUNT(*)::bigint AS count FROM "CheckIn"
              WHERE ${ownerSQL} ${moodSQL} ${typeSQL}
            `),
            prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
              SELECT id FROM "CheckIn"
              WHERE ${ownerSQL} ${moodSQL} ${typeSQL}
              ORDER BY ${scoreSQL} LIMIT ${limit} OFFSET ${skip}
            `),
          ])
          const ids = idRows.map(r => r.id)
          const raw = await prisma.checkIn.findMany({ where: { id: { in: ids } }, select: SELECT_PUBLIC })
          const checkIns = ids.flatMap(id => { const c = raw.find(x => x.id === id); return c ? [c] : [] })
          const total = Number(count)
          return ok({ checkIns, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total } })
        }

        // view === 'mine'
        const [[{ count }], idRows] = await Promise.all([
          prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
            SELECT COUNT(*)::bigint AS count FROM "CheckIn"
            WHERE "userId" = ${session.sub} ${moodSQL} ${typeSQL}
          `),
          prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
            SELECT id FROM "CheckIn"
            WHERE "userId" = ${session.sub} ${moodSQL} ${typeSQL}
            ORDER BY ${scoreSQL} LIMIT ${limit} OFFSET ${skip}
          `),
        ])
        const ids = idRows.map(r => r.id)
        const raw = await prisma.checkIn.findMany({ where: { id: { in: ids } }, select: SELECT_MINE })
        const checkIns = ids.flatMap(id => { const c = raw.find(x => x.id === id); return c ? [c] : [] })
        const total = Number(count)
        return ok({ checkIns, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total } })
      }
      // Ollama unavailable → fall through to text search
    }

    // ── Text search / no search ───────────────────────────────────────────────
    const textFilter = query ? {
      OR: [
        { title:    { contains: query, mode: 'insensitive' as const } },
        { location: { contains: query, mode: 'insensitive' as const } },
        { country:  { contains: query, mode: 'insensitive' as const } },
        { tags: { has: query.toLowerCase() } },
      ],
    } : {}

    const moodFilter = mood && Object.values(Mood).includes(mood) ? { mood } : {}
    const typeFilter = type && Object.values(PlaceType).includes(type) ? { type } : {}

    if (view === 'public') {
      const where = {
        isPublic: true,
        ...(userId && { userId }),
        ...moodFilter,
        ...typeFilter,
        ...textFilter,
      }

      const [total, checkIns] = await prisma.$transaction([
        prisma.checkIn.count({ where }),
        prisma.checkIn.findMany({
          where,
          orderBy: { date: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: SELECT_PUBLIC,
        }),
      ])

      return ok({ checkIns, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total } })
    }

    // view === 'mine'
    const where = {
      userId: session.sub,
      ...moodFilter,
      ...typeFilter,
      ...textFilter,
    }

    const [total, checkIns] = await prisma.$transaction([
      prisma.checkIn.count({ where }),
      prisma.checkIn.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: SELECT_MINE,
      }),
    ])

    return ok({ checkIns, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total } })
  } catch (err) {
    return handleError(err)
  }
}

// ─── POST /api/checkins ───────────────────────────────────────────────────────

const VALID_MOODS = Object.values(Mood)
const VALID_TYPES = Object.values(PlaceType)

function validateCreate(body: Record<string, unknown>): string | null {
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 2)
    return 'Title must be at least 2 characters'
  if (!body.location || typeof body.location !== 'string') return 'Location is required'
  if (!body.country  || typeof body.country  !== 'string') return 'Country is required'
  if (typeof body.lat !== 'number' || typeof body.lng !== 'number') return 'Coordinates (lat, lng) must be numbers'
  if (Math.abs(body.lat as number) > 90 || Math.abs(body.lng as number) > 180) return 'Invalid coordinates'
  if (!body.date || isNaN(Date.parse(body.date as string))) return 'Invalid date'
  if (!body.mood || !VALID_MOODS.includes(body.mood as Mood)) return `Mood must be one of: ${VALID_MOODS.join(', ')}`
  if (!body.type || !VALID_TYPES.includes(body.type as PlaceType)) return `Type must be one of: ${VALID_TYPES.join(', ')}`
  if (!Array.isArray(body.images)) return 'images must be an array'
  if (body.images.some((img: unknown) => typeof img !== 'string')) return 'All images must be URLs (strings)'
  return null
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req)
    const body = await req.json()

    const error = validateCreate(body)
    if (error) return apiError(error, 422)

    const title       = (body.title as string).trim()
    const description = typeof body.description === 'string' ? body.description.trim() : null

    const checkIn = await prisma.checkIn.create({
      data: {
        userId:      session.sub,
        title,
        description,
        story:       typeof body.story === 'string' ? body.story.trim() : null,
        location:    (body.location as string).trim(),
        country:     (body.country  as string).trim(),
        lat:         body.lat  as number,
        lng:         body.lng  as number,
        date:        new Date(body.date as string),
        mood:        body.mood as Mood,
        type:        body.type as PlaceType,
        images:      body.images as string[],
        isPublic:    body.isPublic === true,
        tags:        Array.isArray(body.tags)
                       ? (body.tags as unknown[]).filter((t): t is string => typeof t === 'string').map((t) => t.toLowerCase().trim())
                       : [],
      },
    })

    // Generate embeddings in background — non-blocking, best-effort
    updateCheckInEmbeddings(checkIn.id, title, description).catch(() => {})

    return created({ checkIn })
  } catch (err) {
    return handleError(err)
  }
}
