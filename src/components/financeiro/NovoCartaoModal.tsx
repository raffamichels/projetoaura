'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@phosphor-icons/react';
import { parseValorMonetario } from '@/lib/financeiro-helper';

interface NovoCartaoModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

const CORES_DISPONIVEIS = [
  { nome: 'Azul', valor: '#3B82F6' },
  { nome: 'Roxo', valor: '#8B5CF6' },
  { nome: 'Rosa', valor: '#EC4899' },
  { nome: 'Verde', valor: '#10B981' },
  { nome: 'Laranja', valor: '#F59E0B' },
  { nome: 'Vermelho', valor: '#EF4444' },
  { nome: 'Ciano', valor: '#06B6D4' },
  { nome: 'Índigo', valor: '#6366F1' },
];

export default function NovoCartaoModal({ aberto, onFechar, onSucesso }: NovoCartaoModalProps) {
  const [carregando, setCarregando] = useState(false);
  const [nome, setNome] = useState('');
  const [bandeira, setBandeira] = useState('');
  const [ultimosDigitos, setUltimosDigitos] = useState('');
  const [limite, setLimite] = useState('');
  const [diaVencimento, setDiaVencimento] = useState('');
  const [diaFechamento, setDiaFechamento] = useState('');
  const [cor, setCor] = useState('#3B82F6');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const body = {
        nome,
        bandeira: bandeira || undefined,
        ultimosDigitos: ultimosDigitos || undefined,
        limite: limite ? parseValorMonetario(limite) : undefined,
        diaVencimento: diaVencimento ? parseInt(diaVencimento) : undefined,
        diaFechamento: diaFechamento ? parseInt(diaFechamento) : undefined,
        cor,
        icone: 'credit-card',
      };

      const response = await fetch('/api/v1/financeiro/cartoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        limparFormulario();
        onSucesso();
        onFechar();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar cartão');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar cartão');
    } finally {
      setCarregando(false);
    }
  };

  const limparFormulario = () => {
    setNome('');
    setBandeira('');
    setUltimosDigitos('');
    setLimite('');
    setDiaVencimento('');
    setDiaFechamento('');
    setCor('#3B82F6');
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-surface border-line max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ink">
            Novo Cartão de Crédito
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <Label className="text-ink-soft">Nome do Cartão *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Nubank Mastercard"
              required
              className="bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
            />
          </div>

          {/* Bandeira e Últimos Dígitos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-ink-soft">Bandeira</Label>
              <Input
                value={bandeira}
                onChange={(e) => setBandeira(e.target.value)}
                placeholder="Visa, Mastercard"
                className="bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
              />
            </div>
            <div>
              <Label className="text-ink-soft">Últimos 4 Dígitos</Label>
              <Input
                value={ultimosDigitos}
                onChange={(e) => setUltimosDigitos(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                maxLength={4}
                className="bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
              />
            </div>
          </div>

          {/* Limite */}
          <div>
            <Label className="text-ink-soft">Limite</Label>
            <Input
              type="number"
              step="0.01"
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              placeholder="0,00"
              className="bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-ink-soft">Dia do Vencimento</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(e.target.value)}
                placeholder="15"
                className="bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
              />
            </div>
            <div>
              <Label className="text-ink-soft">Dia do Fechamento</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={diaFechamento}
                onChange={(e) => setDiaFechamento(e.target.value)}
                placeholder="10"
                className="bg-surface border-line-strong text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20"
              />
            </div>
          </div>

          {/* Cor */}
          <div>
            <Label className="text-ink-soft">Cor</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {CORES_DISPONIVEIS.map((corOpt) => (
                <button
                  key={corOpt.valor}
                  type="button"
                  onClick={() => setCor(corOpt.valor)}
                  className={`h-10 rounded-lg transition-all ${
                    cor === corOpt.valor ? 'ring-2 ring-navy ring-offset-2 ring-offset-white' : ''
                  }`}
                  style={{ backgroundColor: corOpt.valor }}
                  title={corOpt.nome}
                />
              ))}
            </div>
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
              disabled={carregando}
              className="flex-1 bg-brand-blue hover:bg-navy text-white"
            >
              {carregando ? (
                <>
                  <Spinner className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Criar Cartão'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
