import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiCreateRateLimiter, rateLimitResponse } from '@/lib/rateLimit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - Marcar notificação como lida
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

    // Verificar se notificação existe e pertence ao usuário
    const notificacao = await prisma.notificacao.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!notificacao) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
    }

    // Se já está lida, retornar sem atualizar
    if (notificacao.lida) {
      return NextResponse.json({ message: 'Notificação já está marcada como lida' }, { status: 200 });
    }

    const notificacaoAtualizada = await prisma.notificacao.update({
      where: { id },
      data: {
        lida: true,
        lidaEm: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Notificação marcada como lida',
      data: notificacaoAtualizada,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
