// Client-side API wrapper — all routes go through Next.js

export interface ApiUser {
  id: string
  email: string
  username: string
  displayName: string
  avatar: string | null
  bio: string | null
  createdAt: string
  _count?: { checkIns: number }
}

export interface ApiCheckIn {
  id: string
  title: string
  location: string
  country: string
  lat: number
  lng: number
  date: string
  mood: string
  type: string
  images: string[]
  tags: string[]
  isPublic: boolean
  description?: string | null
  story?: string | null
  createdAt: string
  user?: { id: string; username: string; displayName: string; avatar: string | null }
}

export interface PaginatedCheckIns {
  checkIns: ApiCheckIn[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; ok: true } | { error: string; ok: false }> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  let body: Record<string, unknown>
  try {
    body = await res.json()
  } catch {
    return { ok: false, error: 'Network error' }
  }

  if (!res.ok) {
    return { ok: false, error: (body.error as string) ?? 'Unknown error' }
  }
  // All API responses are wrapped: { success: true, data: T }
  return { ok: true, data: (body.data ?? body) as T }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiRegister(data: {
  email: string
  username: string
  displayName: string
  password: string
}) {
  return apiFetch<{ user: ApiUser; accessToken: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiLogin(email: string, password: string) {
  return apiFetch<{ user: ApiUser; accessToken: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function apiLogout() {
  return apiFetch<{ message: string }>('/api/auth/logout', { method: 'POST' })
}

export async function apiRefresh() {
  return apiFetch<{ user: ApiUser; accessToken: string }>('/api/auth/refresh', { method: 'POST' })
}

export async function apiGetMe() {
  return apiFetch<{ user: ApiUser }>('/api/auth/me')
}

// ─── Check-ins ────────────────────────────────────────────────────────────────

export async function apiGetCheckIns(params?: {
  page?: number
  limit?: number
  mood?: string
  type?: string
  q?: string
  view?: 'mine' | 'public'
  userId?: string
}) {
  const qs = new URLSearchParams()
  if (params?.page)   qs.set('page',   String(params.page))
  if (params?.limit)  qs.set('limit',  String(params.limit))
  if (params?.mood)   qs.set('mood',   params.mood)
  if (params?.type)   qs.set('type',   params.type)
  if (params?.q)      qs.set('q',      params.q)
  if (params?.view)   qs.set('view',   params.view)
  if (params?.userId) qs.set('userId', params.userId)
  const query = qs.toString()
  return apiFetch<PaginatedCheckIns>(`/api/checkins${query ? `?${query}` : ''}`)
}

export async function apiCreateCheckIn(data: {
  title: string
  location: string
  country: string
  lat: number
  lng: number
  date: string
  mood: string
  type: string
  images: string[]
  tags?: string[]
  description?: string
  story?: string
  isPublic?: boolean
}) {
  return apiFetch<{ checkIn: ApiCheckIn }>('/api/checkins', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiGetCheckIn(id: string) {
  return apiFetch<{ checkIn: ApiCheckIn }>(`/api/checkins/${id}`)
}

export async function apiUpdateCheckIn(id: string, data: Partial<Parameters<typeof apiCreateCheckIn>[0]>) {
  return apiFetch<{ checkIn: ApiCheckIn }>(`/api/checkins/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function apiDeleteCheckIn(id: string) {
  return apiFetch<void>(`/api/checkins/${id}`, { method: 'DELETE' })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function apiLookupUser(email: string) {
  return apiFetch<{ user: { id: string; username: string; displayName: string; avatar: string | null } }>(
    `/api/users/lookup?email=${encodeURIComponent(email)}`
  )
}

export async function apiSearchUsers(q: string) {
  return apiFetch<{ users: { id: string; username: string; displayName: string; avatar: string | null }[] }>(
    `/api/users/search?q=${encodeURIComponent(q)}`
  )
}
