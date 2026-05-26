import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { ok, apiError, handleError } from '@/lib/api/response'
import { verifyPassword, hashPassword } from '@/lib/auth/password'

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req)
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) return apiError('Both passwords required', 422)
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return apiError('New password must be at least 8 characters', 422)
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { passwordHash: true },
    })
    if (!user) return apiError('User not found', 404)

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) return apiError('Current password is incorrect', 401)

    const newHash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: session.sub }, data: { passwordHash: newHash } })

    return ok({ message: 'Password updated' })
  } catch (err) {
    return handleError(err)
  }
}
