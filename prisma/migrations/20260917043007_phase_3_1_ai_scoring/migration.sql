-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "aiExplanation" JSONB,
ADD COLUMN     "aiPriority" TEXT,
ADD COLUMN     "aiScore" INTEGER,
ADD COLUMN     "aiScoredAt" TIMESTAMP(3);
