-- CreateEnum
CREATE TYPE "TipoMidia" AS ENUM ('LIVRO', 'FILME');

-- CreateEnum
CREATE TYPE "StatusLeitura" AS ENUM ('PROXIMO', 'EM_ANDAMENTO', 'PAUSADO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "FonteLivro" AS ENUM ('EMPRESTADO', 'FISICO', 'KINDLE', 'DIGITAL');

-- CreateTable
CREATE TABLE "midias" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMidia" NOT NULL,
    "titulo" TEXT NOT NULL,
    "capa" TEXT,
    "cor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "autor" TEXT,
    "editora" TEXT,
    "genero" TEXT,
    "fonte" "FonteLivro",
    "diretor" TEXT,
    "duracao" INTEGER,
    "anoLancamento" INTEGER,
    "idioma" TEXT,
    "status" "StatusLeitura" NOT NULL DEFAULT 'PROXIMO',
    "nota" INTEGER,
    "dataInicio" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "impressoesIniciais" TEXT,
    "principaisAprendizados" TEXT,
    "trechosMemoraveis" TEXT,
    "reflexao" TEXT,
    "aprendizadosPraticos" TEXT,
    "consideracoesFinais" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "midias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citacoes" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "autor" TEXT,
    "pagina" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "midiaId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "midias_userId_tipo_status_idx" ON "midias"("userId", "tipo", "status");

-- CreateIndex
CREATE INDEX "midias_userId_createdAt_idx" ON "midias"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "citacoes_userId_destaque_idx" ON "citacoes"("userId", "destaque");

-- CreateIndex
CREATE INDEX "citacoes_midiaId_idx" ON "citacoes"("midiaId");

-- CreateIndex
CREATE INDEX "citacoes_userId_createdAt_idx" ON "citacoes"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "midias" ADD CONSTRAINT "midias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citacoes" ADD CONSTRAINT "citacoes_midiaId_fkey" FOREIGN KEY ("midiaId") REFERENCES "midias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citacoes" ADD CONSTRAINT "citacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
