-- AlterTable
ALTER TABLE "users" ADD COLUMN "googleAccessToken" TEXT,
ADD COLUMN "googleRefreshToken" TEXT,
ADD COLUMN "googleTokenExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "compromissos" ADD COLUMN "syncWithGoogle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "googleEventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "compromissos_googleEventId_key" ON "compromissos"("googleEventId");

-- CreateIndex
CREATE INDEX "compromissos_googleEventId_idx" ON "compromissos"("googleEventId");
