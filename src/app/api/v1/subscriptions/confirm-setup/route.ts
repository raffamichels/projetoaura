import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

/**
 * Endpoint para confirmar a subscription após o SetupIntent ser completado
 * Isso vincula o método de pagamento coletado à subscription e processa o pagamento
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { setupIntentId } = body;

    if (!setupIntentId) {
      return NextResponse.json(
        { error: 'setupIntentId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o SetupIntent para obter o payment method
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'SetupIntent não foi confirmado' },
        { status: 400 }
      );
    }

    const paymentMethodId = setupIntent.payment_method as string;
    const subscriptionId = setupIntent.metadata?.subscription_id;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Método de pagamento não encontrado' },
        { status: 400 }
      );
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID da subscription não encontrado nos metadados' },
        { status: 400 }
      );
    }

    // Buscar usuário para obter o customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 400 }
      );
    }

    // Definir o método de pagamento como padrão para o cliente
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Atualizar a subscription com o método de pagamento
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethodId,
    });

    // Se a subscription estiver incomplete, tentar pagar a invoice pendente
    if (subscription.status === 'incomplete') {
      const invoice = subscription.latest_invoice;
      if (invoice) {
        const invoiceId = typeof invoice === 'string' ? invoice : invoice.id;
        try {
          await stripe.invoices.pay(invoiceId);
          console.log('✅ Invoice paga com sucesso:', invoiceId);
        } catch (payError) {
          console.error('❌ Erro ao pagar invoice:', payError);
          // Continuar mesmo com erro, pois o webhook pode processar depois
        }
      }
    }

    // Buscar subscription atualizada
    const updatedSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Atualizar dados no banco
    const currentPeriodEnd = (updatedSubscription as unknown as { current_period_end: number }).current_period_end;
    const planoExpiraEm = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plano: updatedSubscription.status === 'active' ? 'PREMIUM' : 'FREE',
        planoExpiraEm,
        stripeSubscriptionId: updatedSubscription.id,
        stripeSubscriptionStatus: updatedSubscription.status,
        stripePriceId: updatedSubscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: planoExpiraEm,
      },
    });

    console.log('✅ Subscription confirmada:', {
      subscriptionId: updatedSubscription.id,
      status: updatedSubscription.status,
      planoExpiraEm: planoExpiraEm?.toISOString(),
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
      },
    });
  } catch (error) {
    console.error('Error confirming setup:', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar pagamento' },
      { status: 500 }
    );
  }
}
