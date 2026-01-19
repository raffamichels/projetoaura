'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import {
  Plus,
  Target,
  Flame,
  CheckCircle2,
  Circle,
  Loader2,
  Trash2,
  Calendar,
  TrendingUp,
  BarChart3,
  Award,
  Percent,
} from 'lucide-react';
import { StreakCalendar } from './components/StreakCalendar';
import { TrendChart } from './components/TrendChart';
import { WeekdayStats } from './components/WeekdayStats';

interface Habito {
  id: string;
  nome: string;
  descricao?: string;
  horario?: string;
  diasSemana: number[];
  sequenciaAtual: number;
  maiorSequencia: number;
  totalCompletados: number;
  cor: string;
  icone: string;
  completadoHoje: boolean;
}

interface CalendarioData {
  data: string;
  completados: number;
  total: number;
  nivel: number;
  diaSemana: number;
}

interface TendenciaData {
  semana: number;
  dataInicio: string;
  completados: number;
  total: number;
  taxa: number;
}

interface EstatisticaDia {
  dia: number;
  completados: number;
  total: number;
  taxa: number;
}

interface Estatisticas {
  totalHabitos: number;
  completadosHoje: number;
  pendentesHoje: number;
  maiorSequenciaAtual: number;
  maiorSequenciaHistorica: number;
  totalCompletados: number;
  taxaConclusaoHoje: number;
  calendarioStreak: CalendarioData[];
  tendenciaSemanal: TendenciaData[];
  taxaSucessoGeral: number;
  diasCompletosTotal: number;
  diasComHabitos: number;
  melhorSemana: TendenciaData;
  estatisticasPorDia: EstatisticaDia[];
  melhorDia: EstatisticaDia | null;
  piorDia: EstatisticaDia | null;
}

const DIAS_SEMANA = [
  { valor: 0, label: 'D', nome: 'Domingo' },
  { valor: 1, label: 'S', nome: 'Segunda' },
  { valor: 2, label: 'T', nome: 'Terça' },
  { valor: 3, label: 'Q', nome: 'Quarta' },
  { valor: 4, label: 'Q', nome: 'Quinta' },
  { valor: 5, label: 'S', nome: 'Sexta' },
  { valor: 6, label: 'S', nome: 'Sábado' },
];

const CORES = [
  '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
];

