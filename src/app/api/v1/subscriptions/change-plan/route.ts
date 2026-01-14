import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { updateSubscriptionPlan, PLANS } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { newPriceId } = body;

    // Validar priceId
    if (
      newPriceId !== PLANS.MONTHLY.priceId &&
      newPriceId !== PLANS.YEARLY.priceId
    ) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Buscar subscription do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeSubscriptionId: true, stripePriceId: true },
    });

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 400 }
      );
    }

    if (user.stripePriceId === newPriceId) {
      return NextResponse.json(
        { error: 'Você já está neste plano' },
        { status: 400 }
      );
    }

    // Atualizar plano
    const subscription = await updateSubscriptionPlan(
      user.stripeSubscriptionId,
      newPriceId
    );

    return NextResponse.json({
      success: true,
      newPriceId: subscription.items.data[0]?.price.id,
    });
  } catch (error) {
    console.error('Error changing plan:', error);
    return NextResponse.json(
      { error: 'Erro ao trocar plano' },
      { status: 500 }
    );
  }
}
