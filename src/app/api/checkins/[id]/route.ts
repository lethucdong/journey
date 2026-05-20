import { NextRequest } from 'next/server'
import { Mood, PlaceType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { ok, noContent, apiError, handleError } from '@/lib/api/response'
import { updateCheckInEmbeddings } from '@/lib/embedding'

// ─── Ownership check helper ───────────────────────────────────────────────────

async function getOwnedCheckIn(id: string, userId: string) {
  const checkIn = await prisma.checkIn.findUnique({ where: { id } })
  if (!checkIn) return { checkIn: null, error: apiError('Check-in not found', 404) }
  if (checkIn.userId !== userId) return { checkIn: null, error: apiError('Forbidden', 403) }
  return { checkIn, error: null }
}

// ─── GET /api/checkins/:id ────────────────────────────────────────────────────
// Owner sees all fields. Others can view if isPublic = true.

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req)
    const { id } = await params

    const checkIn = await prisma.checkIn.findUnique({
      where: { id },
      include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
    })
    if (!checkIn) return apiError('Check-in not found', 404)

    const isOwner = checkIn.userId === session.sub
    if (!isOwner && !checkIn.isPublic) return apiError('Forbidden', 403)

    return ok({ checkIn, isOwner })
  } catch (err) {
    return handleError(err)
  }
}

// ─── PUT /api/checkins/:id — Full or partial update ───────────────────────────

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req)
    const { id } = await params
    const { checkIn, error } = await getOwnedCheckIn(id, session.sub)
    if (error) return error

    const body = await req.json()
    const VALID_MOODS = Object.values(Mood)
    const VALID_TYPES = Object.values(PlaceType)

    const data: Record<string, unknown> = {}

    if (typeof body.title === 'string' && body.title.trim().length >= 2)
      data.title = body.title.trim()

    if (typeof body.description === 'string')
      data.description = body.description.trim() || null

    if (typeof body.story === 'string')
      data.story = body.story.trim() || null

    if (typeof body.location === 'string' && body.location.trim())
      data.location = body.location.trim()

    if (typeof body.country === 'string' && body.country.trim())
      data.country = body.country.trim()

    if (typeof body.lat === 'number' && Math.abs(body.lat) <= 90)
      data.lat = body.lat

    if (typeof body.lng === 'number' && Math.abs(body.lng) <= 180)
      data.lng = body.lng

    if (body.date && !isNaN(Date.parse(body.date)))
      data.date = new Date(body.date)

    if (body.mood && VALID_MOODS.includes(body.mood))
      data.mood = body.mood

    if (body.type && VALID_TYPES.includes(body.type))
      data.type = body.type

    if (Array.isArray(body.images) && body.images.every((i: unknown) => typeof i === 'string'))
      data.images = body.images

    if (Array.isArray(body.tags))
      data.tags = body.tags.filter((t: unknown): t is string => typeof t === 'string').map((t: string) => t.toLowerCase().trim())

    if (typeof body.isPublic === 'boolean')
      data.isPublic = body.isPublic

    if (typeof body.commentsEnabled === 'boolean')
      data.commentsEnabled = body.commentsEnabled

    if (Object.keys(data).length === 0)
      return apiError('No valid fields to update', 422)

    const updated = await prisma.checkIn.update({ where: { id: checkIn!.id }, data })

    // Regenerate embeddings in background if text content changed
    if (data.title !== undefined || data.description !== undefined) {
      updateCheckInEmbeddings(updated.id, updated.title, updated.description ?? null).catch(() => {})
    }

    return ok({ checkIn: updated })
  } catch (err) {
    return handleError(err)
  }
}

// ─── DELETE /api/checkins/:id ─────────────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req)
    const { id } = await params
    const { error } = await getOwnedCheckIn(id, session.sub)
    if (error) return error

    await prisma.checkIn.delete({ where: { id } })
    return noContent()
  } catch (err) {
    return handleError(err)
  }
}
