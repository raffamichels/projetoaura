import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar anotações
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const cursoId = searchParams.get('cursoId');

    const anotacoes = await prisma.anotacao.findMany({
      where: {
        userId: user.id,
        ...(cursoId && { cursoId })
      },
      include: {
        curso: {
          select: {
            id: true,
            nome: true,
            cor: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: anotacoes }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar anotações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar anotação
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { titulo, conteudo, cor, cursoId } = body;

    if (!titulo) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
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

    const anotacao = await prisma.anotacao.create({
      data: {
        titulo,
        conteudo: conteudo || '',
        cor: cor || '#FBBF24',
        cursoId,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Anotação criada com sucesso', data: anotacao },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar anotação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
