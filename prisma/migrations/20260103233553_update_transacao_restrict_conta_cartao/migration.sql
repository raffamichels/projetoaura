-- DropForeignKey
ALTER TABLE "transacoes" DROP CONSTRAINT "transacoes_cartaoId_fkey";

-- DropForeignKey
ALTER TABLE "transacoes" DROP CONSTRAINT "transacoes_contaBancariaId_fkey";

-- CreateIndex
CREATE INDEX "transacoes_contaBancariaId_idx" ON "transacoes"("contaBancariaId");

-- CreateIndex
CREATE INDEX "transacoes_cartaoId_idx" ON "transacoes"("cartaoId");

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
