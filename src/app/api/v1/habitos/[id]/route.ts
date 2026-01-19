import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiReadRateLimiter, apiUpdateRateLimiter, apiDeleteRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { habitoUpdateSchema } from '@/lib/validations/habitos';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Buscar hábito específico com histórico
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

    // Buscar últimos 30 dias de registros
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    trintaDiasAtras.setHours(0, 0, 0, 0);

    const habito = await prisma.habito.findFirst({
      where: { id, userId: user.id },
      include: {
        registros: {
          where: {
            data: {
              gte: trintaDiasAtras,
            },
          },
          orderBy: { data: 'desc' },
        },
      },
    });

    if (!habito) {
      return NextResponse.json({ error: 'Hábito não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: habito }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar hábito:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar hábito
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
    const rateLimitResult = await apiUpdateRateLimiter.limit(`${user.id}:update`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    // Verificar se o hábito pertence ao usuário
    const habitoExistente = await prisma.habito.findFirst({
      where: { id, userId: user.id },
    });

    if (!habitoExistente) {
      return NextResponse.json({ error: 'Hábito não encontrado' }, { status: 404 });
    }

    const body = await req.json();

    // Validar dados de entrada
    const validationResult = habitoUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const habito = await prisma.habito.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(
      { message: 'Hábito atualizado com sucesso', data: habito },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar hábito:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir hábito
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

    // Verificar se o hábito pertence ao usuário
    const habitoExistente = await prisma.habito.findFirst({
      where: { id, userId: user.id },
    });

    if (!habitoExistente) {
      return NextResponse.json({ error: 'Hábito não encontrado' }, { status: 404 });
    }

    await prisma.habito.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Hábito excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir hábito:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
