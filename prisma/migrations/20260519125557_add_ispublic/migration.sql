-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "CheckIn_isPublic_idx" ON "CheckIn"("isPublic");
