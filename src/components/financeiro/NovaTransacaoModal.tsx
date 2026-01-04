'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NovaTransacaoModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

interface Categoria {
  id: string;
  nome: string;
  tipo: 'RECEITA' | 'DESPESA';
  cor: string;
}

interface Conta {
  id: string;
  nome: string;
}

interface Cartao {
  id: string;
  nome: string;
}

export default function NovaTransacaoModal({ aberto, onFechar, onSucesso }: NovaTransacaoModalProps) {
  const [carregando, setCarregando] = useState(false);
  const [tipo, setTipo] = useState<'RECEITA' | 'DESPESA'>('DESPESA');

  // Dados do formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [contaBancariaId, setContaBancariaId] = useState('');
  const [cartaoId, setCartaoId] = useState('');

  // Flags especiais
  const [isFixa, setIsFixa] = useState(false);
  const [isParcela, setIsParcela] = useState(false);
  const [parcelaTotais, setParcelaTotais] = useState('1');

  // Listas
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);

  useEffect(() => {
    if (aberto) {
      carregarDados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, tipo]);

  const carregarDados = async () => {
    try {
      const [catRes, contasRes, cartoesRes] = await Promise.all([
        fetch(`/api/v1/financeiro/categorias?tipo=${tipo}`),
        fetch('/api/v1/financeiro/contas'),
        fetch('/api/v1/financeiro/cartoes'),
      ]);

      if (catRes.ok) {
        const data = await catRes.json();
        setCategorias(data.data);
      }
      if (contasRes.ok) {
        const data = await contasRes.json();
        setContas(data.data);
      }
      if (cartoesRes.ok) {
        const data = await cartoesRes.json();
        setCartoes(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Handlers para conta e cartão (agora podem ter ambos)
  const handleContaChange = (value: string) => {
    setContaBancariaId(value);
  };

  const handleCartaoChange = (value: string) => {
    setCartaoId(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação: Conta bancária é OBRIGATÓRIA
    if (!contaBancariaId) {
      toast.error('Selecione uma conta bancária');
      return;
    }

    setCarregando(true);
    const loadingToast = toast.loading('Criando transação...');

    try {
      const valorNumerico = parseFloat(valor.replace(',', '.'));

      const body = {
        descricao,
        valor: valorNumerico,
        data,
        tipo,
        observacoes: observacoes || undefined,
        categoriaId: categoriaId || undefined,
        contaBancariaId: contaBancariaId || undefined,
        cartaoId: cartaoId || undefined,
        isFixa,
        isParcela,
        parcelaTotais: isParcela ? parseInt(parcelaTotais) : undefined,
      };

      const response = await fetch('/api/v1/financeiro/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        limparFormulario();
        toast.success(result.message || 'Transação criada com sucesso!', { id: loadingToast });
        onSucesso();
        onFechar();
      } else {
        toast.error(result.error || 'Erro ao criar transação', { id: loadingToast });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar transação. Tente novamente.', { id: loadingToast });
    } finally {
      setCarregando(false);
    }
  };

  const limparFormulario = () => {
    setDescricao('');
    setValor('');
    setData(new Date().toISOString().split('T')[0]);
    setObservacoes('');
    setCategoriaId('');
    setContaBancariaId('');
    setCartaoId('');
    setIsFixa(false);
    setIsParcela(false);
    setParcelaTotais('1');
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Nova Transação
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Registre uma nova receita ou despesa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Transação */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTipo('RECEITA')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipo === 'RECEITA'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              }`}
            >
              <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${tipo === 'RECEITA' ? 'text-green-400' : 'text-zinc-500'}`} />
              <span className={`font-semibold ${tipo === 'RECEITA' ? 'text-green-400' : 'text-zinc-400'}`}>
                Receita
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTipo('DESPESA')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipo === 'DESPESA'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              }`}
            >
              <TrendingDown className={`w-6 h-6 mx-auto mb-2 ${tipo === 'DESPESA' ? 'text-red-400' : 'text-zinc-500'}`} />
              <span className={`font-semibold ${tipo === 'DESPESA' ? 'text-red-400' : 'text-zinc-400'}`}>
                Despesa
              </span>
            </button>
          </div>

          {/* Descrição */}
          <div>
            <Label className="text-zinc-300">Descrição *</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Compra no mercado"
              required
              className="bg-zinc-900/50 border-zinc-800 focus:border-purple-500 text-white"
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Valor *</Label>
              <Input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                required
                className="bg-zinc-900/50 border-zinc-800 focus:border-purple-500 text-white"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Data *</Label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className="bg-zinc-900/50 border-zinc-800 focus:border-purple-500 text-white"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <Label className="text-zinc-300">Categoria</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.cor }} />
                      {cat.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conta Bancária (obrigatório) e Cartão (opcional) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-zinc-400 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <p>Toda transação deve estar vinculada a uma <strong>conta bancária</strong>. O cartão é opcional para registro adicional.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Conta Bancária *</Label>
                <Select value={contaBancariaId} onValueChange={handleContaChange}>
                  <SelectTrigger className={`bg-zinc-900/50 border-zinc-800 text-white ${!contaBancariaId ? 'border-red-500/50' : ''}`}>
                    <SelectValue placeholder="Selecionar conta" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {contas.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id} className="text-white hover:bg-zinc-800">
                        {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Cartão de Crédito (Opcional)</Label>
                <Select value={cartaoId} onValueChange={handleCartaoChange}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                    <SelectValue placeholder="Selecionar cartão" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {cartoes.map((cartao) => (
                      <SelectItem key={cartao.id} value={cartao.id} className="text-white hover:bg-zinc-800">
                        {cartao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!contaBancariaId && (
              <p className="text-xs text-red-400">
                ⚠️ Selecione uma conta bancária
              </p>
            )}
            {contaBancariaId && (
              <p className="text-xs text-green-400">
                ✓ Transação vinculada à conta {cartaoId && '(com informação de cartão)'}
              </p>
            )}
          </div>

          {/* Opções Especiais */}
          <div className="space-y-4 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
            {/* Despesa Fixa */}
            {tipo === 'DESPESA' && (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300">Despesa Fixa (Mensal)</Label>
                  <p className="text-xs text-zinc-500">Repete todo mês automaticamente</p>
                </div>
                <Switch
                  checked={isFixa}
                  onCheckedChange={setIsFixa}
                />
              </div>
            )}

            {/* Parcelamento */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300">Parcelar</Label>
                  <p className="text-xs text-zinc-500">Dividir em várias parcelas</p>
                </div>
                <Switch
                  checked={isParcela}
                  onCheckedChange={setIsParcela}
                />
              </div>
              {isParcela && (
                <div>
                  <Label className="text-zinc-300">Número de Parcelas</Label>
                  <Input
                    type="number"
                    min="2"
                    max="48"
                    value={parcelaTotais}
                    onChange={(e) => setParcelaTotais(e.target.value)}
                    className="bg-zinc-900/50 border-zinc-800 focus:border-purple-500 text-white"
                  />
                  {valor && (
                    <p className="text-xs text-zinc-500 mt-1">
                      {parcelaTotais}x de R$ {(parseFloat(valor.replace(',', '.')) / parseInt(parcelaTotais || '1')).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label className="text-zinc-300">Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais..."
              rows={3}
              className="bg-zinc-900/50 border-zinc-800 focus:border-purple-500 text-white resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onFechar}
              className="flex-1 border-zinc-800 hover:bg-zinc-800"
              disabled={carregando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={carregando || !contaBancariaId}
              className={`flex-1 ${
                tipo === 'RECEITA'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {carregando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Transação'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
