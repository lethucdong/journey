/**
 * Backfill vector embeddings for existing CheckIn records that don't have them yet.
 * Run once after migration:
 *   npx tsx scripts/backfill-embeddings.ts
 */
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()
const OLLAMA_URL  = process.env.OLLAMA_URL        ?? 'http://localhost:11434'
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text'

async function embed(text: string): Promise<number[] | null> {
  if (!text.trim()) return null
  try {
    const res = await fetch(`${OLLAMA_URL}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBED_MODEL, input: text }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) return null
    const data = await res.json() as { embeddings?: number[][] }
    return data.embeddings?.[0] ?? null
  } catch (e) {
    console.error('Ollama error:', e)
    return null
  }
}

function vecStr(vec: number[]): string {
  return `[${vec.join(',')}]`
}

async function main() {
  // Only process rows that are missing at least one embedding
  const rows = await prisma.$queryRaw<{ id: string; title: string; description: string | null }[]>(
    Prisma.sql`
      SELECT id, title, description FROM "CheckIn"
      WHERE "titleEmbedding" IS NULL OR "descriptionEmbedding" IS NULL
    `
  )

  if (rows.length === 0) {
    console.log('All check-ins already have embeddings.')
    return
  }

  console.log(`Backfilling ${rows.length} check-ins...`)
  let done = 0

  for (const row of rows) {
    const [titleVec, descVec] = await Promise.all([
      embed(row.title),
      row.description ? embed(row.description) : Promise.resolve(null),
    ])

    if (titleVec) {
      await prisma.$executeRaw(Prisma.sql`
        UPDATE "CheckIn" SET "titleEmbedding" = ${vecStr(titleVec)}::vector WHERE id = ${row.id}
      `)
    }
    if (descVec) {
      await prisma.$executeRaw(Prisma.sql`
        UPDATE "CheckIn" SET "descriptionEmbedding" = ${vecStr(descVec)}::vector WHERE id = ${row.id}
      `)
    }

    done++
    if (done % 10 === 0 || done === rows.length) {
      process.stdout.write(`\r${done}/${rows.length}`)
    }
  }

  console.log('\nDone!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
