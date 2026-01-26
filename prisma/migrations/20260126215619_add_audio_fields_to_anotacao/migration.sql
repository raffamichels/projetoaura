-- AlterTable
ALTER TABLE "anotacoes" ADD COLUMN     "audioDuracao" INTEGER,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "tipoOrigem" TEXT NOT NULL DEFAULT 'texto',
ADD COLUMN     "transcricaoOriginal" TEXT;
