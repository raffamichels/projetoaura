'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Bell,
  Shield,
  Palette,
  ChevronLeft,
  Moon,
  Sun,
  Monitor,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Download,
  Crown,
  CreditCard,
  Laptop,
  Camera,
  Loader2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PlanoManager } from '@/components/planos/PlanoManager';
import { cn } from '@/lib/utils';

// --- Types ---
type SettingsTab = 'account' | 'appearance' | 'notifications' | 'privacy' | 'billing';

interface NavItem {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
  description: string;
}

// --- Constants ---
const NAV_ITEMS: NavItem[] = [
  { id: 'account', label: 'Minha Conta', icon: User, description: 'Dados pessoais e segurança' },
  { id: 'appearance', label: 'Aparência', icon: Palette, description: 'Temas e preferências visuais' },
  { id: 'notifications', label: 'Notificações', icon: Bell, description: 'Emails e alertas' },
  { id: 'privacy', label: 'Privacidade', icon: Shield, description: 'Dados e visibilidade' },
  { id: 'billing', label: 'Planos e Faturamento', icon: CreditCard, description: 'Gerencie sua assinatura' },
];

// --- Sub-components (Outside of render) ---
const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">{title}</h2>
    <p className="text-sm text-zinc-400 mt-1">{description}</p>
    <Separator className="mt-4 bg-zinc-800" />
  </div>
);

const SettingsCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 shadow-sm", className)}>
    {children}
  </div>
);

