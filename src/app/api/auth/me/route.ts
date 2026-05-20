import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { ok, apiError, handleError } from '@/lib/api/response'

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req)

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: { select: { checkIns: true } },
      },
    })

    if (!user) return apiError('User not found', 404)
    return ok({ user })
  } catch (err) {
    return handleError(err)
  }
}

// ─── PATCH /api/auth/me — Update profile ──────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth(req)
    const body = await req.json()

    type AllowedField = 'displayName' | 'bio' | 'avatar'
    const allowed: AllowedField[] = ['displayName', 'bio', 'avatar']
    const updates: Partial<Record<AllowedField, string>> = {}

    for (const field of allowed) {
      if (typeof body[field] === 'string') {
        updates[field] = body[field].trim()
      }
    }

    if (Object.keys(updates).length === 0) {
      return apiError('No valid fields to update', 422)
    }

    const user = await prisma.user.update({
      where: { id: session.sub },
      data: updates,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        updatedAt: true,
      },
    })

    return ok({ user })
  } catch (err) {
    return handleError(err)
  }
}
