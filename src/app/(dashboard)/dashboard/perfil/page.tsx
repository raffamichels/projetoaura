'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { User, Crown, CheckCircle, Calendar, Pulse, TrendUp, Book, Target, Flame, Lightning, Star, Trophy, Sparkle, BookOpen, CurrencyDollar, ChartBar, Clock, Check, Gear, Medal, PencilSimple } from '@phosphor-icons/react';
import type { IconProps } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';

// --- Types ---
type ProfileTab = 'overview' | 'stats' | 'achievements';

interface NavItem {
  id: ProfileTab;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface Stats {
  compromissosTotal: number;
  cursosAtivos: number;
  metasAlcancadas: number;
  diasConsecutivos: number;
  transacoesTotal: number;
  midiasLidas: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<IconProps>;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  total?: number;
}

// --- Constants ---
const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: User, description: 'Informações do perfil' },
  { id: 'stats', label: 'Estatísticas', icon: ChartBar, description: 'Seu progresso no Aura' },
  { id: 'achievements', label: 'Conquistas', icon: Medal, description: 'Suas conquistas desbloqueadas' },
];

// --- Sub-components (Outside of render) ---
const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-ink tracking-tight">{title}</h2>
    <p className="text-sm text-ink-soft mt-1">{description}</p>
    <Separator className="mt-4 bg-line" />
  </div>
);

const SettingsCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-surface border border-line rounded-xl p-6 shadow-sm", className)}>
    {children}
  </div>
);