const SettingRow = ({
  label,
  desc,
  action
}: {
  label: string;
  desc?: string;
  action: React.ReactNode
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
    <div className="space-y-0.5">
      <label className="text-sm font-medium text-zinc-200 block">{label}</label>
      {desc && <p className="text-xs text-zinc-500 max-w-[400px]">{desc}</p>}
    </div>
    <div className="shrink-0">{action}</div>
  </div>
);

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if came from profile page
  const fromProfile = searchParams.get('from') === 'profile';

  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // States
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    username: 'jdoe',
    phone: '',
  });

  // Helpers
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/v1/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });

      if (response.ok) {
        await update({ name: formData.name });
        toast.success('Alterações salvas com sucesso');
      } else {
        toast.error('Erro ao salvar alterações');
      }
    } catch {
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const loadingToast = toast.loading('Enviando foto...');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      const response = await fetch('/api/v1/perfil/avatar', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (response.ok) {
        await update({ image: data.data.image });
        toast.success('Foto de perfil atualizada!', { id: loadingToast });
      } else {
        toast.error(data.error || 'Erro ao enviar foto', { id: loadingToast });
      }
    } catch {
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
    } catch {
      toast.error('Erro ao remover foto. Tente novamente.', { id: loadingToast });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div className="mb-10">
          {fromProfile && (
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/perfil')}
              className="mb-4 text-zinc-400 hover:text-white hover:bg-zinc-800 -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar ao Perfil
            </Button>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-white">Configurações</h1>
          <p className="text-zinc-400 mt-2 text-lg">
            Gerencie sua conta e preferências do sistema.
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
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap lg:whitespace-normal text-left",
                      isActive
                        ? "bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-aura-400" : "text-zinc-500")} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 space-y-8">

            {/* --- ACCOUNT TAB --- */}
            {activeTab === 'account' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Informações Pessoais" description="Atualize sua foto e detalhes pessoais." />

                {/* Profile Card */}
                <SettingsCard className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative group cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Avatar className="w-24 h-24 border-4 border-zinc-900 shadow-xl">
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
                        {getInitials(session?.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      <div className="absolute inset-0 bg-black/60 rounded-full backdrop-blur-sm"></div>
                      {uploadingAvatar ? (
                        <Loader2 className="w-6 h-6 text-white relative z-10 animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-white relative z-10" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-white">{session?.user?.name}</h3>
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10 gap-1 px-2 py-0.5">
                        <Crown className="w-3 h-3" />
                        {session?.user?.plano || 'Free'}
                      </Badge>
                    </div>
                    <p className="text-zinc-400">{session?.user?.email}</p>
                    <div className="pt-3 flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAvatarClick}
                        disabled={uploadingAvatar}
                        className="border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-300"
                      >
                        {uploadingAvatar ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          'Alterar Foto'
                        )}
                      </Button>
                      {session?.user?.image && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleRemoverAvatar}
                          disabled={uploadingAvatar}
                          className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </SettingsCard>

                {/* Form Fields */}
                <SettingsCard className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullname" className="text-zinc-300">Nome Completo</Label>
                      <Input
                        id="fullname"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-aura-500/50 text-zinc-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-zinc-300">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-aura-500/50 text-zinc-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-zinc-300">Email Principal</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-9 bg-zinc-950/50 border-zinc-800 focus-visible:ring-aura-500/50 text-zinc-100"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-zinc-300">Telefone</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                          id="phone"
                          placeholder="+55"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-9 bg-zinc-950/50 border-zinc-800 focus-visible:ring-aura-500/50 text-zinc-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-800">
                    <Button onClick={handleSave} disabled={isSaving} className="bg-white text-black hover:bg-zinc-200 font-medium">
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </SettingsCard>

                <SectionHeader title="Segurança" description="Gerencie suas credenciais e acesso." />

                <SettingsCard className="space-y-1">
                   <SettingRow
                    label="Senha"
                    desc="Última alteração há 3 meses."
                    action={<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">Redefinir</Button>}
                   />
                   <Separator className="bg-zinc-800/50" />
                   <SettingRow
                    label="Autenticação em Dois Fatores"
                    desc="Adicione uma camada extra de segurança à sua conta."
                    action={<Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-400">Em Breve</Badge>}
                   />
                </SettingsCard>

                {/* Danger Zone */}
                <div className="pt-6">
                  <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-6">
                    <h3 className="text-red-400 font-medium flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" /> Zona de Perigo
                    </h3>
                    <p className="text-sm text-red-400/70 mb-4">
                      A exclusão da sua conta é irreversível. Todos os seus dados serão perdidos.
                    </p>
                    <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-950/30 w-full sm:w-auto justify-start px-0 sm:px-4">
                      Excluir minha conta
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* --- APPEARANCE TAB --- */}
            {activeTab === 'appearance' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Aparência" description="Customize a interface do sistema." />

                <SettingsCard>
                  <Label className="text-base text-zinc-200 mb-4 block">Tema da Interface</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Claro', icon: Sun },
                      { id: 'dark', label: 'Escuro', icon: Moon },
                      { id: 'system', label: 'Sistema', icon: Monitor },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = theme === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
                          className={cn(
                            "cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-zinc-900",
                            isSelected
                              ? "border-aura-500 bg-zinc-900 ring-1 ring-aura-500/20"
                              : "border-zinc-800 hover:border-zinc-700"
                          )}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className={cn("p-2 rounded-full", isSelected ? "bg-aura-500/20 text-aura-400" : "bg-zinc-800 text-zinc-400")}>
                              <Icon className="w-5 h-5" />
                            </div>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-aura-500" />}
                          </div>
                          <span className={cn("font-medium", isSelected ? "text-white" : "text-zinc-400")}>{t.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </SettingsCard>
              </div>
            )}

            {/* --- NOTIFICATIONS TAB --- */}
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Notificações" description="Escolha o que você quer receber." />

                <SettingsCard className="divide-y divide-zinc-800/50">
                  <SettingRow
                    label="Emails de Segurança"
                    desc="Receba alertas sobre logins e mudanças de senha."
                    action={<Switch checked={true} disabled />}
                  />
                  <SettingRow
                    label="Novidades e Atualizações"
                    desc="Fique por dentro das novas funcionalidades do Aura."
                    action={<Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />}
                  />
                  <SettingRow
                    label="Marketing e Parceiros"
                    desc="Receba ofertas exclusivas dos nossos parceiros."
                    action={<Switch checked={marketingNotifs} onCheckedChange={setMarketingNotifs} />}
                  />
                </SettingsCard>
              </div>
            )}

            {/* --- PRIVACY TAB --- */}
            {activeTab === 'privacy' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Privacidade" description="Gerencie como seus dados são usados." />

                <SettingsCard className="divide-y divide-zinc-800/50">
                  <SettingRow
                    label="Perfil Público"
                    desc="Permitir que pessoas fora da sua organização vejam seu perfil básico."
                    action={<Switch checked={publicProfile} onCheckedChange={setPublicProfile} />}
                  />
                  <SettingRow
                    label="Coleta de Dados de Uso"
                    desc="Ajude-nos a melhorar o Aura enviando dados anônimos de uso."
                    action={<Switch checked={dataSharing} onCheckedChange={setDataSharing} />}
                  />
                </SettingsCard>

                 <SettingsCard>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                         <div>
                            <h4 className="text-sm font-medium text-zinc-200">Exportar Dados</h4>
                            <p className="text-xs text-zinc-500">Baixe uma cópia dos seus dados em formato JSON.</p>
                         </div>
                         <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                           <Download className="w-4 h-4 mr-2" /> Download
                         </Button>
                      </div>
                    </div>
                 </SettingsCard>
              </div>
            )}

            {/* --- BILLING TAB --- */}
            {activeTab === 'billing' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Planos e Faturamento" description="Gerencie sua assinatura e métodos de pagamento." />

                {/* Embedded Original Component */}
                <PlanoManager />

                <SettingsCard>
                   <div className="flex items-center gap-4 text-zinc-400 text-sm">
                      <Laptop className="w-4 h-4" />
                      <span>Precisa de uma fatura empresarial? <a href="#" className="text-aura-400 hover:underline">Entre em contato</a>.</span>
                   </div>
                </SettingsCard>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
