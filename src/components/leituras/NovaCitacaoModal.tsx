'use client';

import { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Midia } from '@/types/midia';

interface NovaCitacaoFormProps {
  onSubmit: (formData: { texto: string; autor: string; pagina: string; destaque: boolean; midiaId: string }) => Promise<void>;
  onCancel: () => void;
  midias: Midia[];
  loading?: boolean;
}

// Componente de formulário reutilizável
export function NovaCitacaoForm({ onSubmit, onCancel, midias, loading: externalLoading }: NovaCitacaoFormProps) {
  const [carregando, setCarregando] = useState(false);
  const [formData, setFormData] = useState({
    texto: '',
    autor: '',
    pagina: '',
    destaque: false,
    midiaId: '',
  });

  const loading = externalLoading !== undefined ? externalLoading : carregando;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      await onSubmit(formData);
      // Limpar formulário após sucesso
      setFormData({
        texto: '',
        autor: '',
        pagina: '',
        destaque: false,
        midiaId: '',
      });
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Texto */}
      <div>
        <Label htmlFor="texto" className="text-zinc-300">
          Citação <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="texto"
          value={formData.texto}
          onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white min-h-[120px] mt-1"
          placeholder="Digite a citação aqui..."
          required
        />
      </div>

      {/* Autor e Página */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="autor" className="text-zinc-300">Autor</Label>
          <Input
            id="autor"
            value={formData.autor}
            onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white mt-1"
            placeholder="Ex: Albert Einstein"
          />
        </div>
        <div>
          <Label htmlFor="pagina" className="text-zinc-300">Página</Label>
          <Input
            id="pagina"
            value={formData.pagina}
            onChange={(e) => setFormData({ ...formData, pagina: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white mt-1"
            placeholder="Ex: 42"
          />
        </div>
      </div>

      {/* Mídia */}
      <div>
        <Label htmlFor="midiaId" className="text-zinc-300">Associar a um livro/filme (opcional)</Label>
        <select
          id="midiaId"
          value={formData.midiaId}
          onChange={(e) => setFormData({ ...formData, midiaId: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white mt-1"
        >
          <option value="">Nenhum</option>
          {midias.map((midia) => (
            <option key={midia.id} value={midia.id}>
              {midia.tipo === 'LIVRO' ? '📚' : '🎬'} {midia.titulo}
            </option>
          ))}
        </select>
      </div>

      {/* Destaque */}
      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-md">
        <div>
          <Label htmlFor="destaque" className="cursor-pointer text-zinc-300">
            Adicionar aos destaques
          </Label>
          <p className="text-sm text-zinc-500">
            Citações em destaque aparecem na seção &quot;Frases Inspiradoras&quot;
          </p>
        </div>
        <Switch
          id="destaque"
          checked={formData.destaque}
          onCheckedChange={(checked) => setFormData({ ...formData, destaque: checked })}
        />
      </div>

      {/* Botões */}
      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="button"
          variant="default"
          onClick={onCancel}
          disabled={loading}
          className="border-zinc-700"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? 'Criando...' : 'Criar Citação'}
        </Button>
      </div>
    </form>
  );
}

interface NovaCitacaoModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
  midias: Midia[];
}

export function NovaCitacaoModal({ aberto, onFechar, onSucesso, midias }: NovaCitacaoModalProps) {
  const handleSubmit = async (formData: { texto: string; autor: string; pagina: string; destaque: boolean; midiaId: string }) => {
    const payload = {
      texto: formData.texto,
      autor: formData.autor || null,
      pagina: formData.pagina || null,
      destaque: formData.destaque,
      midiaId: formData.midiaId || null,
    };

    const res = await fetch('/api/v1/leituras/citacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onSucesso();
      onFechar();
    } else {
      const error = await res.json();
      alert(error.error || 'Erro ao criar citação');
      throw new Error('Erro ao criar citação');
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Citação</DialogTitle>
        </DialogHeader>

        <NovaCitacaoForm
          onSubmit={handleSubmit}
          onCancel={onFechar}
          midias={midias}
        />
      </DialogContent>
    </Dialog>
  );
}
