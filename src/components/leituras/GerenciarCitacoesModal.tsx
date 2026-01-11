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
  modoEmbutido?: boolean;
  onVoltar?: () => void;
}

// Componente interno reutilizável com o conteúdo
function ConteudoGerenciarCitacoes({ onAtualizar, modoEmbutido, onVoltar }: ConteudoGerenciarCitacoesProps) {
  const [citacoesDestaque, setCitacoesDestaque] = useState<Citacao[]>([]);
  const [todasCitacoes, setTodasCitacoes] = useState<Citacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [processando, setProcessando] = useState<string | null>(null);
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
      setProcessando(citacao.id);
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
    } finally {
      setProcessando(null);
    }
  };

  const excluirCitacao = async (id: string) => {
    setCitacaoParaExcluir(id);
    setModalExcluir(true);
  };

  const confirmarExcluirCitacao = async () => {
    if (!citacaoParaExcluir) return;

    try {
      setProcessando(citacaoParaExcluir);
      const response = await fetch(`/api/v1/leituras/citacoes/${citacaoParaExcluir}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await carregarCitacoes();
        onAtualizar();
      }
    } catch (error) {
      console.error('Erro ao excluir citação:', error);
    } finally {
      setProcessando(null);
      setCitacaoParaExcluir(null);
    }
  };

  const CitacaoCard = ({ citacao, mostrarBotaoDestaque = true }: { citacao: Citacao; mostrarBotaoDestaque?: boolean }) => (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-zinc-200 text-xs sm:text-sm italic line-clamp-3">
            &ldquo;{citacao.texto}&rdquo;
          </p>
          {citacao.autor && (
            <p className="text-xs text-zinc-400 mt-1 sm:mt-2">— {citacao.autor}</p>
          )}
          {citacao.midia && (
            <p className="text-xs text-zinc-500 mt-1">
              {citacao.midia.tipo === 'LIVRO' ? '📚' : '🎬'} {citacao.midia.titulo}
            </p>
          )}
          {citacao.pagina && (
            <p className="text-xs text-zinc-500 mt-1">Página: {citacao.pagina}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-zinc-700">
        {mostrarBotaoDestaque && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleDestaque(citacao)}
            disabled={processando === citacao.id}
            className={`flex-1 h-8 text-xs ${
              citacao.destaque
                ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                : 'text-zinc-400 hover:text-yellow-500'
            }`}
          >
            <Star className={`w-3 h-3 mr-1 sm:mr-1.5 ${citacao.destaque ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{citacao.destaque ? 'Remover das frases inspiradoras' : 'Adicionar às frases inspiradoras'}</span>
            <span className="sm:hidden">{citacao.destaque ? 'Remover destaque' : 'Adicionar destaque'}</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => excluirCitacao(citacao.id)}
          disabled={processando === citacao.id}
          className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full sm:w-auto"
        >
          <Trash2 className="w-3 h-3 mr-1 sm:mr-1.5" />
          Excluir
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Tabs defaultValue="destaque" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50">
          <TabsTrigger value="destaque" className="data-[state=active]:bg-purple-600 text-xs sm:text-sm">
            <span className="hidden xs:inline">Frases Inspiradoras ({citacoesDestaque.length})</span>
            <span className="xs:hidden">Destaques ({citacoesDestaque.length})</span>
          </TabsTrigger>
          <TabsTrigger value="todas" className="data-[state=active]:bg-purple-600 text-xs sm:text-sm">
            Todas ({todasCitacoes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="destaque" className="flex-1 overflow-y-auto mt-3 sm:mt-4 space-y-2 sm:space-y-3 pr-1 sm:pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : citacoesDestaque.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-zinc-400 px-4">
              <Star className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-30" />
              <p className="text-sm sm:text-base">Nenhuma frase inspiradora</p>
              <p className="text-xs sm:text-sm mt-1">Adicione citações às frases inspiradoras na aba &quot;Todas&quot;</p>
            </div>
          ) : (
            citacoesDestaque.map((citacao) => (
              <CitacaoCard key={citacao.id} citacao={citacao} />
            ))
          )}
        </TabsContent>

        <TabsContent value="todas" className="flex-1 overflow-y-auto mt-3 sm:mt-4 space-y-2 sm:space-y-3 pr-1 sm:pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : todasCitacoes.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-zinc-400 px-4">
              <p className="text-sm sm:text-base">Nenhuma citação cadastrada</p>
            </div>
          ) : (
            todasCitacoes.map((citacao) => (
              <CitacaoCard key={citacao.id} citacao={citacao} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-3 sm:pt-4 border-t border-zinc-800">
        {modoEmbutido && onVoltar && (
          <Button
            variant="default"
            onClick={onVoltar}
            className="border-zinc-700 hover:bg-zinc-800 w-full sm:w-auto text-sm"
          >
            Voltar
          </Button>
        )}
      </div>

      {/* Modal Confirmar Exclusão */}
      <ConfirmModal
        open={modalExcluir}
        onClose={() => {
          setModalExcluir(false);
          setCitacaoParaExcluir(null);
        }}
        onConfirm={confirmarExcluirCitacao}
        title="Excluir Citação"
        description="Tem certeza que deseja excluir esta citação? Ela será removida permanentemente de todas as suas listas. Esta ação não pode ser desfeita."
        confirmText="Excluir Citação"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

interface GerenciarCitacoesModalProps {
  aberto: boolean;
  onFechar: () => void;
  onAtualizar: () => void;
  modoEmbutido?: boolean;
  onVoltar?: () => void;
}

export function GerenciarCitacoesModal({
  aberto,
  onFechar,
  onAtualizar,
  modoEmbutido = false,
  onVoltar,
}: GerenciarCitacoesModalProps) {
  // Se está em modo embutido, renderizar apenas o conteúdo
  if (modoEmbutido) {
    return <ConteudoGerenciarCitacoes onAtualizar={onAtualizar} modoEmbutido={true} onVoltar={onVoltar} />;
  }

  // Modo standalone com Dialog
  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl w-[95vw] max-h-[80vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg md:text-xl">
            <span className="hidden sm:inline">Gerenciar Frases Inspiradoras</span>
            <span className="sm:hidden">Gerenciar Citações</span>
          </DialogTitle>
        </DialogHeader>

        <ConteudoGerenciarCitacoes onAtualizar={onAtualizar} modoEmbutido={false} />

        <div className="flex justify-end gap-2 pt-3 sm:pt-4 border-t border-zinc-800">
          <Button
            variant="default"
            onClick={onFechar}
            className="border-zinc-700 hover:bg-zinc-800 w-full sm:w-auto text-sm"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
