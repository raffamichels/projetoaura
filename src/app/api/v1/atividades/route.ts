import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Buscar atividades recentes do usuário
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

    // Buscar últimas 10 atividades
    const atividades = await prisma.atividade.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ data: atividades }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar nova atividade
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
    const { tipo, titulo, descricao, icone, cor, metadata } = body;

    if (!tipo || !titulo) {
      return NextResponse.json(
        { error: 'Tipo e título são obrigatórios' },
        { status: 400 }
      );
    }

    const atividade = await prisma.atividade.create({
      data: {
        tipo,
        titulo,
        descricao,
        icone: icone || 'activity',
        cor: cor || '#8B5CF6',
        metadata,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Atividade criada com sucesso', data: atividade },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}