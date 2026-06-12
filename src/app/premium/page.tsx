"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, CaretDown, Star, ArrowRight, ArrowLeft, Crown, Infinity, Headphones, Eye, Download, ChartBar } from '@phosphor-icons/react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function PremiumPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleAssinarClick = () => {
    if (session?.user?.plano === 'PREMIUM') {
      toast.info('Você já é um assinante Premium!', {
        description: 'Acesse o dashboard para gerenciar sua assinatura.',
        action: {
          label: 'Ver Assinatura',
          onClick: () => router.push('/dashboard/assinatura'),
        },
      });
      return;
    }

    router.push('/premium/checkout');
  };

  const premiumFeatures = [
    {
      icon: Infinity,
      title: "Módulos Ilimitados",
      description: "Acesso completo a todos os módulos sem nenhum limite de uso.",
    },
    {
      icon: Shield,
      title: "Backup Automático",
      description: "Seus dados são salvos automaticamente na nuvem todos os dias.",
    },
    {
      icon: Headphones,
      title: "Suporte Prioritário",
      description: "Atendimento rápido e dedicado para resolver suas dúvidas.",
    },
    {
      icon: ChartBar,
      title: "Relatórios Avançados",
      description: "Análises detalhadas e insights sobre sua produtividade.",
    },
    {
      icon: Download,
      title: "Exportação Completa",
      description: "Exporte seus dados em PDF, Excel e outros formatos.",
    },
    {
      icon: Eye,
      title: "Acesso Antecipado",
      description: "Seja o primeiro a testar novos recursos e funcionalidades.",
    },
  ];

  const comparisonData = [
    { feature: "Compromissos na Agenda", free: "10/mês", premium: "Ilimitado" },
    { feature: "Transações Financeiras", free: "20/mês", premium: "Ilimitado" },
    { feature: "Cursos Ativos", free: "1", premium: "Ilimitado" },
    { feature: "Itens na Biblioteca", free: "10", premium: "Ilimitado" },
    { feature: "Backup de Dados", free: "—", premium: "Diário" },
    { feature: "Relatórios", free: "Básico", premium: "Avançado" },
    { feature: "Exportação", free: "—", premium: "PDF/Excel" },
    { feature: "Suporte", free: "Comunidade", premium: "Prioritário" },
    { feature: "Novos Recursos", free: "—", premium: "Acesso Antecipado" },
    { feature: "Anúncios", free: "Sim", premium: "Sem Anúncios" },
  ];

  const testimonials = [
    {
      name: "Rafael Mendes",
      role: "Desenvolvedor",
      text: "O Premium vale cada centavo. Os relatórios avançados me ajudaram a entender onde estava perdendo tempo.",
    },
    {
      name: "Julia Oliveira",
      role: "Estudante",
      text: "Com o desconto de estudante, ficou super acessível. Consigo gerenciar todos os meus cursos sem limite!",
    },
    {
      name: "Pedro Costa",
      role: "Empreendedor",
      text: "A exportação em PDF é perfeita para apresentar relatórios financeiros aos meus sócios.",
    },
  ];

  const faqs = [
    {
      question: "Posso testar o Premium antes de assinar?",
      answer: "Sim! Oferecemos 7 dias de teste grátis para você experimentar todos os recursos Premium sem compromisso.",
    },
    {
      question: "Como funciona o pagamento?",
      answer: "Aceitamos cartão de crédito, débito e PIX. O pagamento é processado de forma segura e você pode cancelar a qualquer momento.",
    },
    {
      question: "Existe desconto para pagamento anual?",
      answer: "Sim! No plano anual você economiza 16%, pagando apenas R$ 129/ano em vez de R$ 154,80.",
    },
    {
      question: "O que acontece se eu cancelar?",
      answer: "Você continua com acesso Premium até o fim do período pago. Depois, sua conta volta para o plano gratuito e seus dados são mantidos.",
    },
  ];

  const isPremium = session?.user?.plano === 'PREMIUM';

  return (
    <div className="min-h-screen bg-background text-ink overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-extrabold tracking-tight text-brand">
                Aura
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-sm text-ink-soft hover:text-brand-dark transition-colors duration-150">
                Recursos
              </a>
              <a href="#comparativo" className="text-sm text-ink-soft hover:text-brand-dark transition-colors duration-150">
                Comparativo
              </a>
              <a href="#faq" className="text-sm text-ink-soft hover:text-brand-dark transition-colors duration-150">
                FAQ
              </a>
            </nav>

            {/* Back Button */}
            <Button
              variant="ghost"
              className="text-ink-soft hover:text-ink hover:bg-surface-hover"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 mb-8 animate-fade-in">
              <Crown className="w-4 h-4 text-gold" />
              <span className="text-sm text-amber-700 dark:text-amber-400">Desbloqueie todo o potencial do Aura</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-delay-1">
              <span className="text-ink">Aura</span>
              <br />
              <span className="text-gradient">
                Premium
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-ink-soft mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay-2">
              Remova todos os limites e tenha acesso completo a todos os módulos,
              relatórios avançados, suporte prioritário e muito mais.
            </p>

            {/* Pricing CTA */}
            <div className="max-w-sm mx-auto animate-fade-in-delay-3">
              <div className="p-8 rounded-2xl bg-surface border border-brand/30 shadow-[0_12px_40px_-16px_rgba(14,42,63,0.18)]">
                <div className="mb-4">
                  <span className="text-5xl font-bold text-ink">
                    R$ 12,90
                  </span>
                  <span className="text-ink-soft">/mês</span>
                </div>
                <p className="text-sm text-ink-faint mb-6">ou R$ 129/ano (economize 16%)</p>

                {isPremium ? (
                  <Button
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => router.push('/dashboard/assinatura')}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Você já é Premium
                  </Button>
                ) : (
                  <Button
                    className="w-full h-12 bg-brand hover:bg-brand-dark text-white font-medium transition-colors duration-150"
                    onClick={handleAssinarClick}
                  >
                    Assinar Premium
                    <Star className="w-4 h-4 ml-2" />
                  </Button>
                )}

                <p className="text-xs text-ink-faint mt-4">
                  7 dias de teste grátis • Cancele quando quiser
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-soft text-brand-dark border-brand/20 hover:bg-brand/15">
              Recursos Premium
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-ink">
              Tudo que você precisa para{" "}
              <span className="text-gradient">
                alcançar seus objetivos
              </span>
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-surface border border-line shadow-sm hover:border-brand/40 hover:-translate-y-1 transition-all duration-150"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand-dark" />
                </div>
                <h3 className="text-xl font-semibold text-ink mb-2">{feature.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparativo" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-soft border-y border-line">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-soft text-brand-dark border-brand/20 hover:bg-brand/15">
              Comparativo
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-ink">
              Free vs{" "}
              <span className="text-gradient">
                Premium
              </span>
            </h2>
          </div>

          {/* Comparison Table */}
          <div className="rounded-2xl bg-surface border border-line shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-surface-hover border-b border-line">
              <div className="text-sm font-medium text-ink-soft">Recurso</div>
              <div className="text-center text-sm font-medium text-ink-soft">Free</div>
              <div className="text-center">
                <Badge className="bg-brand text-white border-0">
                  Premium
                </Badge>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-line">
              {comparisonData.map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 p-4 hover:bg-surface-hover transition-colors duration-150">
                  <div className="text-sm text-ink">{item.feature}</div>
                  <div className="text-center text-sm text-ink-faint">{item.free}</div>
                  <div className="text-center text-sm text-brand-dark font-medium">{item.premium}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            {!isPremium && (
              <Button
                className="h-12 px-8 bg-brand hover:bg-brand-dark text-white font-medium transition-colors duration-150"
                onClick={handleAssinarClick}
              >
                Fazer Upgrade Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-soft text-brand-dark border-brand/20 hover:bg-brand/15">
              Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-ink">
              O que nossos usuários{" "}
              <span className="text-gradient">
                Premium dizem
              </span>
            </h2>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="p-6 rounded-2xl bg-surface border border-line shadow-sm">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-ink-soft mb-6 text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-sm font-semibold text-white">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-ink text-sm">{testimonial.name}</div>
                    <div className="text-xs text-ink-faint">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-soft border-y border-line">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-soft text-brand-dark border-brand/20 hover:bg-brand/15">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-ink">
              Perguntas sobre o{" "}
              <span className="text-gradient">
                Premium
              </span>
            </h2>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group p-6 rounded-2xl bg-surface border border-line shadow-sm cursor-pointer hover:border-line-strong transition-colors duration-150"
              >
                <summary className="flex justify-between items-center font-medium text-ink list-none">
                  {faq.question}
                  <CaretDown className="w-5 h-5 text-ink-faint group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-ink-soft text-sm leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-3xl overflow-hidden bg-navy">
            {/* Content */}
            <div className="relative text-center">
              <Crown className="w-16 h-16 mx-auto mb-6 text-gold" />
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Pronto para o próximo nível?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Desbloqueie todo o potencial do Aura e transforme sua produtividade hoje.
              </p>

              {isPremium ? (
                <Button
                  className="h-12 px-8 bg-white text-navy hover:bg-white/90 font-medium transition-colors duration-150"
                  onClick={() => router.push('/dashboard')}
                >
                  Ir para o Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="h-12 px-8 bg-white text-navy hover:bg-white/90 font-medium transition-colors duration-150"
                  onClick={handleAssinarClick}
                >
                  Começar Agora — R$ 12,90/mês
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-line">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-2xl font-extrabold tracking-tight text-brand">
              Aura
            </span>
            <p className="text-sm text-ink-faint">
              © 2026 Aura. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
