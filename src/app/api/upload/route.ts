import { NextRequest } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { ok, apiError, handleError } from '@/lib/api/response'
import { requireAuth } from '@/lib/auth/session'

// CLOUDINARY_URL env var is picked up automatically by the SDK
cloudinary.config({ secure: true })

const MAX_SIZE = 50 * 1024 * 1024
const ALLOWED  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file)                        return apiError('No file provided', 422)
    if (!ALLOWED.includes(file.type)) return apiError('Only JPEG, PNG, WEBP, GIF allowed', 422)
    if (file.size > MAX_SIZE)         return apiError('File too large (max 50 MB)', 422)

    const bytes  = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'photo_journey',
      // Resize to max 1920px on longest side, convert to WebP, quality auto
      transformation: [
        { width: 1920, height: 1920, crop: 'limit' },
        { fetch_format: 'auto', quality: 'auto' },
      ],
    })

    return ok({ url: result.secure_url })
  } catch (err) {
    return handleError(err)
  }
}
