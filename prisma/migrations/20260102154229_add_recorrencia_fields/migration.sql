-- AlterTable
ALTER TABLE "compromissos" ADD COLUMN     "dataFimRecorrencia" TIMESTAMP(3),
ADD COLUMN     "intervaloRecorrencia" INTEGER DEFAULT 1,
ADD COLUMN     "isRecorrente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recorrenciaGrupoId" TEXT,
ADD COLUMN     "recorrenciaInstancia" INTEGER DEFAULT 1,
ADD COLUMN     "tipoRecorrencia" TEXT;

-- CreateIndex
CREATE INDEX "compromissos_recorrenciaGrupoId_idx" ON "compromissos"("recorrenciaGrupoId");
