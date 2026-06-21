'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, Target, TrendUp, Calendar, CurrencyDollar, CheckCircle, Sparkle, Lightning, Shield } from '@phosphor-icons/react';
import { formatarDataFinanceira, formatarMoeda } from '@/lib/financeiro-helper';
import NovoObjetivoModal from '@/components/financeiro/NovoObjetivoModal';
import ContribuirObjetivoModal from '@/components/financeiro/ContribuirObjetivoModal';

interface Objetivo {
  id: string;
  nome: string;
  descricao?: string;
  valorMeta: number;
  valorAtual: number;
  dataInicio: string;
  dataMeta?: string;
  isReservaEmergencia: boolean;
  cor: string;
  icone: string;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  porcentagemAtingida: number;
  falta: number;
}

export default function ObjetivosPage() {
  const router = useRouter();
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalContribuirAberto, setModalContribuirAberto] = useState(false);
  const [objetivoSelecionado, setObjetivoSelecionado] = useState<Objetivo | null>(null);

  useEffect(() => {
    carregarObjetivos();
  }, []);

  const carregarObjetivos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/financeiro/objetivos');
      if (response.ok) {
        const data = await response.json();
        setObjetivos(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar objetivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const objetivosAtivos = objetivos.filter((obj) => obj.status === 'EM_ANDAMENTO');
  const objetivosConcluidos = objetivos.filter((obj) => obj.status === 'CONCLUIDO');
  const totalEconomizado = objetivosAtivos.reduce((acc, obj) => acc + obj.valorAtual, 0);
  const totalMetas = objetivosAtivos.reduce((acc, obj) => acc + obj.valorMeta, 0);

  return (
    <div className="p-4 lg:p-6 space-y-4 sm:space-y-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/financeiro')} className="text-ink-soft">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Financeiro
      </Button>
      <div className="relative mb-8">
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-surface border border-line rounded-xl shadow-sm">
                  <Target className="w-8 h-8 text-brand-dark" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-ink">
                    Objetivos Financeiros
                  </h1>
                  <p className="text-ink-soft">Transforme seus sonhos em realidade</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setModalAberto(true)}
              className="bg-brand hover:bg-brand-dark text-white transition-colors duration-150"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Objetivo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Economizado */}
            <Card className="relative overflow-hidden bg-surface border-line shadow-sm hover:border-green-200 dark:hover:border-green-500/30 transition-colors duration-150">
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                    <Sparkle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-ink-soft">Você já economizou</span>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {formatarMoeda(totalEconomizado)}
                </div>
                <p className="text-xs text-ink-faint">Continue assim! 🎯</p>
              </div>
            </Card>

            {/* Progresso Geral */}
            <Card className="relative overflow-hidden bg-surface border-line shadow-sm hover:border-brand/40 transition-colors duration-150">
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-brand-soft rounded-lg">
                    <TrendUp className="w-5 h-5 text-brand-dark" />
                  </div>
                  <span className="text-sm text-ink-soft">Progresso Geral</span>
                </div>
                <div className="text-3xl font-bold text-brand-dark mb-1">
                  {totalMetas > 0 ? Math.round((totalEconomizado / totalMetas) * 100) : 0}%
                </div>
                <p className="text-xs text-ink-faint">
                  Faltam {formatarMoeda(totalMetas - totalEconomizado)}
                </p>
              </div>
            </Card>

            {/* Objetivos Ativos */}
            <Card className="relative overflow-hidden bg-surface border-line shadow-sm hover:border-amber-200 dark:hover:border-amber-500/30 transition-colors duration-150">
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                    <Lightning className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  </div>
                  <span className="text-sm text-ink-soft">Objetivos Ativos</span>
                </div>
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-400 mb-1">
                  {objetivosAtivos.length}
                </div>
                <p className="text-xs text-ink-faint">
                  {objetivosConcluidos.length} concluídos
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Lista de Objetivos */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      ) : objetivosAtivos.length === 0 ? (
        <Card className="bg-surface border-line shadow-sm p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-soft rounded-full mb-4">
              <Target className="w-10 h-10 text-brand-dark" />
            </div>
            <h3 className="text-2xl font-semibold text-ink mb-2">
              Comece sua jornada financeira!
            </h3>
            <p className="text-ink-soft mb-6 max-w-md mx-auto">
              Defina seus objetivos e acompanhe seu progresso rumo à realização dos seus sonhos
            </p>
            <Button
              onClick={() => setModalAberto(true)}
              className="bg-brand hover:bg-brand-dark text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Objetivo
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {objetivosAtivos.map((objetivo) => (
            <Card
              key={objetivo.id}
              className="relative overflow-hidden bg-surface border-line shadow-sm hover:bg-surface-soft transition-colors duration-150 group"
            >
              {/* Barra de Progresso de Fundo */}
              <div 
                className="absolute bottom-0 left-0 h-1 transition-all"
                style={{ 
                  width: `${objetivo.porcentagemAtingida}%`,
                  backgroundColor: objetivo.cor
                }}
              />

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${objetivo.cor}10` }}
                    >
                      {objetivo.isReservaEmergencia ? (
                        <Shield className="w-6 h-6" style={{ color: objetivo.cor }} />
                      ) : (
                        <Target className="w-6 h-6" style={{ color: objetivo.cor }} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-ink">{objetivo.nome}</h3>
                      {objetivo.descricao && (
                        <p className="text-sm text-ink-soft">{objetivo.descricao}</p>
                      )}
                    </div>
                  </div>
                  {objetivo.isReservaEmergencia && (
                    <span className="px-3 py-1 bg-brand-soft text-brand-dark text-xs rounded-full flex items-center gap-1 border border-brand/20">
                      <Shield className="w-3 h-3" />
                      Emergência
                    </span>
                  )}
                </div>

                {/* Progresso Visual */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-ink-soft">Progresso</span>
                    <span className="text-sm font-bold text-ink">
                      {Math.round(objetivo.porcentagemAtingida)}%
                    </span>
                  </div>
                  <div className="relative h-3 bg-line rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${objetivo.porcentagemAtingida}%`,
                        backgroundColor: objetivo.cor
                      }}
                    />
                  </div>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-ink-faint mb-1">Economizado</p>
                    <p className="text-lg font-bold text-ink">
                      {formatarMoeda(objetivo.valorAtual)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-faint mb-1">Falta</p>
                    <p className="text-lg font-bold" style={{ color: objetivo.cor }}>
                      {formatarMoeda(objetivo.falta)}
                    </p>
                  </div>
                </div>

                {/* Meta e Data */}
                <div className="flex items-center justify-between pt-4 border-t border-line">
                  <div className="flex items-center gap-2 text-sm text-ink-soft">
                    <CurrencyDollar className="w-4 h-4" />
                    Meta: {formatarMoeda(objetivo.valorMeta)}
                  </div>
                  {objetivo.dataMeta && (
                    <div className="flex items-center gap-2 text-sm text-ink-soft">
                      <Calendar className="w-4 h-4" />
                      {formatarDataFinanceira(objetivo.dataMeta)}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    setObjetivoSelecionado(objetivo);
                    setModalContribuirAberto(true);
                  }}
                  className="w-full mt-4 transition-all hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: `${objetivo.cor}10`,
                    color: objetivo.cor,
                    border: `1px solid ${objetivo.cor}20`
                  }}
                  variant="default"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Contribuir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Objetivos Concluídos */}
      {objetivosConcluidos.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-ink mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            Objetivos Concluídos 🎉
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {objetivosConcluidos.map((objetivo) => (
              <Card
                key={objetivo.id}
                className="bg-surface border-line shadow-sm hover:border-green-200 dark:hover:border-green-500/30 transition-colors duration-150"
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-ink">{objetivo.nome}</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatarMoeda(objetivo.valorMeta)}
                  </p>
                  <p className="text-xs text-ink-faint mt-1">Meta alcançada!</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Novo Objetivo */}
      <NovoObjetivoModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSucesso={() => {
          carregarObjetivos();
        }}
      />

      {/* Modal de Contribuir */}
      <ContribuirObjetivoModal
        aberto={modalContribuirAberto}
        onFechar={() => {
          setModalContribuirAberto(false);
          setObjetivoSelecionado(null);
        }}
        onSucesso={() => {
          carregarObjetivos();
        }}
        objetivo={objetivoSelecionado}
      />
    </div>
  );
}
