import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// GET - Buscar anotação específica
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

    const anotacao = await prisma.anotacao.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        curso: true
      }
    });

    if (!anotacao) {
      return NextResponse.json({ error: 'Anotação não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: anotacao }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar anotação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar anotação
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
    const { titulo, conteudo, cor, cursoId } = body;

    const anotacaoExistente = await prisma.anotacao.findFirst({
      where: { id, userId: user.id }
    });

    if (!anotacaoExistente) {
      return NextResponse.json({ error: 'Anotação não encontrada' }, { status: 404 });
    }

    // Se cursoId foi informado, verificar se pertence ao usuário
    if (cursoId) {
      const curso = await prisma.curso.findFirst({
        where: { id: cursoId, userId: user.id }
      });

      if (!curso) {
        return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
      }
    }

    const anotacao = await prisma.anotacao.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(conteudo !== undefined && { conteudo }),
        ...(cor !== undefined && { cor }),
        ...(cursoId !== undefined && { cursoId }),
      },
    });

    return NextResponse.json(
      { message: 'Anotação atualizada com sucesso', data: anotacao },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar anotação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir anotação
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

    const anotacao = await prisma.anotacao.findFirst({
      where: { id, userId: user.id }
    });

    if (!anotacao) {
      return NextResponse.json({ error: 'Anotação não encontrada' }, { status: 404 });
    }

    await prisma.anotacao.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Anotação excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir anotação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
