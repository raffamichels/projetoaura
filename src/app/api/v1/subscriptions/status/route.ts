import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import prisma from '@/lib/prisma';
import { PLANS } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados de assinatura do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plano: true,
        planoExpiraEm: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Determinar informações do plano
    let planName = 'Free';
    let planInterval = null;

    if (user.stripePriceId === PLANS.MONTHLY.priceId) {
      planName = PLANS.MONTHLY.name;
      planInterval = PLANS.MONTHLY.interval;
    } else if (user.stripePriceId === PLANS.YEARLY.priceId) {
      planName = PLANS.YEARLY.name;
      planInterval = PLANS.YEARLY.interval;
    }

    return NextResponse.json({
      plano: user.plano,
      planName,
      planInterval,
      status: user.stripeSubscriptionStatus,
      currentPeriodEnd: user.stripeCurrentPeriodEnd,
      hasActiveSubscription: !!user.stripeSubscriptionId,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status da assinatura' },
      { status: 500 }
    );
  }
}
