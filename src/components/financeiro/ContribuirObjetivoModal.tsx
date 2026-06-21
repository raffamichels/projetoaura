'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner, Target, TrendUp } from '@phosphor-icons/react';
import { formatarMoeda, parseValorMonetario } from '@/lib/financeiro-helper';

interface ContribuirObjetivoModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
  objetivo: {
    id: string;
    nome: string;
    valorMeta: number;
    valorAtual: number;
    cor: string;
    falta: number;
  } | null;
}

interface Conta {
  id: string;
  nome: string;
}

export default function ContribuirObjetivoModal({ 
  aberto, 
  onFechar, 
  onSucesso,
  objetivo 
}: ContribuirObjetivoModalProps) {
  const [carregando, setCarregando] = useState(false);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [contaBancariaId, setContaBancariaId] = useState('');
  const [contas, setContas] = useState<Conta[]>([]);

  // Carregar contas quando o modal abrir
  useEffect(() => {
    if (aberto) {
      void carregarContas();
      setDescricao(objetivo ? `Contribuição para ${objetivo.nome}` : '');
    }
    // O carregamento deve ocorrer somente ao abrir ou trocar o objetivo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, objetivo]);

  const carregarContas = async () => {
    try {
      const response = await fetch('/api/v1/financeiro/contas');
      if (response.ok) {
        const data = await response.json();
        setContas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objetivo) return;

    setCarregando(true);

    try {
      const valorNumerico = parseValorMonetario(valor);
      
      const body = {
        valor: valorNumerico,
        descricao,
        contaBancariaId: contaBancariaId || undefined,
      };

      const response = await fetch(`/api/v1/financeiro/objetivos/${objetivo.id}/contribuir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        limparFormulario();
        onSucesso();
        onFechar();
        
        // Mostrar mensagem se objetivo foi concluído
        if (data.data.concluido) {
          alert(`🎉 Parabéns! Objetivo "${objetivo.nome}" concluído!`);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao contribuir');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao contribuir');
    } finally {
      setCarregando(false);
    }
  };

  const limparFormulario = () => {
    setValor('');
    setDescricao('');
    setContaBancariaId('');
  };

  if (!objetivo) return null;

  const valorNumerico = parseValorMonetario(valor);
  const novoTotal = objetivo.valorAtual + valorNumerico;
  const porcentagemAtual = (objetivo.valorAtual / objetivo.valorMeta) * 100;
  const novaPorcentagem = (novoTotal / objetivo.valorMeta) * 100;

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-surface border-line max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ink flex items-center gap-2">
            <Target className="w-6 h-6" style={{ color: objetivo.cor }} />
            Contribuir para Objetivo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações do Objetivo */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: `${objetivo.cor}08`,
              borderColor: `${objetivo.cor}30`
            }}
          >
            <h3 className="font-semibold text-ink mb-2">{objetivo.nome}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Progresso atual:</span>
                <span className="font-medium text-ink">
                  {formatarMoeda(objetivo.valorAtual)} de {formatarMoeda(objetivo.valorMeta)}
                </span>
              </div>
              <div className="w-full bg-line rounded-full h-2 mt-2">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{ 
                    width: `${porcentagemAtual}%`,
                    backgroundColor: objetivo.cor
                  }}
                />
              </div>
              <div className="flex justify-between text-ink-faint text-xs mt-1">
                <span>{Math.round(porcentagemAtual)}%</span>
                <span>Faltam {formatarMoeda(objetivo.falta)}</span>
              </div>
            </div>
          </div>

          {/* Valor */}
          <div>
            <Label className="text-ink-soft">Valor a Contribuir *</Label>
            <Input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              required
              className="bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 text-lg font-semibold"
            />
            {valorNumerico > 0 && (
              <div className="mt-2 p-3 bg-surface-hover rounded-lg border border-line">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <TrendUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-ink-soft">Após contribuição:</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-ink-soft text-sm">Novo total:</span>
                  <span className="font-semibold text-ink">
                    {formatarMoeda(novoTotal)}
                  </span>
                </div>
                <div className="w-full bg-line rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(novaPorcentagem, 100)}%`,
                      backgroundColor: objetivo.cor
                    }}
                  />
                </div>
                <div className="text-xs text-ink-faint mt-1">
                  {Math.round(novaPorcentagem)}% da meta
                </div>
                {novoTotal >= objetivo.valorMeta && (
                  <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-semibold">
                    🎉 Objetivo será concluído!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Descrição */}
          <div>
            <Label className="text-ink-soft">Descrição</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Contribuição mensal"
              className="bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
            />
          </div>

          {/* Conta */}
          <div>
            <Label className="text-ink-soft">Conta para Débito</Label>
            <Select value={contaBancariaId} onValueChange={setContaBancariaId}>
              <SelectTrigger className="bg-surface border-line-strong text-ink">
                <SelectValue placeholder="Selecionar conta (opcional)" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-line">
                {contas.map((conta) => (
                  <SelectItem key={conta.id} value={conta.id} className="text-ink hover:bg-surface-hover">
                    {conta.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="default"
              onClick={onFechar}
              className="flex-1 bg-surface border border-line text-ink-soft hover:bg-surface-hover"
              disabled={carregando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={carregando || valorNumerico <= 0}
              className="flex-1"
              style={{ 
                backgroundColor: objetivo.cor,
                opacity: valorNumerico <= 0 ? 0.5 : 1
              }}
            >
              {carregando ? (
                <>
                  <Spinner className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Contribuir'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
