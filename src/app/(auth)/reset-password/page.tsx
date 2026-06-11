'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição não encontrado');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!token) {
      setError('Token inválido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?reset=success');
        }, 3000);
      } else {
        setError(data.error || 'Erro ao redefinir senha');
      }
    } catch {
      setError('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-200 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-[#0E2A3F] mb-3">
                Senha redefinida!
              </h1>
              <p className="text-[#5E7081] mb-4 text-sm sm:text-base">
                Sua senha foi alterada com sucesso.
              </p>
              <p className="text-sm text-[#8395A5] mb-8">
                Redirecionando para o login...
              </p>
              <div className="w-8 h-8 border-2 border-[#178E96]/30 border-t-[#178E96] rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token || error === 'Token de redefinição não encontrado') {
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-[#0E2A3F] mb-3">
                Link inválido
              </h1>
              <p className="text-[#5E7081] mb-8 text-sm sm:text-base">
                Este link de redefinição de senha é inválido ou expirou.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block w-full"
              >
                <Button className="w-full bg-[#178E96] hover:bg-[#117178] text-white font-semibold h-11 rounded-lg transition-colors duration-150 uppercase tracking-wide text-sm">
                  Solicitar novo link
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F1E9] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <span className="text-3xl font-extrabold tracking-tight text-[#178E96]">Aura</span>
          </Link>
          <p className="text-[#5E7081] text-sm mt-1">Defina uma nova senha segura</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E9E7DC] rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0E2A3F] mb-1">Redefinir senha</h2>
            <p className="text-[#5E7081] text-sm">Digite sua nova senha abaixo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nova Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#44586A] text-sm font-medium">
                Nova senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-2 focus:ring-[#178E96]/20 h-11 rounded-lg transition-colors duration-150 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8395A5] hover:text-[#44586A] transition-colors duration-150"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[#8395A5]">
                Deve conter: 8+ caracteres, maiúscula, minúscula e número
              </p>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[#44586A] text-sm font-medium">
                Confirmar senha
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-2 focus:ring-[#178E96]/20 h-11 rounded-lg transition-colors duration-150 text-sm"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              className="w-full bg-[#178E96] hover:bg-[#117178] text-white font-semibold h-11 rounded-lg transition-colors duration-150 uppercase tracking-wide text-sm"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Redefinindo...
                </div>
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>

          {/* Link para Login */}
          <div className="text-center mt-6 pt-6 border-t border-[#E9E7DC]">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#117178] hover:text-[#178E96] transition-colors duration-150 text-sm font-semibold group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Voltar para o login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-[#8395A5]">
          <p>
            Feito com <span className="text-[#178E96]">♥</span> por Aura
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F2F1E9]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#178E96] animate-spin mx-auto" />
          <p className="mt-4 text-[#5E7081] text-sm">Carregando...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
