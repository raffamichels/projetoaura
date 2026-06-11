'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Plane,
  Hotel,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Globe,
  Clock,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ViagemComDetalhes, DestinoViagem, CreateDestinoDTO } from '@/types/viagem';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function ViagemDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const [viagem, setViagem] = useState<ViagemComDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDestinoModalOpen, setIsDestinoModalOpen] = useState(false);
  const [destinoFormData, setDestinoFormData] = useState({
    nome: '',
    cidade: '',
    pais: '',
    dataChegada: '',
    dataSaida: '',
    endereco: '',
    fusoHorario: '',
    idioma: '',
    moeda: '',
    voltagem: '',
    tomada: '',
    temperaturaMed: '',
    emergencia: '',
  });

  useEffect(() => {
    fetchViagem();
  }, [params.id]);

  const fetchViagem = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/viagens/${params.id}`);

      if (response.status === 404) {
        toast.error('Viagem não encontrada');
        router.push('/dashboard/viagens');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setViagem(data);
      } else {
        toast.error('Erro ao carregar viagem');
        router.push('/dashboard/viagens');
      }
    } catch (error) {
      console.error('Erro ao buscar viagem:', error);
      toast.error('Erro ao carregar viagem');
      router.push('/dashboard/viagens');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta viagem?')) return;

    try {
      const response = await fetch(`/api/v1/viagens/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Viagem excluída com sucesso!');
        router.push('/dashboard/viagens');
      } else {
        toast.error('Erro ao excluir viagem');
      }
    } catch (error) {
      console.error('Erro ao excluir viagem:', error);
      toast.error('Erro ao excluir viagem');
    }
  };

  const handleCreateDestino = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/v1/viagens/${params.id}/destinos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...destinoFormData,
          ordem: viagem?.destinos?.length || 0,
        }),
      });

      if (response.ok) {
        toast.success('Destino adicionado com sucesso!');
        setIsDestinoModalOpen(false);
        resetDestinoForm();
        fetchViagem();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao adicionar destino');
      }
    } catch (error) {
      console.error('Erro ao criar destino:', error);
      toast.error('Erro ao adicionar destino');
    }
  };

  const handleDeleteDestino = async (destinoId: string) => {
    if (!confirm('Tem certeza que deseja remover este destino?')) return;

    try {
      const response = await fetch(`/api/v1/viagens/${params.id}/destinos/${destinoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Destino removido com sucesso!');
        fetchViagem();
      } else {
        toast.error('Erro ao remover destino');
      }
    } catch (error) {
      console.error('Erro ao remover destino:', error);
      toast.error('Erro ao remover destino');
    }
  };

  const resetDestinoForm = () => {
    setDestinoFormData({
      nome: '',
      cidade: '',
      pais: '',
      dataChegada: '',
      dataSaida: '',
      endereco: '',
      fusoHorario: '',
      idioma: '',
      moeda: '',
      voltagem: '',
      tomada: '',
      temperaturaMed: '',
      emergencia: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#178E96]"></div>
      </div>
    );
  }

  if (!viagem) {
    return null;
  }

  const percentGasto = viagem.orcamentoTotal
    ? (viagem.totalGasto / Number(viagem.orcamentoTotal)) * 100
    : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            onClick={() => router.push('/dashboard/viagens')}
            className="bg-[#F4F3EC] hover:bg-[#E9E7DC] text-[#44586A] duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#0E2A3F] mb-2">{viagem.nome}</h1>
            {viagem.descricao && (
              <p className="text-[#44586A]">{viagem.descricao}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            className="bg-[#F4F3EC] hover:bg-[#E9E7DC] text-[#44586A] duration-150"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleDelete}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 duration-150"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status e Informações Básicas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-[#E9E7DC] shadow-sm p-6">
          <div className="text-center">
            <p className="text-sm text-[#44586A] mb-2">Status</p>
            <Badge className={`${statusColors[viagem.status].bg} ${statusColors[viagem.status].text} border ${statusColors[viagem.status].border}`}>
              {statusLabels[viagem.status]}
            </Badge>
          </div>
        </Card>

        <Card className="bg-white border-[#E9E7DC] shadow-sm p-6">
          <div className="text-center">
            <p className="text-sm text-[#44586A] mb-2">Período</p>
            <p className="text-lg font-bold text-[#0E2A3F]">
              {format(new Date(viagem.dataInicio), 'dd MMM', { locale: ptBR })} -{' '}
              {format(new Date(viagem.dataFim), 'dd MMM yyyy', { locale: ptBR })}
            </p>
          </div>
        </Card>

        <Card className="bg-white border-[#E9E7DC] shadow-sm p-6">
          <div className="text-center">
            <p className="text-sm text-[#44586A] mb-2">Destinos</p>
            <p className="text-lg font-bold text-[#0E2A3F]">
              {viagem.destinos?.length || 0}
            </p>
          </div>
        </Card>

        <Card className="bg-white border-[#E9E7DC] shadow-sm p-6">
          <div className="text-center">
            <p className="text-sm text-[#44586A] mb-2">Orçamento</p>
            <p className="text-lg font-bold text-[#0E2A3F]">
              {viagem.orcamentoTotal
                ? `R$ ${Number(viagem.orcamentoTotal).toFixed(2)}`
                : 'Não definido'}
            </p>
          </div>
        </Card>
      </div>

      {/* Orçamento Detalhado */}
      {viagem.orcamentoTotal && (
        <Card className="bg-white border-[#E9E7DC] shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#0E2A3F] mb-4">Controle de Orçamento</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#44586A]">Total Gasto</span>
              <span className="text-2xl font-bold text-[#0E2A3F]">
                R$ {viagem.totalGasto.toFixed(2)}
              </span>
            </div>
            <div className="relative h-4 bg-[#E9E7DC] rounded-full overflow-hidden">
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
            <div className="flex justify-between text-sm">
              <span className="text-[#44586A]">
                {percentGasto.toFixed(1)}% utilizado
              </span>
              <span className="text-[#44586A]">
                R$ {(Number(viagem.orcamentoTotal) - viagem.totalGasto).toFixed(2)} restante
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs com Conteúdo */}
      <Tabs defaultValue="destinos" className="space-y-4">
        <TabsList className="bg-white border border-[#E9E7DC]">
          <TabsTrigger value="destinos" className="data-[state=active]:bg-[#E5F1F1] data-[state=active]:text-[#117178] data-[state=active]:font-semibold duration-150">
            <MapPin className="w-4 h-4 mr-2" />
            Destinos
          </TabsTrigger>
          <TabsTrigger value="transportes" className="data-[state=active]:bg-[#E5F1F1] data-[state=active]:text-[#117178] data-[state=active]:font-semibold duration-150">
            <Plane className="w-4 h-4 mr-2" />
            Transportes
          </TabsTrigger>
          <TabsTrigger value="hospedagens" className="data-[state=active]:bg-[#E5F1F1] data-[state=active]:text-[#117178] data-[state=active]:font-semibold duration-150">
            <Hotel className="w-4 h-4 mr-2" />
            Hospedagens
          </TabsTrigger>
          <TabsTrigger value="atividades" className="data-[state=active]:bg-[#E5F1F1] data-[state=active]:text-[#117178] data-[state=active]:font-semibold duration-150">
            <Calendar className="w-4 h-4 mr-2" />
            Atividades
          </TabsTrigger>
        </TabsList>

        {/* Tab de Destinos */}
        <TabsContent value="destinos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#0E2A3F]">Destinos da Viagem</h2>
            <Button
              onClick={() => setIsDestinoModalOpen(true)}
              className="bg-[#178E96] hover:bg-[#117178] text-white duration-150"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Destino
            </Button>
          </div>

          {!viagem.destinos || viagem.destinos.length === 0 ? (
            <Card className="bg-white border-[#E9E7DC] shadow-sm p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F4F3EC] rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-[#117178]" />
                </div>
                <h3 className="text-xl font-semibold text-[#0E2A3F] mb-2">
                  Nenhum destino adicionado
                </h3>
                <p className="text-[#8395A5] mb-6">
                  Comece adicionando os destinos da sua viagem
                </p>
                <Button
                  onClick={() => setIsDestinoModalOpen(true)}
                  className="bg-[#178E96] hover:bg-[#117178] text-white duration-150"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Destino
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {viagem.destinos.map((destino, index) => (
                <Card
                  key={destino.id}
                  className="bg-white border-[#E9E7DC] shadow-sm hover:border-[#178E96]/40 transition-all duration-150 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#E5F1F1] rounded-xl">
                        <MapPin className="w-6 h-6 text-[#117178]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0E2A3F]">{destino.nome}</h3>
                        <p className="text-sm text-[#44586A]">{destino.cidade}, {destino.pais}</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      onClick={() => handleDeleteDestino(destino.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 duration-150"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#8395A5]" />
                      <span className="text-[#44586A]">
                        {format(new Date(destino.dataChegada), 'dd MMM', { locale: ptBR })} -{' '}
                        {format(new Date(destino.dataSaida), 'dd MMM yyyy', { locale: ptBR })}
                      </span>
                    </div>

                    {destino.endereco && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-[#8395A5] mt-0.5 flex-shrink-0" />
                        <span className="text-[#44586A]">{destino.endereco}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#E9E7DC]">
                      {destino.idioma && (
                        <div>
                          <p className="text-xs text-[#8395A5]">Idioma</p>
                          <p className="text-sm text-[#0E2A3F] font-medium">{destino.idioma}</p>
                        </div>
                      )}
                      {destino.moeda && (
                        <div>
                          <p className="text-xs text-[#8395A5]">Moeda</p>
                          <p className="text-sm text-[#0E2A3F] font-medium">{destino.moeda}</p>
                        </div>
                      )}
                      {destino.fusoHorario && (
                        <div>
                          <p className="text-xs text-[#8395A5]">Fuso Horário</p>
                          <p className="text-sm text-[#0E2A3F] font-medium">{destino.fusoHorario}</p>
                        </div>
                      )}
                      {destino.temperaturaMed && (
                        <div>
                          <p className="text-xs text-[#8395A5]">Temperatura</p>
                          <p className="text-sm text-[#0E2A3F] font-medium">{destino.temperaturaMed}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Outras Tabs - Em breve */}
        <TabsContent value="transportes">
          <Card className="bg-white border-[#E9E7DC] shadow-sm p-12">
            <div className="text-center">
              <Plane className="w-16 h-16 mx-auto text-blue-300 mb-4" />
              <h3 className="text-xl font-semibold text-[#0E2A3F] mb-2">
                Transportes - Em breve
              </h3>
              <p className="text-[#44586A]">
                Gerenciamento de transportes será adicionado em breve
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hospedagens">
          <Card className="bg-white border-[#E9E7DC] shadow-sm p-12">
            <div className="text-center">
              <Hotel className="w-16 h-16 mx-auto text-[#178E96] mb-4" />
              <h3 className="text-xl font-semibold text-[#0E2A3F] mb-2">
                Hospedagens - Em breve
              </h3>
              <p className="text-[#44586A]">
                Gerenciamento de hospedagens será adicionado em breve
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="atividades">
          <Card className="bg-white border-[#E9E7DC] shadow-sm p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-[#0E2A3F] mb-2">
                Atividades - Em breve
              </h3>
              <p className="text-[#44586A]">
                Gerenciamento de atividades será adicionado em breve
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notas Gerais */}
      {viagem.notasGerais && (
        <Card className="bg-white border-[#E9E7DC] shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#0E2A3F] mb-4">Notas Gerais</h2>
          <p className="text-[#44586A] whitespace-pre-wrap">{viagem.notasGerais}</p>
        </Card>
      )}

      {/* Modal de Adicionar Destino */}
      <Dialog open={isDestinoModalOpen} onOpenChange={setIsDestinoModalOpen}>
        <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar Destino</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Adicione um novo destino à sua viagem
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDestino} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-white">Nome do Destino *</Label>
                <Input
                  id="nome"
                  value={destinoFormData.nome}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, nome: e.target.value })}
                  placeholder="Ex: Torre Eiffel"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <Label htmlFor="cidade" className="text-white">Cidade *</Label>
                <Input
                  id="cidade"
                  value={destinoFormData.cidade}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, cidade: e.target.value })}
                  placeholder="Ex: Paris"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pais" className="text-white">País *</Label>
                <Input
                  id="pais"
                  value={destinoFormData.pais}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, pais: e.target.value })}
                  placeholder="Ex: França"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <Label htmlFor="endereco" className="text-white">Endereço</Label>
                <Input
                  id="endereco"
                  value={destinoFormData.endereco}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, endereco: e.target.value })}
                  placeholder="Endereço completo"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataChegada" className="text-white">Data de Chegada *</Label>
                <Input
                  id="dataChegada"
                  type="date"
                  value={destinoFormData.dataChegada}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, dataChegada: e.target.value })}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="dataSaida" className="text-white">Data de Saída *</Label>
                <Input
                  id="dataSaida"
                  type="date"
                  value={destinoFormData.dataSaida}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, dataSaida: e.target.value })}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idioma" className="text-white">Idioma Local</Label>
                <Input
                  id="idioma"
                  value={destinoFormData.idioma}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, idioma: e.target.value })}
                  placeholder="Ex: Francês"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <Label htmlFor="moeda" className="text-white">Moeda</Label>
                <Input
                  id="moeda"
                  value={destinoFormData.moeda}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, moeda: e.target.value })}
                  placeholder="Ex: EUR"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fusoHorario" className="text-white">Fuso Horário</Label>
                <Input
                  id="fusoHorario"
                  value={destinoFormData.fusoHorario}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, fusoHorario: e.target.value })}
                  placeholder="Ex: UTC+1"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <Label htmlFor="voltagem" className="text-white">Voltagem</Label>
                <Input
                  id="voltagem"
                  value={destinoFormData.voltagem}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, voltagem: e.target.value })}
                  placeholder="Ex: 220V"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <Label htmlFor="tomada" className="text-white">Tipo de Tomada</Label>
                <Input
                  id="tomada"
                  value={destinoFormData.tomada}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, tomada: e.target.value })}
                  placeholder="Ex: Tipo C"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperaturaMed" className="text-white">Temperatura Média</Label>
                <Input
                  id="temperaturaMed"
                  value={destinoFormData.temperaturaMed}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, temperaturaMed: e.target.value })}
                  placeholder="Ex: 20°C"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <Label htmlFor="emergencia" className="text-white">Número de Emergência</Label>
                <Input
                  id="emergencia"
                  value={destinoFormData.emergencia}
                  onChange={(e) => setDestinoFormData({ ...destinoFormData, emergencia: e.target.value })}
                  placeholder="Ex: 112"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => {
                  setIsDestinoModalOpen(false);
                  resetDestinoForm();
                }}
                className="bg-[#F4F3EC] hover:bg-[#E9E7DC] text-[#44586A] duration-150"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Adicionar Destino
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
