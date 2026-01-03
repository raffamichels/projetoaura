-- CreateEnum
CREATE TYPE "TipoConta" AS ENUM ('CORRENTE', 'POUPANCA', 'INVESTIMENTO');

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('RECEITA', 'DESPESA');

-- CreateEnum
CREATE TYPE "StatusObjetivo" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "contas_bancarias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoConta" NOT NULL DEFAULT 'CORRENTE',
    "banco" TEXT,
    "saldoInicial" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "saldoAtual" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "cor" TEXT NOT NULL DEFAULT '#10B981',
    "icone" TEXT NOT NULL DEFAULT 'wallet',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contas_bancarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "bandeira" TEXT,
    "ultimosDigitos" TEXT,
    "limite" DECIMAL(15,2),
    "diaVencimento" INTEGER,
    "diaFechamento" INTEGER,
    "cor" TEXT NOT NULL DEFAULT '#3B82F6',
    "icone" TEXT NOT NULL DEFAULT 'credit-card',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cartoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "icone" TEXT NOT NULL DEFAULT 'tag',
    "categoriaPaiId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "observacoes" TEXT,
    "isFixa" BOOLEAN NOT NULL DEFAULT false,
    "isParcela" BOOLEAN NOT NULL DEFAULT false,
    "parcelaNumero" INTEGER,
    "parcelaTotais" INTEGER,
    "grupoParcelaId" TEXT,
    "categoriaId" TEXT,
    "contaBancariaId" TEXT,
    "cartaoId" TEXT,
    "objetivoId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objetivos_financeiros" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valorMeta" DECIMAL(15,2) NOT NULL,
    "valorAtual" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataMeta" TIMESTAMP(3),
    "isReservaEmergencia" BOOLEAN NOT NULL DEFAULT false,
    "cor" TEXT NOT NULL DEFAULT '#F59E0B',
    "icone" TEXT NOT NULL DEFAULT 'target',
    "status" "StatusObjetivo" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objetivos_financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contas_bancarias_userId_ativa_idx" ON "contas_bancarias"("userId", "ativa");

-- CreateIndex
CREATE INDEX "cartoes_userId_ativo_idx" ON "cartoes"("userId", "ativo");

-- CreateIndex
CREATE INDEX "categorias_userId_tipo_idx" ON "categorias"("userId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_userId_nome_tipo_key" ON "categorias"("userId", "nome", "tipo");

-- CreateIndex
CREATE INDEX "transacoes_userId_data_idx" ON "transacoes"("userId", "data" DESC);

-- CreateIndex
CREATE INDEX "transacoes_userId_tipo_data_idx" ON "transacoes"("userId", "tipo", "data");

-- CreateIndex
CREATE INDEX "transacoes_grupoParcelaId_idx" ON "transacoes"("grupoParcelaId");

-- CreateIndex
CREATE INDEX "transacoes_categoriaId_idx" ON "transacoes"("categoriaId");

-- CreateIndex
CREATE INDEX "objetivos_financeiros_userId_status_idx" ON "objetivos_financeiros"("userId", "status");

-- AddForeignKey
ALTER TABLE "contas_bancarias" ADD CONSTRAINT "contas_bancarias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_categoriaPaiId_fkey" FOREIGN KEY ("categoriaPaiId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_objetivoId_fkey" FOREIGN KEY ("objetivoId") REFERENCES "objetivos_financeiros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetivos_financeiros" ADD CONSTRAINT "objetivos_financeiros_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
