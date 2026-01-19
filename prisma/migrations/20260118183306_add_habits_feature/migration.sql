/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StatusHabito" AS ENUM ('ATIVO', 'PAUSADO', 'CONCLUIDO', 'ABANDONADO');

-- CreateEnum
CREATE TYPE "FrequenciaHabito" AS ENUM ('DIARIO', 'SEMANAL', 'DIAS_ESPECIFICOS');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "stripeSubscriptionStatus" TEXT;

-- CreateTable
CREATE TABLE "identidades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT NOT NULL DEFAULT 'user',
    "cor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habitos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "horario" TEXT,
    "local" TEXT,
    "frequencia" "FrequenciaHabito" NOT NULL DEFAULT 'DIARIO',
    "diasSemana" INTEGER[],
    "status" "StatusHabito" NOT NULL DEFAULT 'ATIVO',
    "sequenciaAtual" INTEGER NOT NULL DEFAULT 0,
    "maiorSequencia" INTEGER NOT NULL DEFAULT 0,
    "totalCompletados" INTEGER NOT NULL DEFAULT 0,
    "cor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "icone" TEXT NOT NULL DEFAULT 'target',
    "identidadeId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_habitos" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "horaCompleto" TIMESTAMP(3),
    "notas" TEXT,
    "habitoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_habitos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "identidades_userId_idx" ON "identidades"("userId");

-- CreateIndex
CREATE INDEX "habitos_userId_status_idx" ON "habitos"("userId", "status");

-- CreateIndex
CREATE INDEX "habitos_identidadeId_idx" ON "habitos"("identidadeId");

-- CreateIndex
CREATE INDEX "registros_habitos_userId_data_idx" ON "registros_habitos"("userId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "registros_habitos_habitoId_data_key" ON "registros_habitos"("habitoId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeSubscriptionId_key" ON "users"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "identidades" ADD CONSTRAINT "identidades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitos" ADD CONSTRAINT "habitos_identidadeId_fkey" FOREIGN KEY ("identidadeId") REFERENCES "identidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitos" ADD CONSTRAINT "habitos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_habitos" ADD CONSTRAINT "registros_habitos_habitoId_fkey" FOREIGN KEY ("habitoId") REFERENCES "habitos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_habitos" ADD CONSTRAINT "registros_habitos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
