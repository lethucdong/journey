import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/session'
import { ok, noContent, apiError, handleError } from '@/lib/api/response'

// ─── PUT /api/comments/[commentId] — edit or hide ────────────────────────────

export async function PUT(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const session = await requireAuth(req)
    const { commentId } = await params
    const body = await req.json()

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, checkInId: true },
    })
    if (!comment) return apiError('Comment not found', 404)

    const isAuthor = comment.userId === session.sub

    // Check if requester is the check-in owner (for hide action)
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: comment.checkInId },
      select: { userId: true },
    })
    const isCheckInOwner = checkIn?.userId === session.sub

    const data: Record<string, unknown> = {}

    // Only comment author can edit content
    if (typeof body.content === 'string') {
      if (!isAuthor) return apiError('Only the comment author can edit content', 403)
      const content = body.content.trim()
      if (!content) return apiError('Comment cannot be empty', 422)
      if (content.length > 1000) return apiError('Comment too long (max 1000 chars)', 422)
      data.content = content
    }

    // Only check-in owner can hide/unhide comments
    if (typeof body.hidden === 'boolean') {
      if (!isCheckInOwner) return apiError('Only the post owner can hide comments', 403)
      data.hidden = body.hidden
    }

    if (Object.keys(data).length === 0) return apiError('Nothing to update', 422)

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data,
      select: { id: true, content: true, hidden: true, updatedAt: true },
    })

    return ok({ comment: updated })
  } catch (err) {
    return handleError(err)
  }
}

// ─── DELETE /api/comments/[commentId] ────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const session = await requireAuth(req)
    const { commentId } = await params

    const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { userId: true } })
    if (!comment) return apiError('Comment not found', 404)
    if (comment.userId !== session.sub) return apiError('Forbidden', 403)

    await prisma.comment.delete({ where: { id: commentId } })
    return noContent()
  } catch (err) {
    return handleError(err)
  }
}
