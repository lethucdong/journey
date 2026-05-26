'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Camera, User, Mail, Phone, FileText, Lock, Loader2,
  CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiUpdateProfile, apiChangePassword } from '@/lib/api/client'

function Field({ label, icon, error, children }: {
  label: string; icon: React.ReactNode; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5">
        <span className="text-gray-500">{icon}</span>{label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium
        ${type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}
    >
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </motion.div>
  )
}

export default function EditProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [username, setUsername] = useState(user?.username ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Change password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const uploadAvatar = async (file: File): Promise<string | null> => {
    setUploadingAvatar(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload/avatar', { method: 'POST', credentials: 'include', body: form })
      const body = await res.json()
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Upload failed')
      return body.data.url as string
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Avatar upload failed', 'error')
      return null
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const errors: Record<string, string> = {}
    if (!displayName.trim()) errors.displayName = 'Display name is required'
    if (!username.trim()) errors.username = 'Username is required'
    if (Object.keys(errors).length) { setFieldErrors(errors); return }

    setSaving(true)
    try {
      let avatarUrl = user?.avatar ?? undefined
      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile)
        if (!uploaded) { setSaving(false); return }
        avatarUrl = uploaded
      }

      const res = await apiUpdateProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        phone: phone.trim(),
        ...(avatarUrl !== user?.avatar ? { avatar: avatarUrl } : {}),
      })

      if (!res.ok) {
        if (res.error.toLowerCase().includes('username')) {
          setFieldErrors({ username: res.error })
        } else {
          showToast(res.error, 'error')
        }
        return
      }

      updateUser(res.data.user)
      setAvatarFile(null)
      showToast('Profile saved', 'success')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { showToast('Passwords do not match', 'error'); return }
    if (newPw.length < 8) { showToast('New password must be at least 8 characters', 'error'); return }

    setChangingPw(true)
    const res = await apiChangePassword({ currentPassword: currentPw, newPassword: newPw })
    setChangingPw(false)

    if (!res.ok) { showToast(res.error, 'error'); return }
    showToast('Password changed', 'success')
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
  }

  if (authLoading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
    </div>
  )

  if (!isAuthenticated || !user) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Please sign in first.</p>
    </div>
  )

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm'

  return (
    <div className="pt-16 min-h-screen pb-24 md:pb-12">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-6 py-6 border-b border-white/5 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-xl hover:bg-white/8 flex items-center justify-center transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </button>
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl font-bold">
          Edit profile
        </motion.h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">

        {/* ── Profile form ── */}
        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          onSubmit={handleSaveProfile} className="space-y-6">

          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                {avatarPreview
                  ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-gray-600" /></div>
                }
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-400 flex items-center justify-center shadow-lg transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarPick} />
            </div>
            <div>
              <p className="text-white font-medium">{user.displayName}</p>
              <p className="text-gray-500 text-sm">@{user.username}</p>
              <p className="text-gray-600 text-xs mt-1">JPG, PNG, WEBP · max 5 MB</p>
            </div>
          </div>

          {/* Fields */}
          <Field label="Display name" icon={<User className="w-3.5 h-3.5" />} error={fieldErrors.displayName}>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name" className={inputCls} />
          </Field>

          <Field label="Username" icon={<span className="text-xs font-mono">@</span>} error={fieldErrors.username}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
              <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username" maxLength={30}
                className={`${inputCls} pl-8`} />
            </div>
            <p className="text-gray-600 text-xs mt-1">Letters, numbers, underscores · 3–30 chars</p>
          </Field>

          <Field label="Email" icon={<Mail className="w-3.5 h-3.5" />}>
            <input value={user.email} readOnly
              className={`${inputCls} opacity-50 cursor-not-allowed`} />
            <p className="text-gray-600 text-xs mt-1">Email cannot be changed</p>
          </Field>

          <Field label="Phone" icon={<Phone className="w-3.5 h-3.5" />}>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+84 90 123 4567" type="tel" className={inputCls} />
          </Field>

          <Field label="Bio" icon={<FileText className="w-3.5 h-3.5" />}>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio about yourself…" rows={3}
              className={`${inputCls} resize-none`} />
          </Field>

          <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-sm">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Save changes'}
          </motion.button>
        </motion.form>

        {/* ── Divider ── */}
        <div className="border-t border-white/8" />

        {/* ── Change password ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-display text-lg font-semibold mb-5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />Change password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { label: 'Current password', value: currentPw, setter: setCurrentPw, show: showCurrentPw, toggle: () => setShowCurrentPw((p) => !p) },
              { label: 'New password', value: newPw, setter: setNewPw, show: showNewPw, toggle: () => setShowNewPw((p) => !p) },
              { label: 'Confirm new password', value: confirmPw, setter: setConfirmPw, show: showNewPw, toggle: () => setShowNewPw((p) => !p) },
            ].map(({ label, value, setter, show, toggle }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} pr-10`}
                  />
                  <button type="button" onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <button type="submit" disabled={changingPw || !currentPw || !newPw || !confirmPw}
              className="w-full py-3 rounded-xl bg-white/8 hover:bg-white/12 disabled:opacity-40 text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm mt-2">
              {changingPw ? <><Loader2 className="w-4 h-4 animate-spin" />Updating…</> : 'Update password'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
