import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { reactivateSubscription } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar subscription do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeSubscriptionId: true },
    });

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura encontrada' },
        { status: 400 }
      );
    }

    // Reativar subscription
    const subscription = await reactivateSubscription(user.stripeSubscriptionId);

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Erro ao reativar assinatura' },
      { status: 500 }
    );
  }
}
