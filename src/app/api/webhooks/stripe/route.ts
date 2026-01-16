import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

// Desabilitar parsing automático do body
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Encontrar o usuário pelo stripeCustomerId
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Determinar o plano baseado no status da subscription
  // Considera PREMIUM se estiver ativo, em trial ou com pagamento atrasado
  const isPremium = ['active', 'trialing', 'past_due'].includes(subscription.status);
  const plano = isPremium ? 'PREMIUM' : 'FREE';

  // Data de expiração do período atual
  const currentPeriodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;
  const planoExpiraEm = currentPeriodEnd
    ? new Date(currentPeriodEnd * 1000)
    : null;

  // Atualizar o usuário
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plano,
      planoExpiraEm,
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: planoExpiraEm,
    },
  });

  console.log('Subscription updated for user:', user.id, {
    status: subscription.status,
    plano,
    planoExpiraEm: planoExpiraEm?.toISOString(),
    subscriptionId: subscription.id,
    priceId: subscription.items.data[0]?.price.id,
    currentPeriodEnd: (subscription as unknown as { current_period_end: number }).current_period_end,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Reverter para plano FREE
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plano: 'FREE',
      planoExpiraEm: null,
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: 'canceled',
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    },
  });

  console.log('Subscription deleted for user:', user.id);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription;

  if (!subscriptionId) return;

  // Buscar a subscription para obter informações atualizadas
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleSubscriptionUpdated(subscription);

  console.log('Invoice payment succeeded for subscription:', subscriptionId);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = (invoice as unknown as { customer: string }).customer;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Atualizar status da subscription para refletir o problema de pagamento
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionStatus: 'past_due',
    },
  });

  console.log('Invoice payment failed for user:', user.id);
}
