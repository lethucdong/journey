import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

const OLLAMA_URL  = process.env.OLLAMA_URL        ?? 'http://localhost:11434'
const OLLAMA_KEY  = process.env.OLLAMA_API_KEY
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text'

export async function embed(text: string): Promise<number[] | null> {
  if (!text.trim()) return null
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (OLLAMA_KEY) headers['Authorization'] = `Bearer ${OLLAMA_KEY}`

    const res = await fetch(`${OLLAMA_URL}/api/embed`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: EMBED_MODEL, input: text }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const data = await res.json() as { embeddings?: number[][] }
    return data.embeddings?.[0] ?? null
  } catch {
    return null
  }
}

export function vecStr(vec: number[]): string {
  return `[${vec.join(',')}]`
}

// Updates both embedding columns for a CheckIn. Fire-and-forget safe.
export async function updateCheckInEmbeddings(
  id: string,
  title: string,
  description: string | null,
): Promise<void> {
  const [titleVec, descVec] = await Promise.all([
    embed(title),
    description ? embed(description) : Promise.resolve(null),
  ])
  if (titleVec) {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "CheckIn" SET "titleEmbedding" = ${vecStr(titleVec)}::vector WHERE id = ${id}
    `)
  }
  if (descVec) {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "CheckIn" SET "descriptionEmbedding" = ${vecStr(descVec)}::vector WHERE id = ${id}
    `)
  }
}
