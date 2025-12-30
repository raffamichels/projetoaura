'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar conta');
        setLoading(false);
        return;
      }

      // Sucesso - redireciona para login
      alert('Conta criada com sucesso! Faça login para continuar.');
      router.push('/login');
      
    } catch {
      setError('Erro ao conectar com o servidor');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Background gradients animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 via-transparent to-transparent blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-aura-400 bg-clip-text text-transparent">
              Aura
            </span>
          </h1>
          <p className="text-gray-400 text-sm">Comece sua jornada de organização</p>
        </div>

        {/* Card de Registro */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Criar sua conta</h2>
            <p className="text-gray-400 text-sm">Preencha os dados abaixo para começar gratuitamente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300 text-sm font-medium">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
              />
            </div>

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
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 8 caracteres, com letra maiúscula, minúscula e número
              </p>
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
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold h-11 rounded-lg shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Criando conta...
                </div>
              ) : (
                'Criar conta gratuita'
              )}
            </Button>
          </form>

          {/* Termos */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Ao criar uma conta, você concorda com nossos{' '}
            <button className="text-gray-400 hover:text-white transition-colors">
              Termos de Uso
            </button>
            {' '}e{' '}
            <button className="text-gray-400 hover:text-white transition-colors">
              Política de Privacidade
            </button>
          </p>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-gray-500">ou</span>
            </div>
          </div>

          {/* Link para Login */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Já tem uma conta?{' '}
              <Link 
                href="/login" 
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Fazer login
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