'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, CalendarCheck, TrendingUp, BookOpenCheck } from 'lucide-react';

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
    <div className="min-h-screen flex bg-white">
      {/* Coluna esquerda - Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-12 lg:px-20 xl:px-28 py-8">
        {/* Logo */}
        <div className="mb-10">
          <Link href="/">
            <span className="text-3xl font-extrabold tracking-tight text-[#178E96]">Aura</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0E2A3F] mb-2">
            Que bom ter você por aqui! 👋
          </h1>
          <p className="text-[#5E7081] text-sm sm:text-base mb-8">
            Acesse sua conta <span className="font-semibold text-[#0E2A3F]">Aura</span> inserindo seus dados abaixo:
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#44586A] text-sm font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-2 focus:ring-[#178E96]/20 h-11 rounded-lg transition-colors duration-150 text-sm"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#44586A] text-sm font-medium">
                  Senha
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#117178] hover:text-[#178E96] transition-colors duration-150 font-medium"
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
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-2 focus:ring-[#178E96]/20 h-11 rounded-lg transition-colors duration-150 text-sm"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              className="w-full bg-[#178E96] hover:bg-[#117178] text-white font-semibold h-11 rounded-lg transition-colors duration-150 uppercase tracking-wide text-sm"
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
              <div className="w-full border-t border-[#E9E7DC]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#8395A5] font-medium">ou continue com</span>
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
            className="w-full bg-white hover:bg-[#F4F3EC] border-[#D9D7CB] text-[#0E2A3F] font-semibold h-11 rounded-lg transition-colors duration-150 text-sm"
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
            <p className="text-sm text-[#5E7081]">
              Novo por aqui?{' '}
              <Link
                href="/register"
                className="text-[#117178] hover:text-[#178E96] font-semibold transition-colors duration-150"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-between text-xs text-[#8395A5]">
          <div className="flex flex-col gap-1">
            <Link href="/#faq" className="underline hover:text-[#117178] transition-colors duration-150">
              Acessar central de ajuda
            </Link>
            <Link href="/#contato" className="underline hover:text-[#117178] transition-colors duration-150">
              Entrar em contato com suporte
            </Link>
          </div>
          <p>
            Feito com <span className="text-[#178E96]">♥</span> por Aura
          </p>
        </div>
      </div>

      {/* Coluna direita - Painel promocional */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#178E96] via-[#154F6D] to-[#0E2A3F] items-center justify-center p-12">
        <div className="relative z-10 max-w-lg w-full">
          <h2 className="text-3xl xl:text-4xl font-bold text-white text-center leading-snug mb-10">
            Organize sua rotina, finanças e estudos em um só lugar ✨
          </h2>

          {/* Stat cards */}
          <div className="flex justify-center gap-4 mb-10">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3">
              <span className="text-3xl font-extrabold text-[#178E96]">+10h</span>
              <span className="text-sm text-[#44586A] leading-tight">
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
            <div className="bg-white rounded-xl px-5 py-4 shadow-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#E5F1F1] flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-[#117178]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0E2A3F]">Aura</p>
                <p className="text-sm text-[#44586A] truncate">Você tem 2 compromissos hoje</p>
              </div>
              <span className="text-xs text-[#8395A5] shrink-0">9:41</span>
            </div>
            <div className="bg-white/90 rounded-xl px-5 py-4 shadow-lg flex items-center gap-4 scale-[0.97]">
              <div className="w-10 h-10 rounded-lg bg-[#E5F1F1] flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-[#117178]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0E2A3F]">Aura</p>
                <p className="text-sm text-[#44586A] truncate">Resumo financeiro do mês disponível</p>
              </div>
              <span className="text-xs text-[#8395A5] shrink-0">9:41</span>
            </div>
            <div className="bg-white/75 rounded-xl px-5 py-4 shadow-md flex items-center gap-4 scale-[0.94]">
              <div className="w-10 h-10 rounded-lg bg-[#E5F1F1] flex items-center justify-center shrink-0">
                <BookOpenCheck className="w-5 h-5 text-[#117178]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0E2A3F]">Aura</p>
                <p className="text-sm text-[#44586A] truncate">Meta de leitura da semana concluída 🎉</p>
              </div>
              <span className="text-xs text-[#8395A5] shrink-0">9:41</span>
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
