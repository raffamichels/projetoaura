'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Search, StickyNote, FileText, ChevronRight, Edit, Trash2, Sparkles, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { UpgradeToPremiumModal } from '@/components/planos/UpgradeToPremiumModal';
import { verificarAcessoRecurso } from '@/lib/planos-helper';
import { RecursoPremium, PlanoUsuario } from '@/types/planos';

interface Curso {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  icone: string;
  _count: {
    modulos: number;
    anotacoes: number;
  };
}

interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  cor: string;
  curso?: {
    id: string;
    nome: string;
    cor: string;
  };
  createdAt: string;
}

export default function EstudosPage() {
  const { data: session } = useSession();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalCursoAberto, setModalCursoAberto] = useState(false);
  const [modalAnotacaoAberto, setModalAnotacaoAberto] = useState(false);
  const [modalVisualizarAnotacao, setModalVisualizarAnotacao] = useState(false);
  const [modalExcluirAnotacao, setModalExcluirAnotacao] = useState(false);
  const [anotacaoSelecionada, setAnotacaoSelecionada] = useState<Anotacao | null>(null);
  const [editandoAnotacao, setEditandoAnotacao] = useState(false);
  const [buscaAtiva, setBuscaAtiva] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Verificar se o usuário é premium
  const plano = (session?.user?.plano as PlanoUsuario) || PlanoUsuario.FREE;
  const planoExpiraEm = session?.user?.planoExpiraEm;
  const acessoRecurso = verificarAcessoRecurso(plano, planoExpiraEm, RecursoPremium.GERAR_RESENHA_IA);
  const isPremium = acessoRecurso.temAcesso;

  const [novoCurso, setNovoCurso] = useState({
    nome: '',
    descricao: '',
    cor: '#8B5CF6',
  });

  const [novaAnotacao, setNovaAnotacao] = useState({
    titulo: '',
    conteudo: '',
    cor: '#FBBF24',
  });

  // Estados para anotação com IA
  const [tipoAnotacao, setTipoAnotacao] = useState<'livre' | 'ia'>('livre');
  const [textoOriginalIA, setTextoOriginalIA] = useState('');
  const [anotacaoGeradaIA, setAnotacaoGeradaIA] = useState<{ title: string; content: string } | null>(null);
  const [gerandoAnotacao, setGerandoAnotacao] = useState(false);
  const [erroIA, setErroIA] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [cursosRes, anotacoesRes] = await Promise.all([
        fetch('/api/v1/estudos/cursos'),
        fetch('/api/v1/estudos/anotacoes'),
      ]);

      if (cursosRes.ok) {
        const cursosData = await cursosRes.json();
        setCursos(cursosData.data);
      }

      if (anotacoesRes.ok) {
        const anotacoesData = await anotacoesRes.json();
        setAnotacoes(anotacoesData.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarCurso = async () => {
    try {
      const response = await fetch('/api/v1/estudos/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoCurso),
      });

      if (response.ok) {
        setModalCursoAberto(false);
        setNovoCurso({ nome: '', descricao: '', cor: '#8B5CF6' });
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao criar curso:', error);
    }
  };

  const criarAnotacao = async () => {
    try {
      const dadosAnotacao = tipoAnotacao === 'ia' && anotacaoGeradaIA
        ? { titulo: anotacaoGeradaIA.title, conteudo: anotacaoGeradaIA.content, cor: novaAnotacao.cor }
        : novaAnotacao;

      const response = await fetch('/api/v1/estudos/anotacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAnotacao),
      });

      if (response.ok) {
        fecharModalAnotacao();
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao criar anotação:', error);
    }
  };

  const gerarAnotacaoComIA = async () => {
    // Verificar se o usuário tem acesso ao recurso
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    if (!textoOriginalIA.trim()) return;

    setGerandoAnotacao(true);
    setErroIA(null);

    try {
      const response = await fetch('/api/generate-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textoOriginalIA }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se for erro 403, mostrar modal de upgrade
        if (response.status === 403) {
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(data.error || 'Erro ao gerar anotação');
      }

      setAnotacaoGeradaIA({ title: data.title, content: data.content });
    } catch (error) {
      console.error('Erro ao gerar anotação com IA:', error);
      setErroIA(error instanceof Error ? error.message : 'Erro ao gerar anotação');
    } finally {
      setGerandoAnotacao(false);
    }
  };

  const handleAnotacaoComIAClick = () => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setTipoAnotacao('ia');
  };

  const fecharModalAnotacao = () => {
    setModalAnotacaoAberto(false);
    setNovaAnotacao({ titulo: '', conteudo: '', cor: '#FBBF24' });
    setTipoAnotacao('livre');
    setTextoOriginalIA('');
    setAnotacaoGeradaIA(null);
    setErroIA(null);
  };

  const buscarConteudo = async (query: string) => {
    if (query.trim().length < 2) {
      setResultadosBusca(null);
      return;
    }

    try {
      const response = await fetch(`/api/v1/estudos/buscar?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResultadosBusca(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar:', error);
    }
  };

  const abrirAnotacao = (anotacao: Anotacao) => {
    setAnotacaoSelecionada(anotacao);
    setEditandoAnotacao(false);
    setModalVisualizarAnotacao(true);
  };

  const editarAnotacao = async () => {
    if (!anotacaoSelecionada) return;

    try {
      const response = await fetch(`/api/v1/estudos/anotacoes/${anotacaoSelecionada.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: anotacaoSelecionada.titulo,
          conteudo: anotacaoSelecionada.conteudo,
          cor: anotacaoSelecionada.cor,
        }),
      });

      if (response.ok) {
        setEditandoAnotacao(false);
        setModalVisualizarAnotacao(false);
        setAnotacaoSelecionada(null);
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao editar anotação:', error);
    }
  };

  const excluirAnotacao = async () => {
    if (!anotacaoSelecionada) return;
    setModalExcluirAnotacao(true);
  };

  const confirmarExcluirAnotacao = async () => {
    if (!anotacaoSelecionada) return;

    try {
      const response = await fetch(`/api/v1/estudos/anotacoes/${anotacaoSelecionada.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setModalVisualizarAnotacao(false);
        setModalExcluirAnotacao(false);
        setAnotacaoSelecionada(null);
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao excluir anotação:', error);
    }
  };

  const cores = [
    '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Estudos</h1>
          <p className="text-sm sm:text-base text-zinc-400">Organize seus materiais de estudo</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setBuscaAtiva(!buscaAtiva)}
            variant="default"
            className="flex-1 sm:flex-none border-zinc-700 hover:bg-zinc-800 h-auto py-2 text-sm"
          >
            <Search className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Buscar</span>
          </Button>
          <Button
            onClick={() => setModalAnotacaoAberto(true)}
            variant="default"
            className="flex-1 sm:flex-none border-zinc-700 hover:bg-zinc-800 h-auto py-2 text-sm"
          >
            <StickyNote className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Nova Anotação</span>
            <span className="xs:hidden">Anotação</span>
          </Button>
          <Button
            onClick={() => setModalCursoAberto(true)}
            className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 h-auto py-2 text-sm"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Novo Curso</span>
            <span className="xs:hidden">Curso</span>
          </Button>
        </div>
      </div>

      {/* Busca */}
      {buscaAtiva && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <Input
              placeholder="Buscar em cursos, páginas e anotações..."
              value={termoBusca}
              onChange={(e) => {
                setTermoBusca(e.target.value);
                buscarConteudo(e.target.value);
              }}
              className="bg-zinc-800 border-zinc-700"
            />
            {resultadosBusca && (
              <div className="mt-4 space-y-4">
                {resultadosBusca.total === 0 ? (
                  <p className="text-zinc-500 text-center py-4">Nenhum resultado encontrado</p>
                ) : (
                  <>
                    {resultadosBusca.cursos.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-400 mb-2">Cursos</h3>
                        {resultadosBusca.cursos.map((curso: any) => (
                          <div
                            key={curso.id}
                            className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-750 cursor-pointer"
                            onClick={() => window.location.href = `/dashboard/estudos/${curso.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: curso.cor }} />
                              <span className="text-white font-medium">{curso.nome}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {resultadosBusca.paginas.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-400 mb-2">Páginas</h3>
                        {resultadosBusca.paginas.map((pagina: any) => (
                          <div
                            key={pagina.id}
                            className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-750 cursor-pointer"
                          >
                            <p className="text-white font-medium">{pagina.titulo}</p>
                            <p className="text-sm text-zinc-400">{pagina.modulo.curso.nome}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total de Cursos
            </CardTitle>
            <BookOpen className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{cursos.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total de Módulos
            </CardTitle>
            <FileText className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {cursos.reduce((acc, c) => acc + c._count.modulos, 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total de Anotações
            </CardTitle>
            <StickyNote className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{anotacoes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cursos */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Meus Cursos</h2>
        {cursos.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 sm:p-8 text-center">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-zinc-400 mb-3 sm:mb-4">Você ainda não tem cursos cadastrados</p>
              <Button
                onClick={() => setModalCursoAberto(true)}
                className="bg-purple-600 hover:bg-purple-700 h-auto py-2.5 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro curso
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {cursos.map((curso) => (
              <Card
                key={curso.id}
                className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
                onClick={() => window.location.href = `/dashboard/estudos/${curso.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: curso.cor + '20', color: curso.cor }}
                      >
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{curso.nome}</CardTitle>
                        {curso.descricao && (
                          <p className="text-sm text-zinc-400 mt-1">{curso.descricao}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-zinc-400">
                    <div>
                      <span className="font-medium">{curso._count.modulos}</span> módulos
                    </div>
                    <div>
                      <span className="font-medium">{curso._count.anotacoes}</span> anotações
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Anotações Recentes */}
      {anotacoes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Anotações Recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anotacoes.slice(0, 6).map((anotacao) => (
              <Card
                key={anotacao.id}
                className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
                onClick={() => abrirAnotacao(anotacao)}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: anotacao.cor + '20', color: anotacao.cor }}
                    >
                      <StickyNote className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-base truncate">
                        {anotacao.titulo}
                      </CardTitle>
                      {anotacao.curso && (
                        <p className="text-xs text-zinc-500 mt-1">{anotacao.curso.nome}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal Novo Curso */}
      <Dialog open={modalCursoAberto} onOpenChange={setModalCursoAberto}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Novo Curso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome" className="text-zinc-300">Nome do Curso</Label>
              <Input
                id="nome"
                value={novoCurso.nome}
                onChange={(e) => setNovoCurso({ ...novoCurso, nome: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                placeholder="Ex: JavaScript Avançado"
              />
            </div>
            <div>
              <Label htmlFor="descricao" className="text-zinc-300">Descrição (opcional)</Label>
              <Input
                id="descricao"
                value={novoCurso.descricao}
                onChange={(e) => setNovoCurso({ ...novoCurso, descricao: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                placeholder="Ex: Conceitos avançados de JavaScript"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Cor</Label>
              <div className="flex gap-2 mt-2">
                {cores.map((cor) => (
                  <button
                    key={cor}
                    onClick={() => setNovoCurso({ ...novoCurso, cor })}
                    className={`w-8 h-8 rounded-full ${
                      novoCurso.cor === cor ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''
                    }`}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="default"
                onClick={() => setModalCursoAberto(false)}
                className="border-zinc-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={criarCurso}
                disabled={!novoCurso.nome}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Criar Curso
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Nova Anotação */}
      <Dialog open={modalAnotacaoAberto} onOpenChange={fecharModalAnotacao}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Nova Anotação</DialogTitle>
          </DialogHeader>

          {/* Tabs para selecionar tipo */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTipoAnotacao('livre')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                tipoAnotacao === 'livre'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              <StickyNote className="w-4 h-4 inline-block mr-2" />
              Anotação Livre
            </button>
            <div className="relative flex-1">
              {/* Coroa indicando recurso premium - aparece apenas para usuários FREE */}
              {!isPremium && (
                <Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 z-10" />
              )}
              <button
                onClick={handleAnotacaoComIAClick}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  tipoAnotacao === 'ia'
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
                title={!isPremium ? 'Premium - Clique para fazer upgrade' : 'Anotação com IA'}
              >
                <Sparkles className="w-4 h-4 inline-block mr-2" />
                Anotação com IA
              </button>
            </div>
          </div>

          {/* Conteúdo baseado no tipo selecionado */}
          {tipoAnotacao === 'livre' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo-anotacao" className="text-zinc-300">Título</Label>
                <Input
                  id="titulo-anotacao"
                  value={novaAnotacao.titulo}
                  onChange={(e) => setNovaAnotacao({ ...novaAnotacao, titulo: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  placeholder="Ex: Anotações da aula 5"
                />
              </div>
              <div>
                <Label htmlFor="conteudo-anotacao" className="text-zinc-300">Conteúdo</Label>
                <textarea
                  id="conteudo-anotacao"
                  value={novaAnotacao.conteudo}
                  onChange={(e) => setNovaAnotacao({ ...novaAnotacao, conteudo: e.target.value })}
                  className="w-full bg-zinc-800 border-zinc-700 text-white mt-1 rounded-md p-3 min-h-[120px] border"
                  placeholder="Digite suas anotações..."
                />
              </div>
              <div>
                <Label className="text-zinc-300">Cor</Label>
                <div className="flex gap-2 mt-2">
                  {cores.map((cor) => (
                    <button
                      key={cor}
                      onClick={() => setNovaAnotacao({ ...novaAnotacao, cor })}
                      className={`w-8 h-8 rounded-full ${
                        novaAnotacao.cor === cor ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''
                      }`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="default"
                  onClick={fecharModalAnotacao}
                  className="border-zinc-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={criarAnotacao}
                  disabled={!novaAnotacao.titulo}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Criar Anotação
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm">
                Cole seus textos brutos, transcrições ou bullet points e a IA irá criar uma anotação organizada em primeira pessoa.
              </p>

              {erroIA && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {erroIA}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coluna esquerda - Texto original */}
                <div>
                  <Label className="text-zinc-300">Texto bruto</Label>
                  <textarea
                    value={textoOriginalIA}
                    onChange={(e) => setTextoOriginalIA(e.target.value)}
                    className="w-full bg-zinc-800 border-zinc-700 text-white mt-1 rounded-md p-3 min-h-[250px] border resize-none"
                    placeholder="Cole suas anotações de reunião, transcrições ou bullet points aqui..."
                    disabled={gerandoAnotacao}
                  />
                </div>

                {/* Coluna direita - Anotação gerada */}
                <div>
                  <Label className="text-zinc-300">Anotação estruturada</Label>
                  {anotacaoGeradaIA ? (
                    <div className="mt-1 space-y-2">
                      <Input
                        value={anotacaoGeradaIA.title}
                        onChange={(e) => setAnotacaoGeradaIA({ ...anotacaoGeradaIA, title: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="Título da anotação"
                      />
                      <textarea
                        value={anotacaoGeradaIA.content}
                        onChange={(e) => setAnotacaoGeradaIA({ ...anotacaoGeradaIA, content: e.target.value })}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md p-3 min-h-[208px] border resize-none"
                        placeholder="Conteúdo gerado..."
                      />
                    </div>
                  ) : (
                    <div className="w-full bg-zinc-800/50 border-zinc-700 text-zinc-500 mt-1 rounded-md p-3 min-h-[250px] border flex items-center justify-center text-center">
                      <p className="text-sm italic">
                        Sua anotação estruturada aparecerá aqui após você colar seu texto e clicar em &quot;Organizar&quot;.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-zinc-300">Cor</Label>
                <div className="flex gap-2 mt-2">
                  {cores.map((cor) => (
                    <button
                      key={cor}
                      onClick={() => setNovaAnotacao({ ...novaAnotacao, cor })}
                      className={`w-8 h-8 rounded-full ${
                        novaAnotacao.cor === cor ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''
                      }`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="default"
                  onClick={fecharModalAnotacao}
                  className="border-zinc-700"
                >
                  Cancelar
                </Button>
                {!anotacaoGeradaIA ? (
                  <Button
                    onClick={gerarAnotacaoComIA}
                    disabled={!textoOriginalIA.trim() || gerandoAnotacao}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {gerandoAnotacao ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Organizando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Organizar
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={criarAnotacao}
                    disabled={!anotacaoGeradaIA.title}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Criar Anotação
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Visualizar/Editar Anotação */}
      <Dialog open={modalVisualizarAnotacao} onOpenChange={setModalVisualizarAnotacao}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editandoAnotacao ? 'Editar Anotação' : 'Visualizar Anotação'}
            </DialogTitle>
          </DialogHeader>
          {anotacaoSelecionada && (
            <div className="space-y-4">
              {editandoAnotacao ? (
                <>
                  <div>
                    <Label htmlFor="titulo-editar" className="text-zinc-300">Título</Label>
                    <Input
                      id="titulo-editar"
                      value={anotacaoSelecionada.titulo}
                      onChange={(e) =>
                        setAnotacaoSelecionada({ ...anotacaoSelecionada, titulo: e.target.value })
                      }
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conteudo-editar" className="text-zinc-300">Conteúdo</Label>
                    <textarea
                      id="conteudo-editar"
                      value={anotacaoSelecionada.conteudo}
                      onChange={(e) =>
                        setAnotacaoSelecionada({ ...anotacaoSelecionada, conteudo: e.target.value })
                      }
                      className="w-full bg-zinc-800 border-zinc-700 text-white mt-1 rounded-md p-3 min-h-[200px]"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Cor</Label>
                    <div className="flex gap-2 mt-2">
                      {cores.map((cor) => (
                        <button
                          key={cor}
                          onClick={() => setAnotacaoSelecionada({ ...anotacaoSelecionada, cor })}
                          className={`w-8 h-8 rounded-full ${
                            anotacaoSelecionada.cor === cor ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''
                          }`}
                          style={{ backgroundColor: cor }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      variant="default"
                      onClick={() => setEditandoAnotacao(false)}
                      className="border-zinc-700"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={editarAnotacao}
                      disabled={!anotacaoSelecionada.titulo}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center"
                        style={{ backgroundColor: anotacaoSelecionada.cor + '20', color: anotacaoSelecionada.cor }}
                      >
                        <StickyNote className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {anotacaoSelecionada.titulo}
                        </h3>
                        {anotacaoSelecionada.curso && (
                          <p className="text-sm text-zinc-400">{anotacaoSelecionada.curso.nome}</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                      <p className="text-zinc-300 whitespace-pre-wrap">{anotacaoSelecionada.conteudo}</p>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Criada em {new Date(anotacaoSelecionada.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-zinc-800">
                    <Button
                      variant="default"
                      onClick={excluirAnotacao}
                      className="border-zinc-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                    <Button
                      onClick={() => setEditandoAnotacao(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão de Anotação */}
      <ConfirmModal
        open={modalExcluirAnotacao}
        onClose={() => setModalExcluirAnotacao(false)}
        onConfirm={confirmarExcluirAnotacao}
        title="Excluir Anotação"
        description="Tem certeza que deseja excluir esta anotação? Todo o conteúdo será perdido permanentemente. Esta ação não pode ser desfeita."
        confirmText="Excluir Anotação"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Modal Upgrade Premium */}
      <UpgradeToPremiumModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        recurso="Anotações com IA"
        descricao="A geração de anotações organizadas com inteligência artificial está disponível apenas para usuários Premium."
      />
    </div>
  );
}
