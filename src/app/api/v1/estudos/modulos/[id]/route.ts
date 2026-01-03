import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Buscar módulo específico
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

    const modulo = await prisma.modulo.findFirst({
      where: {
        id,
        curso: {
          userId: user.id
        }
      },
      include: {
        paginas: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!modulo) {
      return NextResponse.json({ error: 'Módulo não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: modulo }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar módulo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar módulo
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
    const { nome, descricao, ordem } = body;

    const moduloExistente = await prisma.modulo.findFirst({
      where: {
        id,
        curso: {
          userId: user.id
        }
      }
    });

    if (!moduloExistente) {
      return NextResponse.json({ error: 'Módulo não encontrado' }, { status: 404 });
    }

    const modulo = await prisma.modulo.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(ordem !== undefined && { ordem }),
      },
    });

    return NextResponse.json(
      { message: 'Módulo atualizado com sucesso', data: modulo },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar módulo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir módulo
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

    const modulo = await prisma.modulo.findFirst({
      where: {
        id,
        curso: {
          userId: user.id
        }
      }
    });

    if (!modulo) {
      return NextResponse.json({ error: 'Módulo não encontrado' }, { status: 404 });
    }

    await prisma.modulo.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Módulo excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir módulo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
