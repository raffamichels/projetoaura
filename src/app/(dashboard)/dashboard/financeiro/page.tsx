'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  ChartDonut,
  CreditCard,
  Eye,
  EyeSlash,
  Plus,
  Receipt,
  Target,
  TrendDown,
  TrendUp,
  Wallet,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  dataHojeParaInput,
  formatarDataFinanceira,
  formatarMesFinanceiro,
  formatarMoeda,
} from '@/lib/financeiro-helper';
import NovaTransacaoModal from '@/components/financeiro/NovaTransacaoModal';

interface TransacaoRecente {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: 'RECEITA' | 'DESPESA';
  categoria?: { nome: string; cor: string };
  contaBancaria?: { nome: string };
  cartao?: { nome: string };
}

interface DashboardData {
  mes: string;
  resumoMensal: {
    receitas: number;
    despesas: number;
    saldo: number;
    despesasFixas: number;
    despesasVariaveis: number;
    sobra: number;
  };
  gastosPorCategoria: Array<{
    categoriaId: string;
    categoriaNome: string;
    cor: string;
    total: number;
    porcentagem: number;
  }>;
  saldoContas: number;
  totalObjetivos: number;
  saldoLivre: number;
  transacoesRecentes: TransacaoRecente[];
  estatisticas: {
    totalContas: number;
    totalCategorias: number;
    totalObjetivosAtivos: number;
    totalTransacoesMes: number;
  };
}

const mesCorrente = dataHojeParaInput().slice(0, 7);

