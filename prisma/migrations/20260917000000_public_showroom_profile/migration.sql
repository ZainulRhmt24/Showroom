-- Phase 2.5: additive public-showroom profile fields and public inventory indexes.
-- All new profile columns are nullable so existing showroom rows remain valid.
ALTER TABLE "Showroom"
  ADD COLUMN IF NOT EXISTS "tagline" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "whatsapp" TEXT,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "province" TEXT,
  ADD COLUMN IF NOT EXISTS "heroTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "heroDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "primaryContactLabel" TEXT,
  ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "facebookUrl" TEXT;

CREATE INDEX IF NOT EXISTS "Car_showroomId_isSoldOut_createdAt_idx"
  ON "Car"("showroomId", "isSoldOut", "createdAt");

CREATE INDEX IF NOT EXISTS "Car_showroomId_branchId_idx"
  ON "Car"("showroomId", "branchId");
