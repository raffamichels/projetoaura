/**
 * Script de Migração de Usernames
 *
 * Este script gera usernames únicos para usuários existentes que não possuem um.
 * O username é gerado baseado no email do usuário.
 *
 * Executar com: npx ts-node scripts/migrate-usernames.ts
 * Ou: npx tsx scripts/migrate-usernames.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista de usernames reservados
const RESERVED_USERNAMES = [
  'admin', 'administrator', 'root', 'system', 'aura',
  'support', 'help', 'info', 'contact', 'api',
  'dashboard', 'settings', 'profile', 'login', 'register',
  'signup', 'signin', 'logout', 'signout', 'auth',
  'null', 'undefined', 'true', 'false', 'test',
  'mod', 'moderator', 'staff', 'team', 'oficial',
  'official', 'verified', 'premium', 'free', 'pro',
];

/**
 * Gera um username base a partir do email
 */
function generateUsernameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  return localPart
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 20);
}

/**
 * Verifica se o username é válido (não reservado e formato correto)
 */
function isValidUsername(username: string): boolean {
  if (username.length < 3 || username.length > 30) return false;
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) return false;
  if (username.startsWith('.') || username.endsWith('.')) return false;
  if (username.includes('..')) return false;
  if (RESERVED_USERNAMES.includes(username)) return false;
  return true;
}

/**
 * Obtém um username único, adicionando sufixo numérico se necessário
 */
async function getUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername;

  // Garantir que o base username seja válido
  if (!isValidUsername(username)) {
    username = 'user';
  }

  let counter = 1;

  while (true) {
    // Verificar se é reservado
    if (RESERVED_USERNAMES.includes(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
      continue;
    }

    // Verificar no banco
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (!existing) {
      return username;
    }

    // Username já existe, adicionar sufixo
    username = `${baseUsername}${counter}`;
    counter++;

    // Garantir que não ultrapasse 30 caracteres
    if (username.length > 30) {
      const maxBaseLength = 30 - String(counter).length;
      username = `${baseUsername.slice(0, maxBaseLength)}${counter}`;
    }

    // Limite de segurança
    if (counter > 10000) {
      throw new Error(`Não foi possível gerar username único para: ${baseUsername}`);
    }
  }
}

/**
 * Função principal de migração
 */
async function migrateUsernames() {
  console.log('===========================================');
  console.log('   MIGRAÇÃO DE USERNAMES - PROJETO AURA   ');
  console.log('===========================================\n');

  try {
    // Buscar todos os usuários sem username
    const usersWithoutUsername = await prisma.user.findMany({
      where: { username: null },
      select: { id: true, email: true, name: true },
    });

    console.log(`Encontrados ${usersWithoutUsername.length} usuários sem username\n`);

    if (usersWithoutUsername.length === 0) {
      console.log('Nenhum usuário para migrar. Todos já possuem username.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutUsername) {
      try {
        const baseUsername = generateUsernameFromEmail(user.email);
        const uniqueUsername = await getUniqueUsername(baseUsername);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            username: uniqueUsername,
            // NÃO definir usernameChangedAt para permitir alteração imediata
          },
        });

        console.log(`✓ Migrado: ${user.email} -> @${uniqueUsername}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Erro ao migrar usuário ${user.id} (${user.email}):`, error);
        errorCount++;
      }
    }

    console.log('\n===========================================');
    console.log('              RESULTADO                    ');
    console.log('===========================================');
    console.log(`Total de usuários: ${usersWithoutUsername.length}`);
    console.log(`Migrados com sucesso: ${successCount}`);
    console.log(`Erros: ${errorCount}`);
    console.log('===========================================\n');

    if (errorCount === 0) {
      console.log('Migração concluída com sucesso!');
    } else {
      console.log('Migração concluída com alguns erros. Verifique os logs acima.');
    }
  } catch (error) {
    console.error('Erro fatal durante a migração:', error);
    process.exit(1);
  }
}

// Executar
migrateUsernames()
  .catch((error) => {
    console.error('Erro ao executar migração:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
