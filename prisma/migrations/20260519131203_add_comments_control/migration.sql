-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "commentsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;
