import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// GET - Buscar categoria específica
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

    const categoria = await prisma.categoria.findFirst({
      where: { 
        id,
        userId: user.id,
      },
      include: {
        subcategorias: true,
        transacoes: {
          take: 10,
          orderBy: { data: 'desc' },
        },
      },
    });

    if (!categoria) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: categoria }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar categoria
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

    const categoriaExistente = await prisma.categoria.findFirst({
      where: { 
        id,
        userId: user.id,
      },
    });

    if (!categoriaExistente) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    const body = await req.json();
    const { nome, tipo, cor, icone } = body;

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        nome,
        tipo,
        cor,
        icone,
      },
    });

    return NextResponse.json(
      { message: 'Categoria atualizada com sucesso', data: categoria },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir categoria
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

    const categoria = await prisma.categoria.findFirst({
      where: { 
        id,
        userId: user.id,
      },
    });

    if (!categoria) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    // Verificar se tem transações vinculadas
    const temTransacoes = await prisma.transacao.count({
      where: { categoriaId: id },
    });

    if (temTransacoes > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir. Existem ${temTransacoes} transações vinculadas a esta categoria.` },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Categoria excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
