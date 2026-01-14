import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { cancelSubscription } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { immediately = false } = body;

    // Buscar subscription do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeSubscriptionId: true },
    });

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 400 }
      );
    }

    // Cancelar subscription
    const subscription = await cancelSubscription(
      user.stripeSubscriptionId,
      immediately
    );

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar assinatura' },
      { status: 500 }
    );
  }
}
