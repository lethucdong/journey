import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { ok, apiError, handleError } from '@/lib/api/response'

// GET /api/users/lookup?email=friend@example.com
// Returns basic public profile — no sensitive fields.
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)

    const email = new URL(req.url).searchParams.get('email')?.trim().toLowerCase()
    if (!email) return apiError('email is required', 422)

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, username: true, displayName: true, avatar: true },
    })

    if (!user) return apiError('User not found', 404)

    return ok({ user })
  } catch (err) {
    return handleError(err)
  }
}
