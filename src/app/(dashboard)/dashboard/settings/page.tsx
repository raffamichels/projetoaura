'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User,
  Bell,
  Shield,
  Palette,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Lock,
  Mail,
  Eye,
  Database,
  Download,
  Trash2,
  Save,
  Crown,
  Globe,
  Smartphone,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type SettingsTab = 'conta' | 'aparencia' | 'notificacoes' | 'privacidade';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('conta');
  const [isSaving, setIsSaving] = useState(false);

  // Estados para configurações
  const [tema, setTema] = useState<'light' | 'dark' | 'system'>('dark');
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [notificacoesPush, setNotificacoesPush] = useState(true);
  const [notificacoesAgenda, setNotificacoesAgenda] = useState(true);
  const [notificacoesFinanceiro, setNotificacoesFinanceiro] = useState(false);
  const [perfilPublico, setPerfilPublico] = useState(false);
  const [compartilharDados, setCompartilharDados] = useState(false);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Configurações salvas com sucesso!');
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-gray-400">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)} className="space-y-6">
        <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 grid grid-cols-2 lg:grid-cols-4 gap-1">
          <TabsTrigger
            value="conta"
            className="data-[state=active]:bg-aura-500 data-[state=active]:text-white flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Conta</span>
          </TabsTrigger>
          <TabsTrigger
            value="aparencia"
            className="data-[state=active]:bg-aura-500 data-[state=active]:text-white flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger
            value="notificacoes"
            className="data-[state=active]:bg-aura-500 data-[state=active]:text-white flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger
            value="privacidade"
            className="data-[state=active]:bg-aura-500 data-[state=active]:text-white flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Privacidade</span>
          </TabsTrigger>
        </TabsList>

        {/* Conta */}
        <TabsContent value="conta" className="space-y-6">
          {/* Informações do Perfil */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-aura-400" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar e Nome */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-aura-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-aura-500 to-blue-500 text-white text-2xl font-bold">
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{session?.user?.name}</h3>
                  <p className="text-sm text-gray-400">{session?.user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 border-yellow-500/20">
                      Plano {session?.user?.plano}
                    </Badge>
                  </div>
                </div>
                <Button variant="default" className="border-zinc-700 hover:border-aura-500 hover:text-aura-400">
                  Alterar Foto
                </Button>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Campos de Edição */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
                  <Input
                    id="name"
                    defaultValue={session?.user?.name || ''}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={session?.user?.email || ''}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+55 (11) 99999-9999"
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-aura-500 hover:bg-aura-600 w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-400" />
                Segurança
              </CardTitle>
              <CardDescription>
                Proteja sua conta com senha forte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="default" className="w-full justify-between border-zinc-700 hover:border-red-500 hover:text-red-400">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Alterar Senha
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="default" className="w-full justify-between border-zinc-700 hover:border-aura-500 hover:text-aura-400">
                <span className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Autenticação em Dois Fatores
                </span>
                <Badge variant="secondary" className="bg-zinc-800">Em breve</Badge>
              </Button>
            </CardContent>
          </Card>

          {/* Plano */}
          <Card className="bg-gradient-to-br from-aura-500/10 via-blue-500/10 to-purple-500/10 border-aura-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Seu Plano
              </CardTitle>
              <CardDescription>
                Você está no plano {session?.user?.plano}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-gradient-to-r from-aura-500 to-blue-500 hover:from-aura-600 hover:to-blue-600 w-full sm:w-auto">
                <Crown className="w-4 h-4 mr-2" />
                Fazer Upgrade para Premium
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="aparencia" className="space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-aura-400" />
                Tema
              </CardTitle>
              <CardDescription>
                Escolha como o Aura deve aparecer para você
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tema Claro */}
                <button
                  onClick={() => setTema('light')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tema === 'light'
                      ? 'border-aura-500 bg-aura-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-white rounded-full">
                      <Sun className="w-6 h-6 text-gray-900" />
                    </div>
                    <span className="text-white font-medium">Claro</span>
                  </div>
                </button>

                {/* Tema Escuro */}
                <button
                  onClick={() => setTema('dark')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tema === 'dark'
                      ? 'border-aura-500 bg-aura-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-zinc-800 rounded-full">
                      <Moon className="w-6 h-6 text-aura-400" />
                    </div>
                    <span className="text-white font-medium">Escuro</span>
                  </div>
                </button>

                {/* Tema Sistema */}
                <button
                  onClick={() => setTema('system')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tema === 'system'
                      ? 'border-aura-500 bg-aura-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-zinc-800 to-white rounded-full">
                      <Monitor className="w-6 h-6 text-gray-600" />
                    </div>
                    <span className="text-white font-medium">Sistema</span>
                  </div>
                </button>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-aura-500 hover:bg-aura-600 w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
            </CardContent>
          </Card>

          {/* Personalização */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Personalização
              </CardTitle>
              <CardDescription>
                Customize sua experiência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode" className="text-white">Modo Compacto</Label>
                  <p className="text-sm text-gray-400">Reduz o espaçamento entre elementos</p>
                </div>
                <Switch id="compact-mode" />
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations" className="text-white">Animações</Label>
                  <p className="text-sm text-gray-400">Ativar animações e transições</p>
                </div>
                <Switch id="animations" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-aura-400" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Controle como e quando você recebe notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <Label className="text-white font-semibold">Notificações por Email</Label>
                    </div>
                    <p className="text-sm text-gray-400">Receba atualizações importantes por email</p>
                  </div>
                  <Switch
                    checked={notificacoesEmail}
                    onCheckedChange={setNotificacoesEmail}
                  />
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Push */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-aura-400" />
                      <Label className="text-white font-semibold">Notificações Push</Label>
                    </div>
                    <p className="text-sm text-gray-400">Receba notificações no navegador</p>
                  </div>
                  <Switch
                    checked={notificacoesPush}
                    onCheckedChange={setNotificacoesPush}
                  />
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Por Módulo */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold">Notificações por Módulo</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notif-agenda" className="text-white">Agenda</Label>
                    <p className="text-sm text-gray-400">Lembretes de compromissos</p>
                  </div>
                  <Switch
                    id="notif-agenda"
                    checked={notificacoesAgenda}
                    onCheckedChange={setNotificacoesAgenda}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notif-financeiro" className="text-white">Financeiro</Label>
                    <p className="text-sm text-gray-400">Alertas de transações e vencimentos</p>
                  </div>
                  <Switch
                    id="notif-financeiro"
                    checked={notificacoesFinanceiro}
                    onCheckedChange={setNotificacoesFinanceiro}
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-aura-500 hover:bg-aura-600 w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacidade */}
        <TabsContent value="privacidade" className="space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Privacidade e Dados
              </CardTitle>
              <CardDescription>
                Controle suas informações e privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <Label className="text-white font-semibold">Perfil Público</Label>
                  </div>
                  <p className="text-sm text-gray-400">Permitir que outros vejam seu perfil</p>
                </div>
                <Switch
                  checked={perfilPublico}
                  onCheckedChange={setPerfilPublico}
                />
              </div>

              <Separator className="bg-zinc-800" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <Label className="text-white font-semibold">Compartilhar Dados de Uso</Label>
                  </div>
                  <p className="text-sm text-gray-400">Ajude a melhorar o Aura compartilhando dados anônimos</p>
                </div>
                <Switch
                  checked={compartilharDados}
                  onCheckedChange={setCompartilharDados}
                />
              </div>

              <Separator className="bg-zinc-800" />

              {/* Ações de Dados */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold">Seus Dados</h4>

                <Button
                  variant="default"
                  className="w-full justify-between border-zinc-700 hover:border-blue-500 hover:text-blue-400"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar Dados
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="default"
                  className="w-full justify-between border-zinc-700 hover:border-red-500 hover:text-red-400"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Excluir Conta
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-aura-500 hover:bg-aura-600 w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
