'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Calendar, 
  Wallet, 
  BookOpen, 
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  const firstName = session.user.name?.split(' ')[0] || 'Usuário';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Olá, {firstName}! 👋
        </h1>
        <p className="text-gray-400">
          Aqui está um resumo do seu dia
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 - Compromissos Hoje */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Compromissos Hoje
            </CardTitle>
            <Calendar className="w-4 h-4 text-aura-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-500 mt-1">
              Nenhum compromisso agendado
            </p>
          </CardContent>
        </Card>

        {/* Card 2 - Saldo Mensal */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Saldo do Mês
            </CardTitle>
            <Wallet className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ 0,00</div>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Configure suas finanças
            </p>
          </CardContent>
        </Card>

        {/* Card 3 - Cursos Ativos */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Cursos Ativos
            </CardTitle>
            <BookOpen className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-500 mt-1">
              Comece seus estudos
            </p>
          </CardContent>
        </Card>

        {/* Card 4 - Metas do Mês */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Metas do Mês
            </CardTitle>
            <Target className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0/0</div>
            <p className="text-xs text-gray-500 mt-1">
              Defina suas metas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividades Recentes */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Atividades Recentes</CardTitle>
            <CardDescription className="text-gray-400">
              Suas últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Empty State */}
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 mb-2">Nenhuma atividade ainda</p>
                <p className="text-sm text-gray-500">
                  Comece usando os módulos para ver suas atividades aqui
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Ações Rápidas</CardTitle>
            <CardDescription className="text-gray-400">
              Acesse rapidamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-aura-500/10 hover:bg-aura-500/20 text-aura-400 border border-aura-500/20">
              <Calendar className="w-4 h-4 mr-2" />
              Novo Compromisso
              <Badge variant="secondary" className="ml-auto text-xs">Em breve</Badge>
            </Button>
            <Button className="w-full justify-start bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20">
              <Wallet className="w-4 h-4 mr-2" />
              Nova Transação
              <Badge variant="secondary" className="ml-auto text-xs">Em breve</Badge>
            </Button>
            <Button className="w-full justify-start bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20">
              <BookOpen className="w-4 h-4 mr-2" />
              Adicionar Curso
              <Badge variant="secondary" className="ml-auto text-xs">Em breve</Badge>
            </Button>
            <Button className="w-full justify-start bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20">
              <Target className="w-4 h-4 mr-2" />
              Criar Meta
              <Badge variant="secondary" className="ml-auto text-xs">Premium</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Módulos Disponíveis */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Seus Módulos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Agenda */}
          <Card className="bg-gradient-to-br from-aura-500/10 to-blue-500/10 border-aura-500/20 hover:border-aura-500/40 transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-aura-400" />
                <Badge className="bg-aura-500/20 text-aura-400 border-0">Básico</Badge>
              </div>
              <CardTitle className="text-white">Agenda</CardTitle>
              <CardDescription className="text-gray-400">
                Organize seus compromissos e eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-aura-500 hover:bg-aura-600 group-hover:shadow-lg group-hover:shadow-aura-500/25">
                Em breve
              </Button>
            </CardContent>
          </Card>

          {/* Financeiro */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-8 h-8 text-green-400" />
                <Badge className="bg-green-500/20 text-green-400 border-0">Básico</Badge>
              </div>
              <CardTitle className="text-white">Financeiro</CardTitle>
              <CardDescription className="text-gray-400">
                Controle suas receitas e despesas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-500 hover:bg-green-600 group-hover:shadow-lg group-hover:shadow-green-500/25">
                Em breve
              </Button>
            </CardContent>
          </Card>

          {/* Estudos */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-orange-400" />
                <Badge className="bg-orange-500/20 text-orange-400 border-0">Básico</Badge>
              </div>
              <CardTitle className="text-white">Estudos</CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie seus cursos e conteúdos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 group-hover:shadow-lg group-hover:shadow-orange-500/25">
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Banner */}
      <Card className="bg-gradient-to-r from-aura-500/10 via-blue-500/10 to-purple-500/10 border-aura-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-2">
                Desbloqueie Todo o Potencial do Aura
              </h3>
              <p className="text-gray-400 text-sm">
                Acesse recursos premium como Metas, Treinos, Viagens e muito mais
              </p>
            </div>
            <Button className="bg-gradient-to-r from-aura-500 to-blue-500 hover:from-aura-600 hover:to-blue-600 shadow-lg shadow-aura-500/25">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Fazer Upgrade para Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}