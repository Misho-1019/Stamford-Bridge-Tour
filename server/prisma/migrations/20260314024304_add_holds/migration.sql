-- CreateEnum
CREATE TYPE "HoldStatus" AS ENUM ('HELD', 'EXPIRED', 'CONVERTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Hold" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "status" "HoldStatus" NOT NULL DEFAULT 'HELD',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "stripeSessionId" TEXT,
    "email" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "qtyTotal" INTEGER NOT NULL,
    "amountTotalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hold_stripeSessionId_key" ON "Hold"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Hold_expiresAt_idx" ON "Hold"("expiresAt");

-- CreateIndex
CREATE INDEX "Hold_slotId_status_idx" ON "Hold"("slotId", "status");

-- AddForeignKey
ALTER TABLE "Hold" ADD CONSTRAINT "Hold_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TourSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
