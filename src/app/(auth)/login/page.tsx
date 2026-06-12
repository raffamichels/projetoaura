'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { ArrowRight, CalendarCheck, TrendUp, BookBookmark } from '@phosphor-icons/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const { signIn } = await import('next-auth/react');

        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
            setError('Email ou senha incorretos');
            setLoading(false);
            return;
        }

         // Login com sucesso - redireciona para dashboard
        window.location.href = '/dashboard';

    } catch {
        setError('Erro ao conectar com o servidor');
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Coluna esquerda - Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-12 lg:px-20 xl:px-28 py-8">
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto lg:mx-0">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/">
              <Image src="/logo-aura.png" alt="Aura" width={120} height={120} className="drop-shadow-lg" />
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2 text-center">
            Que bom ter você por aqui! 👋
          </h1>
          <p className="text-ink-soft text-sm sm:text-base mb-8">
            Acesse sua conta <span className="font-semibold text-ink">Aura</span> inserindo seus dados abaixo:
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-ink-soft text-sm font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/20 h-11 rounded-lg transition-colors duration-150 text-sm"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-ink-soft text-sm font-medium">
                  Senha
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-dark hover:text-brand transition-colors duration-150 font-medium"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/20 h-11 rounded-lg transition-colors duration-150 text-sm"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold h-11 rounded-lg transition-colors duration-150 uppercase tracking-wide text-sm"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-3 text-ink-faint font-medium">ou continue com</span>
            </div>
          </div>

          {/* Login com Google */}
          <Button
            type="button"
            onClick={async () => {
              const { signIn } = await import('next-auth/react');
              signIn('google', { callbackUrl: '/dashboard' });
            }}
            variant="outline"
            className="w-full bg-surface hover:bg-surface-hover border-line-strong text-ink font-semibold h-11 rounded-lg transition-colors duration-150 text-sm"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </Button>

          {/* Link para Registro */}
          <div className="text-center mt-6">
            <p className="text-sm text-ink-soft">
              Novo por aqui?{' '}
              <Link
                href="/register"
                className="text-brand-dark hover:text-brand font-semibold transition-colors duration-150"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-between text-xs text-ink-faint">
          <div className="flex flex-col gap-1">
            <Link href="/#faq" className="underline hover:text-brand-dark transition-colors duration-150">
              Acessar central de ajuda
            </Link>
            <Link href="/#contato" className="underline hover:text-brand-dark transition-colors duration-150">
              Entrar em contato com suporte
            </Link>
          </div>
          <p>
            Feito com <span className="text-brand">♥</span> por Aura
          </p>
        </div>
      </div>

      {/* Coluna direita - Painel promocional */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-brand via-brand-blue to-navy items-center justify-center p-12">
        <div className="relative z-10 max-w-lg w-full">
          <h2 className="text-3xl xl:text-4xl font-bold text-white text-center leading-snug mb-10">
            Organize sua rotina, finanças e estudos em um só lugar ✨
          </h2>

          {/* Stat cards */}
          <div className="flex justify-center gap-4 mb-10">
            <div className="bg-surface rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3">
              <span className="text-3xl font-extrabold text-brand">+10h</span>
              <span className="text-sm text-ink-soft leading-tight">
                economizadas<br />por semana com o <span className="font-bold">Aura</span>
              </span>
            </div>
            <div className="hidden xl:flex bg-white/10 border border-white/20 rounded-2xl px-6 py-4 items-center gap-3">
              <span className="text-3xl font-extrabold text-white">+83%</span>
              <span className="text-sm text-white/80 leading-tight">de hábitos<br />concluídos</span>
            </div>
          </div>

          {/* Notificações do sistema (mockup) */}
          <div className="space-y-3">
            <div className="bg-surface rounded-xl px-5 py-4 shadow-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-brand-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">Aura</p>
                <p className="text-sm text-ink-soft truncate">Você tem 2 compromissos hoje</p>
              </div>
              <span className="text-xs text-ink-faint shrink-0">9:41</span>
            </div>
            <div className="bg-surface/90 rounded-xl px-5 py-4 shadow-lg flex items-center gap-4 scale-[0.97]">
              <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                <TrendUp className="w-5 h-5 text-brand-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">Aura</p>
                <p className="text-sm text-ink-soft truncate">Resumo financeiro do mês disponível</p>
              </div>
              <span className="text-xs text-ink-faint shrink-0">9:41</span>
            </div>
            <div className="bg-surface/75 rounded-xl px-5 py-4 shadow-md flex items-center gap-4 scale-[0.94]">
              <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                <BookBookmark className="w-5 h-5 text-brand-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">Aura</p>
                <p className="text-sm text-ink-soft truncate">Meta de leitura da semana concluída 🎉</p>
              </div>
              <span className="text-xs text-ink-faint shrink-0">9:41</span>
            </div>
          </div>

          {/* CTA secundário */}
          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium text-sm transition-colors duration-150"
            >
              Ainda não tem conta? Comece grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decoração sutil */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-white/5" />
      </div>
    </div>
  );
}
