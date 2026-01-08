'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-3 sm:p-4">
      {/* Background gradients animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-aura-500/20 via-transparent to-transparent blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-aura-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Aura
            </span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">Organize sua vida, simplifique seu dia</p>
        </div>

        {/* Card de Login */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5 sm:p-8 shadow-2xl">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Entre com suas credenciais para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-aura-500 focus:ring-aura-500/20 h-11"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                  Senha
                </Label>
                <button type="button" className="text-xs text-aura-400 hover:text-aura-300 transition-colors">
                  Esqueceu?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-aura-500 focus:ring-aura-500/20 h-11"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Botão */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-aura-500 to-blue-500 hover:from-aura-600 hover:to-blue-600 text-white font-semibold h-11 rounded-lg shadow-lg shadow-aura-500/25 transition-all duration-200 hover:shadow-aura-500/40 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-gray-500">ou continue com</span>
            </div>
          </div>

          {/* Login com Google */}
          <Button
            type="button"
            onClick={async () => {
              const { signIn } = await import('next-auth/react');
              signIn('google', { callbackUrl: '/dashboard' });
            }}
            variant="default"
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold h-11 rounded-lg border-2 border-zinc-300 transition-all duration-200 hover:border-gray-400"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
          </div>

          {/* Link para Registro */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Não tem uma conta?{' '}
              <Link 
                href="/register" 
                className="text-aura-400 hover:text-aura-300 font-semibold transition-colors"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          © 2025 Aura. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}