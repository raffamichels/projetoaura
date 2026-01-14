"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Wallet,
  BookOpen,
  Library,
  Target,
  Dumbbell,
  Plane,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Check,
  ChevronDown,
  Star,
  ArrowRight,
  Lock,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function PremiumPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAssinarClick = () => {
    console.log('Botão clicado!', { plano: session?.user?.plano });

    // Verificar se o usuário já é premium
    if (session?.user?.plano === 'PREMIUM') {
      console.log('Usuário é premium, mostrando toast');
      toast.info('Você já é um assinante Premium!', {
        description: 'Acesse o dashboard para gerenciar sua assinatura.',
        action: {
          label: 'Ver Assinatura',
          onClick: () => router.push('/dashboard/assinatura'),
        },
      });
      return;
    }

    console.log('Redirecionando para checkout');
    // Se não for premium, redirecionar para checkout
    router.push('/premium/checkout');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, nome }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail("");
        setNome("");
      }
    } catch (error) {
      console.error("Erro ao adicionar à lista de espera:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Aura
              </span>
            </div>
            <nav className="flex items-center space-x-4 md:space-x-8">
              <a href="#recursos" className="text-gray-300 hover:text-purple-400 transition hidden md:inline">
                Recursos
              </a>
              <a href="#precos" className="text-gray-300 hover:text-purple-400 transition hidden md:inline">
                Preços
              </a>
              <a href="#faq" className="text-gray-300 hover:text-purple-400 transition hidden md:inline">
                FAQ
              </a>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-purple-900/30 text-purple-300 hover:bg-purple-900/50">
              <Sparkles className="w-3 h-3 mr-1" />
              Lançamento em breve - Entre para a lista de espera
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Organize sua vida em um só lugar
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Aura é a plataforma completa de gerenciamento pessoal que reúne{" "}
              <span className="text-purple-400 font-semibold">agenda</span>,{" "}
              <span className="text-purple-400 font-semibold">finanças</span>,{" "}
              <span className="text-purple-400 font-semibold">estudos</span> e muito mais.
            </p>

            {/* Waitlist Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
                <div className="flex flex-col gap-3">
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="h-14 text-lg"
                  />
                  <Input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 text-lg"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? "Aguarde..." : "Quero ser um dos primeiros"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Seus dados estão seguros. Sem spam.
                </p>
              </form>
            ) : (
              <div className="max-w-md mx-auto mb-8 p-6 bg-green-900/20 border border-green-800 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-green-300 mb-2">
                  Você está na lista!
                </h3>
                <p className="text-green-400">
                  Prepare-se para transformar sua produtividade. Avisaremos assim que o Aura estiver disponível.
                </p>
              </div>
            )}

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-gray-900"
                  />
                ))}
              </div>
              <span>
                <strong className="text-purple-400">500+</strong> pessoas já na lista de espera
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "7+", label: "Módulos integrados" },
              { number: "1", label: "Plataforma única" },
              { number: "100%", label: "Seus dados privados" },
              { number: "R$ 12,90", label: "Por mês no Premium" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tudo que você precisa,{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                em um só lugar
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Pare de usar dezenas de aplicativos diferentes. Com o Aura, você gerencia toda a sua vida de forma integrada.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Agenda Inteligente",
                description: "Organize compromissos, defina lembretes e nunca mais perca um evento importante.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Wallet,
                title: "Controle Financeiro",
                description: "Gerencie receitas, despesas, objetivos financeiros e tenha visão completa das suas finanças.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: BookOpen,
                title: "Gestão de Estudos",
                description: "Organize cursos, acompanhe progresso e maximize seu aprendizado com técnicas comprovadas.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Library,
                title: "Biblioteca Pessoal",
                description: "Gerencie livros e filmes, salve citações favoritas e acompanhe seu consumo cultural.",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: Target,
                title: "Metas e Hábitos",
                description: "Defina objetivos SMART, rastreie hábitos diários e gamifique seu progresso.",
                color: "from-yellow-500 to-orange-500",
                badge: "Em breve",
              },
              {
                icon: Dumbbell,
                title: "Treinos e Saúde",
                description: "Planeje treinos, registre exercícios e acompanhe sua evolução física.",
                color: "from-red-500 to-pink-500",
                badge: "Em breve",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="relative overflow-hidden bg-zinc-900/50 border-gray-800 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  {feature.badge && (
                    <Badge className="absolute top-4 right-4 bg-purple-900/30 text-purple-300">
                      {feature.badge}
                    </Badge>
                  )}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Por que escolher o Aura?
            </h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Uma solução completa para pessoas que valorizam produtividade e organização
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: "Produtividade 10x",
                description: "Economize horas toda semana gerenciando tudo em um único lugar",
              },
              {
                icon: Shield,
                title: "Dados Seguros",
                description: "Seus dados são criptografados e protegidos com os mais altos padrões de segurança",
              },
              {
                icon: Users,
                title: "Compartilhamento Familiar",
                description: "Gerencie finanças e compromissos com toda a família",
              },
              {
                icon: TrendingUp,
                title: "Insights Inteligentes",
                description: "Receba sugestões personalizadas baseadas nos seus hábitos",
              },
            ].map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-purple-100">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Planos transparentes,{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                sem surpresas
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Escolha o plano ideal para você
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-zinc-900/50 border-gray-800">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Free</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">R$ 0</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Agenda básica (10 compromissos/mês)",
                    "Financeiro básico (20 transações/mês)",
                    "1 curso ativo",
                    "Biblioteca limitada",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => router.push('/dashboard')}
                >
                  Você já está no Free!
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-zinc-900/50 border-purple-500 relative shadow-xl shadow-purple-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  Mais popular
                </Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Premium</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    R$ 12,90
                  </span>
                  <span className="text-gray-400">/mês</span>
                  <p className="text-sm text-gray-400 mt-1">
                    ou R$ 129/ano (economize 16%)
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Todos os módulos ilimitados",
                    "Backup automático de dados",
                    "Suporte prioritário",
                    "Relatórios avançados",
                    "Exportação em PDF/Excel",
                    "Sem anúncios",
                    "Acesso antecipado a novos recursos",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={handleAssinarClick}
                >
                  Assinar Agora
                  <Star className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              O que dizem nossos{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                beta testers
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Ana Silva",
                role: "Empreendedora",
                text: "Finalmente consigo ter uma visão completa da minha vida. O módulo financeiro me ajudou a economizar mais de R$ 2.000 em 3 meses!",
                rating: 5,
              },
              {
                name: "Carlos Santos",
                role: "Estudante de Medicina",
                text: "Organizei todos os meus estudos no Aura. A produtividade aumentou muito e consigo acompanhar meu progresso de forma visual.",
                rating: 5,
              },
              {
                name: "Mariana Costa",
                role: "Designer",
                text: "Simplesmente incrível. Cancelei 5 assinaturas de apps diferentes e agora uso só o Aura. Vale cada centavo do Premium!",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <Card key={i} className="bg-black/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 mr-3" />
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Quando o Aura estará disponível?",
                a: "Estamos finalizando os testes beta e planejamos o lançamento oficial para fevereiro de 2026. Quem estiver na lista de espera terá acesso prioritário!",
              },
              {
                q: "Meus dados estarão seguros?",
                a: "Absolutamente. Utilizamos criptografia de ponta a ponta e seguimos os mais rigorosos padrões de segurança (LGPD compliant). Seus dados são seus e jamais serão compartilhados.",
              },
              {
                q: "Posso usar no celular?",
                a: "Sim! O Aura é totalmente responsivo e funciona perfeitamente em qualquer dispositivo. Apps nativos para iOS e Android estão previstos para o segundo semestre de 2026.",
              },
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim, sem burocracia. Você pode cancelar sua assinatura Premium a qualquer momento e continuar usando o plano gratuito.",
              },
              {
                q: "Existe desconto para estudantes?",
                a: "Sim! Estudantes terão 50% de desconto no plano Premium. Os detalhes serão divulgados no lançamento.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-zinc-900 rounded-lg border border-gray-800 p-6 cursor-pointer hover:border-purple-500/50 transition-colors"
              >
                <summary className="flex justify-between items-center font-semibold text-lg text-white">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-purple-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-300">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para transformar sua vida?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Junte-se a centenas de pessoas que já estão na lista de espera do Aura
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col gap-3">
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="h-14 text-lg bg-white text-purple-600 hover:bg-purple-50"
                >
                  {loading ? "Aguarde..." : "Garantir meu lugar"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="max-w-md mx-auto p-6 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm">
              <Check className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Bem-vindo ao futuro!</h3>
              <p className="text-purple-100">
                Fique de olho na sua caixa de entrada. Em breve você receberá novidades exclusivas.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Aura</span>
              </div>
              <p className="text-sm">
                Organize sua vida em um só lugar.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#recursos" className="hover:text-purple-400 transition">Recursos</a></li>
                <li><a href="#precos" className="hover:text-purple-400 transition">Preços</a></li>
                <li><a href="#faq" className="hover:text-purple-400 transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">Sobre</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Carreiras</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Termos</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">LGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2026 Aura. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
