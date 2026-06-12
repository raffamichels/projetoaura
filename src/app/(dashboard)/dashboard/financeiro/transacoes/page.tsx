'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, TrendUp, TrendDown, Calendar, MagnifyingGlass, Funnel, CreditCard, Wallet, Tag, DotsThreeVertical, PencilSimple, Trash, ArrowsDownUp } from '@phosphor-icons/react';
import { formatarMoeda } from '@/lib/financeiro-helper';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import NovaTransacaoModal from '@/components/financeiro/NovaTransacaoModal';

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: 'RECEITA' | 'DESPESA';
  isFixa: boolean;
  isParcela: boolean;
  parcelaNumero?: number;
  parcelaTotais?: number;
  categoria?: {
    nome: string;
    cor: string;
    icone: string;
  };
  contaBancaria?: {
    nome: string;
  };
  cartao?: {
    nome: string;
  };
}

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'RECEITA' | 'DESPESA'>('TODOS');
  const [busca, setBusca] = useState('');
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    carregarTransacoes();
  }, [filtroTipo]);

  const carregarTransacoes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroTipo !== 'TODOS') {
        params.append('tipo', filtroTipo);
      }
      
      const response = await fetch(`/api/v1/financeiro/transacoes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransacoes(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const transacoesFiltradas = transacoes.filter((t) =>
    t.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  const totalReceitas = transacoes
    .filter((t) => t.tipo === 'RECEITA')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter((t) => t.tipo === 'DESPESA')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="relative mb-8">
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-ink">
                Transações
              </h1>
              <p className="text-ink-soft mt-2">Gerencie suas receitas e despesas</p>
            </div>
            <Button
              onClick={() => setModalAberto(true)}
              className="bg-brand hover:bg-brand-dark text-white transition-colors duration-150"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Transação
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Receitas */}
            <Card className="relative overflow-hidden bg-surface border-line shadow-sm hover:border-green-200 dark:hover:border-green-500/30 transition-colors duration-150">
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ink-soft">Receitas</span>
                  <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                    <TrendUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatarMoeda(totalReceitas)}
                </div>
                <p className="text-xs text-ink-faint mt-1">
                  {transacoes.filter((t) => t.tipo === 'RECEITA').length} transações
                </p>
              </div>
            </Card>

            {/* Despesas */}
            <Card className="relative overflow-hidden bg-surface border-line shadow-sm hover:border-red-200 dark:hover:border-red-500/30 transition-colors duration-150">
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ink-soft">Despesas</span>
                  <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
                    <TrendDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatarMoeda(totalDespesas)}
                </div>
                <p className="text-xs text-ink-faint mt-1">
                  {transacoes.filter((t) => t.tipo === 'DESPESA').length} transações
                </p>
              </div>
            </Card>

            {/* Saldo */}
            <Card className="relative overflow-hidden bg-surface border-line shadow-sm hover:border-brand/40 transition-colors duration-150">
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ink-soft">Saldo</span>
                  <div className="p-2 bg-brand-soft rounded-lg">
                    <ArrowsDownUp className="w-5 h-5 text-brand-dark" />
                  </div>
                </div>
                <div className={`text-3xl font-bold ${saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatarMoeda(saldo)}
                </div>
                <p className="text-xs text-ink-faint mt-1">
                  Receitas - Despesas
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Busca */}
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
          <Input
            placeholder="Buscar transações..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-colors duration-150"
          />
        </div>

        {/* Filtros de Tipo */}
        <div className="flex gap-2">
          <Button
            variant={filtroTipo === 'TODOS' ? 'default' : 'default'}
            onClick={() => setFiltroTipo('TODOS')}
            className={filtroTipo === 'TODOS' 
              ? 'bg-brand-soft text-brand-dark font-semibold hover:bg-brand-soft'
              : 'bg-surface border border-line text-ink-soft hover:bg-surface-hover'
            }
          >
            Todas
          </Button>
          <Button
            variant={filtroTipo === 'RECEITA' ? 'default' : 'default'}
            onClick={() => setFiltroTipo('RECEITA')}
            className={filtroTipo === 'RECEITA' 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-surface border border-line text-ink-soft hover:bg-surface-hover'
            }
          >
            Receitas
          </Button>
          <Button
            variant={filtroTipo === 'DESPESA' ? 'default' : 'default'}
            onClick={() => setFiltroTipo('DESPESA')}
            className={filtroTipo === 'DESPESA' 
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-surface border border-line text-ink-soft hover:bg-surface-hover'
            }
          >
            Despesas
          </Button>
        </div>
      </div>

      {/* Lista de Transações */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      ) : transacoesFiltradas.length === 0 ? (
        <Card className="bg-surface border-line shadow-sm p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-soft rounded-full mb-4">
              <TrendUp className="w-8 h-8 text-brand-dark" />
            </div>
            <h3 className="text-xl font-semibold text-ink mb-2">
              Nenhuma transação encontrada
            </h3>
            <p className="text-ink-soft mb-6">
              Comece criando sua primeira transação
            </p>
            <Button
              onClick={() => setModalAberto(true)}
              className="bg-brand hover:bg-brand-dark text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {transacoesFiltradas.map((transacao) => (
            <Card
              key={transacao.id}
              className="bg-surface border-line shadow-sm hover:bg-surface-soft transition-colors duration-150 group"
            >
              <div className="p-4 flex items-center gap-4">
                <div
                  className={`relative p-3 rounded-xl ${
                    transacao.tipo === 'RECEITA'
                      ? 'bg-green-50 dark:bg-green-500/10'
                      : 'bg-red-50 dark:bg-red-500/10'
                  }`}
                >
                  {transacao.tipo === 'RECEITA' ? (
                    <TrendUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-ink truncate">
                      {transacao.descricao}
                    </h3>
                    {transacao.isFixa && (
                      <span className="px-2 py-0.5 bg-brand-soft text-brand-dark text-xs rounded-full">
                        Fixa
                      </span>
                    )}
                    {transacao.isParcela && (
                      <span className="px-2 py-0.5 bg-brand-soft text-brand-dark text-xs rounded-full">
                        {transacao.parcelaNumero}/{transacao.parcelaTotais}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-ink-soft">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(transacao.data), "dd 'de' MMM", { locale: ptBR })}
                    </div>
                    {transacao.categoria && (
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: transacao.categoria.cor }}
                        />
                        {transacao.categoria.nome}
                      </div>
                    )}
                    {transacao.contaBancaria && (
                      <div className="flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5" />
                        {transacao.contaBancaria.nome}
                      </div>
                    )}
                    {transacao.cartao && (
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        {transacao.cartao.nome}
                      </div>
                    )}
                  </div>
                </div>

                {/* Valor */}
                <div className="text-right">
                  <div
                    className={`text-xl font-bold ${
                      transacao.tipo === 'RECEITA' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transacao.tipo === 'RECEITA' ? '+' : '-'} {formatarMoeda(transacao.valor)}
                  </div>
                </div>

                {/* Menu de Ações */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setMenuAberto(menuAberto === transacao.id ? null : transacao.id)}
                  >
                    <DotsThreeVertical className="w-4 h-4" />
                  </Button>
                  
                  {menuAberto === transacao.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-line rounded-lg shadow-lg z-10">
                      <button className="w-full px-4 py-2 text-left text-sm text-ink-soft hover:bg-surface-hover flex items-center gap-2">
                        <PencilSimple className="w-4 h-4" />
                        Editar
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-surface-hover flex items-center gap-2">
                        <Trash className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Nova Transação */}
      <NovaTransacaoModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSucesso={() => {
          carregarTransacoes();
        }}
      />
    </div>
  );
}