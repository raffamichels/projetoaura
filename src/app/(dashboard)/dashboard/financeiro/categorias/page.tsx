'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Tag, TrendUp, TrendDown, GridFour, ListBullets, PencilSimple, Trash, DotsThreeVertical } from '@phosphor-icons/react';
import NovaCategoriaModal from '@/components/financeiro/NovaCategoriaModal';
import { toast } from 'sonner';

interface Categoria {
  id: string;
  nome: string;
  tipo: 'RECEITA' | 'DESPESA';
  cor: string;
  icone: string;
  subcategorias?: Categoria[];
}

export default function CategoriasPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [visualizacao, setVisualizacao] = useState<'grid' | 'lista'>('grid');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'RECEITA' | 'DESPESA'>('TODOS');
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);

  useEffect(() => {
    carregarCategorias();
  }, [filtroTipo]);

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroTipo !== 'TODOS') {
        params.append('tipo', filtroTipo);
      }
      
      const response = await fetch(`/api/v1/financeiro/categorias?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoriasReceita = categorias.filter((c) => c.tipo === 'RECEITA');
  const categoriasDespesa = categorias.filter((c) => c.tipo === 'DESPESA');

  const editarCategoria = (categoria: Categoria) => {
    setCategoriaSelecionada(categoria);
    setModalAberto(true);
    setMenuAberto(null);
  };

  const excluirCategoria = async (categoria: Categoria) => {
    if (!window.confirm(`Excluir a categoria "${categoria.nome}" permanentemente?`)) return;
    try {
      const response = await fetch(`/api/v1/financeiro/categorias/${categoria.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao excluir categoria');
      toast.success('Categoria excluída');
      setMenuAberto(null);
      await carregarCategorias();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir categoria');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 sm:space-y-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/financeiro')} className="text-ink-soft">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Financeiro
      </Button>
      <div className="relative mb-8">
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-ink">
                Categorias
              </h1>
              <p className="text-ink-soft mt-2">Organize suas transações por categorias</p>
            </div>
            <Button
              onClick={() => { setCategoriaSelecionada(null); setModalAberto(true); }}
              className="bg-brand hover:bg-brand-dark text-white transition-colors duration-150"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Categoria
            </Button>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between">
            {/* Filtros de Tipo */}
            <div className="flex gap-2">
              <Button
                variant={filtroTipo === 'TODOS' ? 'default' : 'default'}
                onClick={() => setFiltroTipo('TODOS')}
                className={filtroTipo === 'TODOS' 
                  ? 'bg-brand-soft text-brand-dark font-semibold hover:bg-brand-soft'
                  : 'bg-surface border border-line text-ink-soft hover:bg-surface-hover'
                }
              >
                Todas
              </Button>
              <Button
                variant={filtroTipo === 'RECEITA' ? 'default' : 'default'}
                onClick={() => setFiltroTipo('RECEITA')}
                className={filtroTipo === 'RECEITA' 
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-surface border border-line text-ink-soft hover:bg-surface-hover'
                }
              >
                <TrendUp className="w-4 h-4 mr-2" />
                Receitas
              </Button>
              <Button
                variant={filtroTipo === 'DESPESA' ? 'default' : 'default'}
                onClick={() => setFiltroTipo('DESPESA')}
                className={filtroTipo === 'DESPESA' 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-surface border border-line text-ink-soft hover:bg-surface-hover'
                }
              >
                <TrendDown className="w-4 h-4 mr-2" />
                Despesas
              </Button>
            </div>

            {/* Toggle de Visualização */}
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setVisualizacao('grid')}
                className={visualizacao === 'grid' 
                  ? 'bg-brand-soft text-brand-dark font-semibold hover:bg-brand-soft'
                  : 'bg-surface border border-line text-ink-soft hover:bg-surface-hover'
                }
              >
                <GridFour className="w-4 h-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setVisualizacao('lista')}
                className={visualizacao === 'lista' 
                  ? 'bg-brand-soft text-brand-dark font-semibold hover:bg-brand-soft'
                  : 'bg-surface border border-line text-ink-soft hover:bg-surface-hover'
                }
              >
                <ListBullets className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      ) : categorias.length === 0 ? (
        <Card className="bg-surface border-line shadow-sm p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-soft rounded-full mb-4">
              <Tag className="w-8 h-8 text-brand-dark" />
            </div>
            <h3 className="text-xl font-semibold text-ink mb-2">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-ink-soft mb-6">
              Crie categorias para organizar suas transações
            </p>
            <Button onClick={() => { setCategoriaSelecionada(null); setModalAberto(true); }} className="bg-brand hover:bg-brand-dark text-white">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Categoria
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Categorias de Receita */}
          {(filtroTipo === 'TODOS' || filtroTipo === 'RECEITA') && categoriasReceita.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
                <TrendUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                Receitas
                <span className="text-sm text-ink-faint font-normal">({categoriasReceita.length})</span>
              </h2>
              
              {visualizacao === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {categoriasReceita.map((categoria) => (
                    <Card
                      key={categoria.id}
                      className="relative overflow-hidden bg-surface border-line shadow-sm hover:bg-surface-soft transition-colors duration-150 group cursor-pointer"
                    >
                      {/* Barra colorida no topo */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: categoria.cor }}
                      />

                      <div className="relative p-4">
                        <div className="flex flex-col items-center text-center">
                          {/* Ícone */}
                          <div 
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: `${categoria.cor}10` }}
                          >
                            <Tag className="w-7 h-7" style={{ color: categoria.cor }} />
                          </div>
                          
                          {/* Nome */}
                          <h3 className="font-semibold text-ink text-sm mb-1">
                            {categoria.nome}
                          </h3>

                          {/* Subcategorias */}
                          {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                            <p className="text-xs text-ink-faint">
                              {categoria.subcategorias.length} subcategoria(s)
                            </p>
                          )}
                        </div>

                        {/* Menu */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuAberto(menuAberto === categoria.id ? null : categoria.id);
                          }}
                        >
                          <DotsThreeVertical className="w-4 h-4" />
                        </Button>

                        {menuAberto === categoria.id && (
                          <div className="absolute right-2 top-10 w-40 bg-surface border border-line rounded-lg shadow-lg z-10">
                            <button onClick={() => editarCategoria(categoria)} className="w-full px-3 py-2 text-left text-sm text-ink-soft hover:bg-surface-hover flex items-center gap-2">
                              <PencilSimple className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button onClick={() => void excluirCategoria(categoria)} className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-surface-hover flex items-center gap-2">
                              <Trash className="w-3.5 h-3.5" />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {categoriasReceita.map((categoria) => (
                    <Card
                      key={categoria.id}
                      className="relative overflow-hidden bg-surface border-line shadow-sm hover:bg-surface-soft transition-colors duration-150 group"
                    >
                      <div className="p-4 flex items-center gap-4">
                        {/* Ícone */}
                        <div 
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: `${categoria.cor}10` }}
                        >
                          <Tag className="w-5 h-5" style={{ color: categoria.cor }} />
                        </div>

                        {/* Nome */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-ink">{categoria.nome}</h3>
                          {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                            <p className="text-sm text-ink-faint">
                              {categoria.subcategorias.length} subcategoria(s)
                            </p>
                          )}
                        </div>

                        {/* Tipo */}
                        <div className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs rounded-full border border-green-200 dark:border-green-500/30">
                          Receita
                        </div>

                        {/* Menu */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setMenuAberto(menuAberto === categoria.id ? null : categoria.id)}
                        >
                          <DotsThreeVertical className="w-4 h-4" />
                        </Button>

                        {menuAberto === categoria.id && (
                          <div className="absolute right-4 top-14 w-40 bg-surface border border-line rounded-lg shadow-lg z-10">
                            <button onClick={() => editarCategoria(categoria)} className="w-full px-3 py-2 text-left text-sm text-ink-soft hover:bg-surface-hover flex items-center gap-2">
                              <PencilSimple className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button onClick={() => void excluirCategoria(categoria)} className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-surface-hover flex items-center gap-2">
                              <Trash className="w-3.5 h-3.5" />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categorias de Despesa */}
          {(filtroTipo === 'TODOS' || filtroTipo === 'DESPESA') && categoriasDespesa.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
                <TrendDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                Despesas
                <span className="text-sm text-ink-faint font-normal">({categoriasDespesa.length})</span>
              </h2>
              
              {visualizacao === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {categoriasDespesa.map((categoria) => (
                    <Card
                      key={categoria.id}
                      className="relative overflow-hidden bg-surface border-line shadow-sm hover:bg-surface-soft transition-colors duration-150 group cursor-pointer"
                    >
                      <div 
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: categoria.cor }}
                      />

                      <div className="relative p-4">
                        <div className="flex flex-col items-center text-center">
                          <div 
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: `${categoria.cor}10` }}
                          >
                            <Tag className="w-7 h-7" style={{ color: categoria.cor }} />
                          </div>
                          
                          <h3 className="font-semibold text-ink text-sm mb-1">
                            {categoria.nome}
                          </h3>

                          {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                            <p className="text-xs text-ink-faint">
                              {categoria.subcategorias.length} subcategoria(s)
                            </p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuAberto(menuAberto === categoria.id ? null : categoria.id);
                          }}
                        >
                          <DotsThreeVertical className="w-4 h-4" />
                        </Button>

                        {menuAberto === categoria.id && (
                          <div className="absolute right-2 top-10 w-40 bg-surface border border-line rounded-lg shadow-lg z-10">
                            <button onClick={() => editarCategoria(categoria)} className="w-full px-3 py-2 text-left text-sm text-ink-soft hover:bg-surface-hover flex items-center gap-2">
                              <PencilSimple className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button onClick={() => void excluirCategoria(categoria)} className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-surface-hover flex items-center gap-2">
                              <Trash className="w-3.5 h-3.5" />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {categoriasDespesa.map((categoria) => (
                    <Card
                      key={categoria.id}
                      className="relative overflow-hidden bg-surface border-line shadow-sm hover:bg-surface-soft transition-colors duration-150 group"
                    >
                      <div className="p-4 flex items-center gap-4">
                        <div 
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: `${categoria.cor}10` }}
                        >
                          <Tag className="w-5 h-5" style={{ color: categoria.cor }} />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-ink">{categoria.nome}</h3>
                          {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                            <p className="text-sm text-ink-faint">
                              {categoria.subcategorias.length} subcategoria(s)
                            </p>
                          )}
                        </div>

                        <div className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-full border border-red-200 dark:border-red-500/30">
                          Despesa
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setMenuAberto(menuAberto === categoria.id ? null : categoria.id)}
                        >
                          <DotsThreeVertical className="w-4 h-4" />
                        </Button>

                        {menuAberto === categoria.id && (
                          <div className="absolute right-4 top-14 w-40 bg-surface border border-line rounded-lg shadow-lg z-10">
                            <button onClick={() => editarCategoria(categoria)} className="w-full px-3 py-2 text-left text-sm text-ink-soft hover:bg-surface-hover flex items-center gap-2">
                              <PencilSimple className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button onClick={() => void excluirCategoria(categoria)} className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-surface-hover flex items-center gap-2">
                              <Trash className="w-3.5 h-3.5" />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Nova Categoria */}
      <NovaCategoriaModal
        aberto={modalAberto}
        categoria={categoriaSelecionada}
        onFechar={() => { setModalAberto(false); setCategoriaSelecionada(null); }}
        onSucesso={() => {
          carregarCategorias();
        }}
      />
    </div>
  );
}
