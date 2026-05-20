-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding columns to CheckIn
ALTER TABLE "CheckIn" ADD COLUMN IF NOT EXISTS "titleEmbedding"       vector(768);
ALTER TABLE "CheckIn" ADD COLUMN IF NOT EXISTS "descriptionEmbedding" vector(768);

-- HNSW index for fast approximate nearest-neighbor search (cosine distance)
CREATE INDEX IF NOT EXISTS "CheckIn_titleEmbedding_idx"
  ON "CheckIn" USING hnsw ("titleEmbedding" vector_cosine_ops);

CREATE INDEX IF NOT EXISTS "CheckIn_descriptionEmbedding_idx"
  ON "CheckIn" USING hnsw ("descriptionEmbedding" vector_cosine_ops);
