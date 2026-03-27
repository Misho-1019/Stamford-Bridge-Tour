-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "clientUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "ClientUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
