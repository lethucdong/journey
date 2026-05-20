import { NextRequest } from 'next/server'
import { verifyAccessToken, type AccessTokenPayload } from './jwt'

// Reads token from: (1) Authorization: Bearer <token>  (2) access_token cookie
export async function getSession(req: NextRequest): Promise<AccessTokenPayload | null> {
  let token: string | null = null

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else {
    token = req.cookies.get('access_token')?.value ?? null
  }

  if (!token) return null

  try {
    return await verifyAccessToken(token)
  } catch {
    return null
  }
}

// Throws with HTTP-friendly error if not authenticated
export async function requireAuth(req: NextRequest): Promise<AccessTokenPayload> {
  const session = await getSession(req)
  if (!session) throw new AuthError(401, 'Authentication required')
  return session
}

export class AuthError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}
