import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { createSubscriptionWithIntent, getOrCreateStripeCustomer, PLANS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId } = body;

    // Log detalhado para debug
    console.log('🛒 CREATE CHECKOUT - Dados recebidos:', {
      priceIdRecebido: priceId,
      planoMensal: PLANS.MONTHLY.priceId,
      planoAnual: PLANS.YEARLY.priceId,
      isPlanoMensal: priceId === PLANS.MONTHLY.priceId,
      isPlanoAnual: priceId === PLANS.YEARLY.priceId,
    });

    // Validar priceId
    if (
      priceId !== PLANS.MONTHLY.priceId &&
      priceId !== PLANS.YEARLY.priceId
    ) {
      console.error('❌ PriceId inválido:', priceId);
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Criar ou obter cliente Stripe
    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email!,
      session.user.name
    );

    // Criar subscription com intent
    const { subscriptionId, clientSecret, type } = await createSubscriptionWithIntent(
      customerId,
      priceId
    );

    console.log('✅ Subscription criada:', { subscriptionId, hasClientSecret: !!clientSecret, type });

    return NextResponse.json({
      subscriptionId,
      clientSecret,
      type,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
