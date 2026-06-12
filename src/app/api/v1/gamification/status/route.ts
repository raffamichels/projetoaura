import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { getGamificationStatus, checkAndUnlockAchievements } from '@/lib/gamification/engine';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    await checkAndUnlockAchievements(user.id);

    const status = await getGamificationStatus(user.id);

    if (!status) {
      return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
    }

    return NextResponse.json({ data: status }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar status de gamificação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
