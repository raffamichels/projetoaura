import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Informações dos planos
export const PLANS = {
  MONTHLY: {
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    amount: 1290, // R$ 12,90 em centavos
    interval: 'month' as const,
    name: 'Premium Mensal',
  },
  YEARLY: {
    priceId: process.env.STRIPE_PRICE_YEARLY!,
    amount: 12900, // R$ 129,00 em centavos
    interval: 'year' as const,
    name: 'Premium Anual',
  },
};

// Helper para criar ou obter um cliente Stripe
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  const prisma = (await import('./prisma')).default;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Criar novo cliente no Stripe
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  // Salvar o ID do cliente no banco
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// Helper para criar uma subscription com payment intent embutido
export async function createSubscriptionWithIntent(
  customerId: string,
  priceId: string
): Promise<{ subscriptionId: string; clientSecret: string; type: 'payment' | 'setup' }> {
  // Criar a subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      payment_method_types: ['card', 'pix'] as Stripe.SubscriptionCreateParams.PaymentSettings.PaymentMethodType[],
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice'],
  });

  const invoice = subscription.latest_invoice as Stripe.Invoice;

  if (!invoice) {
    throw new Error('Invoice não foi criada');
  }

  // Buscar a invoice com payment_intent expandido
  const fullInvoice = await stripe.invoices.retrieve(invoice.id, {
    expand: ['payment_intent'],
  });

  let clientSecret: string | null = null;
  let intentType: 'payment' | 'setup' = 'payment';

  // Verificar se payment_intent existe (usar any para compatibilidade com API 2025)
  const invoicePaymentIntent = (fullInvoice as unknown as { payment_intent?: string | Stripe.PaymentIntent | null }).payment_intent;
  if (invoicePaymentIntent) {
    if (typeof invoicePaymentIntent === 'string') {
      const paymentIntent = await stripe.paymentIntents.retrieve(invoicePaymentIntent);
      clientSecret = paymentIntent.client_secret;
    } else {
      clientSecret = invoicePaymentIntent.client_secret;
    }
  }

  // Se ainda não tem payment_intent, criar um SetupIntent para coletar o método de pagamento
  if (!clientSecret) {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card', 'pix'] as Stripe.SetupIntentCreateParams['payment_method_types'],
      metadata: {
        subscription_id: subscription.id,
      },
    });

    clientSecret = setupIntent.client_secret;
    intentType = 'setup';
  }

  if (!clientSecret) {
    throw new Error('Não foi possível obter o client secret');
  }

  return {
    subscriptionId: subscription.id,
    clientSecret,
    type: intentType,
  };
}

// Helper para cancelar uma subscription
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

// Helper para reativar uma subscription cancelada
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// Helper para atualizar o plano de uma subscription
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

// Helper para obter o portal de gerenciamento do cliente
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}
