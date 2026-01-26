import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiReadRateLimiter, apiCreateRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { categoriaHabitoSchema } from '@/lib/validations/habitos';

// GET - Listar categorias de hábitos do usuário
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

    // Rate limiting
    const rateLimitResult = await apiReadRateLimiter.limit(`${user.id}:read`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const categorias = await prisma.categoriaHabito.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: { habitos: true },
        },
      },
      orderBy: [
        { ordem: 'asc' },
        { nome: 'asc' },
      ],
    });

    // Formatar resposta
    const categoriasFormatadas = categorias.map(cat => ({
      id: cat.id,
      nome: cat.nome,
      cor: cat.cor,
      icone: cat.icone,
      ordem: cat.ordem,
      totalHabitos: cat._count.habitos,
    }));

    return NextResponse.json({
      data: categoriasFormatadas,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar categorias de hábitos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar nova categoria de hábito
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

    // Rate limiting
    const rateLimitResult = await apiCreateRateLimiter.limit(`${user.id}:create`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const body = await req.json();

    // Validar dados de entrada
    const validationResult = categoriaHabitoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nome, cor, icone, ordem } = validationResult.data;

    // Verificar se já existe categoria com mesmo nome
    const categoriaExistente = await prisma.categoriaHabito.findUnique({
      where: {
        userId_nome: {
          userId: user.id,
          nome,
        },
      },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com esse nome' },
        { status: 409 }
      );
    }

    // Obter a maior ordem atual para posicionar a nova categoria no final
    const ultimaCategoria = await prisma.categoriaHabito.findFirst({
      where: { userId: user.id },
      orderBy: { ordem: 'desc' },
    });
    const novaOrdem = ordem ?? (ultimaCategoria ? ultimaCategoria.ordem + 1 : 0);

    const categoria = await prisma.categoriaHabito.create({
      data: {
        nome,
        cor,
        icone,
        ordem: novaOrdem,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Categoria criada com sucesso', data: categoria },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar categoria de hábito:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
