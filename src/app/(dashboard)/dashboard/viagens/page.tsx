'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Globe,
  Sparkles,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Heart,
  Crown,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Viagem, StatusViagem, PropostoViagem } from '@/types/viagem';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusColors = {
  PLANEJADA: { bg: 'bg-[#EFF4F8]', text: 'text-[#154F6D]', border: 'border-[#154F6D]/20' },
  EM_ANDAMENTO: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  CONCLUIDA: { bg: 'bg-[#F4F3EC]', text: 'text-[#8395A5]', border: 'border-[#E9E7DC]' },
  CANCELADA: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
};

const statusLabels = {
  PLANEJADA: 'Planejada',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

const propostoIcons = {
  LAZER: Heart,
  TRABALHO: Briefcase,
  ESTUDO: GraduationCap,
  OUTRO: Globe,
};

const propostoLabels = {
  LAZER: 'Lazer',
  TRABALHO: 'Trabalho',
  ESTUDO: 'Estudo',
  OUTRO: 'Outro',
};

interface ViagemComDetalhes extends Viagem {
  totalGasto: number;
  diasRestantes: number;
}

export default function ViagensPage() {
  const router = useRouter();
  const [viagens, setViagens] = useState<ViagemComDetalhes[]>([]);
  const [filteredViagens, setFilteredViagens] = useState<ViagemComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    proposito: 'LAZER' as PropostoViagem,
    dataInicio: '',
    dataFim: '',
    orcamentoTotal: '',
    notasGerais: '',
  });

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  useEffect(() => {
    if (isPremium) {
      fetchViagens();
    }
  }, [isPremium]);

  useEffect(() => {
    filterViagens();
  }, [searchTerm, statusFilter, viagens]);

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/v1/planos');
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.plano === 'PREMIUM' && data.ativo);
      }
    } catch (error) {
      console.error('Erro ao verificar plano:', error);
    }
  };

  const fetchViagens = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/viagens');

      if (response.status === 403) {
        setIsPremium(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setViagens(data);
      }
    } catch (error) {
      console.error('Erro ao buscar viagens:', error);
      toast.error('Erro ao carregar viagens');
    } finally {
      setLoading(false);
    }
  };

  const filterViagens = () => {
    let filtered = viagens;

    if (searchTerm) {
      filtered = filtered.filter(
        (viagem) =>
          viagem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          viagem.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((viagem) => viagem.status === statusFilter);
    }

    setFilteredViagens(filtered);
  };

  const handleCreateViagem = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/v1/viagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          orcamentoTotal: formData.orcamentoTotal ? Number(formData.orcamentoTotal) : null,
        }),
      });

      if (response.ok) {
        toast.success('Viagem criada com sucesso!');
        setIsModalOpen(false);
        resetForm();
        fetchViagens();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao criar viagem');
      }
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      toast.error('Erro ao criar viagem');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      proposito: 'LAZER' as PropostoViagem,
      dataInicio: '',
      dataFim: '',
      orcamentoTotal: '',
      notasGerais: '',
    });
  };

  const getCountdownText = (diasRestantes: number, status: StatusViagem) => {
    if (status === 'CONCLUIDA' || status === 'CANCELADA') return null;
    if (status === 'EM_ANDAMENTO') return 'Em andamento agora';
    if (diasRestantes === 0) return 'Viagem começa hoje!';
    if (diasRestantes === 1) return 'Falta 1 dia';
    return `Faltam ${diasRestantes} dias`;
  };

  // Estatísticas
  const viagensAtivas = viagens.filter(v => v.status === 'PLANEJADA' || v.status === 'EM_ANDAMENTO');
  const totalGasto = viagens.reduce((acc, v) => acc + v.totalGasto, 0);
  const proximaViagem = viagensAtivas.find(v => v.diasRestantes >= 0 && v.status === 'PLANEJADA');

  if (!isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-8 bg-[#0E2A3F] border-[#0E2A3F] text-white rounded-xl">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-[#D9A441]/15 rounded-full">
                <Crown className="w-12 h-12 text-[#D9A441]" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Recurso Premium</h2>
              <p className="text-white/70 text-lg">
                O gerenciamento de viagens está disponível apenas para usuários Premium
              </p>
            </div>
            <div className="bg-[#143247] border border-[#1F4259] rounded-lg p-6 space-y-3 text-left">
              <h3 className="font-semibold text-lg mb-4 text-white">Com o plano Premium você terá:</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#5BB5BC] mt-0.5 flex-shrink-0" />
                  <span className="text-white/80">Planejamento completo de viagens com múltiplos destinos</span>
                </div>
                <div className="flex items-start gap-3">
                  <Plane className="w-5 h-5 text-[#5BB5BC] mt-0.5 flex-shrink-0" />
                  <span className="text-white/80">Gerenciamento de transportes, voos e hospedagens</span>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#5BB5BC] mt-0.5 flex-shrink-0" />
                  <span className="text-white/80">Roteiro detalhado com atividades dia a dia</span>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-[#5BB5BC] mt-0.5 flex-shrink-0" />
                  <span className="text-white/80">Controle financeiro completo com conversão de moedas</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push('/premium')}
              className="w-full bg-[#178E96] hover:bg-[#117178] text-white font-medium py-6 text-lg duration-150"
            >
              <Crown className="w-5 h-5 mr-2" />
              Fazer Upgrade para Premium
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#178E96]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="relative mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#E5F1F1] rounded-xl">
                <Plane className="w-8 h-8 text-[#117178]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0E2A3F]">
                  Minhas Viagens
                </h1>
                <p className="text-[#44586A]">Planeje e gerencie suas aventuras</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#178E96] hover:bg-[#117178] text-white duration-150"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Viagem
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden bg-white border-[#E9E7DC] shadow-sm hover:border-[#178E96]/40 transition-all duration-150">
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#E5F1F1] rounded-lg">
                  <Sparkles className="w-5 h-5 text-[#117178]" />
                </div>
                <span className="text-sm text-[#44586A]">Viagens Ativas</span>
              </div>
              <div className="text-3xl font-bold text-[#117178] mb-1">
                {viagensAtivas.length}
              </div>
              <p className="text-xs text-[#8395A5]">
                {viagens.length - viagensAtivas.length} concluídas ou canceladas
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden bg-white border-[#E9E7DC] shadow-sm hover:border-green-200 transition-all duration-150">
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-700" />
                </div>
                <span className="text-sm text-[#44586A]">Total Investido</span>
              </div>
              <div className="text-3xl font-bold text-green-700 mb-1">
                R$ {totalGasto.toFixed(2)}
              </div>
              <p className="text-xs text-[#8395A5]">Em todas as viagens</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden bg-white border-[#E9E7DC] shadow-sm hover:border-[#154F6D]/30 transition-all duration-150">
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#EFF4F8] rounded-lg">
                  <Clock className="w-5 h-5 text-[#154F6D]" />
                </div>
                <span className="text-sm text-[#44586A]">Próxima Viagem</span>
              </div>
              {proximaViagem ? (
                <>
                  <div className="text-xl font-bold text-[#154F6D] mb-1 truncate">
                    {proximaViagem.nome}
                  </div>
                  <p className="text-xs text-[#8395A5]">
                    {getCountdownText(proximaViagem.diasRestantes, proximaViagem.status)}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-[#8395A5] mb-1">—</div>
                  <p className="text-xs text-[#8395A5]">Nenhuma viagem planejada</p>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4 bg-white border-[#E9E7DC] shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8395A5] w-4 h-4" />
            <Input
              placeholder="Buscar viagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white border-[#D9D7CB] text-[#0E2A3F]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Status</SelectItem>
              <SelectItem value="PLANEJADA">Planejada</SelectItem>
              <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
              <SelectItem value="CONCLUIDA">Concluída</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Viagens */}
      {filteredViagens.length === 0 ? (
        <Card className="bg-white border-[#E9E7DC] shadow-sm p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F4F3EC] rounded-full mb-4">
              <Plane className="w-10 h-10 text-[#117178]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#0E2A3F] mb-2">
              {viagens.length === 0 ? 'Comece a planejar suas aventuras!' : 'Nenhuma viagem encontrada'}
            </h3>
            <p className="text-[#8395A5] mb-6 max-w-md mx-auto">
              {viagens.length === 0
                ? 'Crie sua primeira viagem e comece a organizar todos os detalhes da sua próxima aventura'
                : 'Nenhuma viagem corresponde aos filtros aplicados.'}
            </p>
            {viagens.length === 0 && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#178E96] hover:bg-[#117178] text-white duration-150"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Viagem
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredViagens.map((viagem) => {
            const countdownText = getCountdownText(viagem.diasRestantes, viagem.status);
            const percentGasto = viagem.orcamentoTotal
              ? (viagem.totalGasto / Number(viagem.orcamentoTotal)) * 100
              : 0;
            const PropostoIcon = propostoIcons[viagem.proposito];

            return (
              <Card
                key={viagem.id}
                className="relative overflow-hidden bg-white border-[#E9E7DC] shadow-sm hover:border-[#178E96]/40 transition-all duration-150 group hover:shadow-md cursor-pointer"
                onClick={() => router.push(`/dashboard/viagens/${viagem.id}`)}
              >
                {/* Barra de status no topo */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    viagem.status === 'PLANEJADA' ? 'bg-blue-500' :
                    viagem.status === 'EM_ANDAMENTO' ? 'bg-green-500' :
                    viagem.status === 'CONCLUIDA' ? 'bg-[#8395A5]' : 'bg-red-500'
                  }`}
                />

                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-3 bg-[#E5F1F1] rounded-xl">
                        <PropostoIcon className="w-6 h-6 text-[#117178]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-[#0E2A3F] group-hover:text-[#117178] transition-colors duration-150 truncate">
                          {viagem.nome}
                        </h3>
                        {viagem.descricao && (
                          <p className="text-sm text-[#44586A] line-clamp-1">{viagem.descricao}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${statusColors[viagem.status].bg} ${statusColors[viagem.status].text} border ${statusColors[viagem.status].border}`}>
                      {statusLabels[viagem.status]}
                    </Badge>
                    <Badge className="bg-[#F4F3EC] text-[#44586A] border border-[#E9E7DC]">
                      {propostoLabels[viagem.proposito]}
                    </Badge>
                  </div>

                  {/* Informações */}
                  <div className="space-y-3 mb-4">
                    {/* Datas */}
                    <div className="flex items-center gap-2 text-sm text-[#44586A]">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {format(new Date(viagem.dataInicio), 'dd MMM', { locale: ptBR })} -{' '}
                        {format(new Date(viagem.dataFim), 'dd MMM yyyy', { locale: ptBR })}
                      </span>
                    </div>

                    {/* Countdown */}
                    {countdownText && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-[#117178] flex-shrink-0" />
                        <span className="text-[#117178] font-medium">{countdownText}</span>
                      </div>
                    )}

                    {/* Destinos */}
                    {viagem.destinos && viagem.destinos.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-[#44586A]">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{viagem.destinos.length} {viagem.destinos.length === 1 ? 'destino' : 'destinos'}</span>
                      </div>
                    )}
                  </div>

                  {/* Orçamento */}
                  {viagem.orcamentoTotal && (
                    <div className="pt-4 border-t border-[#E9E7DC]">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-[#44586A]">Orçamento</span>
                        <span className="font-medium text-[#0E2A3F]">
                          R$ {viagem.totalGasto.toFixed(2)} / R$ {Number(viagem.orcamentoTotal).toFixed(2)}
                        </span>
                      </div>
                      <div className="relative h-2 bg-[#E9E7DC] rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                            percentGasto > 100
                              ? 'bg-red-500'
                              : percentGasto > 80
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentGasto, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#8395A5] mt-1">
                        {percentGasto > 100
                          ? `${(percentGasto - 100).toFixed(0)}% acima do orçamento`
                          : `${(100 - percentGasto).toFixed(0)}% restante`}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Criação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-[#E3E1D6]">
          <DialogHeader>
            <DialogTitle className="text-[#0E2A3F]">Nova Viagem</DialogTitle>
            <DialogDescription className="text-[#44586A]">
              Crie uma nova viagem e comece a planejar sua aventura
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateViagem} className="space-y-4">
            <div>
              <Label htmlFor="nome" className="text-[#0E2A3F]">Nome da Viagem *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Viagem para Paris"
                required
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
              />
            </div>

            <div>
              <Label htmlFor="descricao" className="text-[#0E2A3F]">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva sua viagem..."
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="proposito" className="text-[#0E2A3F]">Propósito</Label>
                <Select
                  value={formData.proposito}
                  onValueChange={(value) =>
                    setFormData({ ...formData, proposito: value as PropostoViagem })
                  }
                >
                  <SelectTrigger className="bg-white border-[#D9D7CB] text-[#0E2A3F] focus:border-[#178E96] focus:ring-[#178E96]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAZER">Lazer</SelectItem>
                    <SelectItem value="TRABALHO">Trabalho</SelectItem>
                    <SelectItem value="ESTUDO">Estudo</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="orcamento" className="text-[#0E2A3F]">Orçamento Total</Label>
                <Input
                  id="orcamento"
                  type="number"
                  step="0.01"
                  value={formData.orcamentoTotal}
                  onChange={(e) =>
                    setFormData({ ...formData, orcamentoTotal: e.target.value })
                  }
                  placeholder="0.00"
                  className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataInicio" className="text-[#0E2A3F]">Data de Início *</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, dataInicio: e.target.value })
                  }
                  required
                  className="bg-white border-[#D9D7CB] text-[#0E2A3F] focus:border-[#178E96] focus:ring-[#178E96]/20"
                />
              </div>

              <div>
                <Label htmlFor="dataFim" className="text-[#0E2A3F]">Data de Término *</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  required
                  className="bg-white border-[#D9D7CB] text-[#0E2A3F] focus:border-[#178E96] focus:ring-[#178E96]/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notas" className="text-[#0E2A3F]">Notas Gerais</Label>
              <Textarea
                id="notas"
                value={formData.notasGerais}
                onChange={(e) => setFormData({ ...formData, notasGerais: e.target.value })}
                placeholder="Adicione notas ou observações sobre a viagem..."
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="bg-[#F4F3EC] hover:bg-[#E9E7DC] text-[#44586A] duration-150"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#178E96] hover:bg-[#117178] text-white duration-150"
              >
                Criar Viagem
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
