'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Spinner } from '@phosphor-icons/react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const { update } = useSession();

  useEffect(() => {
    // Sincronizar automaticamente com o Stripe para garantir que os dados sejam atualizados
    // mesmo se o webhook não disparar (desenvolvimento local sem Stripe CLI)
    const syncSubscription = async () => {
      try {
        // Chamar o endpoint de sincronização
        await fetch('/api/v1/subscriptions/sync', {
          method: 'POST',
        });

        // Aguardar um pouco para o banco ser atualizado
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Forçar atualização da sessão para buscar os dados mais recentes do banco
        await update();
      } catch (error) {
        console.error('Erro ao sincronizar subscription:', error);
        // Mesmo com erro, tentar atualizar a sessão
        await update();
      } finally {
        setIsVerifying(false);
      }
    };

    syncSubscription();
  }, [update]);

  if (isVerifying) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="bg-surface border border-line rounded-xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Spinner className="h-12 w-12 animate-spin text-brand" />
            <p className="text-center text-lg text-ink-soft">
              Verificando seu pagamento...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="bg-surface border border-line rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-green-50 dark:bg-green-500/10 p-3 border border-green-200 dark:border-green-500/30">
              <CheckCircle className="h-12 w-12 text-green-700 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-center text-ink">
              Pagamento Confirmado!
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-ink-soft">
              Sua assinatura premium foi ativada com sucesso!
            </p>
            <p className="text-sm text-ink-soft">
              Agora você tem acesso a todos os recursos premium do Aura.
            </p>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full bg-brand hover:bg-brand-dark text-white transition-colors duration-150">
              <Link href="/dashboard">Ir para o Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-line-strong bg-surface text-ink hover:bg-surface-hover transition-colors duration-150">
              <Link href="/dashboard/assinatura">Ver Minha Assinatura</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
