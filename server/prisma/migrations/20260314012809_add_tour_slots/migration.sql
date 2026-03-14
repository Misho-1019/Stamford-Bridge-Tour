-- CreateTable
CREATE TABLE "TourSlot" (
    "id" TEXT NOT NULL,
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "endAt" TIMESTAMPTZ(6) NOT NULL,
    "capacityTotal" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TourSlot_startAt_idx" ON "TourSlot"("startAt");

-- CreateIndex
CREATE UNIQUE INDEX "TourSlot_startAt_key" ON "TourSlot"("startAt");
