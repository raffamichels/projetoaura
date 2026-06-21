'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowCounterClockwise, ArrowLeft, Plus, Wallet, CreditCard, TrendUp, TrendDown, Buildings, Eye, EyeSlash, DotsThreeVertical, PencilSimple, Trash, Archive } from '@phosphor-icons/react';
import { formatarMoeda } from '@/lib/financeiro-helper';
import NovaContaModal from '@/components/financeiro/NovaContaModal';
import NovoCartaoModal from '@/components/financeiro/NovoCartaoModal';
import { toast } from 'sonner';

interface ContaBancaria {
  id: string;
  nome: string;
  tipo: 'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO';
  banco?: string;
  saldoAtual: number;
  cor: string;
  icone: string;
  ativa: boolean;
}

interface Cartao {
  id: string;
  nome: string;
  bandeira?: string;
  ultimosDigitos?: string;
  limite?: number;
  diaVencimento?: number;
  diaFechamento?: number;
  cor: string;
  ativo: boolean;
  faturaAtual?: number;
  proximaFatura?: number;
  limiteComprometido?: number;
  limiteDisponivel?: number | null;
}

export default function ContasPage() {
  const router = useRouter();
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [ocultarSaldos, setOcultarSaldos] = useState(false);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [modalContaAberto, setModalContaAberto] = useState(false);
  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<ContaBancaria | null>(null);
  const [cartaoSelecionado, setCartaoSelecionado] = useState<Cartao | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [contasRes, cartoesRes] = await Promise.all([
        fetch('/api/v1/financeiro/contas'),
        fetch('/api/v1/financeiro/cartoes'),
      ]);

      if (contasRes.ok) {
        const contasData = await contasRes.json();
        setContas(contasData.data);
      }

      if (cartoesRes.ok) {
        const cartoesData = await cartoesRes.json();
        setCartoes(cartoesData.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const contasAtivas = contas.filter((c) => c.ativa);
  const cartoesAtivos = cartoes.filter((c) => c.ativo);
  const contasArquivadas = contas.filter((c) => !c.ativa);
  const cartoesDesativados = cartoes.filter((c) => !c.ativo);
  
  const saldoTotal = contasAtivas.reduce((acc, conta) => acc + conta.saldoAtual, 0);

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      CORRENTE: 'Conta Corrente',
      POUPANCA: 'Poupança',
      INVESTIMENTO: 'Investimento',
    };
    return labels[tipo] || tipo;
  };

  const atualizarConta = async (conta: ContaBancaria, ativa: boolean) => {
    const response = await fetch(`/api/v1/financeiro/contas/${conta.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...conta, ativa, icone: 'wallet' }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao atualizar conta');
  };

  const arquivarConta = async (conta: ContaBancaria) => {
    try {
      await atualizarConta(conta, false);
      toast.success('Conta arquivada');
      setMenuAberto(null);
      await carregarDados();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao arquivar conta');
    }
  };

  const excluirItem = async (tipo: 'contas' | 'cartoes', id: string, nome: string) => {
    if (!window.confirm(`Excluir "${nome}" permanentemente?`)) return;
    try {
      const response = await fetch(`/api/v1/financeiro/${tipo}/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao excluir');
      toast.success(tipo === 'contas' ? 'Conta excluída' : 'Cartão excluído');
      setMenuAberto(null);
      await carregarDados();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir');
    }
  };

  const desativarCartao = async (cartao: Cartao) => {
    try {
      const response = await fetch(`/api/v1/financeiro/cartoes/${cartao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cartao, ativo: false, icone: 'credit-card' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao desativar cartão');
      toast.success('Cartão desativado');
      setMenuAberto(null);
      await carregarDados();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao desativar cartão');
    }
  };

  const restaurarConta = async (conta: ContaBancaria) => {
    try {
      await atualizarConta(conta, true);
      toast.success('Conta restaurada');
      await carregarDados();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao restaurar conta');
    }
  };

  const restaurarCartao = async (cartao: Cartao) => {
    try {
      const response = await fetch(`/api/v1/financeiro/cartoes/${cartao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cartao, ativo: true, icone: 'credit-card' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao restaurar cartão');
      toast.success('Cartão restaurado');
      await carregarDados();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao restaurar cartão');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 sm:space-y-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/financeiro')} className="text-ink-soft">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Financeiro
      </Button>
      <div className="relative mb-8">
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-ink">
                Contas e Cartões
              </h1>
              <p className="text-ink-soft mt-2">Gerencie seus recursos financeiros</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="default"
                className="bg-surface border border-line text-ink-soft hover:bg-surface-hover duration-150"
                onClick={() => setOcultarSaldos(!ocultarSaldos)}
              >
                {ocultarSaldos ? (
                  <Eye className="w-4 h-4 mr-2" />
                ) : (
                  <EyeSlash className="w-4 h-4 mr-2" />
                )}
                {ocultarSaldos ? 'Mostrar' : 'Ocultar'}
              </Button>
              <Button
                onClick={() => { setContaSelecionada(null); setModalContaAberto(true); }}
                className="bg-brand hover:bg-brand-dark text-white transition-colors duration-150"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Card de Saldo Total */}
          <Card className="relative overflow-hidden bg-surface border-line shadow-sm transition-colors duration-150 mb-6">
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
                    <Wallet className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-ink-soft mb-1">Saldo Total em Contas</p>
                    <div className="text-4xl font-bold text-ink">
                      {ocultarSaldos ? '••••••' : formatarMoeda(saldoTotal)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-ink-soft mb-2">Resumo</p>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-ink-faint">Contas</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">{contasAtivas.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-faint">Cartões</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{cartoesAtivos.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Seção de Contas Bancárias */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                Contas Bancárias
              </h2>
              <Button
                onClick={() => { setContaSelecionada(null); setModalContaAberto(true); }}
                variant="default"
                className="bg-surface border border-line text-ink-soft hover:bg-surface-hover duration-150"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </div>

            {contasAtivas.length === 0 ? (
              <Card className="bg-surface border-line shadow-sm p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full mb-4">
                    <Wallet className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-2">
                    Nenhuma conta cadastrada
                  </h3>
                  <p className="text-ink-soft mb-6">
                    Adicione suas contas bancárias para começar
                  </p>
                  <Button
                    onClick={() => { setContaSelecionada(null); setModalContaAberto(true); }}
                    className="bg-brand hover:bg-brand-dark text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Conta
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contasAtivas.map((conta) => (
                  <Card
                    key={conta.id}
                    className="relative overflow-hidden bg-surface border-line shadow-sm hover:bg-surface-soft transition-colors duration-150 group"
                  >
                    {/* Barra colorida no topo */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: conta.cor }}
                    />

                    <div className="relative p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-3 rounded-xl"
                            style={{ backgroundColor: `${conta.cor}10` }}
                          >
                            <Wallet className="w-6 h-6" style={{ color: conta.cor }} />
                          </div>
                          <div>
                            <h3 className="font-bold text-ink">{conta.nome}</h3>
                            <p className="text-xs text-ink-faint">{getTipoLabel(conta.tipo)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setMenuAberto(menuAberto === conta.id ? null : conta.id)}
                        >
                          <DotsThreeVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Banco */}
                      {conta.banco && (
                        <div className="flex items-center gap-2 text-sm text-ink-soft mb-4">
                          <Buildings className="w-4 h-4" />
                          {conta.banco}
                        </div>
                      )}

                      {/* Saldo */}
                      <div className="pt-4 border-t border-line">
                        <p className="text-xs text-ink-faint mb-1">Saldo Atual</p>
                        <div className="text-2xl font-bold text-ink">
                          {ocultarSaldos ? '••••••' : formatarMoeda(conta.saldoAtual)}
                        </div>
                      </div>

                      {/* Indicador de variação */}
                      <div className="mt-3 flex items-center gap-1 text-sm">
                        {conta.saldoAtual >= 0 ? (
                          <>
                            <TrendUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400">Positivo</span>
                          </>
                        ) : (
                          <>
                            <TrendDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-red-600 dark:text-red-400">Negativo</span>
                          </>
                        )}
                      </div>

                      {/* Menu */}
                      {menuAberto === conta.id && (
                        <div className="absolute right-4 top-16 w-48 bg-surface border border-line rounded-lg shadow-lg z-10">
                          <button onClick={() => { setContaSelecionada(conta); setModalContaAberto(true); setMenuAberto(null); }} className="w-full px-4 py-2 text-left text-sm text-ink-soft hover:bg-surface-hover flex items-center gap-2">
                            <PencilSimple className="w-4 h-4" />
                            Editar
                          </button>
                          <button onClick={() => void arquivarConta(conta)} className="w-full px-4 py-2 text-left text-sm text-ink-soft hover:bg-surface-hover flex items-center gap-2">
                            <Archive className="w-4 h-4" />
                            Arquivar
                          </button>
                          <button onClick={() => void excluirItem('contas', conta.id, conta.nome)} className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-surface-hover flex items-center gap-2">
                            <Trash className="w-4 h-4" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Seção de Cartões */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Cartões de Crédito
              </h2>
              <Button
                onClick={() => { setCartaoSelecionado(null); setModalCartaoAberto(true); }}
                variant="default"
                className="bg-surface border border-line text-ink-soft hover:bg-surface-hover duration-150"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cartão
              </Button>
            </div>

            {cartoesAtivos.length === 0 ? (
              <Card className="bg-surface border-line shadow-sm p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full mb-4">
                    <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-2">
                    Nenhum cartão cadastrado
                  </h3>
                  <p className="text-ink-soft mb-6">
                    Adicione seus cartões de crédito para controlar gastos
                  </p>
                  <Button
                    onClick={() => { setCartaoSelecionado(null); setModalCartaoAberto(true); }}
                    className="bg-brand hover:bg-brand-dark text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Cartão
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cartoesAtivos.map((cartao) => (
                  <Card
                    key={cartao.id}
                    className="relative overflow-hidden bg-surface border-line shadow-sm hover:bg-surface-soft transition-colors duration-150 group"
                  >
                    {/* Barra colorida no topo */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: cartao.cor }}
                    />

                    <div className="relative p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-3 rounded-xl"
                            style={{ backgroundColor: `${cartao.cor}10` }}
                          >
                            <CreditCard className="w-6 h-6" style={{ color: cartao.cor }} />
                          </div>
                          <div>
                            <h3 className="font-bold text-ink">{cartao.nome}</h3>
                            {cartao.bandeira && (
                              <p className="text-xs text-ink-faint">{cartao.bandeira}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setMenuAberto(menuAberto === cartao.id ? null : cartao.id)}
                        >
                          <DotsThreeVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Número do cartão */}
                      {cartao.ultimosDigitos && (
                        <div className="mb-4">
                          <p className="text-sm text-ink-soft">
                            •••• •••• •••• {cartao.ultimosDigitos}
                          </p>
                        </div>
                      )}

                      {/* Limite */}
                      {cartao.limite && (
                        <div className="pt-4 border-t border-line mb-4 space-y-3">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-xs text-ink-faint mb-1">Limite disponível</p>
                              <div className="text-xl font-bold text-ink">
                                {ocultarSaldos ? '••••••' : formatarMoeda(cartao.limiteDisponivel ?? cartao.limite)}
                              </div>
                            </div>
                            <p className="text-xs text-ink-faint">de {ocultarSaldos ? '•••' : formatarMoeda(cartao.limite)}</p>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-line">
                            <div
                              className="h-full rounded-full bg-brand transition-all"
                              style={{ width: `${Math.min(((cartao.limiteComprometido || 0) / cartao.limite) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-lg bg-surface-hover p-2">
                              <p className="text-ink-faint">Fatura atual</p>
                              <p className="font-semibold text-ink">{ocultarSaldos ? '•••' : formatarMoeda(cartao.faturaAtual || 0)}</p>
                            </div>
                            <div className="rounded-lg bg-surface-hover p-2">
                              <p className="text-ink-faint">Próxima fatura</p>
                              <p className="font-semibold text-ink">{ocultarSaldos ? '•••' : formatarMoeda(cartao.proximaFatura || 0)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Datas */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {cartao.diaVencimento && (
                          <div>
                            <p className="text-xs text-ink-faint">Vencimento</p>
                            <p className="text-ink-soft font-medium">Dia {cartao.diaVencimento}</p>
                          </div>
                        )}
                        {cartao.diaFechamento && (
                          <div>
                            <p className="text-xs text-ink-faint">Fechamento</p>
                            <p className="text-ink-soft font-medium">Dia {cartao.diaFechamento}</p>
                          </div>
                        )}
                      </div>

                      {/* Menu */}
                      {menuAberto === cartao.id && (
                        <div className="absolute right-4 top-16 w-48 bg-surface border border-line rounded-lg shadow-lg z-10">
                          <button onClick={() => { setCartaoSelecionado(cartao); setModalCartaoAberto(true); setMenuAberto(null); }} className="w-full px-4 py-2 text-left text-sm text-ink-soft hover:bg-surface-hover flex items-center gap-2">
                            <PencilSimple className="w-4 h-4" />
                            Editar
                          </button>
                          <button onClick={() => void desativarCartao(cartao)} className="w-full px-4 py-2 text-left text-sm text-ink-soft hover:bg-surface-hover flex items-center gap-2">
                            <Archive className="w-4 h-4" />
                            Desativar
                          </button>
                          <button onClick={() => void excluirItem('cartoes', cartao.id, cartao.nome)} className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-surface-hover flex items-center gap-2">
                            <Trash className="w-4 h-4" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div id="inativos">
              <div className="mb-4">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
                  <Archive className="h-6 w-6 text-ink-soft" /> Itens inativos
                </h2>
                <p className="mt-1 text-sm text-ink-faint">
                  Contas arquivadas e cartões desativados podem ser restaurados. Exclusões permanentes não aparecem aqui.
                </p>
              </div>
              {contasArquivadas.length === 0 && cartoesDesativados.length === 0 ? (
                <Card className="border-dashed border-line bg-surface p-6 text-center text-sm text-ink-faint">
                  Nenhuma conta arquivada ou cartão desativado.
                </Card>
              ) : <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {contasArquivadas.map((conta) => (
                  <Card key={conta.id} className="border-line bg-surface p-4 opacity-80">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-ink-faint" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{conta.nome}</p>
                        <p className="text-xs text-ink-faint">Conta arquivada</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => void restaurarConta(conta)}>
                        <ArrowCounterClockwise className="h-4 w-4" /> Restaurar
                      </Button>
                    </div>
                  </Card>
                ))}
                {cartoesDesativados.map((cartao) => (
                  <Card key={cartao.id} className="border-line bg-surface p-4 opacity-80">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-ink-faint" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{cartao.nome}</p>
                        <p className="text-xs text-ink-faint">Cartão desativado</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => void restaurarCartao(cartao)}>
                        <ArrowCounterClockwise className="h-4 w-4" /> Restaurar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>}
            </div>
        </div>
      )}

      {/* Modais */}
      <NovaContaModal
        aberto={modalContaAberto}
        conta={contaSelecionada}
        onFechar={() => { setModalContaAberto(false); setContaSelecionada(null); }}
        onSucesso={() => {
          carregarDados();
        }}
      />

      <NovoCartaoModal
        aberto={modalCartaoAberto}
        cartao={cartaoSelecionado}
        onFechar={() => { setModalCartaoAberto(false); setCartaoSelecionado(null); }}
        onSucesso={() => {
          carregarDados();
        }}
      />
    </div>
  );
}
