'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
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
      } catch (error) {
        setStatus('error');
        setMessage('Erro ao processar verificação');
      }
    }

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verificando seu email...
              </h1>
              <p className="text-gray-600">Aguarde um momento</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Email verificado!
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecionando para o login...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Erro na verificação
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Voltar para o login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
