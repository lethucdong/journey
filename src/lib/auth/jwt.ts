import { SignJWT, jwtVerify } from 'jose'

// ─── Secrets ─────────────────────────────────────────────────────────────────

const accessSecret = () =>
  new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string       // userId
  email: string
  username: string
}

// ─── Access Token — jose only (Edge-safe) ────────────────────────────────────

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret())
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, accessSecret())
  return payload as unknown as AccessTokenPayload
}
