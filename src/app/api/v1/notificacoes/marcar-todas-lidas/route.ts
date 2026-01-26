import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiCreateRateLimiter, rateLimitResponse } from '@/lib/rateLimit';

// PUT - Marcar todas as notificações como lidas
export async function PUT(req: NextRequest) {
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
    const rateLimitResult = await apiCreateRateLimiter.limit(`${user.id}:update`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const resultado = await prisma.notificacao.updateMany({
      where: {
        userId: user.id,
        lida: false,
      },
      data: {
        lida: true,
        lidaEm: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Todas as notificações foram marcadas como lidas',
      count: resultado.count,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
