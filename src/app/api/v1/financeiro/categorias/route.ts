import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar categorias do usuário
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
    const tipo = searchParams.get('tipo'); // RECEITA ou DESPESA

    const categorias = await prisma.categoria.findMany({
      where: { 
        userId: user.id,
        ...(tipo && { tipo: tipo as 'RECEITA' | 'DESPESA' }),
      },
      include: {
        subcategorias: true,
      },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json({ data: categorias }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar nova categoria
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
    const { nome, tipo, cor, icone, categoriaPaiId } = body;

    if (!nome || !tipo) {
      return NextResponse.json(
        { error: 'Nome e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe categoria com mesmo nome e tipo
    const existente = await prisma.categoria.findUnique({
      where: {
        userId_nome_tipo: {
          userId: user.id,
          nome: nome,
          tipo: tipo,
        },
      },
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome para este tipo' },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
        tipo,
        cor: cor || '#8B5CF6',
        icone: icone || 'tag',
        categoriaPaiId: categoriaPaiId || null,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Categoria criada com sucesso', data: categoria },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
