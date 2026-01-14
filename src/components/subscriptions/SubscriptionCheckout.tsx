'use client';

import { useState, useEffect, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutForm } from './CheckoutForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCreatedSubscription = useRef(false);
  const currentPriceIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Só criar subscription quando o priceId mudar E não tiver criado ainda
    // OU quando for a primeira vez
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
        console.log('✅ Checkout session criada com sucesso');
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
      <Card className="bg-zinc-900/50 border-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-zinc-900/50 border-gray-800">
        <CardContent className="py-12 text-center">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card className="bg-zinc-900/50 border-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Finalizar Assinatura</CardTitle>
        <CardDescription className="text-gray-400">
          Você está assinando o plano: <strong className="text-purple-400">{planName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements
          key={priceId}
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#8B5CF6',
                colorBackground: '#18181b',
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
              },
            },
          }}
        >
          <CheckoutForm onSuccess={handleSuccess} onError={handleError} />
        </Elements>
      </CardContent>
    </Card>
  );
}
