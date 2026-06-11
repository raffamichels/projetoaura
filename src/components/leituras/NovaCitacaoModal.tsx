'use client';

import { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Midia } from '@/types/midia';
import { User, BookOpen, Star, Book, Clapperboard } from 'lucide-react';

// --- Interfaces ---

export interface NovaCitacaoValues {
  texto: string;
  autor: string;
  pagina: string;
  destaque: boolean;
  midiaId: string;
}

interface NovaCitacaoFormProps {
  onSubmit: (formData: NovaCitacaoValues) => Promise<void>;
  midias: Midia[];
  isSubmitting?: boolean;
}

// --- Sub-componente exportado para evitar erro no CitacoesModal ---

export function NovaCitacaoForm({ onSubmit, midias, isSubmitting }: NovaCitacaoFormProps) {
  const [formData, setFormData] = useState<NovaCitacaoValues>({
    texto: '',
    autor: '',
    pagina: '',
    destaque: false,
    midiaId: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form id="nova-citacao-form" onSubmit={handleSubmit} className="space-y-1">
      <textarea
        value={formData.texto}
        onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
        placeholder="Digite a citação aqui..."
        required
        className="w-full bg-transparent border-none text-[#0E2A3F] text-lg font-medium placeholder:text-[#8395A5] focus:outline-none focus:ring-0 py-2 resize-none min-h-30"
        autoFocus
      />

      <div className="border-t border-[#E9E7DC]" />

      <div className="space-y-0.5">
        <div className="flex items-center gap-3 py-2.5 px-1 hover:bg-[#F4F3EC] rounded-lg transition-colors">
          <User className="w-5 h-5 text-[#44586A] shrink-0" />
          <input
            type="text"
            value={formData.autor}
            onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
            placeholder="Autor"
            className="flex-1 bg-transparent border-none text-sm text-[#0E2A3F] placeholder:text-[#8395A5] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 py-2.5 px-1 hover:bg-[#F4F3EC] rounded-lg transition-colors">
          <BookOpen className="w-5 h-5 text-[#44586A] shrink-0" />
          <input
            type="text"
            value={formData.pagina}
            onChange={(e) => setFormData({ ...formData, pagina: e.target.value })}
            placeholder="Página (ex: 42)"
            className="flex-1 bg-transparent border-none text-sm text-[#0E2A3F] placeholder:text-[#8395A5] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 py-2.5 px-1 hover:bg-[#F4F3EC] rounded-lg transition-colors">
          {(() => {
            const selectedMidia = midias.find(m => m.id === formData.midiaId);
            return selectedMidia?.tipo === 'LIVRO' ? 
              <Book className="w-5 h-5 text-[#44586A] shrink-0" /> : 
              <Clapperboard className="w-5 h-5 text-[#44586A] shrink-0" />;
          })()}
          <select
            value={formData.midiaId}
            onChange={(e) => setFormData({ ...formData, midiaId: e.target.value })}
            className="flex-1 bg-transparent border-none text-sm text-[#0E2A3F] focus:outline-none appearance-none cursor-pointer"
          >
            <option value="" className="bg-white text-[#8395A5]">Associar a um livro/filme (opcional)</option>
            {midias.map((midia) => (
              <option key={midia.id} value={midia.id} className="bg-white text-[#0E2A3F]">
                {midia.titulo}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 py-2.5 px-1 hover:bg-[#F4F3EC] rounded-lg transition-colors">
          <Star className={`w-5 h-5 shrink-0 ${formData.destaque ? 'text-[#D9A441] fill-[#D9A441]' : 'text-[#44586A]'}`} />
          <div className="flex items-center justify-between flex-1">
            <span className="text-sm text-[#44586A]">Adicionar aos destaques</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, destaque: !formData.destaque })}
              className={`relative w-9 h-5 rounded-full transition-colors ${formData.destaque ? 'bg-[#178E96]' : 'bg-[#D9D7CB]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.destaque ? 'left-4.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E9E7DC] mt-4">
        <Button
          type="submit"
          className="px-6 h-9 text-sm bg-[#178E96] hover:bg-[#117178] text-white rounded-full font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Citação'}
        </Button>
      </div>
    </form>
  );
}

// --- Componente Modal ---

export function NovaCitacaoModal({ 
  aberto, 
  onFechar, 
  onSucesso, 
  midias 
}: { 
  aberto: boolean; 
  onFechar: () => void; 
  onSucesso: () => void; 
  midias: Midia[] 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: NovaCitacaoValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/leituras/citacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          autor: values.autor || null,
          pagina: values.pagina || null,
          midiaId: values.midiaId || null,
        }),
      });

      if (res.ok) {
        onSucesso();
        onFechar();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao criar citação');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-white border-[#E9E7DC] text-[#0E2A3F] max-w-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-[#0E2A3F]">Nova Citação</DialogTitle>
        </DialogHeader>

        <NovaCitacaoForm
          onSubmit={handleSubmit}
          midias={midias}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}