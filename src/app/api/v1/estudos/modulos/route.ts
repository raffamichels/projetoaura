import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// POST - Criar módulo
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
    const { nome, descricao, cursoId, ordem } = body;

    if (!nome || !cursoId) {
      return NextResponse.json(
        { error: 'Nome e cursoId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o curso pertence ao usuário
    const curso = await prisma.curso.findFirst({
      where: { id: cursoId, userId: user.id }
    });

    if (!curso) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
    }

    const modulo = await prisma.modulo.create({
      data: {
        nome,
        descricao,
        cursoId,
        ordem: ordem || 0,
      },
    });

    return NextResponse.json(
      { message: 'Módulo criado com sucesso', data: modulo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar módulo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
