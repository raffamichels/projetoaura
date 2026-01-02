-- CreateTable
CREATE TABLE "atividades" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "metadata" JSONB,
    "icone" TEXT NOT NULL DEFAULT 'activity',
    "cor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atividades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "atividades_userId_createdAt_idx" ON "atividades"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
