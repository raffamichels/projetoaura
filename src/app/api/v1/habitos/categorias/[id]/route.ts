import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiReadRateLimiter, apiCreateRateLimiter, apiDeleteRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { categoriaHabitoUpdateSchema } from '@/lib/validations/habitos';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Buscar categoria específica
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Rate limiting
    const rateLimitResult = await apiReadRateLimiter.limit(`${user.id}:read`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const categoria = await prisma.categoriaHabito.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        habitos: {
          where: {
            status: 'ATIVO',
            dataEncerramento: null,
          },
          select: {
            id: true,
            nome: true,
            cor: true,
            icone: true,
          },
        },
      },
    });

    if (!categoria) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: categoria.id,
        nome: categoria.nome,
        cor: categoria.cor,
        icone: categoria.icone,
        ordem: categoria.ordem,
        habitos: categoria.habitos,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar categoria
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Rate limiting
    const rateLimitResult = await apiCreateRateLimiter.limit(`${user.id}:update`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    // Verificar se categoria existe e pertence ao usuário
    const categoriaExistente = await prisma.categoriaHabito.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!categoriaExistente) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    const body = await req.json();

    // Validar dados de entrada
    const validationResult = categoriaHabitoUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nome, cor, icone, ordem } = validationResult.data;

    // Se está mudando o nome, verificar se já existe outra categoria com esse nome
    if (nome && nome !== categoriaExistente.nome) {
      const nomeEmUso = await prisma.categoriaHabito.findFirst({
        where: {
          userId: user.id,
          nome,
          id: { not: id },
        },
      });

      if (nomeEmUso) {
        return NextResponse.json(
          { error: 'Já existe uma categoria com esse nome' },
          { status: 409 }
        );
      }
    }

    const categoriaAtualizada = await prisma.categoriaHabito.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(cor !== undefined && { cor }),
        ...(icone !== undefined && { icone }),
        ...(ordem !== undefined && { ordem }),
      },
    });

    return NextResponse.json({
      message: 'Categoria atualizada com sucesso',
      data: categoriaAtualizada,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir categoria
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Rate limiting
    const rateLimitResult = await apiDeleteRateLimiter.limit(`${user.id}:delete`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    // Verificar se categoria existe e pertence ao usuário
    const categoria = await prisma.categoriaHabito.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!categoria) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    // Remover a categoria (os hábitos terão categoriaId = null devido ao onDelete: SetNull)
    await prisma.categoriaHabito.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Categoria excluída com sucesso',
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
