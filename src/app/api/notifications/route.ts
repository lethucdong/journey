import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { ok, handleError } from '@/lib/api/response'

// ─── GET /api/notifications ───────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req)

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId: session.sub },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          id: true, type: true, read: true, createdAt: true, commentId: true,
          sender:  { select: { id: true, username: true, displayName: true, avatar: true } },
          checkIn: { select: { id: true, title: true } },
        },
      }),
      prisma.notification.count({ where: { recipientId: session.sub, read: false } }),
    ])

    return ok({ notifications, unreadCount })
  } catch (err) {
    return handleError(err)
  }
}

// ─── PUT /api/notifications — mark all as read ────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(req)
    await prisma.notification.updateMany({
      where: { recipientId: session.sub, read: false },
      data: { read: true },
    })
    return ok({ ok: true })
  } catch (err) {
    return handleError(err)
  }
}
