import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { ok, created, apiError, handleError } from '@/lib/api/response'

function commentSelect(requesterId: string, ownerId: string) {
  return {
    id: true, content: true, createdAt: true, updatedAt: true, parentId: true, hidden: true,
    user: { select: { id: true, username: true, displayName: true, avatar: true } },
    replies: {
      where: { hidden: false },   // visitors never see hidden replies
      orderBy: { createdAt: 'asc' as const },
      select: {
        id: true, content: true, createdAt: true, updatedAt: true, parentId: true, hidden: true,
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    },
  } as const
}

// ─── GET /api/checkins/[id]/comments ─────────────────────────────────────────

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req)
    const { id } = await params

    const checkIn = await prisma.checkIn.findUnique({
      where: { id },
      select: { isPublic: true, commentsEnabled: true, userId: true },
    })
    if (!checkIn) return apiError('Check-in not found', 404)
    if (!checkIn.isPublic && checkIn.userId !== session.sub)
      return apiError('Forbidden', 403)

    const isOwner = checkIn.userId === session.sub

    // Owner sees all (including hidden). Others skip hidden top-level.
    const comments = await prisma.comment.findMany({
      where: {
        checkInId: id,
        parentId: null,
        // non-owners don't see hidden comments (unless it's their own)
        ...(isOwner ? {} : {
          OR: [{ hidden: false }, { userId: session.sub }],
        }),
      },
      orderBy: { createdAt: 'asc' },
      select: commentSelect(session.sub, checkIn.userId),
    })

    // For non-owners: inside replies also filter hidden unless it's their own
    const processedComments = isOwner ? comments : comments.map((c) => ({
      ...c,
      replies: (c.replies ?? []).filter((r) => !r.hidden || r.user.id === session.sub),
    }))

    return ok({ comments: processedComments, commentsEnabled: checkIn.commentsEnabled, isOwner })
  } catch (err) {
    return handleError(err)
  }
}

// ─── POST /api/checkins/[id]/comments ────────────────────────────────────────

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req)
    const { id } = await params
    const body = await req.json()

    const content = typeof body.content === 'string' ? body.content.trim() : ''
    if (!content) return apiError('Comment cannot be empty', 422)
    if (content.length > 1000) return apiError('Comment too long (max 1000 chars)', 422)

    const checkIn = await prisma.checkIn.findUnique({
      where: { id },
      select: { isPublic: true, commentsEnabled: true, userId: true, title: true },
    })
    if (!checkIn) return apiError('Check-in not found', 404)
    if (!checkIn.isPublic) return apiError('Cannot comment on a private check-in', 403)
    if (!checkIn.commentsEnabled) return apiError('Comments are disabled on this post', 403)

    let parentOwnerId: string | null = null
    if (body.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: body.parentId, checkInId: id },
        select: { userId: true },
      })
      if (!parent) return apiError('Parent comment not found', 404)
      parentOwnerId = parent.userId
    }

    const comment = await prisma.comment.create({
      data: { content, userId: session.sub, checkInId: id, parentId: body.parentId ?? null },
      select: {
        id: true, content: true, createdAt: true, updatedAt: true, parentId: true, hidden: true,
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    })

    const notifPromises: Promise<unknown>[] = []
    if (body.parentId && parentOwnerId && parentOwnerId !== session.sub) {
      notifPromises.push(prisma.notification.create({
        data: { recipientId: parentOwnerId, senderId: session.sub, type: 'reply', checkInId: id, commentId: comment.id },
      }))
    } else if (!body.parentId && checkIn.userId !== session.sub) {
      notifPromises.push(prisma.notification.create({
        data: { recipientId: checkIn.userId, senderId: session.sub, type: 'comment', checkInId: id, commentId: comment.id },
      }))
    }
    if (notifPromises.length) Promise.all(notifPromises).catch(() => {})

    return created({ comment })
  } catch (err) {
    return handleError(err)
  }
}
