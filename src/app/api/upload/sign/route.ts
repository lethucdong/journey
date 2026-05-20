import { NextRequest } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { ok, apiError, handleError } from '@/lib/api/response'
import { requireAuth } from '@/lib/auth/session'

cloudinary.config({ secure: true })

const FOLDER = 'photo_journey'
const TRANSFORMATION = 'c_limit,w_1920,h_1920/f_auto,q_auto'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)

    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign = { folder: FOLDER, timestamp, transformation: TRANSFORMATION }

    const cfg = cloudinary.config()
    if (!cfg.api_secret || !cfg.api_key || !cfg.cloud_name) {
      return apiError('Cloudinary not configured', 500)
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, cfg.api_secret)

    return ok({
      timestamp,
      signature,
      apiKey: cfg.api_key,
      cloudName: cfg.cloud_name,
      folder: FOLDER,
      transformation: TRANSFORMATION,
    })
  } catch (err) {
    return handleError(err)
  }
}
