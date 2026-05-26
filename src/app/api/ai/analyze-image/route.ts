import { NextRequest } from 'next/server'
import { ok, apiError, handleError } from '@/lib/api/response'
import { requireAuth } from '@/lib/auth/session'

// Groq — free tier: 14,400 req/day, OpenAI-compatible, fast vision inference
const GROQ_API_KEY   = process.env.GROQ_API_KEY
const GROQ_API_URL   = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL     = process.env.GROQ_VISION_MODEL ?? 'meta-llama/llama-4-scout-17b-16e-instruct'

const PROMPT = `Nhìn vào bức ảnh này và viết một đoạn nhật ký du lịch ngắn, như thể bạn là người chụp bức ảnh đó. Trả lời CHỈ bằng JSON hợp lệ — không markdown, không giải thích.

Trả về đúng cấu trúc này:
{
  "title": "tiêu đề tự nhiên, cảm xúc, ngắn gọn — không mô tả ảnh, viết như một khoảnh khắc đáng nhớ, tối đa 60 ký tự, tiếng Việt",
  "description": "2-3 câu viết theo ngôi thứ nhất, tự nhiên như nhật ký — chia sẻ cảm xúc, suy nghĩ, trải nghiệm lúc đó; KHÔNG liệt kê thứ nhìn thấy trong ảnh, KHÔNG bắt đầu bằng 'Bức ảnh', tiếng Việt",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "type": "mountain|beach|camping|cafe|roadtrip|adventure",
  "locationQuery": "tên địa điểm cụ thể nhất có thể tìm kiếm trên bản đồ (ví dụ: Hội An, Quảng Nam, Việt Nam), để trống nếu không xác định được",
  "mood": "terrible|normal|beautiful|amazing|mustgo"
}

Lưu ý:
- title và description viết bằng tiếng Việt, tự nhiên như người thật viết
- description như một dòng nhật ký: cảm xúc, kỷ niệm, khoảnh khắc — không phải bình luận ảnh
- tags là các từ khoá tiếng Anh không dấu (hashtag)
- locationQuery viết bằng tiếng Việt có dấu để tìm kiếm chính xác hơn
- type và mood chỉ dùng các giá trị đã cho`

export interface ImageAnalysis {
  title: string
  description: string
  tags: string[]
  type: string
  locationQuery: string
  mood: string
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)

    const body = await req.json()
    const { imageUrl } = body as { imageUrl?: string }
    if (!imageUrl || typeof imageUrl !== 'string') return apiError('imageUrl required', 422)

    if (!GROQ_API_KEY) return apiError('GROQ_API_KEY not configured', 500)

    const aiRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: PROMPT },
          ],
        }],
        temperature: 0.6,
        max_tokens: 512,
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      return apiError(`AI service error: ${errText}`, 502)
    }

    const data = await aiRes.json()
    const content: string = data.choices?.[0]?.message?.content ?? ''

    let parsed: Record<string, unknown>
    try {
      const jsonStr = content.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      parsed = JSON.parse(jsonStr)
    } catch {
      return apiError('Failed to parse AI response', 502)
    }

    const result: ImageAnalysis = {
      title:         String(parsed.title ?? ''),
      description:   String(parsed.description ?? ''),
      tags:          Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
      type:          String(parsed.type ?? 'adventure'),
      locationQuery: String(parsed.locationQuery ?? ''),
      mood:          String(parsed.mood ?? 'beautiful'),
    }

    return ok(result)
  } catch (err) {
    return handleError(err)
  }
}
