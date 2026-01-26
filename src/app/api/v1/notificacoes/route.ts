import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiReadRateLimiter, apiCreateRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { notificacaoSchema } from '@/lib/validations/notificacoes';

// GET - Listar notificações do usuário (paginado)
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

    // Parâmetros de paginação
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const apenasNaoLidas = searchParams.get('naoLidas') === 'true';

    const skip = (page - 1) * limit;

    const where = {
      userId: user.id,
      ...(apenasNaoLidas && { lida: false }),
    };

    const [notificacoes, total] = await Promise.all([
      prisma.notificacao.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notificacao.count({ where }),
    ]);

    return NextResponse.json({
      data: notificacoes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar notificação (para uso interno/testes)
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
    const validationResult = notificacaoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { tipo, titulo, mensagem, dados } = validationResult.data;

    const notificacao = await prisma.notificacao.create({
      data: {
        tipo,
        titulo,
        mensagem,
        dados,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Notificação criada', data: notificacao },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
