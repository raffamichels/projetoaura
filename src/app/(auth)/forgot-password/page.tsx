'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Erro ao enviar email');
      }
    } catch {
      setError('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/">
              <span className="text-3xl font-extrabold tracking-tight text-brand">Aura</span>
            </Link>
          </div>

          <div className="bg-surface border border-line rounded-2xl shadow-sm p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-ink mb-3">
                Email enviado!
              </h1>
              <p className="text-ink-soft mb-4 text-sm sm:text-base">
                Se o email <span className="text-brand-dark font-semibold">{email}</span> estiver cadastrado, você receberá instruções para redefinir sua senha.
              </p>
              <p className="text-sm text-ink-faint mb-8">
                Verifique sua caixa de entrada e também a pasta de spam.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-brand-dark hover:text-brand transition-colors duration-150 font-semibold text-sm group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>
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
          <p className="text-ink-soft text-sm mt-1">Recupere o acesso à sua conta</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-line rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-ink mb-1">Esqueceu sua senha?</h2>
            <p className="text-ink-soft text-sm">Digite seu email para receber instruções de redefinição</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  Enviando...
                </div>
              ) : (
                'Enviar link de redefinição'
              )}
            </Button>
          </form>

          {/* Link para Login */}
          <div className="text-center mt-6 pt-6 border-t border-line">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-brand-dark hover:text-brand transition-colors duration-150 text-sm font-semibold group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Voltar para o login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-ink-faint">
          <p>
            Feito com <span className="text-brand">♥</span> por Aura
          </p>
        </div>
      </div>
    </div>
  );
}
