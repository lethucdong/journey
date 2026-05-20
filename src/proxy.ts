import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'

// Routes that require authentication
const PROTECTED_API = ['/api/checkins', '/api/auth/me', '/api/auth/logout', '/api/upload', '/api/notifications', '/api/comments']

// Routes that are always public
const PUBLIC_API = ['/api/auth/register', '/api/auth/login', '/api/auth/refresh']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip non-API routes (handled by page components)
  if (!pathname.startsWith('/api/')) return NextResponse.next()

  // Public API routes — skip auth
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) return NextResponse.next()

  // Protected API routes — verify token
  const isProtected = PROTECTED_API.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Try Authorization header first, then cookie
  let token: string | null = null
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else {
    token = req.cookies.get('access_token')?.value ?? null
  }

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 },
    )
  }

  try {
    const payload = await verifyAccessToken(token)

    // Forward user info to route handlers via headers
    const reqHeaders = new Headers(req.headers)
    reqHeaders.set('x-user-id', payload.sub)
    reqHeaders.set('x-user-email', payload.email)
    reqHeaders.set('x-user-username', payload.username)

    return NextResponse.next({ request: { headers: reqHeaders } })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Token invalid or expired' },
      { status: 401 },
    )
  }
}

export const config = {
  matcher: ['/api/:path*'],
}
