import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';

// POST - Contribuir para objetivo
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { id } = await context.params;

    const objetivo = await prisma.objetivoFinanceiro.findFirst({
      where: { 
        id,
        userId: user.id,
      },
    });

    if (!objetivo) {
      return NextResponse.json({ error: 'Objetivo não encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { valor, descricao, contaBancariaId } = body;

    if (!valor || valor <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Criar transação vinculada ao objetivo
    const transacao = await prisma.transacao.create({
      data: {
        descricao: descricao || `Contribuição para ${objetivo.nome}`,
        valor,
        data: new Date(),
        tipo: 'DESPESA',
        observacoes: `Contribuição para objetivo: ${objetivo.nome}`,
        objetivoId: id,
        contaBancariaId,
        userId: user.id,
      },
    });

    // Atualizar valor atual do objetivo
    const objetivoAtualizado = await prisma.objetivoFinanceiro.update({
      where: { id },
      data: {
        valorAtual: {
          increment: valor,
        },
      },
    });

    // Atualizar saldo da conta se fornecida
    if (contaBancariaId) {
      await prisma.contaBancaria.update({
        where: { id: contaBancariaId },
        data: {
          saldoAtual: {
            decrement: valor,
          },
        },
      });
    }

    // Verificar se objetivo foi concluído
    const valorAtual = Number(objetivoAtualizado.valorAtual);
    const valorMeta = Number(objetivoAtualizado.valorMeta);

    if (valorAtual >= valorMeta && objetivo.status !== 'CONCLUIDO') {
      await prisma.objetivoFinanceiro.update({
        where: { id },
        data: {
          status: 'CONCLUIDO',
        },
      });

      // Registrar atividade de conclusão
      await registrarAtividade({
        userId: user.id,
        tipo: 'financeiro_objetivo_concluido',
        titulo: `Objetivo concluído: ${objetivo.nome}`,
        descricao: `Meta de R$ ${valorMeta.toFixed(2)} atingida! 🎉`,
        metadata: {
          objetivoId: objetivo.id,
          valorMeta: valorMeta,
        },
      });
    }

    return NextResponse.json(
      { 
        message: 'Contribuição realizada com sucesso',
        data: {
          transacao,
          objetivo: objetivoAtualizado,
          concluido: valorAtual >= valorMeta,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao contribuir para objetivo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}