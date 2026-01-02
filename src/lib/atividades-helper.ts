// src/lib/atividades-helper.ts
// Funções auxiliares para registrar atividades

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

interface RegistrarAtividadeParams {
  userId: string;
  tipo: 'compromisso_criado' | 'compromisso_editado' | 'compromisso_excluido';
  titulo: string;
  descricao?: string;
  metadata?: Prisma.InputJsonValue;
}

export async function registrarAtividade({
  userId,
  tipo,
  titulo,
  descricao,
  metadata,
}: RegistrarAtividadeParams) {
  try {
    // Mapear tipo para ícone e cor
    const config = {
      compromisso_criado: {
        icone: 'calendar-check',
        cor: '#10B981', // verde
      },
      compromisso_editado: {
        icone: 'edit',
        cor: '#3B82F6', // azul
      },
      compromisso_excluido: {
        icone: 'calendar-x',
        cor: '#EF4444', // vermelho
      },
    };

    const { icone, cor } = config[tipo];

    await prisma.atividade.create({
      data: {
        tipo,
        titulo,
        descricao,
        icone,
        cor,
        metadata,
        userId,
      },
    });
  } catch (error) {
    // Não quebrar a aplicação se falhar ao registrar atividade
    console.error('Erro ao registrar atividade:', error);
  }
}