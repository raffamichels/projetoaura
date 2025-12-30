'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-aura-400 to-blue-400 bg-clip-text text-transparent">
            Aura
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-gray-400">{session.user.email}</p>
            </div>
            <Button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Olá, {session.user.name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-gray-400">
              Bem-vindo ao seu painel de controle pessoal
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Agenda</h3>
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-sm text-gray-400">
                Organize seus compromissos
              </p>
              <Button className="mt-4 w-full bg-aura-500 hover:bg-aura-600">
                Em breve
              </Button>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Financeiro</h3>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-sm text-gray-400">
                Controle suas finanças
              </p>
              <Button className="mt-4 w-full bg-green-500 hover:bg-green-600">
                Em breve
              </Button>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Estudos</h3>
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-sm text-gray-400">
                Gerencie seus cursos
              </p>
              <Button className="mt-4 w-full bg-orange-500 hover:bg-orange-600">
                Em breve
              </Button>
            </div>
          </div>

          {/* Info do Plano */}
          <div className="bg-gradient-to-r from-aura-500/10 to-blue-500/10 border border-aura-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Plano Atual</h3>
                <p className="text-sm text-gray-400">
                  Você está no plano <span className="text-aura-400 font-semibold">{session.user.plano}</span>
                </p>
              </div>
              <Button className="bg-gradient-to-r from-aura-500 to-blue-500 hover:from-aura-600 hover:to-blue-600">
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}