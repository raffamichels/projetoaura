/*
  Warnings:

  - A unique constraint covering the columns `[googleCalendarChannelId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "midias" ADD COLUMN     "resenhaGeradaIA" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "googleCalendarChannelId" TEXT,
ADD COLUMN     "googleCalendarResourceId" TEXT,
ADD COLUMN     "googleCalendarWatchExpiration" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_googleCalendarChannelId_key" ON "users"("googleCalendarChannelId");
