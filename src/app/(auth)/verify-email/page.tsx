'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Spinner } from '@phosphor-icons/react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado');
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);

          // Redireciona para login após 3 segundos
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Erro ao verificar email');
        }
      } catch {
        setStatus('error');
        setMessage('Erro ao processar verificação');
      }
    }

    verifyEmail();
  }, [token, router]);

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
            {status === 'loading' && (
              <>
                <Spinner className="w-16 h-16 text-brand animate-spin mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-ink mb-2">
                  Verificando seu email...
                </h1>
                <p className="text-ink-soft">Aguarde um momento</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">
                  Email verificado!
                </h1>
                <p className="text-ink-soft mb-4">{message}</p>
                <p className="text-sm text-ink-faint">
                  Redirecionando para o login...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 mb-4">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">
                  Erro na verificação
                </h1>
                <p className="text-ink-soft mb-6">{message}</p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-semibold h-11 rounded-lg transition-colors duration-150 uppercase tracking-wide text-sm"
                >
                  Voltar para o login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <span className="text-3xl font-extrabold tracking-tight text-brand">Aura</span>
          </div>
          <div className="bg-surface border border-line rounded-2xl shadow-sm p-8">
            <div className="text-center">
              <Spinner className="w-16 h-16 text-brand animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-2">
                Carregando...
              </h1>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
