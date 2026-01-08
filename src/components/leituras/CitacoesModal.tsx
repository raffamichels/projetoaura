'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NovaCitacaoForm } from './NovaCitacaoModal';
import { GerenciarCitacoesModal } from './GerenciarCitacoesModal';
import { Midia } from '@/types/midia';

interface CitacoesModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
  midias: Midia[];
}

export function CitacoesModal({ aberto, onFechar, onSucesso, midias }: CitacoesModalProps) {
  const [abaAtiva, setAbaAtiva] = useState<'nova' | 'gerenciar'>('nova');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (formData: { texto: string; autor: string; pagina: string; destaque: boolean; midiaId: string }) => {
    setCarregando(true);
    try {
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
        // Permanece na aba "Nova" após criar citação
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao criar citação');
        throw new Error('Erro ao criar citação');
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleVoltar = () => {
    setAbaAtiva('nova');
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Citações</DialogTitle>
        </DialogHeader>

        <Tabs value={abaAtiva} onValueChange={(value) => setAbaAtiva(value as 'nova' | 'gerenciar')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50">
            <TabsTrigger value="nova" className="data-[state=active]:bg-purple-600">
              Nova
            </TabsTrigger>
            <TabsTrigger value="gerenciar" className="data-[state=active]:bg-purple-600">
              Gerenciar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nova" className="flex-1 overflow-y-auto mt-4">
            <NovaCitacaoForm
              onSubmit={handleSubmit}
              onCancel={onFechar}
              midias={midias}
              loading={carregando}
            />
          </TabsContent>

          <TabsContent value="gerenciar" className="flex-1 overflow-y-auto mt-4 flex flex-col min-h-0">
            <GerenciarCitacoesModal
              aberto={true}
              onFechar={onFechar}
              onAtualizar={onSucesso}
              modoEmbutido={true}
              onVoltar={handleVoltar}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
          <Button
            variant="default"
            onClick={onFechar}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
