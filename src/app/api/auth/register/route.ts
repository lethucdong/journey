import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signAccessToken } from '@/lib/auth/jwt'
import { generateRefreshToken, hashRefreshToken, refreshTokenExpiresAt } from '@/lib/auth/token'
import {
  created,
  apiError,
  handleError,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '@/lib/api/response'

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(body: Record<string, unknown>) {
  const { email, username, displayName, password } = body

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Invalid email address'

  if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(username))
    return 'Username must be 3–30 characters, letters/numbers/underscores only'

  if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 2)
    return 'Display name must be at least 2 characters'

  if (!password || typeof password !== 'string' || password.length < 8)
    return 'Password must be at least 8 characters'

  return null
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validationError = validate(body)
    if (validationError) return apiError(validationError, 422)

    const { email, username, displayName, password } = body as {
      email: string
      username: string
      displayName: string
      password: string
    }

    // Check duplicates
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] },
      select: { email: true, username: true },
    })

    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'Email' : 'Username'
      return apiError(`${field} is already taken`, 409)
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        displayName: displayName.trim(),
        passwordHash,
      },
      select: { id: true, email: true, username: true, displayName: true, avatar: true, createdAt: true },
    })

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

    const res = created({ user, accessToken })
    setAccessTokenCookie(res, accessToken)
    setRefreshTokenCookie(res, rawRefresh)
    return res
  } catch (err) {
    return handleError(err)
  }
}
