import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';

// GET - Buscar conta específica
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

    const conta = await prisma.contaBancaria.findFirst({
      where: { 
        id,
        userId: user.id,
      },
      include: {
        transacoes: {
          take: 10,
          orderBy: { data: 'desc' },
        },
      },
    });

    if (!conta) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: conta }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar conta
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

    const contaExistente = await prisma.contaBancaria.findFirst({
      where: { 
        id,
        userId: user.id,
      },
    });

    if (!contaExistente) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    const body = await req.json();
    const { nome, tipo, banco, cor, icone, ativa } = body;

    const conta = await prisma.contaBancaria.update({
      where: { id },
      data: {
        nome,
        tipo,
        banco,
        cor,
        icone,
        ativa,
      },
    });

    // Registrar atividade
    await registrarAtividade({
      userId: user.id,
      tipo: 'financeiro_conta_editada',
      titulo: `Conta atualizada: ${nome}`,
      descricao: `${tipo}`,
      metadata: {
        contaId: conta.id,
      },
    });

    return NextResponse.json(
      { message: 'Conta atualizada com sucesso', data: conta },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir conta
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

    const conta = await prisma.contaBancaria.findFirst({
      where: { 
        id,
        userId: user.id,
      },
    });

    if (!conta) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    // VALIDAÇÃO CRÍTICA: Verificar se existem transações vinculadas
    const transacoesVinculadas = await prisma.transacao.count({
      where: {
        contaBancariaId: id,
        userId: user.id,
      },
    });

    if (transacoesVinculadas > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir esta conta pois existem ${transacoesVinculadas} transação(ões) vinculada(s) a ela. Exclua ou transfira as transações primeiro.`,
        },
        { status: 400 }
      );
    }

    await prisma.contaBancaria.delete({
      where: { id },
    });

    // Registrar atividade
    await registrarAtividade({
      userId: user.id,
      tipo: 'financeiro_conta_excluida',
      titulo: `Conta excluída: ${conta.nome}`,
      descricao: `${conta.tipo}`,
      metadata: {
        contaId: id,
      },
    });

    return NextResponse.json(
      { message: 'Conta excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}