'use client';

import { useState, useEffect, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useTheme } from 'next-themes';
import { CheckoutForm } from './CheckoutForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@phosphor-icons/react';
import { toast } from 'sonner';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface SubscriptionCheckoutProps {
  priceId: string;
  planName: string;
  onSuccess?: () => void;
}

export function SubscriptionCheckout({
  priceId,
  planName,
  onSuccess,
}: SubscriptionCheckoutProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<'payment' | 'setup'>('payment');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCreatedSubscription = useRef(false);
  const currentPriceIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Só criar subscription quando o priceId mudar E não tiver criado ainda
    if (currentPriceIdRef.current === priceId && hasCreatedSubscription.current) {
      console.log('⏸️ Subscription já criada para este priceId, ignorando...');
      return;
    }

    // Se o priceId mudou, resetar o client secret
    if (currentPriceIdRef.current !== priceId) {
      console.log('🔄 PriceId mudou, resetando checkout...');
      setClientSecret(null);
      setError(null);
      hasCreatedSubscription.current = false;
    }

    currentPriceIdRef.current = priceId;
    hasCreatedSubscription.current = true;
    setIsLoading(true);

    const createCheckoutSession = async () => {
      try {
        console.log('🎬 Criando checkout session para priceId:', priceId);

        const response = await fetch('/api/v1/subscriptions/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao criar sessão de checkout');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setIntentType(data.type || 'payment');
        console.log('✅ Checkout session criada com sucesso, tipo:', data.type);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        toast.error('Erro ao iniciar checkout');
        hasCreatedSubscription.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    createCheckoutSession();
  }, [priceId]);

  const handleSuccess = () => {
    toast.success('Pagamento processado com sucesso!');
    onSuccess?.();
  };

  const handleError = (errorMessage: string) => {
    toast.error(errorMessage);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8 animate-spin text-brand" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8 animate-spin text-brand" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-ink">Finalizar Assinatura</CardTitle>
        <CardDescription className="text-ink-soft">
          Você está assinando o plano: <strong className="text-brand-dark">{planName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements
          key={`${priceId}-${isDark ? 'dark' : 'light'}`}
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: isDark ? 'night' : 'stripe',
              variables: isDark
                ? {
                    colorPrimary: '#2FB0B8',
                    colorBackground: '#12283A',
                    colorText: '#E6EEF4',
                    colorDanger: '#EF4444',
                    fontFamily: 'system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                  }
                : {
                    colorPrimary: '#178E96',
                    colorBackground: '#FFFFFF',
                    colorText: '#0E2A3F',
                    colorDanger: '#DC2626',
                    fontFamily: 'system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                  },
            },
          }}
        >
          <CheckoutForm onSuccess={handleSuccess} onError={handleError} intentType={intentType} />
        </Elements>
      </CardContent>
    </Card>
  );
}
