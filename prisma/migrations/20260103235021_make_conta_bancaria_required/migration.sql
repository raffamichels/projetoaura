/*
  Warnings:

  - Made the column `contaBancariaId` on table `transacoes` required. This step will fail if there are existing NULL values in that column.

*/

-- Primeiro, precisamos garantir que todas as transações tenham uma conta vinculada
-- Se houver transações sem conta, vamos criar uma conta "Migração" e vincular a elas

DO $$
DECLARE
  default_conta_id TEXT;
  user_id_var TEXT;
BEGIN
  -- Para cada usuário que tem transações sem conta
  FOR user_id_var IN
    SELECT DISTINCT "userId"
    FROM transacoes
    WHERE "contaBancariaId" IS NULL
  LOOP
    -- Verificar se o usuário já tem uma conta
    SELECT id INTO default_conta_id
    FROM contas_bancarias
    WHERE "userId" = user_id_var
    LIMIT 1;

    -- Se não tiver conta, criar uma
    IF default_conta_id IS NULL THEN
      INSERT INTO contas_bancarias (
        id,
        nome,
        tipo,
        "saldoInicial",
        "saldoAtual",
        cor,
        icone,
        ativa,
        "userId",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text,
        'Conta Principal',
        'CORRENTE',
        0,
        0,
        '#10B981',
        'wallet',
        true,
        user_id_var,
        NOW(),
        NOW()
      )
      RETURNING id INTO default_conta_id;
    END IF;

    -- Atualizar transações sem conta para usar a conta padrão
    UPDATE transacoes
    SET "contaBancariaId" = default_conta_id
    WHERE "userId" = user_id_var
    AND "contaBancariaId" IS NULL;
  END LOOP;
END $$;

-- DropForeignKey
ALTER TABLE "transacoes" DROP CONSTRAINT "transacoes_cartaoId_fkey";

-- AlterTable - Agora tornar contaBancariaId obrigatório
ALTER TABLE "transacoes" ALTER COLUMN "contaBancariaId" SET NOT NULL;

-- AddForeignKey - Cartão agora é SET NULL (opcional)
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
