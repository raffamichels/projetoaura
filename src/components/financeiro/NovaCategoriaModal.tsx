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
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface NovaCategoriaModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

const CORES_DISPONIVEIS = [
  { nome: 'Roxo', valor: '#8B5CF6' },
  { nome: 'Rosa', valor: '#EC4899' },
  { nome: 'Azul', valor: '#3B82F6' },
  { nome: 'Verde', valor: '#10B981' },
  { nome: 'Laranja', valor: '#F59E0B' },
  { nome: 'Vermelho', valor: '#EF4444' },
  { nome: 'Ciano', valor: '#06B6D4' },
  { nome: 'Amarelo', valor: '#F59E0B' },
];

export default function NovaCategoriaModal({ aberto, onFechar, onSucesso }: NovaCategoriaModalProps) {
  const [carregando, setCarregando] = useState(false);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'RECEITA' | 'DESPESA'>('DESPESA');
  const [cor, setCor] = useState('#8B5CF6');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const body = {
        nome,
        tipo,
        cor,
        icone: 'tag',
      };

      const response = await fetch('/api/v1/financeiro/categorias', {
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
        alert(error.error || 'Erro ao criar categoria');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar categoria');
    } finally {
      setCarregando(false);
    }
  };

  const limparFormulario = () => {
    setNome('');
    setTipo('DESPESA');
    setCor('#8B5CF6');
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-white border-[#E3E1D6] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0E2A3F]">
            Nova Categoria
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Categoria */}
          <div>
            <Label className="text-[#44586A] mb-3 block">Tipo *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo('RECEITA')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipo === 'RECEITA'
                    ? 'border-green-600 bg-green-50'
                    : 'border-[#E9E7DC] bg-white hover:border-[#D9D7CB]'
                }`}
              >
                <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${tipo === 'RECEITA' ? 'text-green-600' : 'text-[#8395A5]'}`} />
                <span className={`font-semibold ${tipo === 'RECEITA' ? 'text-green-600' : 'text-[#44586A]'}`}>
                  Receita
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTipo('DESPESA')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipo === 'DESPESA'
                    ? 'border-red-600 bg-red-50'
                    : 'border-[#E9E7DC] bg-white hover:border-[#D9D7CB]'
                }`}
              >
                <TrendingDown className={`w-6 h-6 mx-auto mb-2 ${tipo === 'DESPESA' ? 'text-red-600' : 'text-[#8395A5]'}`} />
                <span className={`font-semibold ${tipo === 'DESPESA' ? 'text-red-600' : 'text-[#44586A]'}`}>
                  Despesa
                </span>
              </button>
            </div>
          </div>

          {/* Nome */}
          <div>
            <Label className="text-[#44586A]">Nome da Categoria *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Assinaturas, Lazer, Freelance"
              required
              className="bg-white border-[#D9D7CB] text-[#0E2A3F] placeholder:text-[#8395A5] focus:border-[#178E96] focus:ring-[#178E96]/20"
            />
            <p className="text-xs text-[#8395A5] mt-1">
              Escolha um nome descritivo e fácil de identificar
            </p>
          </div>

          {/* Cor */}
          <div>
            <Label className="text-[#44586A] mb-2 block">Cor</Label>
            <div className="grid grid-cols-4 gap-2">
              {CORES_DISPONIVEIS.map((corOpt) => (
                <button
                  key={corOpt.valor}
                  type="button"
                  onClick={() => setCor(corOpt.valor)}
                  className={`h-12 rounded-lg transition-all hover:scale-110 ${
                    cor === corOpt.valor ? 'ring-2 ring-[#0E2A3F] ring-offset-2 ring-offset-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: corOpt.valor }}
                  title={corOpt.nome}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-[#F4F3EC] rounded-lg border border-[#E9E7DC]">
            <Label className="text-[#44586A] text-xs mb-2 block">Preview</Label>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${cor}20` }}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cor }} />
              </div>
              <div>
                <p className="font-semibold text-[#0E2A3F]">
                  {nome || 'Nome da Categoria'}
                </p>
                <p className="text-xs text-[#8395A5]">
                  {tipo === 'RECEITA' ? 'Receita' : 'Despesa'}
                </p>
              </div>
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
              className={`flex-1 ${
                tipo === 'RECEITA'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {carregando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Criar Categoria'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}