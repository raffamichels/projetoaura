'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Trash } from '@phosphor-icons/react';
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
    <div className="bg-surface-hover border border-line-strong rounded-lg p-3 sm:p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-ink-soft text-xs sm:text-sm italic line-clamp-3">&ldquo;{citacao.texto}&rdquo;</p>
          {citacao.autor && <p className="text-xs text-ink-soft mt-2">— {citacao.autor}</p>}
          {citacao.midia && (
            <p className="text-xs text-ink-faint mt-1">
              {citacao.midia.tipo === 'LIVRO' ? '📚' : '🎬'} {citacao.midia.titulo}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-line-strong">
        {mostrarBotaoDestaque && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleDestaque(citacao)}
            className={`flex-1 h-8 text-xs ${citacao.destaque ? 'bg-amber-50 dark:bg-amber-500/10 text-gold hover:bg-yellow-500/30' : 'text-ink-soft hover:text-gold'}`}
          >
            <Star className={`w-3 h-3 mr-1.5 ${citacao.destaque ? 'fill-current' : ''}`} />
            <span>{citacao.destaque ? 'Remover destaque' : 'Adicionar destaque'}</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => excluirCitacao(citacao.id)}
          className="h-8 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <Trash className="w-3 h-3 mr-1.5" /> Excluir
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Tabs defaultValue="destaque" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 bg-surface-hover">
          <TabsTrigger value="destaque" className="data-[state=active]:bg-brand data-[state=active]:text-white text-xs sm:text-sm font-medium">
            Inspiradoras ({citacoesDestaque.length})
          </TabsTrigger>
          <TabsTrigger value="todas" className="data-[state=active]:bg-brand data-[state=active]:text-white text-xs sm:text-sm font-medium">
            Todas ({todasCitacoes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="destaque" className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
          {loading ? <div className="animate-pulse text-center py-8">Carregando...</div> :
            citacoesDestaque.length === 0 ? <div className="text-center py-12 text-ink-faint text-sm">Nenhuma frase inspiradora</div> :
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
      <DialogContent className="bg-surface border-line text-ink max-w-3xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Gerenciar Citações</DialogTitle>
        </DialogHeader>
        <ConteudoGerenciarCitacoes onAtualizar={onAtualizar} />
      </DialogContent>
    </Dialog>
  );
}