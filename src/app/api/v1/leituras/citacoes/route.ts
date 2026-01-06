import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';

// GET - Listar todas as citações
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
    const destaque = searchParams.get('destaque');
    const midiaId = searchParams.get('midiaId');

    const where: any = { userId: user.id };
    if (destaque === 'true') where.destaque = true;
    if (midiaId) where.midiaId = midiaId;

    const citacoes = await prisma.citacao.findMany({
      where,
      include: {
        midia: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
            autor: true,
            diretor: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: citacoes }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar citações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar uma nova citação
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

    // Validações
    if (!body.texto) {
      return NextResponse.json({ error: 'Texto da citação é obrigatório' }, { status: 400 });
    }

    // Se midiaId foi fornecido, verificar se pertence ao usuário
    if (body.midiaId) {
      const midia = await prisma.midia.findFirst({
        where: {
          id: body.midiaId,
          userId: user.id,
        },
      });

      if (!midia) {
        return NextResponse.json({ error: 'Mídia não encontrada' }, { status: 404 });
      }
    }

    const citacao = await prisma.citacao.create({
      data: {
        texto: body.texto,
        autor: body.autor,
        pagina: body.pagina,
        destaque: body.destaque || false,
        midiaId: body.midiaId,
        userId: user.id,
      },
      include: {
        midia: {
          select: {
            titulo: true,
            tipo: true,
          },
        },
      },
    });

    // Registrar atividade
    await registrarAtividade({
      userId: user.id,
      tipo: 'leitura_citacao_criada',
      titulo: 'Nova citação adicionada',
      descricao: body.texto.substring(0, 100) + (body.texto.length > 100 ? '...' : ''),
      metadata: { citacaoId: citacao.id, midiaId: body.midiaId },
    });

    return NextResponse.json(
      { message: 'Citação criada com sucesso', data: citacao },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar citação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