export default function HabitosPage() {
  const t = useTranslations('habits');
  const [loading, setLoading] = useState(true);
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);

  // Obter timezone do usuário (executado apenas no cliente)
  const timezone = useMemo(() => {
    if (typeof window !== 'undefined') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return 'America/Sao_Paulo'; // Fallback
  }, []);

  // Dia da semana selecionado (null = dia atual)
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [diaAtual, setDiaAtual] = useState<number>(() => {
    // Calcular dia da semana no timezone local
    const now = new Date();
    return now.getDay();
  });

  // Modal states
  const [modalHabitoAberto, setModalHabitoAberto] = useState(false);
  const [modalExcluirHabito, setModalExcluirHabito] = useState(false);
  const [habitoSelecionado, setHabitoSelecionado] = useState<Habito | null>(null);

  // Loading states
  const [criandoHabito, setCriandoHabito] = useState(false);
  const [completandoHabito, setCompletandoHabito] = useState<string | null>(null);

  // Form states
  const [novoHabito, setNovoHabito] = useState({
    nome: '',
    descricao: '',
    horario: '',
    diasSemana: [] as number[],
    cor: '#8B5CF6',
  });

  // Verifica se está visualizando o dia atual
  const isVisualizandoDiaAtual = diaSelecionado === null || diaSelecionado === diaAtual;

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);

      // Construir URL com parâmetro de dia da semana e timezone
      const params = new URLSearchParams();
      params.set('timezone', timezone);
      if (diaSelecionado !== null) {
        params.set('diaSemana', diaSelecionado.toString());
      }

      const habitosUrl = `/api/v1/habitos?${params.toString()}`;
      const estatisticasUrl = `/api/v1/habitos/estatisticas?timezone=${encodeURIComponent(timezone)}`;

      const [habitosRes, estatisticasRes] = await Promise.all([
        fetch(habitosUrl),
        fetch(estatisticasUrl),
      ]);

      if (habitosRes.ok) {
        const data = await habitosRes.json();
        setHabitos(data.data);
        // Atualizar dia atual do servidor
        if (data.diaSemanaAtual !== undefined) {
          setDiaAtual(data.diaSemanaAtual);
        }
      }

      if (estatisticasRes.ok) {
        const data = await estatisticasRes.json();
        setEstatisticas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [diaSelecionado, timezone]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const criarHabito = async () => {
    if (criandoHabito || !novoHabito.nome.trim()) return;

    setCriandoHabito(true);
    try {
      const response = await fetch('/api/v1/habitos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoHabito.nome.trim(),
          descricao: novoHabito.descricao?.trim() || null,
          horario: novoHabito.horario || null,
          diasSemana: novoHabito.diasSemana,
          cor: novoHabito.cor,
        }),
      });

      if (response.ok) {
        setModalHabitoAberto(false);
        setNovoHabito({
          nome: '',
          descricao: '',
          horario: '',
          diasSemana: [],
          cor: '#8B5CF6',
        });
        carregarDados();
      } else {
        const errorData = await response.json();
        console.error('Erro ao criar hábito:', errorData);
        alert(errorData.error || 'Erro ao criar hábito');
      }
    } catch (error) {
      console.error('Erro ao criar hábito:', error);
      alert('Erro de conexão ao criar hábito');
    } finally {
      setCriandoHabito(false);
    }
  };

  const completarHabito = async (habito: Habito) => {
    if (completandoHabito) return;

    setCompletandoHabito(habito.id);
    try {
      const response = await fetch(`/api/v1/habitos/${habito.id}/completar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: new Date().toISOString(),
          completado: !habito.completadoHoje,
          timezone, // Enviar timezone do cliente
        }),
      });

      if (response.ok) {
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao completar hábito:', error);
    } finally {
      setCompletandoHabito(null);
    }
  };

  const excluirHabito = async () => {
    if (!habitoSelecionado) return;

    try {
      const response = await fetch(`/api/v1/habitos/${habitoSelecionado.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setModalExcluirHabito(false);
        setHabitoSelecionado(null);
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao excluir hábito:', error);
    }
  };

  const toggleDiaSemana = (dia: number) => {
    setNovoHabito(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia].sort(),
    }));
  };

  // Separar hábitos completados e pendentes
  const habitosPendentes = habitos.filter(h => !h.completadoHoje);
  const habitosCompletados = habitos.filter(h => h.completadoHoje);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-zinc-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('pageTitle')}</h1>
          <p className="text-sm sm:text-base text-zinc-400">{t('subtitle')}</p>
        </div>
        <Button
          onClick={() => setModalHabitoAberto(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('newHabit')}
        </Button>
      </div>

      {/* Estatísticas resumidas */}
      {estatisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">{t('todayProgress')}</p>
                  <p className="text-2xl font-bold text-white">
                    {estatisticas.completadosHoje}/{estatisticas.totalHabitos}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">{t('currentStreak')}</p>
                  <p className="text-2xl font-bold text-white">
                    {estatisticas.maiorSequenciaAtual} <span className="text-sm font-normal text-zinc-500">{t('days')}</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">{t('bestStreak')}</p>
                  <p className="text-2xl font-bold text-white">
                    {estatisticas.maiorSequenciaHistorica} <span className="text-sm font-normal text-zinc-500">{t('days')}</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">{t('totalCompleted')}</p>
                  <p className="text-2xl font-bold text-white">{estatisticas.totalCompletados}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Seletor de Dia da Semana - Compacto */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {DIAS_SEMANA.map((dia) => {
            const isSelected = diaSelecionado === null
              ? dia.valor === diaAtual
              : dia.valor === diaSelecionado;
            const isToday = dia.valor === diaAtual;

            return (
              <button
                key={dia.valor}
                type="button"
                onClick={() => setDiaSelecionado(dia.valor === diaAtual ? null : dia.valor)}
                className={`w-7 h-7 rounded-full text-xs font-medium transition-all relative ${
                  isSelected
                    ? 'bg-purple-600 text-white'
                    : isToday
                      ? 'bg-zinc-800 text-purple-400 ring-1 ring-purple-500/50'
                      : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400'
                }`}
                title={isToday ? `${dia.nome} (${t('today')})` : dia.nome}
              >
                {dia.label}
              </button>
            );
          })}
        </div>
        {!isVisualizandoDiaAtual && (
          <span className="text-xs text-amber-500/70">{t('viewOnly')}</span>
        )}
      </div>

      {/* Lista de Hábitos - Compacta */}
      {habitos.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 text-center">
            <Target className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-white mb-1">{t('noHabitsYet')}</h3>
            <p className="text-sm text-zinc-400 mb-3">{t('startCreatingHabits')}</p>
            <Button
              onClick={() => setModalHabitoAberto(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('createFirstHabit')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-3">
            {/* Hábitos Pendentes */}
            {habitosPendentes.length > 0 && (
              <div className={habitosCompletados.length > 0 ? 'mb-3' : ''}>
                <h2 className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1.5 px-1">
                  <Circle className="w-3 h-3" />
                  {t('pending')} ({habitosPendentes.length})
                </h2>
                <div className="space-y-1">
                  {habitosPendentes.map((habito) => (
                    <div
                      key={habito.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${
                        isVisualizandoDiaAtual ? 'hover:bg-zinc-800/50' : 'opacity-70'
                      }`}
                    >
                      <button
                        onClick={() => isVisualizandoDiaAtual && completarHabito(habito)}
                        disabled={!isVisualizandoDiaAtual || completandoHabito === habito.id}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isVisualizandoDiaAtual ? 'hover:bg-zinc-800 cursor-pointer' : 'cursor-not-allowed opacity-50'
                        }`}
                        style={{ borderColor: habito.cor }}
                        title={!isVisualizandoDiaAtual ? t('canOnlyCompleteToday') : undefined}
                      >
                        {completandoHabito === habito.id && (
                          <Loader2 className="w-3 h-3 animate-spin" style={{ color: habito.cor }} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{habito.nome}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {habito.horario && (
                          <span className="text-xs text-zinc-500 hidden sm:block">{habito.horario}</span>
                        )}
                        <div className="flex items-center gap-0.5 text-orange-500">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{habito.sequenciaAtual}</span>
                        </div>
                        <button
                          onClick={() => {
                            setHabitoSelecionado(habito);
                            setModalExcluirHabito(true);
                          }}
                          className="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divisor */}
            {habitosPendentes.length > 0 && habitosCompletados.length > 0 && (
              <div className="border-t border-zinc-800 my-2" />
            )}

            {/* Hábitos Completados */}
            {habitosCompletados.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1.5 px-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  {t('completed')} ({habitosCompletados.length})
                </h2>
                <div className="space-y-1">
                  {habitosCompletados.map((habito) => (
                    <div
                      key={habito.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors group opacity-60 ${
                        isVisualizandoDiaAtual ? 'hover:bg-zinc-800/30' : ''
                      }`}
                    >
                      <button
                        onClick={() => isVisualizandoDiaAtual && completarHabito(habito)}
                        disabled={!isVisualizandoDiaAtual || completandoHabito === habito.id}
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          !isVisualizandoDiaAtual ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                        }`}
                        style={{ backgroundColor: habito.cor }}
                        title={!isVisualizandoDiaAtual ? t('canOnlyCompleteToday') : undefined}
                      >
                        {completandoHabito === habito.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-white" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-400 line-through truncate">{habito.nome}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {habito.horario && (
                          <span className="text-xs text-zinc-600 hidden sm:block">{habito.horario}</span>
                        )}
                        <div className="flex items-center gap-0.5 text-orange-500/50">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{habito.sequenciaAtual}</span>
                        </div>
                        <button
                          onClick={() => {
                            setHabitoSelecionado(habito);
                            setModalExcluirHabito(true);
                          }}
                          className="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estatísticas Avançadas */}
      {estatisticas && estatisticas.calendarioStreak && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Calendário de Streak */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                {t('streakCalendar')}
              </CardTitle>
              <p className="text-xs text-zinc-500">
                {estatisticas.diasComHabitos > 90 ? t('last90Days') : t('allTime')}
              </p>
            </CardHeader>
            <CardContent>
              <StreakCalendar dados={estatisticas.calendarioStreak} />
            </CardContent>
          </Card>

          {/* Gráfico de Tendência */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                {t('weeklyTrend')}
              </CardTitle>
              <p className="text-xs text-zinc-500">
                {estatisticas.diasComHabitos > 84 ? t('last12Weeks') : t('allTime')}
              </p>
            </CardHeader>
            <CardContent>
              <TrendChart dados={estatisticas.tendenciaSemanal} />
            </CardContent>
          </Card>

          {/* Taxa de Sucesso por Dia da Semana */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                {t('successByWeekday')}
              </CardTitle>
              <p className="text-xs text-zinc-500">
                {estatisticas.diasComHabitos > 90 ? t('last90Days') : t('allTime')}
              </p>
            </CardHeader>
            <CardContent>
              <WeekdayStats
                dados={estatisticas.estatisticasPorDia}
                melhorDia={estatisticas.melhorDia}
                piorDia={estatisticas.piorDia}
              />
            </CardContent>
          </Card>

          {/* Métricas Gerais */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                {t('overallMetrics')}
              </CardTitle>
              <p className="text-xs text-zinc-500">
                {estatisticas.diasComHabitos > 90 ? t('last90Days') : t('allTime')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Taxa de Sucesso Geral */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-zinc-400">{t('overallSuccessRate')}</span>
                </div>
                <span className="text-lg font-bold text-white">{estatisticas.taxaSucessoGeral}%</span>
              </div>

              {/* Dias Completos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-zinc-400">{t('perfectDays')}</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {estatisticas.diasCompletosTotal}/{estatisticas.diasComHabitos}
                </span>
              </div>

              {/* Melhor Semana */}
              {estatisticas.melhorSemana && estatisticas.melhorSemana.taxa > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-zinc-400">{t('bestWeek')}</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {estatisticas.melhorSemana.taxa}%
                    <span className="text-xs font-normal text-zinc-500 ml-1">
                      ({t('week')} {estatisticas.melhorSemana.semana})
                    </span>
                  </span>
                </div>
              )}

              {/* Barra de Progresso Visual */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>{t('consistency')}</span>
                  <span>{estatisticas.taxaSucessoGeral}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${estatisticas.taxaSucessoGeral}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Novo Hábito - Simplificado */}
      <Dialog open={modalHabitoAberto} onOpenChange={setModalHabitoAberto}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{t('newHabit')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Nome */}
            <div>
              <Label htmlFor="nome-habito" className="text-zinc-300">{t('habitName')}</Label>
              <Input
                id="nome-habito"
                value={novoHabito.nome}
                onChange={(e) => setNovoHabito({ ...novoHabito, nome: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1.5"
                placeholder={t('habitNamePlaceholder')}
                autoFocus
              />
            </div>

            {/* Horário */}
            <div>
              <Label htmlFor="horario-habito" className="text-zinc-300">{t('time')} <span className="text-zinc-500">({t('optional')})</span></Label>
              <Input
                id="horario-habito"
                type="time"
                value={novoHabito.horario}
                onChange={(e) => setNovoHabito({ ...novoHabito, horario: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1.5"
              />
            </div>

            {/* Dias da Semana */}
            <div>
              <Label className="text-zinc-300">{t('repeatOn')}</Label>
              <p className="text-xs text-zinc-500 mb-2">{t('leaveEmptyForEveryday')}</p>
              <div className="flex gap-2">
                {DIAS_SEMANA.map((dia) => (
                  <button
                    key={dia.valor}
                    type="button"
                    onClick={() => toggleDiaSemana(dia.valor)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      novoHabito.diasSemana.includes(dia.valor)
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                    title={dia.nome}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor */}
            <div>
              <Label className="text-zinc-300">{t('color')}</Label>
              <div className="flex gap-2 mt-2">
                {CORES.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setNovoHabito({ ...novoHabito, cor })}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      novoHabito.cor === cor ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => setModalHabitoAberto(false)}
                className="text-zinc-400 hover:text-white"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={criarHabito}
                disabled={!novoHabito.nome || criandoHabito}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {criandoHabito ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('creating')}
                  </>
                ) : (
                  t('create')
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão */}
      <ConfirmModal
        open={modalExcluirHabito}
        onClose={() => {
          setModalExcluirHabito(false);
          setHabitoSelecionado(null);
        }}
        onConfirm={excluirHabito}
        title={t('deleteHabit')}
        description={t('deleteHabitConfirmation')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </div>
  );
}
