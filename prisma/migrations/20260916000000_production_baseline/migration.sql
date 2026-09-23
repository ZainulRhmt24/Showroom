-- Baseline generated read-only from the existing Supabase production schema on 2026-09-17.
-- It is intentionally NOT executed against production. Prisma will mark it as applied.
-- On a fresh database, it creates the complete pre-Phase-2.5 schema.
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('NOTE', 'CALL', 'WHATSAPP', 'FOLLOW_UP', 'TEST_DRIVE', 'STATUS_CHANGE');

-- CreateEnum
CREATE TYPE "CarCondition" AS ENUM ('Baru', 'Bekas');

-- CreateEnum
CREATE TYPE "CarFuel" AS ENUM ('Bensin', 'Diesel', 'Listrik', 'Hybrid');

-- CreateEnum
CREATE TYPE "CarTransmission" AS ENUM ('Automatic', 'Manual');

-- CreateEnum
CREATE TYPE "CarType" AS ENUM ('SUV', 'MPV', 'Sedan', 'Hatchback', 'Pickup', 'Luxury');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('Operasional', 'Servis', 'Poles', 'Dokumen', 'Marketing', 'Gaji', 'Lainnya');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'REFERRAL', 'WALK_IN', 'MARKETPLACE', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('Baru', 'Diproses', 'Disetujui', 'Ditolak', 'FollowUp', 'TestDrive', 'Negosiasi', 'SPK', 'Selesai', 'Batal');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('Kredit', 'Cash', 'Trade-In', 'Kontak');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'MANAGER', 'SALES');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Kredit', 'TradeIn');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Penjualan', 'TradeIn');

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mapUrl" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "openDays" TEXT,
    "openHours" TEXT,
    "phone" TEXT,
    "showroomId" TEXT NOT NULL,
    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "monthly" DOUBLE PRECISION NOT NULL,
    "dp" DOUBLE PRECISION NOT NULL,
    "transmission" "CarTransmission" NOT NULL,
    "fuel" "CarFuel" NOT NULL,
    "engine" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "type" "CarType" NOT NULL,
    "condition" "CarCondition" NOT NULL,
    "location" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "gallery" TEXT[],
    "badge" TEXT,
    "isSoldOut" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "branchId" TEXT,
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isAccidentFree" BOOLEAN NOT NULL DEFAULT true,
    "isFloodFree" BOOLEAN NOT NULL DEFAULT true,
    "isOdometerVerified" BOOLEAN NOT NULL DEFAULT true,
    "ownership" TEXT DEFAULT 'Tangan Pertama (Pribadi)',
    "plateNumber" TEXT,
    "priceCredit" DOUBLE PRECISION,
    "serviceRecord" TEXT DEFAULT 'Bengkel Resmi (ATPM)',
    "taxDate" TEXT,
    "warrantyDays" INTEGER NOT NULL DEFAULT 365,
    "showroomId" TEXT NOT NULL,
    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL, "showroomId" TEXT NOT NULL, "name" TEXT NOT NULL, "phone" TEXT NOT NULL,
    "email" TEXT, "address" TEXT, "notes" TEXT, "source" "LeadSource",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL, "category" "ExpenseCategory" NOT NULL, "description" TEXT NOT NULL, "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "carId" TEXT, "branchId" TEXT, "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "showroomId" TEXT NOT NULL,
    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL, "type" "LeadType" NOT NULL, "name" TEXT NOT NULL, "whatsapp" TEXT NOT NULL,
    "email" TEXT, "city" TEXT, "carId" TEXT, "carName" TEXT, "details" JSONB,
    "status" "LeadStatus" NOT NULL DEFAULT 'Baru', "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedTo" TEXT, "notes" TEXT, "showroomId" TEXT NOT NULL, "branchId" TEXT, "customerId" TEXT,
    "lastContactAt" TIMESTAMP(3), "nextFollowUpAt" TIMESTAMP(3), "source" "LeadSource",
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL, "showroomId" TEXT NOT NULL, "customerId" TEXT, "leadId" TEXT,
    "type" "ActivityType" NOT NULL, "content" TEXT NOT NULL, "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Showroom" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "phone" TEXT, "email" TEXT,
    "address" TEXT, "logo" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Showroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "key" TEXT NOT NULL, "value" TEXT NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL, "quote" TEXT NOT NULL, "name" TEXT NOT NULL, "car" TEXT NOT NULL, "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "showroomId" TEXT,
    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL, "type" "TransactionType" NOT NULL DEFAULT 'Penjualan', "carId" TEXT, "carName" TEXT NOT NULL,
    "leadId" TEXT, "buyerName" TEXT NOT NULL, "buyerPhone" TEXT, "salePrice" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'Cash', "branchId" TEXT, "ownerId" TEXT NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "showroomId" TEXT NOT NULL,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false, CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMembership" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "showroomId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'SALES', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, "branchId" TEXT, CONSTRAINT "UserMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_slug_key" ON "Branch"("slug" ASC);
CREATE UNIQUE INDEX "Car_slug_key" ON "Car"("slug" ASC);
CREATE INDEX "Customer_createdAt_idx" ON "Customer"("createdAt" ASC);
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone" ASC);
CREATE INDEX "Customer_showroomId_idx" ON "Customer"("showroomId" ASC);
CREATE INDEX "LeadActivity_customerId_idx" ON "LeadActivity"("customerId" ASC);
CREATE INDEX "LeadActivity_leadId_idx" ON "LeadActivity"("leadId" ASC);
CREATE INDEX "LeadActivity_showroomId_idx" ON "LeadActivity"("showroomId" ASC);
CREATE UNIQUE INDEX "Showroom_slug_key" ON "Showroom"("slug" ASC);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email" ASC);
CREATE UNIQUE INDEX "UserMembership_userId_showroomId_key" ON "UserMembership"("userId" ASC, "showroomId" ASC);

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Car" ADD CONSTRAINT "Car_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Car" ADD CONSTRAINT "Car_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Car" ADD CONSTRAINT "Car_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserMembership" ADD CONSTRAINT "UserMembership_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserMembership" ADD CONSTRAINT "UserMembership_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "Showroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserMembership" ADD CONSTRAINT "UserMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
