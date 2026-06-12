import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { checkAndUnlockAchievements, awardXP } from '@/lib/gamification/engine';

export async function POST() {
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

    const unlockedTypes = await checkAndUnlockAchievements(user.id);

    let totalXPGanho = 0;
    for (const tipo of unlockedTypes) {
      const result = await awardXP(user.id, 'DIA_PERFEITO' as never);
      totalXPGanho += result.xpGanho;
    }

    return NextResponse.json({
      data: {
        conquistasDesbloqueadas: unlockedTypes.length,
        tiposDesbloqueados: unlockedTypes,
        xpGanho: totalXPGanho,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar conquistas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
