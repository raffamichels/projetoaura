'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BookOpen,
  Plus,
  ChevronLeft,
  FileText,
  Trash2,
  Edit,
  FolderOpen,
  Save,
  X,
  Sparkles,
  List,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import RichTextEditor from '@/components/estudos/RichTextEditor';
import { PomodoroTimer } from '@/components/PomodoroTimer';

interface Modulo {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  _count?: {
    paginas: number;
  };
  paginas?: Pagina[];
}

interface Pagina {
  id: string;
  titulo: string;
  conteudo: string;
  ordem: number;
}

interface Curso {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  modulos: Modulo[];
}

export default function CursoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const cursoId = params.id as string;

  const [curso, setCurso] = useState<Curso | null>(null);
  const [moduloSelecionado, setModuloSelecionado] = useState<Modulo | null>(null);
  const [paginaSelecionada, setPaginaSelecionada] = useState<Pagina | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalModuloAberto, setModalModuloAberto] = useState(false);
  const [modalPaginaAberto, setModalPaginaAberto] = useState(false);
  const [editandoPagina, setEditandoPagina] = useState(false);
  const [paginaAmpliada, setPaginaAmpliada] = useState(false);

  const [novoModulo, setNovoModulo] = useState({
    nome: '',
    descricao: '',
  });

  const [novaPagina, setNovaPagina] = useState({
    titulo: '',
    conteudo: '',
  });

  useEffect(() => {
    carregarCurso();
  }, [cursoId]);

  const carregarCurso = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/estudos/cursos/${cursoId}`);
      if (response.ok) {
        const data = await response.json();
        setCurso(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarModulo = async () => {
    try {
      const response = await fetch('/api/v1/estudos/modulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...novoModulo,
          cursoId,
          ordem: curso?.modulos.length || 0,
        }),
      });

      if (response.ok) {
        setModalModuloAberto(false);
        setNovoModulo({ nome: '', descricao: '' });
        carregarCurso();
      }
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
    }
  };

  const criarPagina = async () => {
    if (!moduloSelecionado) return;

    try {
      const response = await fetch('/api/v1/estudos/paginas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...novaPagina,
          moduloId: moduloSelecionado.id,
          ordem: moduloSelecionado.paginas?.length || 0,
        }),
      });

      if (response.ok) {
        setModalPaginaAberto(false);
        setNovaPagina({ titulo: '', conteudo: '' });
        carregarModulo(moduloSelecionado.id);
      }
    } catch (error) {
      console.error('Erro ao criar página:', error);
    }
  };

  const carregarModulo = async (moduloId: string) => {
    try {
      const response = await fetch(`/api/v1/estudos/modulos/${moduloId}`);
      if (response.ok) {
        const data = await response.json();
        setModuloSelecionado(data.data);
        setPaginaSelecionada(null);
      }
    } catch (error) {
      console.error('Erro ao carregar módulo:', error);
    }
  };

  const carregarPagina = async (paginaId: string) => {
    try {
      const response = await fetch(`/api/v1/estudos/paginas/${paginaId}`);
      if (response.ok) {
        const data = await response.json();
        setPaginaSelecionada(data.data);
        setEditandoPagina(false);
      }
    } catch (error) {
      console.error('Erro ao carregar página:', error);
    }
  };

  const salvarPagina = async () => {
    if (!paginaSelecionada) return;

    try {
      const response = await fetch(`/api/v1/estudos/paginas/${paginaSelecionada.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: paginaSelecionada.titulo,
          conteudo: paginaSelecionada.conteudo,
        }),
      });

      if (response.ok) {
        setEditandoPagina(false);
        if (moduloSelecionado) {
          carregarModulo(moduloSelecionado.id);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar página:', error);
    }
  };

  const excluirModulo = async (moduloId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Deseja realmente excluir este módulo? Todas as páginas serão excluídas.')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/estudos/modulos/${moduloId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (moduloSelecionado?.id === moduloId) {
          setModuloSelecionado(null);
          setPaginaSelecionada(null);
        }
        carregarCurso();
      }
    } catch (error) {
      console.error('Erro ao excluir módulo:', error);
    }
  };

  const excluirPagina = async (paginaId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Deseja realmente excluir esta página?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/estudos/paginas/${paginaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (paginaSelecionada?.id === paginaId) {
          setPaginaSelecionada(null);
        }
        if (moduloSelecionado) {
          carregarModulo(moduloSelecionado.id);
        }
      }
    } catch (error) {
      console.error('Erro ao excluir página:', error);
    }
  };

  const excluirCurso = async () => {
    if (!confirm('Deseja realmente excluir este curso? Todos os módulos, páginas e anotações serão excluídos permanentemente.')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/estudos/cursos/${cursoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/estudos');
      }
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500 mx-auto mb-4"></div>
            <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-zinc-400 font-medium">Carregando seu curso...</p>
        </div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-zinc-600" />
          </div>
          <p className="text-zinc-400">Curso não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header com gradiente */}
      <div className="relative border-b border-zinc-800/50 backdrop-blur-xl bg-zinc-900/80 -mx-4 lg:-mx-6 overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />
        <div className="relative p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/estudos')}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl h-auto py-2 px-3 text-sm flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
              Voltar
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{
                    backgroundColor: curso.cor + '20',
                    color: curso.cor,
                    boxShadow: `0 0 20px ${curso.cor}20`,
                  }}
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-white truncate">{curso.nome}</h1>
                  {curso.descricao && (
                    <p className="text-zinc-400 text-xs truncate">{curso.descricao}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0 overflow-x-auto">
              <PomodoroTimer />
              <div className="hidden sm:flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <span className="text-xs text-zinc-500 block">Módulos</span>
                  <p className="text-sm font-bold text-white">{curso.modulos.length}</p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <span className="text-xs text-zinc-500 block">Páginas</span>
                  <p className="text-sm font-bold text-white">
                    {curso.modulos.reduce((acc, m) => acc + (m._count?.paginas || 0), 0)}
                  </p>
                </div>
                <Button
                  onClick={excluirCurso}
                  variant="ghost"
                  className="hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-lg h-auto py-1.5 px-2"
                  title="Excluir curso"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          {/* Mobile stats row */}
          <div className="flex sm:hidden items-center gap-2 mt-2 w-full">
            <div className="flex-1 px-2.5 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <span className="text-xs text-zinc-500 block">Módulos</span>
              <p className="text-sm font-bold text-white">{curso.modulos.length}</p>
            </div>
            <div className="flex-1 px-2.5 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <span className="text-xs text-zinc-500 block">Páginas</span>
              <p className="text-sm font-bold text-white">
                {curso.modulos.reduce((acc, m) => acc + (m._count?.paginas || 0), 0)}
              </p>
            </div>
            <Button
              onClick={excluirCurso}
              variant="ghost"
              className="hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-lg h-auto py-1.5 px-2"
              title="Excluir curso"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-120px)]">
        {/* Sidebar Esquerda - Módulos */}
        <div className={`${paginaAmpliada ? 'hidden' : 'w-full lg:w-80'} border-b lg:border-b-0 lg:border-r border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm overflow-y-auto max-h-96 lg:max-h-none`}>
          <div className="p-4">
            <Button
              onClick={() => setModalModuloAberto(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-lg shadow-purple-500/20 rounded-xl h-12"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-semibold">Novo Módulo</span>
            </Button>
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Conteúdo do Curso
              </span>
            </div>
            <div className="space-y-2">
              {curso.modulos.map((modulo, index) => (
                <div
                  key={modulo.id}
                  onClick={() => carregarModulo(modulo.id)}
                  className={`group relative cursor-pointer rounded-xl p-4 transition-all duration-200 ${
                    moduloSelecionado?.id === modulo.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-500/30 shadow-lg shadow-purple-500/10'
                      : 'bg-zinc-800/40 hover:bg-zinc-800/60 border-2 border-transparent hover:border-zinc-700/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        moduloSelecionado?.id === modulo.id
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-zinc-700/50 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-300'
                      }`}
                    >
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-zinc-500">
                          Módulo {index + 1}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white truncate mb-1">
                        {modulo.nome}
                      </h3>
                      {modulo.descricao && (
                        <p className="text-xs text-zinc-500 truncate">{modulo.descricao}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <FileText className="w-3 h-3" />
                          <span>{modulo._count?.paginas || 0} páginas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => excluirModulo(modulo.id, e)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                    title="Excluir módulo"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
              {curso.modulos.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 text-sm mb-3">Nenhum módulo ainda</p>
                  <p className="text-xs text-zinc-600">
                    Organize seu conteúdo criando módulos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Área Central - Páginas e Conteúdo */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {moduloSelecionado ? (
            <>
              {/* Lista de Páginas */}
              <div className={`${paginaAmpliada ? 'hidden' : 'w-full lg:w-72'} border-b lg:border-b-0 lg:border-r border-zinc-800/50 bg-zinc-900/20 overflow-y-auto max-h-80 lg:max-h-none`}>
                <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/40">
                  <h2 className="font-bold text-white mb-1 text-lg">
                    {moduloSelecionado.nome}
                  </h2>
                  {moduloSelecionado.descricao && (
                    <p className="text-xs text-zinc-400 mb-3">{moduloSelecionado.descricao}</p>
                  )}
                  <Button
                    onClick={() => setModalPaginaAberto(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/20 rounded-xl h-10"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="font-semibold">Nova Página</span>
                  </Button>
                </div>
                <div className="p-4 space-y-2">
                  {moduloSelecionado.paginas?.map((pagina, index) => (
                    <div
                      key={pagina.id}
                      onClick={() => carregarPagina(pagina.id)}
                      className={`group relative cursor-pointer rounded-xl p-3 transition-all duration-200 ${
                        paginaSelecionada?.id === pagina.id
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10'
                          : 'bg-zinc-800/30 hover:bg-zinc-800/50 border-2 border-transparent hover:border-zinc-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            paginaSelecionada?.id === pagina.id
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-zinc-700/50 text-zinc-400 group-hover:bg-zinc-700'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-zinc-500 block mb-0.5">
                            Página {index + 1}
                          </span>
                          <span className="text-sm font-medium text-white truncate block">
                            {pagina.titulo}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => excluirPagina(pagina.id, e)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Excluir página"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                  {(!moduloSelecionado.paginas || moduloSelecionado.paginas.length === 0) && (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 rounded-xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-7 h-7 text-zinc-600" />
                      </div>
                      <p className="text-zinc-500 text-sm mb-2">Nenhuma página</p>
                      <p className="text-xs text-zinc-600">Crie sua primeira página</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Visualizador/Editor de Página */}
              <div className="flex-1 overflow-y-auto bg-zinc-950/50">
                {paginaSelecionada ? (
                  <div className={`p-4 sm:p-8 mx-auto ${paginaAmpliada ? 'max-w-full lg:px-16' : 'max-w-5xl'}`}>
                    <div className="mb-6">
                      {editandoPagina ? (
                        <div className="space-y-4">
                          <Input
                            value={paginaSelecionada.titulo}
                            onChange={(e) =>
                              setPaginaSelecionada({
                                ...paginaSelecionada,
                                titulo: e.target.value,
                              })
                            }
                            className="text-3xl font-bold bg-zinc-900/50 border-zinc-700/50 text-white h-14 rounded-xl px-5"
                            placeholder="Título da página"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={salvarPagina}
                              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg shadow-green-500/20 rounded-xl"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Salvar
                            </Button>
                            <Button
                              variant="default"
                              onClick={() => {
                                setEditandoPagina(false);
                                carregarPagina(paginaSelecionada.id);
                              }}
                              className="border-zinc-700/50 hover:bg-zinc-800/50 rounded-xl"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
                              <Sparkles className="w-3 h-3 text-blue-400" />
                              <span className="text-xs font-medium text-blue-400">
                                Conteúdo do Curso
                              </span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                              {paginaSelecionada.titulo}
                            </h1>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setPaginaAmpliada(!paginaAmpliada)}
                              variant="default"
                              className="border-zinc-700/50 hover:bg-zinc-800/50 rounded-xl"
                              title={paginaAmpliada ? "Reduzir visualização" : "Ampliar visualização"}
                            >
                              {paginaAmpliada ? (
                                <Minimize2 className="w-4 h-4" />
                              ) : (
                                <Maximize2 className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => setEditandoPagina(true)}
                              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/20 rounded-xl"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-8">
                      {editandoPagina ? (
                        <RichTextEditor
                          content={paginaSelecionada.conteudo}
                          onChange={(content) =>
                            setPaginaSelecionada({ ...paginaSelecionada, conteudo: content })
                          }
                        />
                      ) : (
                        <>
                          <style jsx global>{`
                            .prose img {
                              max-width: 100%;
                              height: auto;
                              border-radius: 0.5rem;
                              margin: 1rem 0;
                              display: block;
                            }

                            .prose img[data-align="center"] {
                              margin-left: auto;
                              margin-right: auto;
                            }

                            .prose img[data-align="right"] {
                              margin-left: auto;
                              margin-right: 0;
                            }

                            .prose img[data-align="left"] {
                              margin-left: 0;
                              margin-right: auto;
                            }
                          `}</style>
                          <div
                            className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-strong:text-white prose-a:text-blue-400"
                            dangerouslySetInnerHTML={{ __html: paginaSelecionada.conteudo }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-12 h-12 text-zinc-600" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Selecione uma página
                      </h3>
                      <p className="text-zinc-500">Escolha uma página para visualizar o conteúdo</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                  <FolderOpen className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Selecione um módulo</h3>
                <p className="text-zinc-500">Escolha um módulo para começar a estudar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Módulo */}
      <Dialog open={modalModuloAberto} onOpenChange={setModalModuloAberto}>
        <DialogContent className="bg-zinc-900 border-zinc-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Criar Novo Módulo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome-modulo" className="text-zinc-300 font-medium">
                Nome do Módulo
              </Label>
              <Input
                id="nome-modulo"
                value={novoModulo.nome}
                onChange={(e) => setNovoModulo({ ...novoModulo, nome: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-2 h-11 rounded-xl"
                placeholder="Ex: Introdução ao JavaScript"
              />
            </div>
            <div>
              <Label htmlFor="descricao-modulo" className="text-zinc-300 font-medium">
                Descrição (opcional)
              </Label>
              <Input
                id="descricao-modulo"
                value={novoModulo.descricao}
                onChange={(e) => setNovoModulo({ ...novoModulo, descricao: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-2 h-11 rounded-xl"
                placeholder="Ex: Conceitos básicos da linguagem"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="default"
                onClick={() => setModalModuloAberto(false)}
                className="flex-1 border-zinc-700 hover:bg-zinc-800 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button
                onClick={criarModulo}
                disabled={!novoModulo.nome}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl h-11"
              >
                Criar Módulo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Nova Página */}
      <Dialog open={modalPaginaAberto} onOpenChange={setModalPaginaAberto}>
        <DialogContent className="bg-zinc-900 border-zinc-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Criar Nova Página</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo-pagina" className="text-zinc-300 font-medium">
                Título da Página
              </Label>
              <Input
                id="titulo-pagina"
                value={novaPagina.titulo}
                onChange={(e) => setNovaPagina({ ...novaPagina, titulo: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-2 h-11 rounded-xl"
                placeholder="Ex: Variáveis e Tipos de Dados"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="default"
                onClick={() => setModalPaginaAberto(false)}
                className="flex-1 border-zinc-700 hover:bg-zinc-800 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button
                onClick={criarPagina}
                disabled={!novaPagina.titulo}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl h-11"
              >
                Criar Página
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
