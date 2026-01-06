import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// GET - Buscar página específica
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

    const pagina = await prisma.pagina.findFirst({
      where: {
        id,
        modulo: {
          curso: {
            userId: user.id
          }
        }
      },
      include: {
        modulo: {
          include: {
            curso: true
          }
        }
      }
    });

    if (!pagina) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: pagina }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar página:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar página
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
    const { titulo, conteudo, ordem } = body;

    const paginaExistente = await prisma.pagina.findFirst({
      where: {
        id,
        modulo: {
          curso: {
            userId: user.id
          }
        }
      }
    });

    if (!paginaExistente) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    const pagina = await prisma.pagina.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(conteudo !== undefined && { conteudo }),
        ...(ordem !== undefined && { ordem }),
      },
    });

    return NextResponse.json(
      { message: 'Página atualizada com sucesso', data: pagina },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar página:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir página
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

    const pagina = await prisma.pagina.findFirst({
      where: {
        id,
        modulo: {
          curso: {
            userId: user.id
          }
        }
      }
    });

    if (!pagina) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    await prisma.pagina.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Página excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir página:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
