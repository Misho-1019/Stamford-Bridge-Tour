/*
  Warnings:

  - A unique constraint covering the columns `[stripeRefundId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "stripeRefundId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripeRefundId_key" ON "Booking"("stripeRefundId");
