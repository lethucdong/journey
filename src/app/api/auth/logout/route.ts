import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashRefreshToken } from '@/lib/auth/token'
import { ok, handleError, clearAuthCookies } from '@/lib/api/response'

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const rawRefresh = req.cookies.get('refresh_token')?.value

    if (rawRefresh) {
      // Revoke the refresh token — ignore if already deleted
      await prisma.refreshToken
        .delete({ where: { tokenHash: hashRefreshToken(rawRefresh) } })
        .catch(() => {})
    }

    const res = ok({ message: 'Logged out successfully' })
    clearAuthCookies(res)
    return res
  } catch (err) {
    return handleError(err)
  }
}
