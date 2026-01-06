import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar cursos
export async function GET() {
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

    const cursos = await prisma.curso.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { modulos: true, anotacoes: true }
        }
      },
      orderBy: { ordem: 'asc' },
    });

    return NextResponse.json({ data: cursos }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar curso
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
    const { nome, descricao, cor, icone, ordem } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const curso = await prisma.curso.create({
      data: {
        nome,
        descricao,
        cor: cor || '#8B5CF6',
        icone: icone || 'book-open',
        ordem: ordem || 0,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Curso criado com sucesso', data: curso },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar curso:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
