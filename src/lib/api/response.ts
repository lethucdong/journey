import { NextResponse } from 'next/server'
import { AuthError } from '@/lib/auth/session'

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const IS_PROD = process.env.NODE_ENV === 'production'

export function setAccessTokenCookie(res: NextResponse, token: string): void {
  res.cookies.set('access_token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 15 * 60,       // 15 minutes
    path: '/',
  })
}

export function setRefreshTokenCookie(res: NextResponse, token: string): void {
  res.cookies.set('refresh_token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/api/auth/refresh',
  })
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.delete('access_token')
  res.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 0,
    path: '/api/auth/refresh',
  })
}

// ─── Standard response helpers ────────────────────────────────────────────────

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status })
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data }, { status: 201 })
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status })
}

// ─── Central error handler ────────────────────────────────────────────────────

export function handleError(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    return apiError(err.message, err.status)
  }
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', err)
  }
  return apiError('Internal server error', 500)
}
