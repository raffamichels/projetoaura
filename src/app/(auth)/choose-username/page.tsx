'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AtSign, Check, X, Loader2, ArrowRight, Sparkles } from 'lucide-react';

export default function ChooseUsernamePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirecionar se usuário já tem username
  useEffect(() => {
    if (session?.user?.username) {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Redirecionar se não está autenticado
  useEffect(() => {
    if (session === null) {
      router.push('/login');
    }
  }, [session, router]);

  // Sugerir username baseado no nome
  useEffect(() => {
    if (session?.user?.name && !username) {
      const suggested = session.user.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 20);
      if (suggested.length >= 3) {
        setUsername(suggested);
      }
    }
  }, [session?.user?.name, username]);

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
    const normalized = value.toLowerCase().replace(/\s/g, '');
    setUsername(normalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameError || !usernameAvailable) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/username/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao definir username');
        setLoading(false);
        return;
      }

      // Atualizar sessão e redirecionar
      await update({ username });
      router.push('/dashboard');
    } catch {
      setError('Erro ao conectar com o servidor');
      setLoading(false);
    }
  };

  // Se session ainda está carregando
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #0a0a0a 50%, #0f0f0f 100%)'
      }}>
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0f0f0f 0%, #0a0a0a 50%, #0f0f0f 100%)'
    }}>
      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
      }} />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
      }} />

      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Image
            src="/images/logo-sem-fundo.png"
            alt="Aura Logo"
            width={160}
            height={160}
            className="w-32 h-32 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white mb-2">Escolha seu username</h1>
          <p className="text-gray-400 text-sm">Este será seu identificador único no Aura</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-purple-900/20">
          {/* Boas-vindas */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">
                Bem-vindo, {session?.user?.name || 'usuário'}!
              </p>
              <p className="text-xs text-gray-400">Falta só mais um passo para começar</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Username
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</div>
                <Input
                  id="username"
                  type="text"
                  placeholder="seu_username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  required
                  autoFocus
                  className="pl-7 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-12 rounded-xl text-base"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                  {!checkingUsername && usernameAvailable === true && <Check className="w-5 h-5 text-green-500" />}
                  {!checkingUsername && usernameAvailable === false && <X className="w-5 h-5 text-red-500" />}
                </div>
              </div>

              {/* Feedback */}
              {usernameError && (
                <p className="text-xs text-red-400">{usernameError}</p>
              )}
              {!usernameError && usernameAvailable === true && (
                <p className="text-xs text-green-400">Username disponível!</p>
              )}
              {!usernameError && usernameAvailable === false && (
                <p className="text-xs text-red-400">Este username já está em uso</p>
              )}
              {!usernameError && username.length === 0 && (
                <p className="text-xs text-gray-500">Letras, números, _ e . (3-30 caracteres)</p>
              )}
            </div>

            {/* Erro geral */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              disabled={loading || !usernameAvailable || !!usernameError}
              className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-blue-500 text-white font-semibold h-12 rounded-xl shadow-lg shadow-purple-900/50 transition-all duration-300 hover:shadow-purple-800/60 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Você poderá alterar seu username a cada 30 dias nas configurações.
          </p>
        </div>
      </div>
    </div>
  );
}
