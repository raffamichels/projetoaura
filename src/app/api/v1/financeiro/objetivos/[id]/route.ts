import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';
import { calcularProgressoObjetivo, calcularFaltaObjetivo } from '@/lib/financeiro-helper';

// GET - Buscar objetivo específico
export async function GET(
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
      include: {
        transacoes: {
          orderBy: { data: 'desc' },
        },
      },
    });

    if (!objetivo) {
      return NextResponse.json({ error: 'Objetivo não encontrado' }, { status: 404 });
    }

    const valorMeta = Number(objetivo.valorMeta);
    const valorAtual = Number(objetivo.valorAtual);

    const objetivoComCalculo = {
      ...objetivo,
      valorMeta,
      valorAtual,
      porcentagemAtingida: calcularProgressoObjetivo(valorAtual, valorMeta),
      falta: calcularFaltaObjetivo(valorAtual, valorMeta),
    };

    return NextResponse.json({ data: objetivoComCalculo }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar objetivo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar objetivo
export async function PUT(
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

    const objetivoExistente = await prisma.objetivoFinanceiro.findFirst({
      where: { 
        id,
        userId: user.id,
      },
    });

    if (!objetivoExistente) {
      return NextResponse.json({ error: 'Objetivo não encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { 
      nome,
      descricao,
      valorMeta,
      dataMeta,
      cor,
      icone,
      status,
    } = body;

    const objetivo = await prisma.objetivoFinanceiro.update({
      where: { id },
      data: {
        nome,
        descricao,
        valorMeta,
        dataMeta: dataMeta ? new Date(dataMeta) : null,
        cor,
        icone,
        status,
      },
    });

    // Se status mudou para CONCLUIDO, registrar atividade
    if (status === 'CONCLUIDO' && objetivoExistente.status !== 'CONCLUIDO') {
      await registrarAtividade({
        userId: user.id,
        tipo: 'financeiro_objetivo_concluido',
        titulo: `Objetivo concluído: ${nome}`,
        descricao: `Meta de R$ ${Number(valorMeta).toFixed(2)} atingida! 🎉`,
        metadata: {
          objetivoId: objetivo.id,
          valorMeta: Number(valorMeta),
        },
      });
    }

    return NextResponse.json(
      { message: 'Objetivo atualizado com sucesso', data: objetivo },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar objetivo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir objetivo
export async function DELETE(
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

    await prisma.objetivoFinanceiro.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Objetivo excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir objetivo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}