'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { ArrowRight, Check, X, Spinner, CalendarCheck, TrendUp, BookBookmark } from '@phosphor-icons/react';

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

  const inputClass = "bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/20 h-11 rounded-lg transition-colors duration-150 text-sm";

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
            Criar sua conta
          </h1>
          <p className="text-ink-soft text-sm sm:text-base mb-8">
            Comece sua jornada de produtividade com o <span className="font-semibold text-ink">Aura</span>:
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-ink-soft text-sm font-medium">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Username */}
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
                  className={`pl-7 pr-10 ${inputClass}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername && <Spinner className="w-4 h-4 text-ink-faint animate-spin" />}
                  {!checkingUsername && usernameAvailable === true && <Check className="w-4 h-4 text-green-600 dark:text-green-400" />}
                  {!checkingUsername && usernameAvailable === false && <X className="w-4 h-4 text-red-600 dark:text-red-400" />}
                </div>
              </div>
              {usernameError && (
                <p className="text-xs text-red-600 dark:text-red-400">{usernameError}</p>
              )}
              {!usernameError && usernameAvailable === true && (
                <p className="text-xs text-green-600 dark:text-green-400">Username disponível!</p>
              )}
              {!usernameError && username.length === 0 && (
                <p className="text-xs text-ink-faint">Letras, números, _ e . (3-30 caracteres)</p>
              )}
            </div>

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
                className={inputClass}
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-ink-soft text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={inputClass}
              />
              <p className="text-xs text-ink-faint">
                Mínimo 8 caracteres, com maiúscula, minúscula e número
              </p>
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
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold h-11 rounded-lg transition-colors duration-150 uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !isFormValid}
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
          <p className="text-xs text-ink-faint text-center mt-4">
            Ao criar uma conta, você concorda com nossos{' '}
            <button className="text-brand-dark hover:text-brand transition-colors duration-150 font-medium underline">
              Termos de Uso
            </button>
            {' '}e{' '}
            <button className="text-brand-dark hover:text-brand transition-colors duration-150 font-medium underline">
              Política de Privacidade
            </button>
          </p>

          {/* Link para Login */}
          <div className="text-center mt-6">
            <p className="text-sm text-ink-soft">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-brand-dark hover:text-brand font-semibold transition-colors duration-150"
              >
                Fazer login
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
              href="/login"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium text-sm transition-colors duration-150"
            >
              Já tem conta? Faça login
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
