'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F1E9] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <span className="text-3xl font-extrabold tracking-tight text-[#178E96]">Aura</span>
          </Link>
        </div>

        <div className="bg-white border border-[#E9E7DC] rounded-2xl shadow-sm p-8">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 text-[#178E96] animate-spin mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[#0E2A3F] mb-2">
                  Verificando seu email...
                </h1>
                <p className="text-[#5E7081]">Aguarde um momento</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-200 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-[#0E2A3F] mb-2">
                  Email verificado!
                </h1>
                <p className="text-[#5E7081] mb-4">{message}</p>
                <p className="text-sm text-[#8395A5]">
                  Redirecionando para o login...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-[#0E2A3F] mb-2">
                  Erro na verificação
                </h1>
                <p className="text-[#5E7081] mb-6">{message}</p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-[#178E96] hover:bg-[#117178] text-white font-semibold h-11 rounded-lg transition-colors duration-150 uppercase tracking-wide text-sm"
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F1E9] p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <span className="text-3xl font-extrabold tracking-tight text-[#178E96]">Aura</span>
          </div>
          <div className="bg-white border border-[#E9E7DC] rounded-2xl shadow-sm p-8">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-[#178E96] animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[#0E2A3F] mb-2">
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
