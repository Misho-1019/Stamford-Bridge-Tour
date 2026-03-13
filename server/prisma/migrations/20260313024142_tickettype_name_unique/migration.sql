/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `TicketType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TicketType_name_key" ON "TicketType"("name");
