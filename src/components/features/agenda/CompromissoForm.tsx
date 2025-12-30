'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
//import { Calendar } from 'lucide-react';

interface CompromissoFormProps {
  onClose: () => void;
  onSave: (data: { id: string; titulo: string }) => void;
}

const categorias = [
  { value: 'trabalho', label: 'Trabalho', cor: '#8B5CF6' },
  { value: 'pessoal', label: 'Pessoal', cor: '#3B82F6' },
  { value: 'saude', label: 'Saúde', cor: '#10B981' },
  { value: 'estudo', label: 'Estudo', cor: '#F97316' },
  { value: 'lazer', label: 'Lazer', cor: '#EC4899' },
  { value: 'outro', label: 'Outro', cor: '#6B7280' },
];

export function CompromissoForm({ onClose, onSave }: CompromissoFormProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [categoria, setCategoria] = useState('trabalho');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/agenda/compromissos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          descricao,
          data: new Date(data).toISOString(),
          horaInicio,
          horaFim,
          categoria,
          cor: categorias.find(c => c.value === categoria)?.cor,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onSave(result.data);
        onClose();
      } else {
        alert('Erro ao criar compromisso');
      }
    } catch {
      alert('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="titulo" className="text-gray-300">
          Título *
        </Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Reunião com cliente"
          required
          className="bg-zinc-800/50 border-zinc-700 text-white"
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao" className="text-gray-300">
          Descrição
        </Label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Adicione detalhes sobre o compromisso..."
          rows={3}
          className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:border-aura-500 focus:ring-1 focus:ring-aura-500 resize-none"
        />
      </div>

      {/* Data */}
      <div className="space-y-2">
        <Label htmlFor="data" className="text-gray-300">
          Data *
        </Label>
        <Input
          id="data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          className="bg-zinc-800/50 border-zinc-700 text-white"
        />
      </div>

      {/* Horários */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="horaInicio" className="text-gray-300">
            Início *
          </Label>
          <Input
            id="horaInicio"
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
            className="bg-zinc-800/50 border-zinc-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="horaFim" className="text-gray-300">
            Término
          </Label>
          <Input
            id="horaFim"
            type="time"
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 text-white"
          />
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <Label className="text-gray-300">Categoria *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categorias.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategoria(cat.value)}
              className={`
                px-3 py-2 rounded-lg border text-sm font-medium transition-all
                ${categoria === cat.value
                  ? 'border-2 scale-105'
                  : 'border-zinc-700 hover:border-zinc-600'
                }
              `}
              style={{
                borderColor: categoria === cat.value ? cat.cor : undefined,
                backgroundColor: categoria === cat.value ? `${cat.cor}20` : undefined,
                color: categoria === cat.value ? cat.cor : undefined,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 border-zinc-700 hover:bg-zinc-800"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-aura-500 hover:bg-aura-600"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Compromisso'}
        </Button>
      </div>
    </form>
  );
}