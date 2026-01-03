'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Shield,
  Crown,
  CheckCircle2,
  Calendar,
  Activity,
  TrendingUp,
  Award,
  Edit,
  Camera,
  Save,
  X,
} from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  plano: string;
  createdAt: string;
  emailVerified: boolean;
}

interface Stats {
  compromissosTotal: number;
  cursosAtivos: number;
  metasAlcancadas: number;
  diasConsecutivos: number;
}

export default function PerfilPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(false);
  const [stats, setStats] = useState<Stats>({
    compromissosTotal: 0,
    cursosAtivos: 0,
    metasAlcancadas: 0,
    diasConsecutivos: 0,
  });

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

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
      });
      carregarEstatisticas();
    }
    setLoading(false);
  }, [session]);

  const carregarEstatisticas = async () => {
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
        cursosAtivos = data.data?.filter((c: any) => c.ativo).length || 0;
      }

      setStats({
        compromissosTotal: totalCompromissos,
        cursosAtivos: cursosAtivos,
        metasAlcancadas: 0, // TODO: implementar quando tiver módulo de metas
        diasConsecutivos: 7, // TODO: calcular dias consecutivos de uso
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSalvarPerfil = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/v1/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await update({ name: formData.name });
        setEditando(false);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/v1/perfil/senha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senhaAtual: senhaData.senhaAtual,
          novaSenha: senhaData.novaSenha,
        }),
      });

      if (response.ok) {
        setSenhaData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
        alert('Senha alterada com sucesso!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com Avatar */}
      <div className="relative">
        {/* Banner de fundo */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-aura-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>

        {/* Avatar e Info */}
        <div className="relative px-4 sm:px-6 -mt-12 sm:-mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-zinc-900 shadow-2xl">
                <AvatarFallback className="bg-gradient-to-br from-aura-500 to-blue-500 text-white text-3xl sm:text-4xl font-bold">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-2 bg-aura-500 rounded-full hover:bg-aura-600 transition-colors shadow-lg">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Nome e Info */}
            <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {session?.user?.name}
                </h1>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Plano {session?.user?.plano}
                </Badge>
                {session?.user?.emailVerified && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-400">{session?.user?.email}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Membro desde {new Date(session?.user?.createdAt || Date.now()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Botão Upgrade */}
            <div className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-aura-500 to-blue-500 hover:from-aura-600 hover:to-blue-600 shadow-lg shadow-aura-500/25 h-auto py-2.5 sm:py-3">
                <Crown className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-aura-500/30 transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-xl">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Compromissos</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.compromissosTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-purple-500/30 transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-purple-500/10 rounded-xl">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Cursos Ativos</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.cursosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-green-500/30 transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-500/10 rounded-xl">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Metas</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.metasAlcancadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-orange-500/30 transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-orange-500/10 rounded-xl">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Sequência</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.diasConsecutivos} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Configurações */}
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-zinc-900/50 border border-zinc-800 h-auto p-1">
          <TabsTrigger value="perfil" className="data-[state=active]:bg-aura-500/20 data-[state=active]:text-aura-400 text-xs sm:text-sm py-2 sm:py-2.5">
            <User className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="data-[state=active]:bg-aura-500/20 data-[state=active]:text-aura-400 text-xs sm:text-sm py-2 sm:py-2.5">
            <Shield className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="data-[state=active]:bg-aura-500/20 data-[state=active]:text-aura-400 text-xs sm:text-sm py-2 sm:py-2.5">
            <Bell className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="data-[state=active]:bg-aura-500/20 data-[state=active]:text-aura-400 text-xs sm:text-sm py-2 sm:py-2.5">
            <Palette className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Aparência</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Perfil */}
        <TabsContent value="perfil" className="space-y-4 sm:space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl text-white">Informações Pessoais</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Atualize suas informações de perfil
                  </CardDescription>
                </div>
                {!editando ? (
                  <Button
                    variant="outline"
                    onClick={() => setEditando(true)}
                    className="border-zinc-700 hover:bg-zinc-800 h-auto py-2 text-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditando(false);
                        setFormData({
                          name: session?.user?.name || '',
                          email: session?.user?.email || '',
                        });
                      }}
                      className="border-zinc-700 hover:bg-zinc-800 h-auto py-2 text-sm"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSalvarPerfil}
                      disabled={saving}
                      className="bg-aura-500 hover:bg-aura-600 h-auto py-2 text-sm"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Salvar
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
        </TabsContent>

        {/* Tab Segurança */}
        <TabsContent value="seguranca" className="space-y-4 sm:space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-white">Alterar Senha</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
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
                className="bg-aura-500 hover:bg-aura-600 w-full sm:w-auto h-auto py-2.5"
              >
                <Lock className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-white">Autenticação de Dois Fatores</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Adicione uma camada extra de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">2FA não configurado</p>
                  <p className="text-xs text-gray-400 mt-1">Proteja sua conta com autenticação de dois fatores</p>
                </div>
                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800" disabled>
                  Em breve
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Notificações */}
        <TabsContent value="notificacoes" className="space-y-4 sm:space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-white">Preferências de Notificação</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Escolha como você quer ser notificado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
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

                <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
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

                <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
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
        <TabsContent value="aparencia" className="space-y-4 sm:space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-white">Personalização</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Customize a aparência do seu Aura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <p className="text-sm font-medium text-white mb-3">Tema</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button className="p-4 bg-gradient-to-br from-zinc-900 to-black border-2 border-aura-500 rounded-lg">
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
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                    <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-white shadow-lg"></button>
                    <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-zinc-700 opacity-50"></button>
                    <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-zinc-700 opacity-50"></button>
                    <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-orange-500 to-red-500 border-2 border-zinc-700 opacity-50"></button>
                    <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 border-2 border-zinc-700 opacity-50"></button>
                    <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 border-2 border-zinc-700 opacity-50"></button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Outras cores disponíveis no plano Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Zona de Perigo */}
      <Card className="bg-red-500/5 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-red-400">Zona de Perigo</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-red-400/70">
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
  );
}
