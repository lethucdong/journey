import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { signAccessToken } from '@/lib/auth/jwt'
import { generateRefreshToken, hashRefreshToken, refreshTokenExpiresAt } from '@/lib/auth/token'
import {
  ok,
  apiError,
  handleError,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '@/lib/api/response'

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !password) {
      return apiError('Email and password are required', 422)
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        passwordHash: true,
        createdAt: true,
      },
    })

    // Constant-time comparison: always verify even if user not found
    const passwordMatch = user
      ? await verifyPassword(password, user.passwordHash)
      : await verifyPassword(password, '$2a$12$invalid.hash.to.prevent.timing.attack')

    if (!user || !passwordMatch) {
      return apiError('Invalid email or password', 401)
    }

    // Issue tokens
    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    })

    const rawRefresh = generateRefreshToken()
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(rawRefresh),
        userId: user.id,
        expiresAt: refreshTokenExpiresAt(),
      },
    })

    const { passwordHash: _, ...safeUser } = user

    const res = ok({ user: safeUser, accessToken })
    setAccessTokenCookie(res, accessToken)
    setRefreshTokenCookie(res, rawRefresh)
    return res
  } catch (err) {
    return handleError(err)
  }
}
