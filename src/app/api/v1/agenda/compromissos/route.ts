import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Listar compromissos
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const compromissos = await prisma.compromisso.findMany({
      where: { userId: user.id },
      orderBy: { data: 'asc' },
    });

    return NextResponse.json({ data: compromissos });
  } catch (error) {
    console.error('Erro ao buscar compromissos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar compromisso
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { titulo, descricao, data, horaInicio, horaFim, categoria, cor } = body;

    // Validações básicas
    if (!titulo || !data || !horaInicio) {
      return NextResponse.json(
        { error: 'Título, data e horário de início são obrigatórios' },
        { status: 400 }
      );
    }

    const compromisso = await prisma.compromisso.create({
      data: {
        titulo,
        descricao,
        data: new Date(data),
        horaInicio,
        horaFim,
        categoria,
        cor: cor || '#8B5CF6',
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Compromisso criado com sucesso', data: compromisso },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar compromisso:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}