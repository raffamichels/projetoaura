'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, ArrowRight, Shield, AtSign, Check, X, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para validação de username
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Validação de formato local
  const validateUsernameFormat = (value: string): string => {
    if (value.length === 0) return '';
    if (value.length < 3) return 'Mínimo 3 caracteres';
    if (value.length > 30) return 'Máximo 30 caracteres';
    if (!/^[a-zA-Z0-9_.]+$/.test(value)) return 'Apenas letras, números, _ e .';
    if (value.startsWith('.') || value.endsWith('.')) return 'Não pode começar/terminar com ponto';
    if (value.includes('..')) return 'Pontos consecutivos não permitidos';
    return '';
  };

  // Verificar disponibilidade com debounce
  const checkUsernameAvailability = useCallback(async (value: string) => {
    if (!value || value.length < 3 || validateUsernameFormat(value)) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const res = await fetch(`/api/v1/username/check?username=${encodeURIComponent(value)}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
      if (!data.available && data.message) {
        setUsernameError(data.message);
      }
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  // Debounce para verificação de username
  useEffect(() => {
    const formatError = validateUsernameFormat(username);
    setUsernameError(formatError);

    if (formatError || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameAvailability]);

  const handleUsernameChange = (value: string) => {
    // Normalizar para lowercase e remover espaços
    const normalized = value.toLowerCase().replace(/\s/g, '');
    setUsername(normalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar username antes de enviar
    if (!username || usernameError || usernameAvailable === false) {
      setError('Por favor, escolha um username válido e disponível');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar conta');
        setLoading(false);
        return;
      }

      // Sucesso - redireciona para login
      alert('Conta criada com sucesso! Verifique seu email para ativar sua conta.');
      router.push('/login');

    } catch {
      setError('Erro ao conectar com o servidor');
      setLoading(false);
    }
  };

  const isFormValid = name && username && email && password &&
                      !usernameError && usernameAvailable === true;

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
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
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
            className="w-56 h-56 sm:w-64 sm:h-64 md:w-36 md:h-36 lg:w-40 lg:h-40 mx-auto -mb-16 md:-mb-8"
          />
          <p className="text-gray-400 text-sm sm:text-base font-light">Comece sua jornada de produtividade</p>
        </div>

        {/* Card de Registro - Glassmorphism */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 md:p-4 shadow-2xl shadow-purple-900/20 hover:shadow-purple-800/30 transition-all duration-300">
          <div className="mb-4 md:mb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Criar sua conta</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Junte-se a milhares de usuários produtivos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-2">
            {/* Nome */}
            <div className="space-y-1.5 md:space-y-1">
              <Label htmlFor="name" className="text-gray-300 text-xs sm:text-sm font-medium flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Nome completo
              </Label>
              <div className="relative group">
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-10 sm:h-11 md:h-9 rounded-xl transition-all hover:bg-white/10 text-sm"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5 md:space-y-1">
              <Label htmlFor="username" className="text-gray-300 text-xs sm:text-sm font-medium flex items-center gap-2">
                <AtSign className="w-3.5 h-3.5" />
                Username
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</div>
                <Input
                  id="username"
                  type="text"
                  placeholder="seu_username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  required
                  className="pl-7 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-10 sm:h-11 md:h-9 rounded-xl transition-all hover:bg-white/10 text-sm pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                  {!checkingUsername && usernameAvailable === true && <Check className="w-4 h-4 text-green-500" />}
                  {!checkingUsername && usernameAvailable === false && <X className="w-4 h-4 text-red-500" />}
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
              {usernameError && (
                <p className="text-xs text-red-400">{usernameError}</p>
              )}
              {!usernameError && usernameAvailable === true && (
                <p className="text-xs text-green-400">Username disponível!</p>
              )}
              {!usernameError && username.length === 0 && (
                <p className="text-xs text-gray-500">Letras, números, _ e . (3-30 caracteres)</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5 md:space-y-1">
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-10 sm:h-11 md:h-9 rounded-xl transition-all hover:bg-white/10 text-sm"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5 md:space-y-1">
              <Label htmlFor="password" className="text-gray-300 text-xs sm:text-sm font-medium flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Senha
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-10 sm:h-11 md:h-9 rounded-xl transition-all hover:bg-white/10 text-sm"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Mínimo 8 caracteres, com maiúscula, minúscula e número
              </p>
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
              className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-blue-500 text-white font-semibold h-10 sm:h-11 md:h-9 rounded-xl shadow-lg shadow-purple-900/50 transition-all duration-300 hover:shadow-purple-800/60 hover:scale-[1.02] active:scale-[0.98] group mt-4 md:mt-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Criando conta...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Criar conta gratuita
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Termos */}
          <p className="text-xs text-gray-500 text-center mt-3 md:mt-2">
            Ao criar uma conta, você concorda com nossos{' '}
            <button className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Termos de Uso
            </button>
            {' '}e{' '}
            <button className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Política de Privacidade
            </button>
          </p>

          {/* Link para Login */}
          <div className="text-center mt-4 pt-4 md:mt-3 md:pt-3 border-t border-white/10">
            <p className="text-xs sm:text-sm text-gray-400">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors inline-flex items-center gap-1 group"
              >
                Fazer login
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
