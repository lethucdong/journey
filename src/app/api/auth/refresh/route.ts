import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAccessToken } from '@/lib/auth/jwt'
import { generateRefreshToken, hashRefreshToken, refreshTokenExpiresAt } from '@/lib/auth/token'
import {
  ok,
  apiError,
  handleError,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '@/lib/api/response'

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
// Refresh token rotation: old token is deleted, new token is issued

export async function POST(req: NextRequest) {
  try {
    const rawRefresh = req.cookies.get('refresh_token')?.value
    if (!rawRefresh) return apiError('No refresh token', 401)

    const tokenHash = hashRefreshToken(rawRefresh)

    // Find and validate stored token
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, email: true, username: true, displayName: true, avatar: true },
        },
      },
    })

    if (!stored) return apiError('Invalid refresh token', 401)
    if (stored.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { tokenHash } })
      return apiError('Refresh token expired', 401)
    }

    // Rotate: update token hash in-place (single statement, safe with PgBouncer)
    const newRawRefresh = generateRefreshToken()
    await prisma.refreshToken.update({
      where: { tokenHash },
      data: {
        tokenHash: hashRefreshToken(newRawRefresh),
        expiresAt: refreshTokenExpiresAt(),
      },
    })

    const newAccessToken = await signAccessToken({
      sub: stored.user.id,
      email: stored.user.email,
      username: stored.user.username,
    })

    const res = ok({ user: stored.user, accessToken: newAccessToken })
    setAccessTokenCookie(res, newAccessToken)
    setRefreshTokenCookie(res, newRawRefresh)
    return res
  } catch (err) {
    return handleError(err)
  }
}
