-- CreateEnum
CREATE TYPE "StatusViagem" AS ENUM ('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "PropostoViagem" AS ENUM ('LAZER', 'TRABALHO', 'ESTUDO', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoTransporte" AS ENUM ('AVIAO', 'CARRO', 'ONIBUS', 'TREM', 'TAXI', 'UBER', 'OUTRO');

-- CreateEnum
CREATE TYPE "CategoriaAtividade" AS ENUM ('TURISMO', 'TRABALHO', 'LAZER', 'ALIMENTACAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('PASSAPORTE', 'VISTO', 'RG', 'CNH', 'SEGURO_VIAGEM', 'RESERVA', 'OUTRO');

-- CreateTable
CREATE TABLE "viagens" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "proposito" "PropostoViagem" NOT NULL DEFAULT 'LAZER',
    "status" "StatusViagem" NOT NULL DEFAULT 'PLANEJADA',
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "orcamentoTotal" DECIMAL(15,2),
    "notasGerais" TEXT,
    "avaliacaoGeral" INTEGER,
    "diario" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinos_viagem" (
    "id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "endereco" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "dataChegada" TIMESTAMP(3) NOT NULL,
    "dataSaida" TIMESTAMP(3) NOT NULL,
    "fusoHorario" TEXT,
    "idioma" TEXT,
    "moeda" TEXT,
    "voltagem" TEXT,
    "tomada" TEXT,
    "costumes" TEXT,
    "gorjetas" TEXT,
    "emergencia" TEXT,
    "frasesBasicas" TEXT,
    "temperaturaMed" TEXT,
    "previsaoClima" TEXT,
    "viagemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinos_viagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locais_salvos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "endereco" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "telefone" TEXT,
    "notas" TEXT,
    "favorito" BOOLEAN NOT NULL DEFAULT false,
    "destinoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locais_salvos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportes_viagem" (
    "id" TEXT NOT NULL,
    "tipo" "TipoTransporte" NOT NULL,
    "descricao" TEXT,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "origem" TEXT,
    "destino" TEXT,
    "companhia" TEXT,
    "numeroVoo" TEXT,
    "assento" TEXT,
    "horarioEmbarque" TIMESTAMP(3),
    "portaoEmbarque" TEXT,
    "conexao" TEXT,
    "horarioChegada" TIMESTAMP(3),
    "codigoReserva" TEXT,
    "empresa" TEXT,
    "placaVeiculo" TEXT,
    "arquivoUrl" TEXT,
    "rotaUrl" TEXT,
    "tempoEstimado" TEXT,
    "notas" TEXT,
    "viagemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transportes_viagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospedagens_viagem" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'hotel',
    "nome" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "endereco" TEXT,
    "cidade" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "telefone" TEXT,
    "email" TEXT,
    "codigoReserva" TEXT,
    "website" TEXT,
    "comprovanteUrl" TEXT,
    "avaliacaoPessoal" INTEGER,
    "notas" TEXT,
    "viagemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospedagens_viagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades_viagem" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT,
    "horaFim" TEXT,
    "local" TEXT,
    "endereco" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "categoria" "CategoriaAtividade" NOT NULL DEFAULT 'TURISMO',
    "prioridade" INTEGER NOT NULL DEFAULT 0,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "favorita" BOOLEAN NOT NULL DEFAULT false,
    "tempoEstimado" TEXT,
    "checklist" JSONB,
    "notas" TEXT,
    "viagemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atividades_viagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despesas_viagem" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "valorConvertido" DECIMAL(15,2),
    "data" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT NOT NULL,
    "formaPagamento" TEXT,
    "notas" TEXT,
    "viagemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "despesas_viagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_viagem" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "nome" TEXT NOT NULL,
    "numero" TEXT,
    "dataEmissao" TIMESTAMP(3),
    "dataValidade" TIMESTAMP(3),
    "arquivoUrl" TEXT,
    "notas" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_viagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "viagens_userId_status_idx" ON "viagens"("userId", "status");

-- CreateIndex
CREATE INDEX "viagens_userId_dataInicio_idx" ON "viagens"("userId", "dataInicio");

-- CreateIndex
CREATE INDEX "destinos_viagem_viagemId_ordem_idx" ON "destinos_viagem"("viagemId", "ordem");

-- CreateIndex
CREATE INDEX "locais_salvos_destinoId_favorito_idx" ON "locais_salvos"("destinoId", "favorito");

-- CreateIndex
CREATE INDEX "transportes_viagem_viagemId_dataHora_idx" ON "transportes_viagem"("viagemId", "dataHora");

-- CreateIndex
CREATE INDEX "hospedagens_viagem_viagemId_checkIn_idx" ON "hospedagens_viagem"("viagemId", "checkIn");

-- CreateIndex
CREATE INDEX "atividades_viagem_viagemId_data_idx" ON "atividades_viagem"("viagemId", "data");

-- CreateIndex
CREATE INDEX "atividades_viagem_viagemId_favorita_idx" ON "atividades_viagem"("viagemId", "favorita");

-- CreateIndex
CREATE INDEX "despesas_viagem_viagemId_data_idx" ON "despesas_viagem"("viagemId", "data");

-- CreateIndex
CREATE INDEX "despesas_viagem_viagemId_categoria_idx" ON "despesas_viagem"("viagemId", "categoria");

-- CreateIndex
CREATE INDEX "documentos_viagem_userId_tipo_idx" ON "documentos_viagem"("userId", "tipo");

-- CreateIndex
CREATE INDEX "documentos_viagem_userId_dataValidade_idx" ON "documentos_viagem"("userId", "dataValidade");

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destinos_viagem" ADD CONSTRAINT "destinos_viagem_viagemId_fkey" FOREIGN KEY ("viagemId") REFERENCES "viagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locais_salvos" ADD CONSTRAINT "locais_salvos_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "destinos_viagem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes_viagem" ADD CONSTRAINT "transportes_viagem_viagemId_fkey" FOREIGN KEY ("viagemId") REFERENCES "viagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospedagens_viagem" ADD CONSTRAINT "hospedagens_viagem_viagemId_fkey" FOREIGN KEY ("viagemId") REFERENCES "viagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividades_viagem" ADD CONSTRAINT "atividades_viagem_viagemId_fkey" FOREIGN KEY ("viagemId") REFERENCES "viagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesas_viagem" ADD CONSTRAINT "despesas_viagem_viagemId_fkey" FOREIGN KEY ("viagemId") REFERENCES "viagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_viagem" ADD CONSTRAINT "documentos_viagem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
