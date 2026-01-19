-- Simplify habits module: remove Identidade model and related fields

-- Step 1: Remove the foreign key constraint from habitos to identidades
ALTER TABLE "habitos" DROP CONSTRAINT IF EXISTS "habitos_identidadeId_fkey";

-- Step 2: Remove columns from habitos that are no longer needed
ALTER TABLE "habitos" DROP COLUMN IF EXISTS "identidadeId";
ALTER TABLE "habitos" DROP COLUMN IF EXISTS "frequencia";
ALTER TABLE "habitos" DROP COLUMN IF EXISTS "local";

-- Step 3: Drop the identidades table
DROP TABLE IF EXISTS "identidades";

-- Step 4: Drop the FrequenciaHabito enum (if exists)
DROP TYPE IF EXISTS "FrequenciaHabito";

-- Step 5: Update index (remove old, add new if needed)
DROP INDEX IF EXISTS "habitos_identidadeId_idx";
