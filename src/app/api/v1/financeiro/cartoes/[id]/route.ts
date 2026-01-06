import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';

// GET - Buscar cartão específico
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

    const cartao = await prisma.cartao.findFirst({
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

    if (!cartao) {
      return NextResponse.json({ error: 'Cartão não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: cartao }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar cartão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar cartão
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

    const cartaoExistente = await prisma.cartao.findFirst({
      where: { 
        id,
        userId: user.id,
      },
    });

    if (!cartaoExistente) {
      return NextResponse.json({ error: 'Cartão não encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { 
      nome, 
      bandeira, 
      ultimosDigitos, 
      limite, 
      diaVencimento, 
      diaFechamento,
      cor, 
      icone,
      ativo
    } = body;

    const cartao = await prisma.cartao.update({
      where: { id },
      data: {
        nome,
        bandeira,
        ultimosDigitos,
        limite,
        diaVencimento,
        diaFechamento,
        cor,
        icone,
        ativo,
      },
    });

    // Registrar atividade
    await registrarAtividade({
      userId: user.id,
      tipo: 'financeiro_cartao_editado',
      titulo: `Cartão atualizado: ${nome}`,
      descricao: `${bandeira || 'Cartão'}`,
      metadata: {
        cartaoId: cartao.id,
      },
    });

    return NextResponse.json(
      { message: 'Cartão atualizado com sucesso', data: cartao },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar cartão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir cartão
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

    const cartao = await prisma.cartao.findFirst({
      where: { 
        id,
        userId: user.id,
      },
    });

    if (!cartao) {
      return NextResponse.json({ error: 'Cartão não encontrado' }, { status: 404 });
    }

    // VALIDAÇÃO CRÍTICA: Verificar se existem transações vinculadas
    const transacoesVinculadas = await prisma.transacao.count({
      where: {
        cartaoId: id,
        userId: user.id,
      },
    });

    if (transacoesVinculadas > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir este cartão pois existem ${transacoesVinculadas} transação(ões) vinculada(s) a ele. Exclua ou transfira as transações primeiro.`,
        },
        { status: 400 }
      );
    }

    await prisma.cartao.delete({
      where: { id },
    });

    // Registrar atividade
    await registrarAtividade({
      userId: user.id,
      tipo: 'financeiro_cartao_excluido',
      titulo: `Cartão excluído: ${cartao.nome}`,
      descricao: `${cartao.bandeira || 'Cartão'}`,
      metadata: {
        cartaoId: id,
      },
    });

    return NextResponse.json(
      { message: 'Cartão excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir cartão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
