'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Trash2, CornerDownRight, Loader2, EyeOff, Eye, Pencil, MessageSquareOff, MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface CommentUser {
  id: string; username: string; displayName: string; avatar: string | null
}
interface ReplyData {
  id: string; content: string; createdAt: string; updatedAt: string
  parentId: string | null; hidden: boolean; user: CommentUser
}
interface CommentData extends ReplyData {
  replies?: ReplyData[]
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function Avatar({ user, size = 'md' }: { user: CommentUser; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
  if (user.avatar) return <img src={user.avatar} alt={user.displayName} className={`${cls} rounded-full object-cover shrink-0`} />
  return (
    <div className={`${cls} rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 shrink-0`}>
      {user.displayName[0].toUpperCase()}
    </div>
  )
}

function CommentInput({ onSubmit, placeholder = 'Write a comment…', autoFocus = false, onCancel, initialValue = '' }: {
  onSubmit: (content: string) => Promise<void>
  placeholder?: string; autoFocus?: boolean; onCancel?: () => void; initialValue?: string
}) {
  const [text, setText] = useState(initialValue)
  const [sending, setSending] = useState(false)

  const submit = async () => {
    if (!text.trim()) return
    setSending(true)
    await onSubmit(text.trim())
    setText('')
    setSending(false)
  }

  return (
    <div className="flex gap-2 items-start">
      <textarea
        value={text} onChange={(e) => setText(e.target.value)} autoFocus={autoFocus}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
        placeholder={placeholder} rows={2}
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/40 resize-none transition-colors"
      />
      <div className="flex flex-col gap-1.5">
        <button onClick={submit} disabled={!text.trim() || sending}
          className="w-8 h-8 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 flex items-center justify-center transition-colors">
          {sending ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="w-8 h-8 rounded-xl bg-white/8 hover:bg-white/12 flex items-center justify-center text-gray-400 text-xs transition-colors">✕</button>
        )}
      </div>
    </div>
  )
}

// ── Single comment (used for both top-level and replies) ──────────────────────
function CommentItem({ comment, currentUserId, isCheckInOwner, onDelete, onReply, onHide, onEdit }: {
  comment: CommentData | ReplyData
  currentUserId: string | null
  isCheckInOwner: boolean
  onDelete: (id: string, parentId: string | null) => Promise<void>
  onReply?: (parentId: string, content: string) => Promise<void>
  onHide: (id: string, parentId: string | null, hidden: boolean) => Promise<void>
  onEdit: (id: string, parentId: string | null, content: string) => Promise<void>
}) {
  const [showReply, setShowReply] = useState(false)
  const [editing, setEditing] = useState(false)
  const isAuthor = currentUserId === comment.user.id

  if (comment.hidden && !isCheckInOwner && !isAuthor) return null

  return (
    <div className={`group ${comment.hidden ? 'opacity-50' : ''}`}>
      <div className="flex gap-3">
        <Avatar user={comment.user} size={'replies' in comment ? 'md' : 'sm'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="text-sm font-medium text-white">{comment.user.displayName}</span>
            <span className="text-gray-500 text-xs">@{comment.user.username}</span>
            {comment.hidden && <span className="text-xs text-yellow-500/70 bg-yellow-500/10 px-1.5 py-0.5 rounded">hidden</span>}
            {comment.updatedAt !== comment.createdAt && <span className="text-gray-600 text-xs">edited</span>}
            <span className="text-gray-600 text-xs ml-auto">{timeAgo(comment.createdAt)}</span>
          </div>

          {editing ? (
            <div className="mt-1">
              <CommentInput
                initialValue={comment.content} autoFocus
                onSubmit={async (content) => { await onEdit(comment.id, comment.parentId, content); setEditing(false) }}
                onCancel={() => setEditing(false)}
              />
            </div>
          ) : (
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
          )}

          {/* Action bar */}
          {!editing && (
            <div className="flex items-center gap-3 mt-2">
              {currentUserId && onReply && (
                <button onClick={() => setShowReply((p) => !p)} className="flex items-center gap-1 text-gray-500 hover:text-orange-400 text-xs transition-colors">
                  <CornerDownRight className="w-3 h-3" />Reply
                </button>
              )}
              {isAuthor && (
                <>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-gray-500 hover:text-blue-400 text-xs transition-colors opacity-0 group-hover:opacity-100">
                    <Pencil className="w-3 h-3" />Edit
                  </button>
                  <button onClick={() => onDelete(comment.id, comment.parentId)} className="flex items-center gap-1 text-gray-500 hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3 h-3" />Delete
                  </button>
                </>
              )}
              {isCheckInOwner && !isAuthor && (
                <button onClick={() => onHide(comment.id, comment.parentId, !comment.hidden)} className="flex items-center gap-1 text-gray-500 hover:text-yellow-400 text-xs transition-colors opacity-0 group-hover:opacity-100">
                  {comment.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {comment.hidden ? 'Unhide' : 'Hide'}
                </button>
              )}
            </div>
          )}

          {/* Reply input */}
          <AnimatePresence>
            {showReply && onReply && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-3">
                <CommentInput
                  placeholder={`Reply to @${comment.user.username}…`} autoFocus
                  onSubmit={async (content) => { await onReply(comment.id, content); setShowReply(false) }}
                  onCancel={() => setShowReply(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {'replies' in comment && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 pl-3 border-l border-white/8">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id} comment={reply}
                  currentUserId={currentUserId} isCheckInOwner={isCheckInOwner}
                  onDelete={onDelete} onHide={onHide} onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function CommentSection({ checkInId, isPublic, checkInOwnerId }: {
  checkInId: string; isPublic: boolean; checkInOwnerId?: string
}) {
  const { user, openAuthModal } = useAuth()
  const [comments, setComments] = useState<CommentData[]>([])
  const [commentsEnabled, setCommentsEnabled] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(false)

  const isCheckInOwner = isOwner || (!!user && user.id === checkInOwnerId)

  const fetchComments = useCallback(async () => {
    if (!isPublic) return
    setLoading(true)
    try {
      const res = await fetch(`/api/checkins/${checkInId}/comments`, { credentials: 'include' })
      const body = await res.json()
      if (body.success) {
        setComments(body.data.comments)
        setCommentsEnabled(body.data.commentsEnabled)
        setIsOwner(body.data.isOwner)
      }
    } finally { setLoading(false) }
  }, [checkInId, isPublic])

  useEffect(() => { fetchComments() }, [fetchComments])

  const postComment = async (content: string, parentId?: string) => {
    const res = await fetch(`/api/checkins/${checkInId}/comments`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, parentId }),
    })
    const body = await res.json()
    if (!body.success) return
    const c = { ...body.data.comment, replies: [] }
    if (parentId) {
      setComments((prev) => prev.map((cm) => cm.id === parentId ? { ...cm, replies: [...(cm.replies ?? []), body.data.comment] } : cm))
    } else {
      setComments((prev) => [...prev, c])
    }
  }

  const deleteComment = async (id: string, parentId: string | null) => {
    await fetch(`/api/comments/${id}`, { method: 'DELETE', credentials: 'include' })
    if (parentId) {
      setComments((prev) => prev.map((c) => c.id === parentId ? { ...c, replies: (c.replies ?? []).filter((r) => r.id !== id) } : c))
    } else {
      setComments((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const hideComment = async (id: string, parentId: string | null, hidden: boolean) => {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hidden }),
    })
    const body = await res.json()
    if (!body.success) return
    const patch = (c: CommentData | ReplyData) => c.id === id ? { ...c, hidden } : c
    if (parentId) {
      setComments((prev) => prev.map((c) => c.id === parentId ? { ...c, replies: (c.replies ?? []).map(patch) } : c))
    } else {
      setComments((prev) => prev.map((c) => patch(c) as CommentData))
    }
  }

  const editComment = async (id: string, parentId: string | null, content: string) => {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const body = await res.json()
    if (!body.success) return
    const patch = (c: CommentData | ReplyData) => c.id === id ? { ...c, content, updatedAt: body.data.comment.updatedAt } : c
    if (parentId) {
      setComments((prev) => prev.map((c) => c.id === parentId ? { ...c, replies: (c.replies ?? []).map(patch) } : c))
    } else {
      setComments((prev) => prev.map((c) => patch(c) as CommentData))
    }
  }

  const toggleComments = async () => {
    setToggling(true)
    const res = await fetch(`/api/checkins/${checkInId}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentsEnabled: !commentsEnabled }),
    })
    const body = await res.json()
    if (body.success) setCommentsEnabled(!commentsEnabled)
    setToggling(false)
  }

  if (!isPublic) return null

  const totalCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0)
  const visibleCount = comments.reduce((sum, c) => {
    const visibleReplies = (c.replies ?? []).filter((r) => !r.hidden || isCheckInOwner || r.user.id === user?.id).length
    const visibleSelf = (!c.hidden || isCheckInOwner || c.user.id === user?.id) ? 1 : 0
    return sum + visibleSelf + visibleReplies
  }, 0)

  return (
    <section className="py-10 border-t border-white/8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-orange-400" />
          Comments
          {visibleCount > 0 && <span className="text-gray-500 font-normal text-lg">({visibleCount})</span>}
        </h2>

        {/* Owner toggle */}
        {isCheckInOwner && (
          <button
            onClick={toggleComments} disabled={toggling}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              commentsEnabled
                ? 'border-white/15 text-gray-400 hover:border-red-500/40 hover:text-red-400'
                : 'border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
            }`}
          >
            {toggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : commentsEnabled ? <MessageSquareOff className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
            {commentsEnabled ? 'Disable comments' : 'Enable comments'}
          </button>
        )}
      </div>

      {/* Disabled state */}
      {!commentsEnabled && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/4 border border-white/8 text-gray-500 text-sm mb-6">
          <MessageSquareOff className="w-4 h-4 shrink-0" />
          {isCheckInOwner ? 'Comments are disabled. Enable them above.' : 'Comments have been disabled by the author.'}
        </div>
      )}

      {/* Input */}
      {commentsEnabled && (
        user ? (
          <div className="flex gap-3 mb-8">
            <Avatar user={{ id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar }} />
            <div className="flex-1">
              <CommentInput onSubmit={(content) => postComment(content)} />
              <p className="text-gray-600 text-xs mt-1.5">Ctrl+Enter to send</p>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 rounded-xl bg-white/4 border border-white/8 text-center">
            <p className="text-gray-400 text-sm mb-3">Sign in to leave a comment</p>
            <button onClick={() => openAuthModal('login')} className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors">Sign in</button>
          </div>
        )
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Loading comments…</div>
      ) : comments.length === 0 ? (
        commentsEnabled && <p className="text-gray-600 text-sm">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id} comment={comment}
              currentUserId={user?.id ?? null}
              isCheckInOwner={isCheckInOwner}
              onDelete={deleteComment}
              onReply={(parentId, content) => postComment(content, parentId)}
              onHide={hideComment}
              onEdit={editComment}
            />
          ))}
        </div>
      )}
    </section>
  )
}
