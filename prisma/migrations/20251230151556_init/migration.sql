-- CreateEnum
CREATE TYPE "PlanoUsuario" AS ENUM ('FREE', 'PREMIUM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "plano" "PlanoUsuario" NOT NULL DEFAULT 'FREE',
    "planoExpiraEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compromissos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT,
    "categoria" TEXT,
    "cor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compromissos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "compromissos_userId_data_idx" ON "compromissos"("userId", "data");

-- AddForeignKey
ALTER TABLE "compromissos" ADD CONSTRAINT "compromissos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
