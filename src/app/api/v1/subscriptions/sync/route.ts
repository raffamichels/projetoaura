import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

/**
 * Endpoint para sincronizar manualmente os dados da subscription do Stripe com o banco de dados
 * Útil quando o webhook não disparou ou quando há inconsistências nos dados
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Usuário não possui customer ID do Stripe' },
        { status: 400 }
      );
    }

    // Buscar todas as subscriptions ativas do cliente no Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      limit: 10,
    });

    // Log para debug: ver todas as subscriptions
    console.log('📋 Subscriptions encontradas:', {
      total: subscriptions.data.length,
      subscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        priceId: sub.items.data[0]?.price.id,
        interval: sub.items.data[0]?.price.recurring?.interval,
        currentPeriodEnd: (sub as unknown as { current_period_end: number }).current_period_end,
        currentPeriodEndDate: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      })),
    });

    // Encontrar a subscription mais recente que está ativa, trialing ou paga
    // Ordenar por data de criação (mais recente primeiro)
    const sortedSubscriptions = subscriptions.data.sort((a, b) => b.created - a.created);

    // Procurar por subscription válida
    const activeSubscription = sortedSubscriptions.find((sub) => {
      // Aceitar status active e trialing
      if (sub.status === 'active' || sub.status === 'trialing') {
        return true;
      }
      // Também aceitar incomplete se o payment intent foi pago
      if (sub.status === 'incomplete') {
        const invoice = sub.latest_invoice as any;
        const paymentIntent = invoice?.payment_intent;
        if (paymentIntent && paymentIntent.status === 'succeeded') {
          console.log('⚠️ Subscription incomplete mas com pagamento confirmado:', {
            subscriptionId: sub.id,
            paymentIntentStatus: paymentIntent.status,
          });
          return true;
        }
      }
      return false;
    });

    if (!activeSubscription) {
      // Se não há subscription ativa, limpar os dados do usuário
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          plano: 'FREE',
          planoExpiraEm: null,
          stripeSubscriptionId: null,
          stripeSubscriptionStatus: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        },
      });

      return NextResponse.json({
        message: 'Nenhuma subscription ativa encontrada. Dados limpos.',
        hasActiveSubscription: false,
      });
    }

    // Atualizar dados no banco com informações do Stripe
    const currentPeriodEnd = (activeSubscription as unknown as { current_period_end: number }).current_period_end;
    const planoExpiraEm = currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000)
      : null;

    // Determinar o intervalo do plano
    const priceInterval = activeSubscription.items.data[0]?.price.recurring?.interval;
    const planName =
      priceInterval === 'year' ? 'Premium Anual' : 'Premium Mensal';

    console.log('💾 Atualizando banco de dados com:', {
      userId: session.user.id,
      plano: 'PREMIUM',
      planName,
      priceInterval,
      planoExpiraEm: planoExpiraEm?.toISOString(),
      subscriptionId: activeSubscription.id,
      status: activeSubscription.status,
      priceId: activeSubscription.items.data[0]?.price.id,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plano: 'PREMIUM',
        planoExpiraEm,
        stripeSubscriptionId: activeSubscription.id,
        stripeSubscriptionStatus: activeSubscription.status,
        stripePriceId: activeSubscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: planoExpiraEm,
      },
    });

    return NextResponse.json({
      message: 'Dados sincronizados com sucesso!',
      hasActiveSubscription: true,
      subscription: {
        id: activeSubscription.id,
        status: activeSubscription.status,
        planName,
        planInterval: priceInterval,
        currentPeriodEnd: planoExpiraEm?.toISOString(),
        priceId: activeSubscription.items.data[0]?.price.id,
      },
    });
  } catch (error) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { error: 'Erro ao sincronizar dados' },
      { status: 500 }
    );
  }
}
