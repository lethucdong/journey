// Node.js-only crypto utilities — do NOT import in middleware (Edge Runtime)
import { createHash, randomBytes } from 'crypto'

export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

export function generateRefreshToken(): string {
  return randomBytes(40).toString('hex')
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS)
}
