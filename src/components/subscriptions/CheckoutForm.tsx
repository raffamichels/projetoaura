'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  intentType: 'payment' | 'setup';
}

export function CheckoutForm({ onSuccess, onError, intentType }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      if (intentType === 'setup') {
        // Para SetupIntent, usamos confirmSetup sem redirect
        const result = await stripe.confirmSetup({
          elements,
          redirect: 'if_required',
        });

        if (result.error) {
          onError(result.error.message || 'Erro ao processar pagamento');
          return;
        }

        // Após o SetupIntent ser confirmado, precisamos vincular o método de pagamento à subscription
        if (result.setupIntent && result.setupIntent.status === 'succeeded') {
          try {
            const confirmResponse = await fetch('/api/v1/subscriptions/confirm-setup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ setupIntentId: result.setupIntent.id }),
            });

            if (!confirmResponse.ok) {
              const errorData = await confirmResponse.json();
              throw new Error(errorData.error || 'Erro ao confirmar assinatura');
            }

            // Redirecionar para página de sucesso
            window.location.href = '/dashboard/assinatura/sucesso';
          } catch (confirmError) {
            onError(confirmError instanceof Error ? confirmError.message : 'Erro ao confirmar assinatura');
          }
        }
      } else {
        // Para PaymentIntent, usamos confirmPayment com redirect
        const result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/dashboard/assinatura/sucesso`,
          },
        });

        if (result.error) {
          onError(result.error.message || 'Erro ao processar pagamento');
        } else {
          onSuccess();
        }
      }
    } catch (err) {
      onError('Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          'Assinar Agora'
        )}
      </Button>
    </form>
  );
}
