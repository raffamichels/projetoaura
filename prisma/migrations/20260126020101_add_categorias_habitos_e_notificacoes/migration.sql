-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('LEMBRETE_HABITO', 'RESUMO_DIARIO', 'SEQUENCIA_RISCO', 'CONQUISTA', 'SISTEMA');

-- AlterTable
ALTER TABLE "habitos" ADD COLUMN     "categoriaId" TEXT;

-- CreateTable
CREATE TABLE "categorias_habitos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "icone" TEXT NOT NULL DEFAULT 'folder',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_habitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "dados" JSONB,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "lidaEm" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferencias_notificacao" (
    "id" TEXT NOT NULL,
    "lembreteHabitoAtivo" BOOLEAN NOT NULL DEFAULT true,
    "resumoDiarioAtivo" BOOLEAN NOT NULL DEFAULT true,
    "horarioResumoDiario" TEXT NOT NULL DEFAULT '07:00',
    "alertaSequenciaAtivo" BOOLEAN NOT NULL DEFAULT true,
    "toastAtivo" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferencias_notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categorias_habitos_userId_ordem_idx" ON "categorias_habitos"("userId", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_habitos_userId_nome_key" ON "categorias_habitos"("userId", "nome");

-- CreateIndex
CREATE INDEX "notificacoes_userId_lida_createdAt_idx" ON "notificacoes"("userId", "lida", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notificacoes_userId_createdAt_idx" ON "notificacoes"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "preferencias_notificacao_userId_key" ON "preferencias_notificacao"("userId");

-- AddForeignKey
ALTER TABLE "habitos" ADD CONSTRAINT "habitos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_habitos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_habitos" ADD CONSTRAINT "categorias_habitos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferencias_notificacao" ADD CONSTRAINT "preferencias_notificacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
