'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/lib/financeiro-helper';
import NovaTransacaoModal from '@/components/financeiro/NovaTransacaoModal';

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
  estatisticas: {
    totalContas: number;
    totalCategorias: number;
    totalObjetivosAtivos: number;
    totalTransacoesMes: number;
  };
}

export default function FinanceiroDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inicializando, setInicializando] = useState(false);
  const [modalTransacaoAberto, setModalTransacaoAberto] = useState(false);

  useEffect(() => {
    inicializarCategorias();
  }, []);

  const inicializarCategorias = async () => {
    try {
      setInicializando(true);
      
      // Tentar inicializar categorias padrão (se já existir, a API retorna erro que ignoramos)
      await fetch('/api/v1/financeiro/categorias/inicializar', {
        method: 'POST',
      }).catch(() => {
        // Ignorar erro se categorias já existem
      });

      // Carregar dashboard
      await carregarDashboard();
    } finally {
      setInicializando(false);
    }
  };

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/financeiro/dashboard');
      
      if (response.ok) {
        const data = await response.json();
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || inicializando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-zinc-400">
            {inicializando ? 'Preparando seu módulo financeiro...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400">Erro ao carregar dados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Financeiro</h1>
          <p className="text-sm sm:text-base text-zinc-400">Visão geral das suas finanças</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setModalTransacaoAberto(true)}
            className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 h-auto py-2.5 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Saldo Total */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Saldo Total
            </CardTitle>
            <Wallet className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatarMoeda(dashboard.saldoContas)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {dashboard.estatisticas.totalContas} conta(s)
            </p>
          </CardContent>
        </Card>

        {/* Receitas do Mês */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Receitas
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatarMoeda(dashboard.resumoMensal.receitas)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Mês atual
            </p>
          </CardContent>
        </Card>

        {/* Despesas do Mês */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Despesas
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatarMoeda(dashboard.resumoMensal.despesas)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {dashboard.estatisticas.totalTransacoesMes} transações
            </p>
          </CardContent>
        </Card>

        {/* Sobra Mensal */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Sobra Mensal
            </CardTitle>
            <Target className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatarMoeda(dashboard.resumoMensal.sobra)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Após despesas fixas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Gastos por Categoria */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.gastosPorCategoria.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                Nenhuma despesa registrada este mês
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.gastosPorCategoria.slice(0, 5).map((cat) => (
                  <div key={cat.categoriaId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.cor }}
                        />
                        <span className="text-sm text-zinc-300">
                          {cat.categoriaNome}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {formatarMoeda(cat.total)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${cat.porcentagem}%`,
                          backgroundColor: cat.cor,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Receitas</span>
              <span className="text-green-500 font-medium">
                {formatarMoeda(dashboard.resumoMensal.receitas)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Despesas Fixas</span>
              <span className="text-red-500 font-medium">
                {formatarMoeda(dashboard.resumoMensal.despesasFixas)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Despesas Variáveis</span>
              <span className="text-red-500 font-medium">
                {formatarMoeda(dashboard.resumoMensal.despesasVariaveis)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Total em Objetivos</span>
              <span className="text-purple-500 font-medium">
                {formatarMoeda(dashboard.totalObjetivos)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 pt-4">
              <span className="text-white font-semibold">Saldo Livre</span>
              <span className="text-xl font-bold text-white">
                {formatarMoeda(dashboard.saldoLivre)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Button
          className="h-16 sm:h-20 border-zinc-800 hover:bg-zinc-800"
          onClick={() => window.location.href = '/dashboard/financeiro/contas'}
        >
          <div className="text-center">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-500" />
            <div className="text-xs sm:text-sm text-zinc-300">Contas e Cartões</div>
          </div>
        </Button>

        <Button
          className="h-16 sm:h-20 border-zinc-800 hover:bg-zinc-800"
          onClick={() => window.location.href = '/dashboard/financeiro/transacoes'}
        >
          <div className="text-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-500" />
            <div className="text-xs sm:text-sm text-zinc-300">Transações</div>
          </div>
        </Button>

        <Button
          className="h-16 sm:h-20 border-zinc-800 hover:bg-zinc-800"
          onClick={() => window.location.href = '/dashboard/financeiro/objetivos'}
        >
          <div className="text-center">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-500" />
            <div className="text-xs sm:text-sm text-zinc-300">Objetivos</div>
          </div>
        </Button>
      </div>

      {/* Modal de Nova Transação */}
      <NovaTransacaoModal
        aberto={modalTransacaoAberto}
        onFechar={() => setModalTransacaoAberto(false)}
        onSucesso={() => {
          carregarDashboard();
        }}
      />
    </div>
  );
}