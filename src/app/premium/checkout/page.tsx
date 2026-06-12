'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionCheckout } from '@/components/subscriptions/SubscriptionCheckout';
import { Check, ArrowLeft, Warning } from '@phosphor-icons/react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Importar as constantes do Stripe
// IMPORTANTE: Em componentes Client, apenas NEXT_PUBLIC_* está disponível
const PLANS = {
  MONTHLY: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!,
    amount: 1290,
    name: 'Premium Mensal',
  },
  YEARLY: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY!,
    amount: 12900,
    name: 'Premium Anual',
  },
};

// Log para debug: verificar se os priceIds estão corretos
if (typeof window !== 'undefined') {
  console.log('🏷️ PLANS configurados:', {
    monthly: {
      priceId: PLANS.MONTHLY.priceId,
      name: PLANS.MONTHLY.name,
    },
    yearly: {
      priceId: PLANS.YEARLY.priceId,
      name: PLANS.YEARLY.name,
    },
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly'); // Padrão anual
  const [showCheckout, setShowCheckout] = useState(false); // Controla se mostra o checkout

  // Redirecionar usuários premium
  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user?.plano === 'PREMIUM') {
      router.push('/dashboard/assinatura');
    }
  }, [session, status, router]);

  const handleSuccess = () => {
    router.push('/dashboard/assinatura/sucesso');
  };

  const currentPlan = selectedPlan === 'monthly' ? PLANS.MONTHLY : PLANS.YEARLY;

  // Log quando o plano selecionado mudar
  useEffect(() => {
    console.log('📦 Plano selecionado:', {
      selectedPlan,
      planName: currentPlan.name,
      priceId: currentPlan.priceId,
      amount: currentPlan.amount,
    });
  }, [selectedPlan, currentPlan]);

  // Mostrar loading enquanto verifica a sessão
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-ink flex items-center justify-center">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mb-4"></div>
            <p className="text-ink-soft">Verificando sua assinatura...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se já for premium, mostrar mensagem
  if (session?.user?.plano === 'PREMIUM') {
    return (
      <div className="min-h-screen bg-background text-ink">
        <header className="border-b border-line bg-surface/90 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/premium" className="flex items-center">
                <span className="text-2xl font-extrabold tracking-tight text-brand">
                  Aura
                </span>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="rounded-full bg-brand-soft p-4 border border-brand/30">
                <Warning className="h-12 w-12 text-brand" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-ink">Você já é Premium!</h2>
                <p className="text-ink-soft">
                  Você já possui uma assinatura premium ativa.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <Button
                  asChild
                  className="flex-1 bg-brand hover:bg-brand-dark transition-colors duration-150"
                >
                  <Link href="/dashboard/assinatura">Gerenciar Assinatura</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 border-line-strong text-ink-soft hover:bg-surface-hover hover:text-ink"
                >
                  <Link href="/dashboard">Ir para Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-ink">
      {/* Header */}
      <header className="border-b border-line bg-surface/90 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/premium" className="flex items-center">
              <span className="text-2xl font-extrabold tracking-tight text-brand">
                Aura
              </span>
            </Link>
            <Button variant="ghost" className="text-ink-soft hover:text-ink hover:bg-surface-hover" asChild>
              <Link href="/premium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Plan Selection */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-ink">Escolha seu plano</h1>
              <p className="text-ink-soft">
                Selecione o plano que melhor se adapta às suas necessidades
              </p>
            </div>

            {/* Monthly Plan */}
            <Card
              className={`cursor-pointer transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-brand shadow-lg shadow-brand/10'
                  : 'hover:border-brand/50'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-ink">Premium Mensal</h3>
                    <p className="text-sm text-ink-soft">
                      Cobrança mensal
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-ink">R$ 12,90</div>
                    <div className="text-sm text-ink-soft">por mês</div>
                  </div>
                </div>
                {selectedPlan === 'monthly' && (
                  <Badge className="bg-brand text-white">Selecionado</Badge>
                )}
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card
              className={`cursor-pointer transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-brand shadow-lg shadow-brand/10'
                  : 'hover:border-brand/50'
              }`}
              onClick={() => setSelectedPlan('yearly')}
            >
              <Badge className="absolute -top-3 left-4 bg-green-600 text-white">
                Economize 16%
              </Badge>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-ink">Premium Anual</h3>
                    <p className="text-sm text-ink-soft">
                      Cobrança anual - Melhor valor
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-ink">R$ 129,00</div>
                    <div className="text-sm text-ink-soft">por ano</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-semibold">
                      R$ 10,75/mês
                    </div>
                  </div>
                </div>
                {selectedPlan === 'yearly' && (
                  <Badge className="bg-brand text-white">Selecionado</Badge>
                )}
              </CardContent>
            </Card>

            {/* Features List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-ink">O que está incluído</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'Todos os módulos ilimitados',
                    'Sincronização com Google Calendar',
                    'Geração de resenhas com IA',
                    'Backup automático de dados',
                    'Suporte prioritário',
                    'Relatórios avançados',
                    'Exportação em PDF/Excel',
                    'Sem anúncios',
                    'Acesso antecipado a novos recursos',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-brand mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-ink-soft">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right: Checkout Form */}
          <div className="lg:sticky lg:top-6 h-fit">
            {!showCheckout ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-ink">Confirme seu plano</CardTitle>
                  <CardDescription className="text-ink-soft">
                    Você selecionou: <strong className="text-brand">{currentPlan.name}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-line rounded-lg bg-surface-hover">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-ink-soft">Plano:</span>
                      <span className="font-bold text-ink">{currentPlan.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ink-soft">Valor:</span>
                      <span className="font-bold text-ink">
                        {selectedPlan === 'monthly' ? 'R$ 12,90/mês' : 'R$ 129,00/ano'}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-brand hover:bg-brand-dark text-white transition-colors duration-150"
                    onClick={() => setShowCheckout(true)}
                  >
                    Prosseguir para Pagamento
                  </Button>

                  <p className="text-xs text-ink-soft text-center">
                    Você ainda pode voltar e trocar de plano antes de pagar
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <SubscriptionCheckout
                  priceId={currentPlan.priceId}
                  planName={currentPlan.name}
                  onSuccess={handleSuccess}
                />

                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full border-line-strong text-ink-soft hover:bg-surface-hover"
                    onClick={() => setShowCheckout(false)}
                  >
                    Voltar e Trocar de Plano
                  </Button>
                </div>
              </>
            )}

            <div className="mt-6 text-center text-sm text-ink-soft">
              <p>Pagamento seguro processado pelo Stripe</p>
              <p className="mt-2">
                Você pode cancelar sua assinatura a qualquer momento
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
