'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Wallet, BookOpen, TrendUp, Target, CheckCircle, Books } from '@phosphor-icons/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';
import { AtividadesRecentes } from '@/components/dashboard/AtividadesRecentes';
import { useTranslations } from 'next-intl';
import { usePlano } from '@/hooks/usePlano';
import { formatarMoeda } from '@/lib/financeiro-helper';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tSidebar = useTranslations('sidebar');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [compromissosHoje, setCompromissosHoje] = useState(0);
  const [loadingCompromissos, setLoadingCompromissos] = useState(true);
  const [saldoMes, setSaldoMes] = useState(0);
  const [transacoesMes, setTransacoesMes] = useState(0);
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(true);
  const { ehFree } = usePlano();

  // Buscar compromissos de hoje
  useEffect(() => {
    if (session) {
      fetchCompromissosHoje();
      fetchResumoFinanceiro();
    }
  }, [session]);

  const fetchCompromissosHoje = async () => {
    try {
      const response = await fetch('/api/v1/agenda/compromissos');
      if (response.ok) {
        const data = await response.json();
        const compromissos = data.data || [];
        
        // Pegar data de hoje no fuso horário local
        const hoje = new Date();
        const inicioHoje = startOfDay(hoje);
        const fimHoje = endOfDay(hoje);
        
        // Filtrar compromissos de hoje
        const compromissosDeHoje = compromissos.filter((comp: { data: string }) => {
          const dataCompromisso = parseISO(comp.data);
          return isWithinInterval(dataCompromisso, { start: inicioHoje, end: fimHoje });
        });
        
        setCompromissosHoje(compromissosDeHoje.length);
      }
    } catch (error) {
      console.error('Erro ao buscar compromissos:', error);
    } finally {
      setLoadingCompromissos(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-ink-soft">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const firstName = session.user.name?.split(' ')[0] || 'Usuário';

  // Função para ir para a agenda e abrir modal de novo compromisso
  const handleNovoCompromisso = () => {
    router.push('/dashboard/agenda?novo=true');
  };

  // Função para ir para a agenda
  const handleIrParaAgenda = () => {
    router.push('/dashboard/agenda');
  };

  // Função para ir para o financeiro e abrir modal de nova transação
  const handleNovaTransacao = () => {
    router.push('/dashboard/financeiro?nova=true');
  };

  // Função para ir para estudos e abrir modal de novo curso
  const handleNovoCurso = () => {
    router.push('/dashboard/estudos?novo=true');
  };

  // Função para ir para o financeiro
  const handleIrParaFinanceiro = () => {
    router.push('/dashboard/financeiro');
  };

  // Função para ir para estudos
  const handleIrParaEstudos = () => {
    router.push('/dashboard/estudos');
  };

  // Função para ir para biblioteca
  const handleIrParaBiblioteca = () => {
    router.push('/dashboard/biblioteca');
  };

  const fetchResumoFinanceiro = async () => {
    try {
      const response = await fetch('/api/v1/financeiro/dashboard');
      if (response.ok) {
        const data = await response.json();
        setSaldoMes(Number(data.data?.resumoMensal?.saldo) || 0);
        setTransacoesMes(Number(data.data?.estatisticas?.totalTransacoesMes) || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
    } finally {
      setLoadingFinanceiro(false);
    }
  };

  // Função para ir para metas
  const handleIrParaMetas = () => {
    router.push('/dashboard/metas');
  };

  const handleCardKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    navigate: () => void
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 lg:p-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
          {t('greeting', { name: firstName })}
        </h1>
        <p className="text-sm sm:text-base text-ink-soft">
          {t('daySummary')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 - Compromissos Hoje */}
        <Card
          className="cursor-pointer hover:border-brand/50 transition-all duration-150"
          onClick={handleIrParaAgenda}
          onKeyDown={(event) => handleCardKeyDown(event, handleIrParaAgenda)}
          role="link"
          tabIndex={0}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-soft">
              {t('appointmentsToday')}
            </CardTitle>
            <Calendar className="w-4 h-4 text-brand" />
          </CardHeader>
          <CardContent>
            {loadingCompromissos ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand"></div>
                <span className="text-sm text-ink-soft">{tCommon('loading')}</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-ink">{compromissosHoje}</div>
                <p className="text-xs text-ink-faint mt-1">
                  {compromissosHoje === 0
                    ? t('noAppointments')
                    : compromissosHoje === 1
                    ? t('oneAppointment')
                    : t('manyAppointments', { count: compromissosHoje })
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 2 - Saldo Mensal */}
        <Card
          className="cursor-pointer hover:border-brand/50 transition-all duration-150"
          onClick={handleIrParaFinanceiro}
          onKeyDown={(event) => handleCardKeyDown(event, handleIrParaFinanceiro)}
          role="link"
          tabIndex={0}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-soft">
              {t('monthlyBalance')}
            </CardTitle>
            <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            {loadingFinanceiro ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand" />
            ) : (
              <div className={`text-2xl font-bold ${saldoMes < 0 ? 'text-red-600 dark:text-red-400' : 'text-ink'}`}>
                {formatarMoeda(saldoMes)}
              </div>
            )}
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <TrendUp className="w-3 h-3" />
              {transacoesMes === 0 ? t('configureFinances') : t('monthlyBalanceDescription')}
            </p>
          </CardContent>
        </Card>

        {/* Card 3 - Cursos Ativos */}
        <Card
          className="cursor-pointer hover:border-brand/50 transition-all duration-150"
          onClick={handleIrParaEstudos}
          onKeyDown={(event) => handleCardKeyDown(event, handleIrParaEstudos)}
          role="link"
          tabIndex={0}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-soft">
              {t('activeCourses')}
            </CardTitle>
            <BookOpen className="w-4 h-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ink">0</div>
            <p className="text-xs text-ink-faint mt-1">
              {t('startStudies')}
            </p>
          </CardContent>
        </Card>

        {/* Card 4 - Metas do Mês */}
        <Card
          className="cursor-pointer hover:border-brand/50 transition-all duration-150"
          onClick={handleIrParaMetas}
          onKeyDown={(event) => handleCardKeyDown(event, handleIrParaMetas)}
          role="link"
          tabIndex={0}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-soft">
              {t('monthlyGoals')}
            </CardTitle>
            <Target className="w-4 h-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ink">0/0</div>
            <p className="text-xs text-ink-faint mt-1">
              {t('defineGoals')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Atividades Recentes */}
        <AtividadesRecentes />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-ink text-lg sm:text-xl">{t('quickActions')}</CardTitle>
            <CardDescription className="text-ink-soft text-sm">
              {t('accessQuickly')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {/* Botão Novo Compromisso - FUNCIONAL */}
            <Button
              onClick={handleNovoCompromisso}
              className="w-full justify-start h-auto py-3 bg-brand hover:bg-brand-dark text-white border-0 transition-all duration-150 text-sm sm:text-base"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t('newAppointment')}
            </Button>

            {/* Nova Transação - FUNCIONAL */}
            <Button
              onClick={handleNovaTransacao}
              className="w-full justify-start h-auto py-3 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 hover:border-green-300 dark:hover:border-green-500/50 transition-all duration-150 text-sm sm:text-base"
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t('newTransaction')}
            </Button>

            {/* Adicionar Curso - FUNCIONAL */}
            <Button
              onClick={handleNovoCurso}
              className="w-full justify-start h-auto py-3 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all duration-150 text-sm sm:text-base"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t('addCourse')}
            </Button>
            <Button
              disabled
              className="w-full justify-start h-auto py-3 bg-blue-soft hover:bg-blue-soft text-brand-blue border border-[#D5E2EC] dark:border-brand-blue/30 cursor-not-allowed text-sm sm:text-base"
            >
              <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t('createGoal')}
              <Badge variant="secondary" className="ml-auto text-xs">{tCommon('premium')}</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Módulos Disponíveis */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-ink mb-3 sm:mb-4">{t('yourModules')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Agenda */}
          <Card
            onClick={handleIrParaAgenda}
            className="hover:border-brand/40 transition-all duration-150 cursor-pointer group"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-brand" />
                <Badge className="bg-brand-soft text-brand-dark border-0">{tCommon('active')}</Badge>
              </div>
              <CardTitle className="text-ink">{tSidebar('agenda')}</CardTitle>
              <CardDescription className="text-ink-soft">
                {t('organizeAppointments')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-brand hover:bg-brand-dark text-white">
                {t('accessAgenda')}
              </Button>
            </CardContent>
          </Card>

          {/* Financeiro */}
          <Card
            onClick={handleIrParaFinanceiro}
            className="hover:border-brand/40 transition-all duration-150 cursor-pointer group"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-8 h-8 text-green-600 dark:text-green-400" />
                <Badge className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-0">{tCommon('active')}</Badge>
              </div>
              <CardTitle className="text-ink">{tSidebar('financial')}</CardTitle>
              <CardDescription className="text-ink-soft">
                {t('controlFinances')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-brand hover:bg-brand-dark text-white">
                {t('accessFinancial')}
              </Button>
            </CardContent>
          </Card>

          {/* Estudos */}
          <Card
            onClick={handleIrParaEstudos}
            className="hover:border-brand/40 transition-all duration-150 cursor-pointer group"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-gold" />
                <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0">{tCommon('active')}</Badge>
              </div>
              <CardTitle className="text-ink">{tSidebar('studies')}</CardTitle>
              <CardDescription className="text-ink-soft">
                {t('manageCourses')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-brand hover:bg-brand-dark text-white">
                {t('accessStudies')}
              </Button>
            </CardContent>
          </Card>

          {/* Biblioteca */}
          <Card
            onClick={handleIrParaBiblioteca}
            className="hover:border-brand/40 transition-all duration-150 cursor-pointer group"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Books className="w-8 h-8 text-brand-blue" />
                <Badge className="bg-blue-soft text-brand-blue border-0">{tCommon('active')}</Badge>
              </div>
              <CardTitle className="text-ink">{tSidebar('library')}</CardTitle>
              <CardDescription className="text-ink-soft">
                {t('organizeBooks')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-brand hover:bg-brand-dark text-white">
                {t('accessLibrary')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Banner - Only show for free plan */}
      {ehFree && (
        <Card className="bg-brand-soft border-brand/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-ink mb-1 sm:mb-2">
                  {t('unlockPotential')}
                </h3>
                <p className="text-ink-soft text-xs sm:text-sm">
                  {t('accessPremiumFeatures')}
                </p>
              </div>
              <Button
                onClick={() => router.push('/premium')}
                className="w-full md:w-auto bg-brand hover:bg-brand-dark text-white text-sm sm:text-base h-auto py-2.5 sm:py-2"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('upgradeToPremium')}</span>
                <span className="sm:hidden">{t('upgradePremium')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
