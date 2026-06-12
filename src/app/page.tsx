"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Wallet, Heart, BookOpen, Books, Airplane, ListBullets, X, Check, CaretDown, ArrowRight, SquaresFour, TrendUp, TrendDown, Bell, Gear, Shield, DeviceMobile, Lightning } from '@phosphor-icons/react';

/* ============================================================
   Mockups do sistema (recriações em CSS da UI real do produto)
   ============================================================ */

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border border-line shadow-[0_24px_60px_-20px_rgba(14,42,63,0.25)] bg-surface">
      {/* Barra do navegador */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-hover border-b border-line">
        <span className="w-2.5 h-2.5 rounded-full bg-[#C0564F]" />
        <span className="w-2.5 h-2.5 rounded-full bg-gold" />
        <span className="w-2.5 h-2.5 rounded-full bg-brand" />
        <div className="ml-3 flex-1 max-w-[220px] h-5 rounded-md bg-surface border border-line flex items-center px-2">
          <span className="text-[9px] text-ink-faint">aura.app/dashboard</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function DashboardMockup() {
  return (
    <BrowserFrame>
      {/* Topbar teal do sistema */}
      <div className="flex items-center justify-between px-4 py-2 bg-brand">
        <span className="text-white font-extrabold text-sm">Aura</span>
        <div className="flex items-center gap-2.5">
          <Bell className="w-3.5 h-3.5 text-white/80" />
          <div className="w-5 h-5 rounded-full bg-navy flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">RM</span>
          </div>
        </div>
      </div>
      <div className="flex bg-background">
        {/* Sidebar */}
        <div className="hidden sm:block w-32 bg-surface border-r border-line py-3 space-y-0.5">
          {[
            { icon: SquaresFour, label: "Dashboard", active: true },
            { icon: Heart, label: "Hábitos" },
            { icon: Calendar, label: "Agenda" },
            { icon: Wallet, label: "Financeiro" },
            { icon: BookOpen, label: "Estudos" },
            { icon: Books, label: "Biblioteca" },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-1.5 mx-2 px-2 py-1.5 rounded-md ${
                item.active
                  ? "bg-brand-soft text-brand-dark font-semibold"
                  : "text-ink-soft"
              }`}
            >
              <item.icon className="w-3 h-3" />
              <span className="text-[9px]">{item.label}</span>
            </div>
          ))}
          <div className="mx-2 mt-3 px-2 py-1.5 flex items-center gap-1.5 text-ink-soft">
            <Gear className="w-3 h-3" />
            <span className="text-[9px]">Configurações</span>
          </div>
        </div>
        {/* Conteúdo */}
        <div className="flex-1 p-3 space-y-2.5">
          <p className="text-[11px] font-bold text-ink">Bom dia, Raffael 👋</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface rounded-lg border border-line p-2.5">
              <p className="text-[8px] text-ink-faint uppercase tracking-wide">Saldo do mês</p>
              <p className="text-[13px] font-bold text-ink">R$ 2.430</p>
              <p className="text-[8px] text-green-600 dark:text-green-400 flex items-center gap-0.5">
                <TrendUp className="w-2.5 h-2.5" /> +12%
              </p>
            </div>
            <div className="bg-surface rounded-lg border border-line p-2.5">
              <p className="text-[8px] text-ink-faint uppercase tracking-wide">Compromissos</p>
              <p className="text-[13px] font-bold text-ink">3 hoje</p>
              <p className="text-[8px] text-brand-dark">Próx. 14h00</p>
            </div>
            <div className="bg-surface rounded-lg border border-line p-2.5">
              <p className="text-[8px] text-ink-faint uppercase tracking-wide">Hábitos</p>
              <p className="text-[13px] font-bold text-ink">5/7</p>
              <div className="mt-1 h-1 rounded-full bg-line overflow-hidden">
                <div className="h-full w-[71%] bg-brand rounded-full" />
              </div>
            </div>
          </div>
          {/* Gráfico de barras */}
          <div className="bg-surface rounded-lg border border-line p-2.5">
            <p className="text-[9px] font-semibold text-ink mb-1.5">Gastos por semana</p>
            <div className="flex items-end gap-1.5 h-12">
              {[40, 65, 50, 80, 58, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-brand"
                  style={{ height: `${h}%`, opacity: 0.45 + (h / 100) * 0.55 }}
                />
              ))}
            </div>
          </div>
          {/* Lista */}
          <div className="bg-surface rounded-lg border border-line p-2.5 space-y-1.5">
            {[
              { label: "Mercado", valor: "- R$ 184,90", neg: true },
              { label: "Salário", valor: "+ R$ 4.500,00", neg: false },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded ${t.neg ? "bg-red-50 dark:bg-red-500/10" : "bg-green-50 dark:bg-green-500/10"} flex items-center justify-center`}>
                    {t.neg ? (
                      <TrendDown className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />
                    ) : (
                      <TrendUp className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <span className="text-[9px] text-ink-soft">{t.label}</span>
                </div>
                <span className={`text-[9px] font-semibold ${t.neg ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                  {t.valor}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function FinanceiroMockup() {
  return (
    <BrowserFrame>
      <div className="flex items-center justify-between px-4 py-2 bg-brand">
        <span className="text-white font-extrabold text-sm">Aura</span>
        <span className="text-[9px] text-white/80">Financeiro</span>
      </div>
      <div className="p-3 bg-background space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Receitas", valor: "R$ 5.200", cor: "text-green-600 dark:text-green-400" },
            { label: "Despesas", valor: "R$ 2.770", cor: "text-red-600 dark:text-red-400" },
            { label: "Saldo", valor: "R$ 2.430", cor: "text-brand-dark" },
          ].map((c) => (
            <div key={c.label} className="bg-surface rounded-lg border border-line p-2.5">
              <p className="text-[8px] text-ink-faint uppercase tracking-wide">{c.label}</p>
              <p className={`text-[12px] font-bold ${c.cor}`}>{c.valor}</p>
            </div>
          ))}
        </div>
        <div className="bg-surface rounded-lg border border-line p-2.5 space-y-1.5">
          <p className="text-[9px] font-semibold text-ink">Transações recentes</p>
          {[
            { label: "Aluguel", cat: "Moradia", valor: "- R$ 1.200,00" },
            { label: "Mercado", cat: "Alimentação", valor: "- R$ 184,90" },
            { label: "Academia", cat: "Saúde", valor: "- R$ 89,90" },
            { label: "Freelance", cat: "Renda extra", valor: "+ R$ 700,00", pos: true },
          ].map((t) => (
            <div key={t.label} className="flex items-center justify-between py-0.5 border-b border-line last:border-0">
              <div>
                <p className="text-[9px] font-medium text-ink">{t.label}</p>
                <p className="text-[8px] text-ink-faint">{t.cat}</p>
              </div>
              <span className={`text-[9px] font-semibold ${t.pos ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {t.valor}
              </span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function AgendaMockup() {
  return (
    <BrowserFrame>
      <div className="flex items-center justify-between px-4 py-2 bg-brand">
        <span className="text-white font-extrabold text-sm">Aura</span>
        <span className="text-[9px] text-white/80">Agenda</span>
      </div>
      <div className="p-3 bg-background space-y-2">
        <div className="bg-surface rounded-lg border border-line p-2.5">
          <p className="text-[9px] font-semibold text-ink mb-1.5">Junho 2026</p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <span key={i} className="text-[8px] text-ink-faint font-medium">{d}</span>
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                className={`text-[8px] py-0.5 rounded ${
                  i === 10
                    ? "bg-brand text-white font-bold"
                    : i === 4 || i === 12
                    ? "bg-brand-soft text-brand-dark font-semibold"
                    : "text-ink-soft"
                }`}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { hora: "09h00", titulo: "Reunião de planejamento", cor: "var(--brand)" },
            { hora: "14h00", titulo: "Consulta médica", cor: "var(--brand-blue)" },
            { hora: "19h30", titulo: "Treino — academia", cor: "var(--gold)" },
          ].map((e) => (
            <div key={e.titulo} className="bg-surface rounded-lg border border-line px-2.5 py-2 flex items-center gap-2">
              <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: e.cor }} />
              <div>
                <p className="text-[8px] text-ink-faint">{e.hora}</p>
                <p className="text-[9px] font-medium text-ink">{e.titulo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function HabitosMockup() {
  return (
    <BrowserFrame>
      <div className="flex items-center justify-between px-4 py-2 bg-brand">
        <span className="text-white font-extrabold text-sm">Aura</span>
        <span className="text-[9px] text-white/80">Hábitos</span>
      </div>
      <div className="p-3 bg-background space-y-1.5">
        {[
          { nome: "Ler 20 minutos", streak: "12 dias", pct: 86 },
          { nome: "Beber 2L de água", streak: "30 dias", pct: 100 },
          { nome: "Exercício físico", streak: "5 dias", pct: 57 },
          { nome: "Meditar", streak: "8 dias", pct: 71 },
        ].map((h) => (
          <div key={h.nome} className="bg-surface rounded-lg border border-line px-2.5 py-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${h.pct === 100 ? "bg-brand" : "bg-brand-soft"}`}>
                  <Check className={`w-2 h-2 ${h.pct === 100 ? "text-white" : "text-brand-dark"}`} />
                </div>
                <span className="text-[9px] font-medium text-ink">{h.nome}</span>
              </div>
              <span className="text-[8px] text-gold font-semibold">🔥 {h.streak}</span>
            </div>
            <div className="h-1 rounded-full bg-line overflow-hidden">
              <div className="h-full bg-brand rounded-full" style={{ width: `${h.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}

/* ============================================================
   Landing Page
   ============================================================ */

const modulos = [
  {
    icon: Wallet,
    titulo: "Financeiro",
    descricao: "Controle receitas, despesas, contas, cartões e objetivos em um painel claro e completo.",
  },
  {
    icon: Calendar,
    titulo: "Agenda",
    descricao: "Organize compromissos com visão diária e semanal, recorrências e lembretes.",
  },
  {
    icon: Heart,
    titulo: "Hábitos",
    descricao: "Construa rotinas saudáveis com sequências, metas semanais e acompanhamento visual.",
  },
  {
    icon: BookOpen,
    titulo: "Estudos",
    descricao: "Gerencie cursos e anotações com editor rico, áudio e organização por matéria.",
  },
  {
    icon: Books,
    titulo: "Biblioteca",
    descricao: "Acompanhe suas leituras, registre citações, avaliações e progresso de cada livro.",
  },
  {
    icon: Airplane,
    titulo: "Viagens",
    descricao: "Planeje roteiros, organize documentos e controle os gastos de cada viagem.",
  },
];

const faqs = [
  {
    pergunta: "O Aura é gratuito?",
    resposta:
      "Sim! Você pode criar sua conta e usar os módulos essenciais gratuitamente, sem cartão de crédito. O plano Premium desbloqueia recursos avançados para quem quer ir além.",
  },
  {
    pergunta: "Funciona no celular?",
    resposta:
      "Sim. O Aura é um PWA: você pode instalá-lo direto do navegador no Android e iOS e usá-lo como um aplicativo, com a mesma conta em todos os dispositivos.",
  },
  {
    pergunta: "Meus dados estão seguros?",
    resposta:
      "Seus dados são criptografados em trânsito e armazenados com segurança. Você pode exportá-los ou excluir sua conta a qualquer momento, em conformidade com a LGPD.",
  },
  {
    pergunta: "Posso cancelar o Premium quando quiser?",
    resposta:
      "Pode. A assinatura é sem fidelidade: cancele a qualquer momento e continue usando o plano gratuito normalmente.",
  },
  {
    pergunta: "Preciso configurar muita coisa para começar?",
    resposta:
      "Não. Em menos de 2 minutos você cria a conta e já pode registrar seu primeiro compromisso, transação ou hábito. Cada módulo funciona de forma independente.",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [faqAberta, setFaqAberta] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-ink">
      {/* ===================== Header ===================== */}
      <header
        className={`fixed top-0 inset-x-0 z-50 bg-surface transition-shadow duration-150 ${
          scrolled ? "shadow-[0_2px_12px_rgba(14,42,63,0.08)]" : "border-b border-line"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-brand">
            Aura
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm text-ink-soft hover:text-brand-dark transition-colors duration-150">
              Recursos
            </a>
            <a href="#como-funciona" className="text-sm text-ink-soft hover:text-brand-dark transition-colors duration-150">
              Como funciona
            </a>
            <a href="#precos" className="text-sm text-ink-soft hover:text-brand-dark transition-colors duration-150">
              Preços
            </a>
            <a href="#faq" className="text-sm text-ink-soft hover:text-brand-dark transition-colors duration-150">
              FAQ
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-brand-dark hover:text-brand transition-colors duration-150 px-3 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg transition-colors duration-150"
            >
              Cadastre-se grátis
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-ink-soft hover:bg-surface-hover rounded-lg transition-colors duration-150"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <ListBullets className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-t border-line px-4 py-4 space-y-1">
            {[
              { href: "#recursos", label: "Recursos" },
              { href: "#como-funciona", label: "Como funciona" },
              { href: "#precos", label: "Preços" },
              { href: "#faq", label: "FAQ" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-2.5 px-3 rounded-lg text-ink-soft hover:bg-surface-hover transition-colors duration-150"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3 border-t border-line flex flex-col gap-2">
              <Link
                href="/login"
                className="text-center py-2.5 rounded-lg border border-line-strong font-semibold text-brand-dark hover:bg-surface-hover transition-colors duration-150"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="text-center py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition-colors duration-150"
              >
                Cadastre-se grátis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ===================== Hero ===================== */}
      <section className="pt-28 lg:pt-36 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-brand-soft text-brand-dark text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Lightning className="w-3.5 h-3.5" />
              Agenda, finanças, hábitos e estudos em um só lugar
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] text-ink mb-6">
              Transforme sua rotina em <span className="text-brand">conquistas</span>
            </h1>
            <p className="text-lg text-ink-soft mb-8 max-w-lg leading-relaxed">
              O Aura é o gerenciador pessoal completo: organize compromissos, controle suas
              finanças, construa hábitos e acompanhe seus estudos — tudo em um painel simples e claro.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-lg transition-colors duration-150"
              >
                Criar conta gratuita
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#recursos"
                className="inline-flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover border border-line-strong text-ink font-semibold px-7 py-3.5 rounded-lg transition-colors duration-150"
              >
                Conhecer recursos
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-brand" /> Grátis para começar
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-brand" /> Sem cartão de crédito
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-brand" /> Funciona no celular
              </span>
            </div>
          </div>

          <div className="relative">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ===================== Faixa de destaque ===================== */}
      <section className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { numero: "6", label: "módulos integrados" },
            { numero: "2 min", label: "para começar a usar" },
            { numero: "100%", label: "em português" },
            { numero: "24/7", label: "acesso em qualquer dispositivo" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl lg:text-4xl font-extrabold text-[#2EB8C0] mb-1">{s.numero}</p>
              <p className="text-sm text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== Recursos ===================== */}
      <section id="recursos" className="bg-surface py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mb-4">
              Tudo o que você precisa para se organizar
            </h2>
            <p className="text-lg text-ink-soft">
              Cada módulo foi pensado para simplificar uma área da sua vida — e todos conversam entre si.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulos.map((m) => (
              <div
                key={m.titulo}
                className="bg-surface border border-line rounded-xl p-6 shadow-sm hover:shadow-md hover:border-brand/40 transition-all duration-150"
              >
                <div className="w-11 h-11 rounded-lg bg-brand-soft flex items-center justify-center mb-4">
                  <m.icon className="w-5 h-5 text-brand-dark" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">{m.titulo}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{m.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== Deep-dives alternados ===================== */}
      <section id="como-funciona" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 lg:space-y-28">
          {/* Financeiro */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-brand-dark text-sm font-semibold mb-3">
                <Wallet className="w-4 h-4" /> Financeiro
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-ink mb-4">
                Saiba exatamente para onde vai o seu dinheiro
              </h3>
              <p className="text-ink-soft leading-relaxed mb-6">
                Registre transações em segundos, organize por categorias, acompanhe contas e cartões
                e visualize sua evolução com gráficos claros. Defina objetivos e veja seu progresso mês a mês.
              </p>
              <ul className="space-y-2.5">
                {["Receitas, despesas e transferências", "Contas, cartões e faturas", "Objetivos de economia com progresso visual"].map((li) => (
                  <li key={li} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
            </div>
            <FinanceiroMockup />
          </div>

          {/* Agenda */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <span className="inline-flex items-center gap-1.5 text-brand-dark text-sm font-semibold mb-3">
                <Calendar className="w-4 h-4" /> Agenda
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-ink mb-4">
                Seus compromissos sob controle, sem esforço
              </h3>
              <p className="text-ink-soft leading-relaxed mb-6">
                Visualize o dia e a semana de relance, crie eventos recorrentes e receba lembretes.
                A agenda se integra ao seu dashboard para você nunca perder um compromisso.
              </p>
              <ul className="space-y-2.5">
                {["Visão diária e semanal", "Eventos recorrentes e lembretes", "Integração com o painel inicial"].map((li) => (
                  <li key={li} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-1">
              <AgendaMockup />
            </div>
          </div>

          {/* Hábitos */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-brand-dark text-sm font-semibold mb-3">
                <Heart className="w-4 h-4" /> Hábitos
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-ink mb-4">
                Construa hábitos que ficam
              </h3>
              <p className="text-ink-soft leading-relaxed mb-6">
                Marque seus hábitos diários, mantenha sequências e acompanhe seu desempenho semanal.
                Pequenas ações todos os dias, grandes resultados no fim do mês.
              </p>
              <ul className="space-y-2.5">
                {["Sequências (streaks) motivadoras", "Metas semanais flexíveis", "Histórico e estatísticas de constância"].map((li) => (
                  <li key={li} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
            </div>
            <HabitosMockup />
          </div>
        </div>
      </section>

      {/* ===================== Benefícios rápidos ===================== */}
      <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-3 gap-8">
          {[
            {
              icon: DeviceMobile,
              titulo: "Leve no bolso",
              descricao: "Instale como aplicativo no celular (PWA) e acesse de qualquer lugar.",
            },
            {
              icon: Shield,
              titulo: "Seguro e privado",
              descricao: "Seus dados criptografados e sob seu controle, em conformidade com a LGPD.",
            },
            {
              icon: Lightning,
              titulo: "Rápido de verdade",
              descricao: "Interface leve e direta: registre qualquer coisa em poucos toques.",
            },
          ].map((b) => (
            <div key={b.titulo} className="flex gap-4">
              <div className="w-11 h-11 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-brand-dark" />
              </div>
              <div>
                <h3 className="font-bold text-ink mb-1">{b.titulo}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{b.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== Preços ===================== */}
      <section id="precos" className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mb-4">
              Comece grátis, evolua quando quiser
            </h2>
            <p className="text-lg text-ink-soft">
              Sem pegadinhas: o plano gratuito é para sempre e o Premium não tem fidelidade.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-surface border border-line rounded-2xl p-8 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-ink">Gratuito</h3>
              <p className="text-sm text-ink-faint mb-5">Para organizar o essencial</p>
              <p className="mb-6">
                <span className="text-4xl font-extrabold text-ink">R$ 0</span>
                <span className="text-sm text-ink-faint">/mês</span>
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {["Agenda e compromissos", "Controle financeiro básico", "Hábitos ilimitados", "Acesso em todos os dispositivos"].map((li) => (
                  <li key={li} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center border border-line-strong hover:bg-surface-hover text-ink font-semibold py-3 rounded-lg transition-colors duration-150"
              >
                Criar conta grátis
              </Link>
            </div>

            {/* Premium */}
            <div className="relative bg-surface border-2 border-brand rounded-2xl p-8 shadow-md flex flex-col">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-4 py-1.5 rounded-full">
                MAIS POPULAR
              </span>
              <h3 className="text-lg font-bold text-ink">Premium</h3>
              <p className="text-sm text-ink-faint mb-5">Para quem quer o controle total</p>
              <p className="mb-6">
                <span className="text-4xl font-extrabold text-ink">R$ 12,90</span>
                <span className="text-sm text-ink-faint">/mês</span>
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Tudo do plano gratuito",
                  "Estudos com editor completo e áudio",
                  "Biblioteca de leituras avançada",
                  "Planejamento de viagens",
                  "Relatórios e estatísticas detalhadas",
                ].map((li) => (
                  <li key={li} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-lg transition-colors duration-150"
              >
                Começar agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section id="faq" className="bg-surface py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-lg text-ink-soft">Tudo o que você precisa saber antes de começar.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.pergunta} className="border border-line rounded-xl overflow-hidden bg-surface">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface-soft transition-colors duration-150"
                  onClick={() => setFaqAberta(faqAberta === i ? null : i)}
                  aria-expanded={faqAberta === i}
                >
                  <span className="font-semibold text-ink text-sm sm:text-base">{faq.pergunta}</span>
                  <CaretDown
                    className={`w-5 h-5 text-ink-faint shrink-0 transition-transform duration-150 ${
                      faqAberta === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {faqAberta === i && (
                  <div className="px-5 pb-4 text-sm text-ink-soft leading-relaxed">{faq.resposta}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA final ===================== */}
      <section className="bg-gradient-to-br from-brand via-brand-blue to-navy py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Pronto para organizar sua vida?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Crie sua conta gratuita em menos de 2 minutos e comece hoje mesmo.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-surface hover:bg-background text-brand-dark font-bold px-8 py-4 rounded-lg transition-colors duration-150"
          >
            Criar conta gratuita
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===================== Footer ===================== */}
      <footer className="bg-navy text-white/70 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <Link href="/" className="text-2xl font-extrabold text-white">
                Aura
              </Link>
              <p className="text-sm mt-3 leading-relaxed">
                O gerenciador pessoal completo para sua rotina, finanças, hábitos e estudos.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Produto</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#recursos" className="hover:text-white transition-colors duration-150">Recursos</a></li>
                <li><a href="#precos" className="hover:text-white transition-colors duration-150">Preços</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors duration-150">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Conta</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors duration-150">Entrar</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors duration-150">Criar conta</Link></li>
                <li><Link href="/premium" className="hover:text-white transition-colors duration-150">Premium</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors duration-150">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-150">Termos de uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-150">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <p>© {new Date().getFullYear()} Aura. Todos os direitos reservados.</p>
            <p>
              Feito com <span className="text-brand">♥</span> para sua produtividade
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
