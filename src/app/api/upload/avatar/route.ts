import { NextRequest } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { ok, apiError, handleError } from '@/lib/api/response'
import { requireAuth } from '@/lib/auth/session'

cloudinary.config({ secure: true })

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return apiError('No file provided', 422)
    if (!ALLOWED.includes(file.type)) return apiError('Only JPEG, PNG, WEBP allowed', 422)
    if (file.size > MAX_SIZE) return apiError('File too large (max 5 MB)', 422)

    const bytes = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'photo_journey/avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { fetch_format: 'auto', quality: 'auto' },
      ],
    })

    return ok({ url: result.secure_url })
  } catch (err) {
    return handleError(err)
  }
}
