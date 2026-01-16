import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { createSubscription, getOrCreateStripeCustomer, PLANS } from '@/lib/stripe';

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

    // Criar subscription
    const subscription = await createSubscription(customerId, priceId);

    // Log da subscription criada
    console.log('✅ Subscription criada:', {
      subscriptionId: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0]?.price.id,
      interval: subscription.items.data[0]?.price.recurring?.interval,
      currentPeriodEnd: (subscription as unknown as { current_period_end: number }).current_period_end,
      currentPeriodEndDate: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
    });

    // Extrair o client secret do payment intent
    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent as any;
    const clientSecret = paymentIntent?.client_secret;

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Erro ao criar checkout' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