export default function PerfilPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    compromissosTotal: 0,
    cursosAtivos: 0,
    metasAlcancadas: 0,
    diasConsecutivos: 0,
    transacoesTotal: 0,
    midiasLidas: 0,
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-commitment',
      title: 'Primeiro Passo',
      description: 'Criou seu primeiro compromisso',
      icon: Calendar,
      unlocked: false,
    },
    {
      id: 'week-streak',
      title: 'Constante',
      description: '7 dias consecutivos de uso',
      icon: Flame,
      unlocked: false,
    },
    {
      id: 'course-master',
      title: 'Estudioso',
      description: 'Completou 3 cursos',
      icon: BookOpen,
      unlocked: false,
      progress: 0,
      total: 3,
    },
    {
      id: 'financial-organized',
      title: 'Organizado',
      description: 'Registrou 50 transações',
      icon: CurrencyDollar,
      unlocked: false,
      progress: 0,
      total: 50,
    },
    {
      id: 'goal-achiever',
      title: 'Realizador',
      description: 'Alcançou 5 objetivos financeiros',
      icon: Target,
      unlocked: false,
      progress: 0,
      total: 5,
    },
    {
      id: 'reading-enthusiast',
      title: 'Leitor Ávido',
      description: 'Concluiu 10 leituras',
      icon: Book,
      unlocked: false,
      progress: 0,
      total: 10,
    },
  ]);

  const updateAchievements = useCallback((currentStats: Stats) => {
    setAchievements(prev =>
      prev.map(achievement => {
        switch (achievement.id) {
          case 'first-commitment':
            return {
              ...achievement,
              unlocked: currentStats.compromissosTotal > 0,
              unlockedAt: currentStats.compromissosTotal > 0 ? new Date() : undefined,
            };
          case 'week-streak':
            return {
              ...achievement,
              unlocked: currentStats.diasConsecutivos >= 7,
              unlockedAt: currentStats.diasConsecutivos >= 7 ? new Date() : undefined,
            };
          case 'course-master':
            return {
              ...achievement,
              progress: currentStats.cursosAtivos,
              unlocked: currentStats.cursosAtivos >= 3,
              unlockedAt: currentStats.cursosAtivos >= 3 ? new Date() : undefined,
            };
          case 'financial-organized':
            return {
              ...achievement,
              progress: currentStats.transacoesTotal,
              unlocked: currentStats.transacoesTotal >= 50,
              unlockedAt: currentStats.transacoesTotal >= 50 ? new Date() : undefined,
            };
          case 'reading-enthusiast':
            return {
              ...achievement,
              progress: currentStats.midiasLidas,
              unlocked: currentStats.midiasLidas >= 10,
              unlockedAt: currentStats.midiasLidas >= 10 ? new Date() : undefined,
            };
          default:
            return achievement;
        }
      })
    );
  }, []);

  const carregarEstatisticas = useCallback(async () => {
    try {
      const compromissosRes = await fetch('/api/v1/agenda/compromissos');
      let totalCompromissos = 0;
      if (compromissosRes.ok) {
        const data = await compromissosRes.json();
        totalCompromissos = data.data?.length || 0;
      }

      const cursosRes = await fetch('/api/v1/estudos/cursos');
      let cursosAtivos = 0;
      if (cursosRes.ok) {
        const data = await cursosRes.json();
        cursosAtivos = data.data?.filter((c: { ativo: boolean }) => c.ativo).length || 0;
      }

      const transacoesRes = await fetch('/api/v1/financeiro/transacoes');
      let totalTransacoes = 0;
      if (transacoesRes.ok) {
        const data = await transacoesRes.json();
        totalTransacoes = data.data?.length || 0;
      }

      const midiasRes = await fetch('/api/v1/biblioteca/midias');
      let midiasLidas = 0;
      if (midiasRes.ok) {
        const data = await midiasRes.json();
        midiasLidas = data.data?.filter((m: { status: string }) => m.status === 'CONCLUIDO').length || 0;
      }

      const newStats = {
        compromissosTotal: totalCompromissos,
        cursosAtivos: cursosAtivos,
        metasAlcancadas: 0,
        diasConsecutivos: 7,
        transacoesTotal: totalTransacoes,
        midiasLidas: midiasLidas,
      };

      setStats(newStats);
      updateAchievements(newStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [updateAchievements]);

  useEffect(() => {
    if (session?.user) {
      carregarEstatisticas();
    }
    setLoading(false);
  }, [session, carregarEstatisticas]);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDaysUntilExpiration = () => {
    if (!session?.user?.planoExpiraEm) return null;
    const expiration = new Date(session.user.planoExpiraEm);
    const today = new Date();
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-ink-soft">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const completionPercentage = Math.round((unlockedAchievements.length / achievements.length) * 100);

  return (
    <div className="min-h-screen text-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Meu Perfil</h1>
          <p className="text-ink-soft mt-2 text-lg">
            Visualize suas informações, estatísticas e conquistas.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-none">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap lg:whitespace-normal text-left",
                      isActive
                        ? "bg-brand-soft text-brand-dark font-semibold"
                        : "text-ink-soft hover:text-ink hover:bg-surface-hover"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-brand-dark" : "text-ink-faint")} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Link para Configurações */}
              <Separator className="my-2 bg-line hidden lg:block" />
              <button
                onClick={() => router.push('/dashboard/settings?from=profile')}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap lg:whitespace-normal text-left text-ink-soft hover:text-ink hover:bg-surface-hover"
              >
                <Gear className="w-4 h-4 shrink-0 text-ink-faint" />
                <span>Configurações</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 space-y-8">

            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Informações do Perfil" description="Seus dados pessoais e foto de perfil." />

                {/* Profile Card - View Only */}
                <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-surface shadow-sm ring-2 ring-brand/20">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback className="bg-brand text-white text-2xl font-bold">
                      {getInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-semibold text-ink">{session?.user?.name}</h3>
                      <Badge variant="outline" className="border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 gap-1 px-2 py-0.5">
                        <Crown className="w-3 h-3" />
                        {session?.user?.plano || 'Free'}
                      </Badge>
                      {session?.user?.emailVerified && (
                        <Badge variant="outline" className="border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 gap-1 px-2 py-0.5">
                          <CheckCircle className="w-3 h-3" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <p className="text-ink-soft">{session?.user?.email}</p>
                    <p className="text-sm text-ink-faint flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Membro desde {new Date(session?.user?.createdAt || Date.now()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                    <div className="pt-3">
                      <Button
                        size="sm"
                        onClick={() => router.push('/dashboard/settings?from=profile')}
                        className="border border-line-strong bg-surface hover:bg-surface-hover text-ink"
                      >
                        <PencilSimple className="w-4 h-4 mr-2" />
                        Editar Perfil
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Plano Premium Info */}
                {session?.user?.plano === 'PREMIUM' ? (
                  <>
                    <SectionHeader title="Assinatura" description="Informações sobre seu plano atual." />
                    <Card className="bg-navy border-navy text-white">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                          <Crown className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Plano Premium</h3>
                          <p className="text-sm text-white/70">Você tem acesso a todos os recursos</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-white/10 rounded-lg flex items-center justify-between">
                          <span className="text-sm text-white/70">Status</span>
                          <Badge className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30">Ativo</Badge>
                        </div>
                        {getDaysUntilExpiration() && (
                          <div className="p-3 bg-white/10 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-white/70">Renova em</span>
                            <span className="text-sm text-white font-medium">{getDaysUntilExpiration()} dias</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </>
                ) : (
                  <>
                    <SectionHeader title="Upgrade" description="Aproveite todos os recursos do Aura." />
                    <Card className="bg-navy border-navy text-white">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="p-4 bg-white/10 rounded-2xl">
                          <Sparkle className="w-10 h-10 text-gold" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-lg font-semibold text-white mb-1">Desbloqueie o Aura Premium</h3>
                          <p className="text-sm text-white/70 mb-4">Acesse recursos exclusivos, conquistas especiais e muito mais.</p>
                          <Button
                            onClick={() => router.push('/premium')}
                            className="bg-brand hover:bg-brand-dark border-0 text-white font-semibold transition-colors duration-150"
                          >
                            <Sparkle className="w-4 h-4 mr-2" />
                            Fazer Upgrade
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            )}

            {/* --- STATS TAB --- */}
            {activeTab === 'stats' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Suas Estatísticas" description="Acompanhe seu progresso no Aura." />

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-surface border border-line hover:border-line-strong rounded-xl p-4 shadow-sm transition-all duration-150 group">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors duration-150">
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <TrendUp className="w-4 h-4 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-ink">{stats.compromissosTotal}</p>
                        <p className="text-xs text-ink-faint">Compromissos</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface border border-line hover:border-line-strong rounded-xl p-4 shadow-sm transition-all duration-150 group">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-brand-soft rounded-lg group-hover:bg-brand-soft transition-colors duration-150">
                          <BookOpen className="w-5 h-5 text-brand-dark" />
                        </div>
                        <Pulse className="w-4 h-4 text-brand/50" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-ink">{stats.cursosAtivos}</p>
                        <p className="text-xs text-ink-faint">Cursos Ativos</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface border border-line hover:border-line-strong rounded-xl p-4 shadow-sm transition-all duration-150 group">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-500/20 transition-colors duration-150">
                          <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <Check className="w-4 h-4 text-green-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-ink">{stats.metasAlcancadas}</p>
                        <p className="text-xs text-ink-faint">Metas</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface border border-line hover:border-line-strong rounded-xl p-4 shadow-sm transition-all duration-150 group">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors duration-150">
                          <Flame className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                        </div>
                        <Lightning className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-ink">{stats.diasConsecutivos}</p>
                        <p className="text-xs text-ink-faint">Dias Seguidos</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface border border-line hover:border-line-strong rounded-xl p-4 shadow-sm transition-all duration-150 group">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20 transition-colors duration-150">
                          <CurrencyDollar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <ChartBar className="w-4 h-4 text-cyan-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-ink">{stats.transacoesTotal}</p>
                        <p className="text-xs text-ink-faint">Transações</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface border border-line hover:border-line-strong rounded-xl p-4 shadow-sm transition-all duration-150 group">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors duration-150">
                          <Book className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <Star className="w-4 h-4 text-rose-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-ink">{stats.midiasLidas}</p>
                        <p className="text-xs text-ink-faint">Leituras</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumo de Conquistas */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-soft rounded-lg">
                        <Trophy className="w-5 h-5 text-brand-dark" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-ink">Progresso de Conquistas</h3>
                        <p className="text-sm text-ink-soft">{unlockedAchievements.length} de {achievements.length} desbloqueadas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-ink">{completionPercentage}%</p>
                    </div>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </Card>
              </div>
            )}

            {/* --- ACHIEVEMENTS TAB --- */}
            {activeTab === 'achievements' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Conquistas" description="Suas medalhas e realizações no Aura." />

                {/* Progress Overview */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                        <Trophy className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-ink">Seu Progresso</h3>
                        <p className="text-sm text-ink-soft">{unlockedAchievements.length} conquistas desbloqueadas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-ink">{completionPercentage}%</p>
                      <p className="text-xs text-ink-faint">Completo</p>
                    </div>
                  </div>
                  <Progress value={completionPercentage} className="h-3" />
                </Card>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => {
                    const Icon = achievement.icon;
                    const isUnlocked = achievement.unlocked;
                    const hasProgress = achievement.total !== undefined;

                    return (
                      <Card
                        key={achievement.id}
                        className={cn(
                          "transition-all",
                          isUnlocked
                            ? 'bg-brand-soft border-brand/40'
                            : 'opacity-60'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "p-3 rounded-xl",
                              isUnlocked
                                ? 'bg-brand/15 text-brand-dark'
                                : 'bg-surface-hover text-ink-faint'
                            )}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-ink">{achievement.title}</h4>
                              {isUnlocked && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />}
                            </div>
                            <p className="text-sm text-ink-soft mt-1">{achievement.description}</p>
                            {hasProgress && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-ink-faint">
                                    {achievement.progress}/{achievement.total}
                                  </span>
                                  <span className="text-ink-faint">
                                    {Math.round(((achievement.progress || 0) / (achievement.total || 1)) * 100)}%
                                  </span>
                                </div>
                                <Progress
                                  value={((achievement.progress || 0) / (achievement.total || 1)) * 100}
                                  className="h-1.5"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
