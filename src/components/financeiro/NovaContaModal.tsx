'use client';

import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';

interface NovaContaModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

const CORES_DISPONIVEIS = [
  { nome: 'Verde', valor: '#10B981' },
  { nome: 'Azul', valor: '#3B82F6' },
  { nome: 'Roxo', valor: '#8B5CF6' },
  { nome: 'Rosa', valor: '#EC4899' },
  { nome: 'Laranja', valor: '#F59E0B' },
  { nome: 'Vermelho', valor: '#EF4444' },
  { nome: 'Ciano', valor: '#06B6D4' },
  { nome: 'Índigo', valor: '#6366F1' },
];

export default function NovaContaModal({ aberto, onFechar, onSucesso }: NovaContaModalProps) {
  const [carregando, setCarregando] = useState(false);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO'>('CORRENTE');
  const [banco, setBanco] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [cor, setCor] = useState('#10B981');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const body = {
        nome,
        tipo,
        banco: banco || undefined,
        saldoInicial: parseFloat(saldoInicial.replace(',', '.')) || 0,
        cor,
        icone: 'wallet',
      };

      const response = await fetch('/api/v1/financeiro/contas', {
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
        alert(error.error || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar conta');
    } finally {
      setCarregando(false);
    }
  };

  const limparFormulario = () => {
    setNome('');
    setTipo('CORRENTE');
    setBanco('');
    setSaldoInicial('');
    setCor('#10B981');
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-white border-[#E3E1D6] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0E2A3F]">
            Nova Conta Bancária
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <Label className="text-[#44586A]">Nome da Conta *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Nubank, Banco do Brasil"
              required
              className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
            />
          </div>

          {/* Tipo */}
          <div>
            <Label className="text-[#44586A]">Tipo *</Label>
            <Select value={tipo} onValueChange={(v: string) => setTipo(v as 'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO')}>
              <SelectTrigger className="bg-white border-[#D9D7CB] text-[#0E2A3F]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E3E1D6]">
                <SelectItem value="CORRENTE" className="text-[#0E2A3F] hover:bg-[#F4F3EC]">
                  Conta Corrente
                </SelectItem>
                <SelectItem value="POUPANCA" className="text-[#0E2A3F] hover:bg-[#F4F3EC]">
                  Poupança
                </SelectItem>
                <SelectItem value="INVESTIMENTO" className="text-[#0E2A3F] hover:bg-[#F4F3EC]">
                  Investimento
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Banco */}
          <div>
            <Label className="text-[#44586A]">Banco</Label>
            <Input
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              placeholder="Ex: Nubank, Itaú"
              className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
            />
          </div>

          {/* Saldo Inicial */}
          <div>
            <Label className="text-[#44586A]">Saldo Inicial</Label>
            <Input
              type="number"
              step="0.01"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              placeholder="0,00"
              className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
            />
          </div>

          {/* Cor */}
          <div>
            <Label className="text-[#44586A]">Cor</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {CORES_DISPONIVEIS.map((corOpt) => (
                <button
                  key={corOpt.valor}
                  type="button"
                  onClick={() => setCor(corOpt.valor)}
                  className={`h-10 rounded-lg transition-all ${
                    cor === corOpt.valor ? 'ring-2 ring-[#0E2A3F] ring-offset-2 ring-offset-white' : ''
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
              className="flex-1 bg-white border border-[#E9E7DC] text-[#44586A] hover:bg-[#F4F3EC]"
              disabled={carregando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={carregando}
              className="flex-1 bg-[#178E96] hover:bg-[#117178] text-white"
            >
              {carregando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}