export default function FinanceiroDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState(mesCorrente);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [categoriasProntas, setCategoriasProntas] = useState(false);
  const [modalTransacaoAberto, setModalTransacaoAberto] = useState(false);
  const [ocultarValores, setOcultarValores] = useState(false);

  useEffect(() => {
    const inicializarCategorias = async () => {
      await fetch('/api/v1/financeiro/categorias/inicializar', { method: 'POST' }).catch(() => null);
      setCategoriasProntas(true);
    };

    void inicializarCategorias();
  }, []);

  useEffect(() => {
    if (categoriasProntas) void carregarDashboard(mesSelecionado);
  }, [categoriasProntas, mesSelecionado]);

  const carregarDashboard = async (mes: string) => {
    try {
      setLoading(true);
      setErro('');
      const response = await fetch(`/api/v1/financeiro/dashboard?mes=${mes}`);
      if (!response.ok) throw new Error('Falha ao carregar dados financeiros');
      const data = await response.json();
      setDashboard(data.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setErro('Não foi possível carregar suas finanças. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const navegarMes = (direcao: number) => {
    const [ano, mes] = mesSelecionado.split('-').map(Number);
    const novaData = new Date(ano, mes - 1 + direcao, 1);
    const novoMes = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}`;
    setMesSelecionado(novoMes);
  };

  const exibirValor = (valor: number) => (ocultarValores ? '••••••' : formatarMoeda(valor));
  const percentualComprometido = dashboard?.resumoMensal.receitas
    ? Math.min((dashboard.resumoMensal.despesas / dashboard.resumoMensal.receitas) * 100, 100)
    : 0;

  if (!dashboard && (loading || !categoriasProntas)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-brand" />
          <p className="text-ink-soft">Organizando sua visão financeira...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-ink-soft">{erro || 'Não foi possível carregar os dados.'}</p>
        <Button onClick={() => carregarDashboard(mesSelecionado)}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className={`space-y-5 p-4 transition-opacity lg:p-6 ${loading ? 'opacity-60' : 'opacity-100'}`}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">Meu dinheiro</p>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Financeiro</h1>
          <p className="mt-1 text-sm text-ink-soft">Entenda o mês e decida seu próximo passo.</p>
        </div>
        <Button
          onClick={() => setModalTransacaoAberto(true)}
          className="h-11 w-full bg-brand text-white hover:bg-brand-dark sm:w-auto"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nova transação
        </Button>
      </header>

      <div className="flex items-center justify-between rounded-xl border border-line bg-surface p-2 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navegarMes(-1)} aria-label="Mês anterior">
          <CaretLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="font-semibold text-ink">{formatarMesFinanceiro(mesSelecionado)}</p>
          {mesSelecionado === mesCorrente && <p className="text-xs text-ink-faint">Mês atual</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navegarMes(1)}
          disabled={mesSelecionado >= mesCorrente}
          aria-label="Próximo mês"
        >
          <CaretRight className="h-5 w-5" />
        </Button>
      </div>

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-brand-dark to-brand shadow-lg">
        <CardContent className="p-5 text-white sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/75">
                {mesSelecionado === mesCorrente ? 'Saldo em contas' : 'Saldo ao fim do mês'}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{exibirValor(dashboard.saldoContas)}</p>
              <p className="mt-2 text-xs text-white/70">
                {dashboard.estatisticas.totalContas} {dashboard.estatisticas.totalContas === 1 ? 'conta conectada' : 'contas conectadas'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOcultarValores((valor) => !valor)}
              className="rounded-lg bg-white/10 p-2.5 transition-colors hover:bg-white/20"
              aria-label={ocultarValores ? 'Mostrar valores' : 'Ocultar valores'}
            >
              {ocultarValores ? <Eye className="h-5 w-5" /> : <EyeSlash className="h-5 w-5" />}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-white/70"><TrendUp /> Entradas</div>
              <p className="mt-1 font-semibold">{exibirValor(dashboard.resumoMensal.receitas)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-white/70"><TrendDown /> Saídas</div>
              <p className="mt-1 font-semibold">{exibirValor(dashboard.resumoMensal.despesas)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-white/70"><Wallet /> Balanço do mês</div>
              <p className="mt-1 font-semibold">{exibirValor(dashboard.resumoMensal.saldo)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ResumoCard
          titulo="Entradas"
          valor={exibirValor(dashboard.resumoMensal.receitas)}
          detalhe={`${dashboard.estatisticas.totalTransacoesMes} movimentações no mês`}
          icone={<TrendUp className="h-5 w-5 text-green-600 dark:text-green-400" />}
          cor="bg-green-50 dark:bg-green-500/10"
        />
        <ResumoCard
          titulo="Saídas"
          valor={exibirValor(dashboard.resumoMensal.despesas)}
          detalhe={`${percentualComprometido.toFixed(0)}% das entradas`}
          icone={<TrendDown className="h-5 w-5 text-red-600 dark:text-red-400" />}
          cor="bg-red-50 dark:bg-red-500/10"
        />
        <ResumoCard
          titulo="Livre para usar"
          valor={exibirValor(dashboard.saldoLivre)}
          detalhe={`${dashboard.estatisticas.totalObjetivosAtivos} objetivos ativos`}
          icone={<Target className="h-5 w-5 text-brand-dark" />}
          cor="bg-brand-soft"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="border-line bg-surface shadow-sm lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-ink">Para onde foi seu dinheiro</CardTitle>
              <p className="mt-1 text-sm text-ink-faint">Maiores categorias de despesas do mês</p>
            </div>
            <ChartDonut className="h-6 w-6 text-brand" />
          </CardHeader>
          <CardContent>
            {dashboard.gastosPorCategoria.length === 0 ? (
              <EstadoVazio texto="Nenhuma despesa registrada neste mês." />
            ) : (
              <div className="space-y-4">
                {dashboard.gastosPorCategoria.slice(0, 5).map((categoria) => (
                  <div key={categoria.categoriaId}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: categoria.cor }} />
                        <span className="truncate text-ink-soft">{categoria.categoriaNome}</span>
                        <span className="text-xs text-ink-faint">{categoria.porcentagem.toFixed(0)}%</span>
                      </div>
                      <span className="font-semibold text-ink">{exibirValor(categoria.total)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(categoria.porcentagem, 100)}%`, backgroundColor: categoria.cor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-line bg-surface shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-ink">Composição das saídas</CardTitle>
            <p className="text-sm text-ink-faint">O que é recorrente e o que varia</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <LinhaResumo label="Despesas fixas" valor={exibirValor(dashboard.resumoMensal.despesasFixas)} />
            <LinhaResumo label="Despesas variáveis" valor={exibirValor(dashboard.resumoMensal.despesasVariaveis)} />
            <LinhaResumo label="Guardado em objetivos" valor={exibirValor(dashboard.totalObjetivos)} />
            <div className="rounded-xl bg-surface-hover p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">Comprometimento da renda</span>
                <span className="font-semibold text-ink">{percentualComprometido.toFixed(0)}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full ${percentualComprometido > 80 ? 'bg-red-500' : 'bg-brand'}`}
                  style={{ width: `${percentualComprometido}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-line bg-surface shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-ink">Movimentações recentes</CardTitle>
              <p className="mt-1 text-sm text-ink-faint">Seus últimos lançamentos</p>
            </div>
            <Button variant="ghost" onClick={() => router.push('/dashboard/financeiro/transacoes')}>
              Ver todas <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {dashboard.transacoesRecentes.length === 0 ? (
              <EstadoVazio texto="Sua primeira transação aparecerá aqui." />
            ) : (
              <div className="divide-y divide-line">
                {dashboard.transacoesRecentes.slice(0, 5).map((transacao) => (
                  <div key={transacao.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        transacao.tipo === 'RECEITA' ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'
                      }`}
                    >
                      {transacao.tipo === 'RECEITA'
                        ? <TrendUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        : <TrendDown className="h-5 w-5 text-red-600 dark:text-red-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{transacao.descricao}</p>
                      <p className="truncate text-xs text-ink-faint">
                        {transacao.categoria?.nome || 'Sem categoria'} · {formatarDataFinanceira(transacao.data, { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <p className={`whitespace-nowrap font-semibold ${transacao.tipo === 'RECEITA' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {ocultarValores ? '••••••' : `${transacao.tipo === 'RECEITA' ? '+' : '−'} ${formatarMoeda(transacao.valor)}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-line bg-surface shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-ink">Acessos rápidos</CardTitle>
            <p className="text-sm text-ink-faint">Tudo no lugar certo</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Atalho icone={<Wallet />} titulo="Contas e cartões" detalhe="Saldos, limites e bancos" onClick={() => router.push('/dashboard/financeiro/contas')} />
            <Atalho icone={<Receipt />} titulo="Transações" detalhe="Histórico de entradas e saídas" onClick={() => router.push('/dashboard/financeiro/transacoes')} />
            <Atalho icone={<Target />} titulo="Objetivos" detalhe="Metas e reserva financeira" onClick={() => router.push('/dashboard/financeiro/objetivos')} />
            <Atalho icone={<CreditCard />} titulo="Categorias" detalhe="Organize seus lançamentos" onClick={() => router.push('/dashboard/financeiro/categorias')} />
          </CardContent>
        </Card>
      </section>

      <NovaTransacaoModal
        aberto={modalTransacaoAberto}
        onFechar={() => setModalTransacaoAberto(false)}
        onSucesso={() => carregarDashboard(mesSelecionado)}
      />
    </div>
  );
}

function ResumoCard({ titulo, valor, detalhe, icone, cor }: { titulo: string; valor: string; detalhe: string; icone: React.ReactNode; cor: string }) {
  return (
    <Card className="border-line bg-surface shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cor}`}>{icone}</div>
        <div className="min-w-0">
          <p className="text-sm text-ink-soft">{titulo}</p>
          <p className="truncate text-xl font-bold text-ink">{valor}</p>
          <p className="truncate text-xs text-ink-faint">{detalhe}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LinhaResumo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="font-semibold text-ink">{valor}</span>
    </div>
  );
}

function Atalho({ icone, titulo, detalhe, onClick }: { icone: React.ReactNode; titulo: string; detalhe: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface-hover">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">{icone}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{titulo}</span>
        <span className="block truncate text-xs text-ink-faint">{detalhe}</span>
      </span>
      <CaretRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function EstadoVazio({ texto }: { texto: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-faint">
      {texto}
    </div>
  );
}
