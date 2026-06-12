'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Spinner } from '@phosphor-icons/react';

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
        .replace(/[̀-ͯ]/g, '') // Remove acentos
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <span className="text-3xl font-extrabold tracking-tight text-brand">Aura</span>
          </Link>
          <h1 className="text-2xl font-bold text-ink mt-4 mb-1">Escolha seu username</h1>
          <p className="text-ink-soft text-sm">Este será seu identificador único no Aura</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-line rounded-2xl shadow-sm p-8">
          {/* Boas-vindas */}
          <div className="mb-6 p-4 bg-brand-soft rounded-lg border border-brand/20">
            <p className="text-sm text-ink font-semibold">
              Bem-vindo, {session?.user?.name || 'usuário'}!
            </p>
            <p className="text-xs text-ink-soft">Falta só mais um passo para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-ink-soft text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-sm">@</div>
                <Input
                  id="username"
                  type="text"
                  placeholder="seu_username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  required
                  autoFocus
                  className="pl-7 pr-10 bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/20 h-11 rounded-lg transition-colors duration-150 text-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername && <Spinner className="w-5 h-5 text-ink-faint animate-spin" />}
                  {!checkingUsername && usernameAvailable === true && <Check className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  {!checkingUsername && usernameAvailable === false && <X className="w-5 h-5 text-red-600 dark:text-red-400" />}
                </div>
              </div>

              {/* Feedback */}
              {usernameError && (
                <p className="text-xs text-red-600 dark:text-red-400">{usernameError}</p>
              )}
              {!usernameError && usernameAvailable === true && (
                <p className="text-xs text-green-600 dark:text-green-400">Username disponível!</p>
              )}
              {!usernameError && usernameAvailable === false && (
                <p className="text-xs text-red-600 dark:text-red-400">Este username já está em uso</p>
              )}
              {!usernameError && username.length === 0 && (
                <p className="text-xs text-ink-faint">Letras, números, _ e . (3-30 caracteres)</p>
              )}
            </div>

            {/* Erro geral */}
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              disabled={loading || !usernameAvailable || !!usernameError}
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold h-11 rounded-lg transition-colors duration-150 uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Salvando...
                </div>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>

          {/* Info */}
          <p className="text-xs text-ink-faint text-center mt-4">
            Você poderá alterar seu username a cada 30 dias nas configurações.
          </p>
        </div>
      </div>
    </div>
  );
}
