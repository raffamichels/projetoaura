import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiReadRateLimiter, rateLimitResponse } from '@/lib/rateLimit';

// GET - Contar notificações não lidas
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

    const count = await prisma.notificacao.count({
      where: {
        userId: user.id,
        lida: false,
      },
    });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Erro ao contar notificações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
