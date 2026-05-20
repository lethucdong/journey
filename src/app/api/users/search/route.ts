import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { ok, apiError, handleError } from '@/lib/api/response'

// GET /api/users/search?q=localpart
// Matches users whose email local-part (before @) starts with q.
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)

    const q = new URL(req.url).searchParams.get('q')?.trim() ?? ''
    if (!q) return apiError('q is required', 422)

    const users = await prisma.user.findMany({
      where: { email: { startsWith: q, mode: 'insensitive' } },
      select: { id: true, username: true, displayName: true, avatar: true },
      take: 5,
    })

    return ok({ users })
  } catch (err) {
    return handleError(err)
  }
}
