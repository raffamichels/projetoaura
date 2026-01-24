'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen md:h-screen relative overflow-hidden flex items-center justify-center p-3 sm:p-4" style={{
      background: 'linear-gradient(135deg, #0f0f0f 0%, #0a0a0a 50%, #0f0f0f 100%)'
    }}>
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
      }} />

      {/* Radial vignette effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
      }} />

      {/* Animated gradient orbs - more subtle */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Very subtle grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-2">
          <Image
            src="/images/logo-sem-fundo.png"
            alt="Aura Logo"
            width={280}
            height={280}
            className="w-56 h-56 sm:w-64 sm:h-64 md:w-40 md:h-40 lg:w-44 lg:h-44 mx-auto -mb-16 md:-mb-10"
          />
          <p className="text-gray-400 text-sm sm:text-base font-light">Transforme sua rotina em conquistas</p>
        </div>

        {/* Card de Login - Glassmorphism */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 md:p-5 shadow-2xl shadow-purple-900/20 hover:shadow-purple-800/30 transition-all duration-300">
          <div className="mb-5 md:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Bem-vindo de volta</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Continue sua jornada de produtividade</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-300 text-xs sm:text-sm font-medium flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                Email
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-10 sm:h-11 rounded-xl transition-all hover:bg-white/10 text-sm"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300 text-xs sm:text-sm font-medium flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  Senha
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium group flex items-center gap-1"
                >
                  Esqueceu?
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-10 sm:h-11 rounded-xl transition-all hover:bg-white/10 text-sm"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-blue-500 text-white font-semibold h-10 sm:h-11 rounded-xl shadow-lg shadow-purple-900/50 transition-all duration-300 hover:shadow-purple-800/60 hover:scale-[1.02] active:scale-[0.98] group text-sm"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Entrar
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5 md:my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-3 text-gray-500 font-medium">ou continue com</span>
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
            className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white font-semibold h-10 sm:h-11 rounded-xl transition-all duration-200 hover:border-white/20 group text-sm"
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
            <span className="group-hover:translate-x-0.5 transition-transform">Entrar com Google</span>
          </Button>

          {/* Link para Registro */}
          <div className="text-center mt-5 md:mt-4">
            <p className="text-xs sm:text-sm text-gray-400">
              Novo por aqui?{' '}
              <Link
                href="/register"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors inline-flex items-center gap-1 group"
              >
                Criar conta gratuita
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 md:mt-2 text-xs text-gray-500 md:hidden">
          <p>© 2025 Aura. Feito com dedicação para sua produtividade.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}