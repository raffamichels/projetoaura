'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Target, Shield } from 'lucide-react';

interface NovoObjetivoModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

const CORES_DISPONIVEIS = [
  { nome: 'Laranja', valor: '#F59E0B' },
  { nome: 'Roxo', valor: '#8B5CF6' },
  { nome: 'Rosa', valor: '#EC4899' },
  { nome: 'Verde', valor: '#10B981' },
  { nome: 'Azul', valor: '#3B82F6' },
  { nome: 'Vermelho', valor: '#EF4444' },
  { nome: 'Ciano', valor: '#06B6D4' },
  { nome: 'Índigo', valor: '#6366F1' },
];

export default function NovoObjetivoModal({ aberto, onFechar, onSucesso }: NovoObjetivoModalProps) {
  const [carregando, setCarregando] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorMeta, setValorMeta] = useState('');
  const [dataMeta, setDataMeta] = useState('');
  const [isReservaEmergencia, setIsReservaEmergencia] = useState(false);
  const [cor, setCor] = useState('#F59E0B');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const body = {
        nome,
        descricao: descricao || undefined,
        valorMeta: parseFloat(valorMeta.replace(',', '.')),
        dataMeta: dataMeta || undefined,
        isReservaEmergencia,
        cor,
        icone: isReservaEmergencia ? 'shield' : 'target',
      };

      const response = await fetch('/api/v1/financeiro/objetivos', {
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
        alert(error.error || 'Erro ao criar objetivo');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar objetivo');
    } finally {
      setCarregando(false);
    }
  };

  const limparFormulario = () => {
    setNome('');
    setDescricao('');
    setValorMeta('');
    setDataMeta('');
    setIsReservaEmergencia(false);
    setCor('#F59E0B');
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-white border-[#E3E1D6] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0E2A3F] flex items-center gap-2">
            {isReservaEmergencia ? (
              <>
                <Shield className="w-6 h-6 text-[#154F6D]" />
                Nova Reserva de Emergência
              </>
            ) : (
              <>
                <Target className="w-6 h-6 text-[#D9A441]" />
                Novo Objetivo Financeiro
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Objetivo */}
          <div className="flex items-center justify-between p-3 bg-[#F4F3EC] rounded-lg border border-[#E9E7DC]">
            <div>
              <Label className="text-[#0E2A3F]">Reserva de Emergência</Label>
              <p className="text-xs text-[#8395A5]">Objetivo prioritário de segurança</p>
            </div>
            <Switch
              checked={isReservaEmergencia}
              onCheckedChange={setIsReservaEmergencia}
            />
          </div>

          {/* Nome */}
          <div>
            <Label className="text-[#44586A]">Nome do Objetivo *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={isReservaEmergencia ? "Ex: Fundo de Emergência" : "Ex: Viagem para Paris"}
              required
              className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
            />
          </div>

          {/* Descrição */}
          <div>
            <Label className="text-[#44586A]">Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva seu objetivo..."
              rows={3}
              className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20 resize-none"
            />
          </div>

          {/* Valor Meta */}
          <div>
            <Label className="text-[#44586A]">Valor da Meta *</Label>
            <Input
              type="number"
              step="0.01"
              value={valorMeta}
              onChange={(e) => setValorMeta(e.target.value)}
              placeholder="0,00"
              required
              className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
            />
            {isReservaEmergencia && valorMeta && (
              <p className="text-xs text-[#8395A5] mt-1">
                💡 Recomendação: 6 meses de despesas mensais
              </p>
            )}
          </div>

          {/* Data Meta */}
          <div>
            <Label className="text-[#44586A]">Data da Meta</Label>
            <Input
              type="date"
              value={dataMeta}
              onChange={(e) => setDataMeta(e.target.value)}
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
                'Criar Objetivo'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}