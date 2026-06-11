'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Trash2 } from 'lucide-react';
import { Citacao } from '@/types/midia';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface ConteudoGerenciarCitacoesProps {
  onAtualizar: () => void;
}

interface GerenciarCitacoesModalProps {
  aberto: boolean;
  onFechar: () => void;
  onAtualizar: () => void;
  modoEmbutido?: boolean;
}

function ConteudoGerenciarCitacoes({ onAtualizar }: ConteudoGerenciarCitacoesProps) {
  const [citacoesDestaque, setCitacoesDestaque] = useState<Citacao[]>([]);
  const [todasCitacoes, setTodasCitacoes] = useState<Citacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [citacaoParaExcluir, setCitacaoParaExcluir] = useState<string | null>(null);

  useEffect(() => {
    carregarCitacoes();
  }, []);

  const carregarCitacoes = async () => {
    try {
      setLoading(true);
      const [destaqueRes, todasRes] = await Promise.all([
        fetch('/api/v1/leituras/citacoes?destaque=true'),
        fetch('/api/v1/leituras/citacoes'),
      ]);

      if (destaqueRes.ok) {
        const data = await destaqueRes.json();
        setCitacoesDestaque(data.data);
      }

      if (todasRes.ok) {
        const data = await todasRes.json();
        setTodasCitacoes(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar citações:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDestaque = async (citacao: Citacao) => {
    try {
      const response = await fetch(`/api/v1/leituras/citacoes/${citacao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destaque: !citacao.destaque }),
      });

      if (response.ok) {
        await carregarCitacoes();
        onAtualizar();
      }
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error);
    }
  };

  const excluirCitacao = async (id: string) => {
    setCitacaoParaExcluir(id);
    setModalExcluir(true);
  };

  const confirmarExcluirCitacao = async () => {
    if (!citacaoParaExcluir) return;
    try {
      const response = await fetch(`/api/v1/leituras/citacoes/${citacaoParaExcluir}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await carregarCitacoes();
        onAtualizar();
      }
    } finally {
      setCitacaoParaExcluir(null);
    }
  };

  const CitacaoCard = ({ citacao, mostrarBotaoDestaque = true }: { citacao: Citacao; mostrarBotaoDestaque?: boolean }) => (
    <div className="bg-[#F4F3EC] border border-[#D9D7CB] rounded-lg p-3 sm:p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[#44586A] text-xs sm:text-sm italic line-clamp-3">&ldquo;{citacao.texto}&rdquo;</p>
          {citacao.autor && <p className="text-xs text-[#44586A] mt-2">— {citacao.autor}</p>}
          {citacao.midia && (
            <p className="text-xs text-[#8395A5] mt-1">
              {citacao.midia.tipo === 'LIVRO' ? '📚' : '🎬'} {citacao.midia.titulo}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-[#D9D7CB]">
        {mostrarBotaoDestaque && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleDestaque(citacao)}
            className={`flex-1 h-8 text-xs ${citacao.destaque ? 'bg-amber-50 text-[#D9A441] hover:bg-yellow-500/30' : 'text-[#44586A] hover:text-[#D9A441]'}`}
          >
            <Star className={`w-3 h-3 mr-1.5 ${citacao.destaque ? 'fill-current' : ''}`} />
            <span>{citacao.destaque ? 'Remover destaque' : 'Adicionar destaque'}</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => excluirCitacao(citacao.id)}
          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-3 h-3 mr-1.5" /> Excluir
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Tabs defaultValue="destaque" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 bg-[#F4F3EC]">
          <TabsTrigger value="destaque" className="data-[state=active]:bg-[#178E96] text-white text-xs sm:text-sm font-medium">
            Inspiradoras ({citacoesDestaque.length})
          </TabsTrigger>
          <TabsTrigger value="todas" className="data-[state=active]:bg-[#178E96] text-white text-xs sm:text-sm font-medium">
            Todas ({todasCitacoes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="destaque" className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
          {loading ? <div className="animate-pulse text-center py-8">Carregando...</div> :
            citacoesDestaque.length === 0 ? <div className="text-center py-12 text-[#8395A5] text-sm">Nenhuma frase inspiradora</div> :
            citacoesDestaque.map(c => <CitacaoCard key={c.id} citacao={c} />)}
        </TabsContent>

        <TabsContent value="todas" className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
          {loading ? <div className="animate-pulse text-center py-8">Carregando...</div> :
            todasCitacoes.map(c => <CitacaoCard key={c.id} citacao={c} />)}
        </TabsContent>
      </Tabs>

      <ConfirmModal
        open={modalExcluir}
        onClose={() => setModalExcluir(false)}
        onConfirm={confirmarExcluirCitacao}
        title="Excluir Citação"
        description="Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}

export function GerenciarCitacoesModal({ aberto, onFechar, onAtualizar, modoEmbutido = false }: GerenciarCitacoesModalProps) {
  if (modoEmbutido) return <ConteudoGerenciarCitacoes onAtualizar={onAtualizar} />;

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-white border-[#E9E7DC] text-[#0E2A3F] max-w-3xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Gerenciar Citações</DialogTitle>
        </DialogHeader>
        <ConteudoGerenciarCitacoes onAtualizar={onAtualizar} />
      </DialogContent>
    </Dialog>
  );
}