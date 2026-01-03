import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Buscar curso específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const curso = await prisma.curso.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        modulos: {
          orderBy: { ordem: 'asc' },
          include: {
            _count: {
              select: { paginas: true }
            }
          }
        },
        anotacoes: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!curso) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: curso }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar curso
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { nome, descricao, cor, icone, ativo, ordem } = body;

    const cursoExistente = await prisma.curso.findFirst({
      where: { id, userId: user.id }
    });

    if (!cursoExistente) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
    }

    const curso = await prisma.curso.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(cor !== undefined && { cor }),
        ...(icone !== undefined && { icone }),
        ...(ativo !== undefined && { ativo }),
        ...(ordem !== undefined && { ordem }),
      },
    });

    return NextResponse.json(
      { message: 'Curso atualizado com sucesso', data: curso },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir curso
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const curso = await prisma.curso.findFirst({
      where: { id, userId: user.id }
    });

    if (!curso) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
    }

    await prisma.curso.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Curso excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
