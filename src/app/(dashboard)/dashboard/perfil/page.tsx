'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  Crown,
  CheckCircle2,
  Calendar,
  Activity,
  TrendingUp,
  Edit,
  Camera,
  Save,
  X,
  Loader2,
  Trash2,
  Book,
  Target,
  Flame,
  Zap,
  Star,
  Trophy,
  Sparkles,
  BookOpen,
  DollarSign,
  BarChart3,
  Clock,
  Check,
  LucideIcon,
} from 'lucide-react';

// Interface ProfileData removida pois não estava sendo usada

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
  icon: LucideIcon; // CORREÇÃO: Tipo específico em vez de any
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  total?: number;
}

export default function PerfilPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
      icon: DollarSign,
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [senhaData, setSenhaData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const [notificacoes, setNotificacoes] = useState({
    emailCompromissos: true,
    emailMetas: true,
    emailFinanceiro: false,
    pushCompromissos: true,
    pushMetas: false,
  });

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

  // CORREÇÃO: Envolvido em useCallback para resolver warning do useEffect
  const carregarEstatisticas = useCallback(async () => {
    try {
      // Buscar compromissos
      const compromissosRes = await fetch('/api/v1/agenda/compromissos');
      let totalCompromissos = 0;
      if (compromissosRes.ok) {
        const data = await compromissosRes.json();
        totalCompromissos = data.data?.length || 0;
      }

      // Buscar cursos
      const cursosRes = await fetch('/api/v1/estudos/cursos');
      let cursosAtivos = 0;
      if (cursosRes.ok) {
        const data = await cursosRes.json();
        // CORREÇÃO: Tipagem explícita para evitar 'any'
        cursosAtivos = data.data?.filter((c: { ativo: boolean }) => c.ativo).length || 0;
      }

      // Buscar transações
      const transacoesRes = await fetch('/api/v1/financeiro/transacoes');
      let totalTransacoes = 0;
      if (transacoesRes.ok) {
        const data = await transacoesRes.json();
        totalTransacoes = data.data?.length || 0;
      }

      // Buscar mídias
      const midiasRes = await fetch('/api/v1/biblioteca/midias');
      let midiasLidas = 0;
      if (midiasRes.ok) {
        const data = await midiasRes.json();
        // CORREÇÃO: Tipagem explícita para evitar 'any'
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

      // Atualizar conquistas
      updateAchievements(newStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [updateAchievements]);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
      });
      carregarEstatisticas();
    }
    setLoading(false);
  }, [session, carregarEstatisticas]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const loadingToast = toast.loading('Enviando foto...');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/v1/perfil/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        await update({ image: data.data.image });
        toast.success('Foto de perfil atualizada!', { id: loadingToast });
      } else {
        toast.error(data.error || 'Erro ao enviar foto', { id: loadingToast });
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar foto. Tente novamente.', { id: loadingToast });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoverAvatar = async () => {
    setUploadingAvatar(true);
    const loadingToast = toast.loading('Removendo foto...');

    try {
      const response = await fetch('/api/v1/perfil/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        await update({ image: null });
        toast.success('Foto removida!', { id: loadingToast });
      } else {
        toast.error(data.error || 'Erro ao remover foto', { id: loadingToast });
      }
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      toast.error('Erro ao remover foto. Tente novamente.', { id: loadingToast });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSalvarPerfil = async () => {
    setSaving(true);
    const loadingToast = toast.loading('Salvando alterações...');

    try {
      const response = await fetch('/api/v1/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await update({ name: formData.name });
        setEditando(false);
        toast.success('Perfil atualizado com sucesso!', { id: loadingToast });
      } else {
        toast.error(data.error || 'Erro ao salvar perfil', { id: loadingToast });
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil. Tente novamente.', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (senhaData.novaSenha.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading('Alterando senha...');

    try {
      const response = await fetch('/api/v1/perfil/senha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senhaAtual: senhaData.senhaAtual,
          novaSenha: senhaData.novaSenha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSenhaData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
        toast.success('Senha alterada com sucesso!', { id: loadingToast });
      } else {
        toast.error(data.error || 'Erro ao alterar senha', { id: loadingToast });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha. Tente novamente.', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const completionPercentage = Math.round((unlockedAchievements.length / achievements.length) * 100);

  return (
    <div className="space-y-6 pb-16 p-4 lg:p-6">
      {/* Header Moderno */}
      <div className="relative overflow-hidden">
        {/* Banner com gradiente dinâmico */}
        <div className="h-56 bg-gradient-to-br from-aura-500/30 via-purple-500/20 to-blue-500/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(139,92,246,0.3),rgba(0,0,0,0))]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:72px_72px]"></div>
          {/* Elementos decorativos */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-aura-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Perfil Info */}
        <div className="px-6 -mt-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar com Upload */}
            <div className="relative group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Avatar className="w-32 h-32 border-4 border-zinc-900 shadow-2xl ring-4 ring-aura-500/20">
                {session?.user?.image ? (
                  <AvatarImage src={session.user.image} alt={session?.user?.name || 'Avatar'} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-aura-500 to-blue-500 text-white text-4xl font-bold">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>

              {/* Overlay com botões */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <div className="absolute inset-0 bg-black/60 rounded-full backdrop-blur-sm"></div>
                <Button
                  size="sm"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="relative z-10 h-8 w-8 p-0 rounded-full bg-aura-500 hover:bg-aura-600"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
                {session?.user?.image && (
                  <Button
                    size="sm"
                    onClick={handleRemoverAvatar}
                    disabled={uploadingAvatar}
                    className="relative z-10 h-8 w-8 p-0 rounded-full bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Info do usuário */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {session?.user?.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-lg shadow-orange-500/25">
                    <Crown className="w-3 h-3 mr-1" />
                    {session?.user?.plano}
                  </Badge>
                  {session?.user?.emailVerified && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  <Badge className="bg-aura-500/20 text-aura-400 border-aura-500/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    {unlockedAchievements.length} Conquistas
                  </Badge>
                </div>
              </div>
              <p className="text-gray-400 mb-1">{session?.user?.email}</p>
              <p className="text-sm text-gray-500">
                <Clock className="w-3 h-3 inline mr-1" />
                Membro desde {new Date(session?.user?.createdAt || Date.now()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* CTA Upgrade */}
            {session?.user?.plano === 'FREE' && (
              <Button
                onClick={() => router.push('/premium')}
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 hover:from-yellow-600 hover:via-orange-600 hover:to-pink-600 shadow-xl shadow-orange-500/25 border-0 text-white font-semibold px-6"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade para Premium
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid Moderno */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 px-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all group">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <TrendingUp className="w-4 h-4 text-blue-400/50" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.compromissosTotal}</p>
                <p className="text-xs text-gray-400">Compromissos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all group">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <Activity className="w-4 h-4 text-purple-400/50" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.cursosAtivos}</p>
                <p className="text-xs text-gray-400">Cursos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:border-green-500/40 transition-all group">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <Check className="w-4 h-4 text-green-400/50" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.metasAlcancadas}</p>
                <p className="text-xs text-gray-400">Metas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 hover:border-orange-500/40 transition-all group">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <Zap className="w-4 h-4 text-orange-400/50" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.diasConsecutivos}</p>
                <p className="text-xs text-gray-400">Dias Seguidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40 transition-all group">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                </div>
                <BarChart3 className="w-4 h-4 text-cyan-400/50" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.transacoesTotal}</p>
                <p className="text-xs text-gray-400">Transações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20 hover:border-pink-500/40 transition-all group">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                  <Book className="w-5 h-5 text-pink-400" />
                </div>
                <Star className="w-4 h-4 text-pink-400/50" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.midiasLidas}</p>
                <p className="text-xs text-gray-400">Leituras</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conquistas Section */}
      <div className="px-6">
        <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Conquistas
                </CardTitle>
                <CardDescription className="mt-1">
                  {unlockedAchievements.length} de {achievements.length} desbloqueadas
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
                <p className="text-xs text-gray-400">Completo</p>
              </div>
            </div>
            <Progress value={completionPercentage} className="mt-4 h-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                const isUnlocked = achievement.unlocked;
                const hasProgress = achievement.total !== undefined;

                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-aura-500/20 to-aura-500/5 border-aura-500/40 shadow-lg shadow-aura-500/10'
                        : 'bg-zinc-800/30 border-zinc-700/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-lg ${
                          isUnlocked
                            ? 'bg-aura-500/20 text-aura-400'
                            : 'bg-zinc-700/50 text-zinc-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-white text-sm">
                            {achievement.title}
                          </h4>
                          {isUnlocked && (
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {achievement.description}
                        </p>
                        {hasProgress && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">
                                {achievement.progress}/{achievement.total}
                              </span>
                              <span className="text-gray-500">
                                {/* CORREÇÃO: Previne divisão por undefined ou zero */}
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
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Configurações */}
      <div className="px-6">
        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-zinc-900/50 border border-zinc-800 h-auto p-1">
            <TabsTrigger value="perfil" className="data-[state=active]:bg-aura-500/20 data-[state=active]:text-aura-400 py-3">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="data-[state=active]:bg-aura-500/20 data-[state=active]:text-aura-400 py-3">
              <Shield className="w-4 h-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="data-[state=active]:bg-aura-500/20 data-[state=active]:text-aura-400 py-3">
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="data-[state=active]:bg-aura-500/20 data-[state=active]:text-aura-400 py-3">
              <Palette className="w-4 h-4 mr-2" />
              Aparência
            </TabsTrigger>
          </TabsList>

          {/* Tab Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">Informações Pessoais</CardTitle>
                    <CardDescription>
                      Atualize suas informações de perfil
                    </CardDescription>
                  </div>
                  {!editando ? (
                    <Button
                      variant="default"
                      onClick={() => setEditando(true)}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        onClick={() => {
                          setEditando(false);
                          setFormData({
                            name: session?.user?.name || '',
                            email: session?.user?.email || '',
                          });
                        }}
                        className="border-zinc-700 hover:bg-zinc-800"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSalvarPerfil}
                        disabled={saving}
                        className="bg-aura-500 hover:bg-aura-600 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editando}
                    className="bg-zinc-800/50 border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editando}
                    className="bg-zinc-800/50 border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Plano Info */}
            {session?.user?.plano === 'PREMIUM' && (
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Assinatura Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                      <span className="text-sm text-gray-400">Status</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Ativo
                      </Badge>
                    </div>
                    {getDaysUntilExpiration() && (
                      <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                        <span className="text-sm text-gray-400">Renova em</span>
                        <span className="text-sm text-white font-medium">
                          {getDaysUntilExpiration()} dias
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Alterar Senha</CardTitle>
                <CardDescription>
                  Mantenha sua conta segura com uma senha forte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">Senha Atual</Label>
                  <Input
                    id="senhaAtual"
                    type="password"
                    value={senhaData.senhaAtual}
                    onChange={(e) => setSenhaData({ ...senhaData, senhaAtual: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={senhaData.novaSenha}
                    onChange={(e) => setSenhaData({ ...senhaData, novaSenha: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={senhaData.confirmarSenha}
                    onChange={(e) => setSenhaData({ ...senhaData, confirmarSenha: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <Button
                  onClick={handleAlterarSenha}
                  disabled={saving || !senhaData.senhaAtual || !senhaData.novaSenha}
                  className="bg-aura-500 hover:bg-aura-600 w-full sm:w-auto disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Autenticação de Dois Fatores</CardTitle>
                <CardDescription>
                  Adicione uma camada extra de segurança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">2FA não configurado</p>
                    <p className="text-xs text-gray-400 mt-1">Proteja sua conta com autenticação de dois fatores</p>
                  </div>
                  <Button variant="default" className="border-zinc-700 hover:bg-zinc-800" disabled>
                    Em breve
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Notificações */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Preferências de Notificação</CardTitle>
                <CardDescription>
                  Escolha como você quer ser notificado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">E-mail - Compromissos</p>
                      <p className="text-xs text-gray-400 mt-1">Receba lembretes de compromissos por e-mail</p>
                    </div>
                    <button
                      onClick={() => setNotificacoes({ ...notificacoes, emailCompromissos: !notificacoes.emailCompromissos })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificacoes.emailCompromissos ? 'bg-aura-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificacoes.emailCompromissos ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">E-mail - Metas</p>
                      <p className="text-xs text-gray-400 mt-1">Notificações sobre progresso de metas</p>
                    </div>
                    <button
                      onClick={() => setNotificacoes({ ...notificacoes, emailMetas: !notificacoes.emailMetas })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificacoes.emailMetas ? 'bg-aura-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificacoes.emailMetas ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">E-mail - Financeiro</p>
                      <p className="text-xs text-gray-400 mt-1">Relatórios financeiros mensais</p>
                    </div>
                    <button
                      onClick={() => setNotificacoes({ ...notificacoes, emailFinanceiro: !notificacoes.emailFinanceiro })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificacoes.emailFinanceiro ? 'bg-aura-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificacoes.emailFinanceiro ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Aparência */}
          <TabsContent value="aparencia" className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Personalização</CardTitle>
                <CardDescription>
                  Customize a aparência do seu Aura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <p className="text-sm font-medium text-white mb-3">Tema</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <button className="p-4 bg-gradient-to-br from-zinc-900 to-black border-2 border-aura-500 rounded-lg hover:scale-105 transition-transform">
                        <div className="aspect-square bg-zinc-800 rounded mb-2"></div>
                        <p className="text-xs text-white font-medium">Escuro</p>
                      </button>
                      <button className="p-4 bg-gradient-to-br from-zinc-100 to-white border-2 border-zinc-700 rounded-lg opacity-50 cursor-not-allowed">
                        <div className="aspect-square bg-zinc-200 rounded mb-2"></div>
                        <p className="text-xs text-zinc-800 font-medium">Claro</p>
                        <Badge className="text-[10px] mt-1">Em breve</Badge>
                      </button>
                      <button className="p-4 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-2 border-zinc-700 rounded-lg opacity-50 cursor-not-allowed">
                        <div className="aspect-square bg-gradient-to-br from-zinc-700 to-zinc-900 rounded mb-2"></div>
                        <p className="text-xs text-white font-medium">Auto</p>
                        <Badge className="text-[10px] mt-1">Em breve</Badge>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <p className="text-sm font-medium text-white mb-3">Cor de destaque</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-white shadow-lg hover:scale-110 transition-transform"></button>
                      <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-zinc-700 opacity-50 hover:opacity-75 transition-opacity"></button>
                      <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-zinc-700 opacity-50 hover:opacity-75 transition-opacity"></button>
                      <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-orange-500 to-red-500 border-2 border-zinc-700 opacity-50 hover:opacity-75 transition-opacity"></button>
                      <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 border-2 border-zinc-700 opacity-50 hover:opacity-75 transition-opacity"></button>
                      <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 border-2 border-zinc-700 opacity-50 hover:opacity-75 transition-opacity"></button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Outras cores disponíveis no plano Premium</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Zona de Perigo */}
      <div className="px-6">
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-xl text-red-400">Zona de Perigo</CardTitle>
            <CardDescription className="text-red-400/70">
              Ações irreversíveis que afetam sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Excluir Conta</p>
                <p className="text-xs text-gray-400 mt-1">Excluir permanentemente sua conta e todos os dados</p>
              </div>
              <Button variant="destructive" className="w-full sm:w-auto" disabled>
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}