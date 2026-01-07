'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, Film, ChevronLeft, Save, Trash2, Edit, X, Quote, Calendar, Clock, Globe, Sparkles } from 'lucide-react';
import { Midia, StatusLeitura } from '@/types/midia';
import { StarRating } from '@/components/ui/star-rating';
import { GenerateReviewButton } from '@/components/leituras/GenerateReviewButton';
import { ReviewDisplayModal } from '@/components/leituras/ReviewDisplayModal';

export default function DetalheMidiaPage() {
  const router = useRouter();
  const params = useParams();
  const midiaId = params.id as string;

  const [midia, setMidia] = useState<Midia | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [generatedReview, setGeneratedReview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nota: 0,
    resenhaGeradaIA: '',
    impressoesIniciais: '',
    principaisAprendizados: '',
    trechosMemoraveis: '',
    reflexao: '',
    aprendizadosPraticos: '',
    consideracoesFinais: '',
  });

  useEffect(() => {
    carregarMidia();
  }, [midiaId]);

  const carregarMidia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/leituras/midias/${midiaId}`);
      if (res.ok) {
        const data = await res.json();
        setMidia(data.data);
        setFormData({
          nota: data.data.nota || 0,
          resenhaGeradaIA: data.data.resenhaGeradaIA || '',
          impressoesIniciais: data.data.impressoesIniciais || '',
          principaisAprendizados: data.data.principaisAprendizados || '',
          trechosMemoraveis: data.data.trechosMemoraveis || '',
          reflexao: data.data.reflexao || '',
          aprendizadosPraticos: data.data.aprendizadosPraticos || '',
          consideracoesFinais: data.data.consideracoesFinais || '',
        });
      } else {
        router.push('/dashboard/biblioteca');
      }
    } catch (error) {
      console.error('Erro ao carregar mídia:', error);
      router.push('/dashboard/biblioteca');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const res = await fetch(`/api/v1/leituras/midias/${midiaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await carregarMidia();
        setEditando(false);
      } else {
        alert('Erro ao salvar reflexões');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar reflexões');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const res = await fetch(`/api/v1/leituras/midias/${midiaId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/dashboard/biblioteca');
      } else {
        alert('Erro ao excluir item');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir item');
    }
  };

  const getStatusBadge = (status: StatusLeitura) => {
    const badges = {
      PROXIMO: { label: 'Próximo', className: 'text-zinc-400' },
      EM_ANDAMENTO: { label: 'Em andamento', className: 'text-blue-400' },
      PAUSADO: { label: 'Pausado', className: 'text-yellow-400' },
      CONCLUIDO: { label: 'Concluído', className: 'text-green-400' },
    };
    return badges[status] || badges.PROXIMO;
  };

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

  if (!midia) {
    return null;
  }

  const statusInfo = getStatusBadge(midia.status);

  return (
    <div className="space-y-6">
      {/* Header Compacto */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/biblioteca')}
          className="border-zinc-700 hover:bg-zinc-800"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex gap-2">
          {!editando ? (
            <>
              <GenerateReviewButton
                midiaId={midiaId}
                onReviewGenerated={(review) => setGeneratedReview(review)}
              />
              <Button
                onClick={() => setEditando(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={handleExcluir}
                className="border-zinc-700 text-red-400 hover:text-red-300 hover:bg-zinc-800"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditando(false);
                  setFormData({
                    nota: midia.nota || 0,
                    resenhaGeradaIA: midia.resenhaGeradaIA || '',
                    impressoesIniciais: midia.impressoesIniciais || '',
                    principaisAprendizados: midia.principaisAprendizados || '',
                    trechosMemoraveis: midia.trechosMemoraveis || '',
                    reflexao: midia.reflexao || '',
                    aprendizadosPraticos: midia.aprendizadosPraticos || '',
                    consideracoesFinais: midia.consideracoesFinais || '',
                  });
                }}
                className="border-zinc-700"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSalvar}
                disabled={salvando}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hero Section - Capa e Informações Lado a Lado */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Capa */}
            <div className="flex-shrink-0">
              {midia.capa ? (
                <img
                  src={midia.capa}
                  alt={`Capa de ${midia.titulo}`}
                  className="w-64 h-96 object-cover rounded-xl border border-zinc-700 shadow-2xl mx-auto lg:mx-0"
                />
              ) : (
                <div className="w-64 h-96 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center mx-auto lg:mx-0">
                  {midia.tipo === 'LIVRO' ? (
                    <BookOpen className="w-20 h-20 text-zinc-600" />
                  ) : (
                    <Film className="w-20 h-20 text-zinc-600" />
                  )}
                </div>
              )}
            </div>

            {/* Informações Principais */}
            <div className="flex-1 space-y-6">
              {/* Título e Tipo */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {midia.tipo === 'LIVRO' ? (
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                      <Film className="w-5 h-5 text-pink-400" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-zinc-400">
                    {midia.tipo === 'LIVRO' ? 'Livro' : 'Filme'}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {midia.titulo}
                </h1>
                <p className="text-lg text-zinc-300">
                  {midia.tipo === 'LIVRO' ? midia.autor : midia.diretor}
                </p>
              </div>

              {/* Status e Avaliação */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700">
                  <div className={`w-2 h-2 rounded-full ${
                    midia.status === 'CONCLUIDO' ? 'bg-green-400' :
                    midia.status === 'EM_ANDAMENTO' ? 'bg-blue-400' :
                    midia.status === 'PAUSADO' ? 'bg-yellow-400' : 'bg-zinc-400'
                  }`} />
                  <span className={`text-sm font-medium ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Avaliação */}
                <div className="flex items-center gap-2">
                  {editando ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700">
                      <StarRating
                        value={formData.nota}
                        onChange={(nota) => setFormData({ ...formData, nota })}
                        size="md"
                      />
                    </div>
                  ) : (
                    midia.nota && midia.nota > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700">
                        <StarRating
                          value={midia.nota}
                          size="md"
                          readonly
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Detalhes em Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                {midia.genero && (
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Gênero</p>
                    <p className="text-white font-medium">{midia.genero}</p>
                  </div>
                )}

                {midia.tipo === 'LIVRO' && (
                  <>
                    {midia.editora && (
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Editora</p>
                        <p className="text-white font-medium">{midia.editora}</p>
                      </div>
                    )}
                    {midia.fonte && (
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Fonte</p>
                        <p className="text-white font-medium">{midia.fonte}</p>
                      </div>
                    )}
                  </>
                )}

                {midia.tipo === 'FILME' && (
                  <>
                    {midia.anoLancamento && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <p className="text-xs text-zinc-500 uppercase tracking-wider">Ano</p>
                        </div>
                        <p className="text-white font-medium">{midia.anoLancamento}</p>
                      </div>
                    )}
                    {midia.duracao && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <p className="text-xs text-zinc-500 uppercase tracking-wider">Duração</p>
                        </div>
                        <p className="text-white font-medium">{midia.duracao} min</p>
                      </div>
                    )}
                  </>
                )}

                {midia.idioma && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-zinc-500" />
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Idioma</p>
                    </div>
                    <p className="text-white font-medium">{midia.idioma}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resenha Gerada por IA */}
      {(midia.resenhaGeradaIA || editando) && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Resenha Gerada por IA
            </CardTitle>
            {!editando && midia.resenhaGeradaIA && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (confirm('Tem certeza que deseja excluir a resenha gerada?')) {
                    try {
                      const res = await fetch(`/api/v1/leituras/midias/${midiaId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resenhaGeradaIA: null }),
                      });
                      if (res.ok) {
                        await carregarMidia();
                      }
                    } catch (error) {
                      console.error('Erro ao excluir resenha:', error);
                    }
                  }
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editando ? (
              <Textarea
                value={formData.resenhaGeradaIA}
                onChange={(e) =>
                  setFormData({ ...formData, resenhaGeradaIA: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white min-h-[200px] font-serif"
                placeholder="Resenha gerada pela IA..."
              />
            ) : (
              <p className="text-zinc-300 whitespace-pre-wrap text-sm sm:text-base font-serif leading-relaxed">
                {midia.resenhaGeradaIA || (
                  <span className="text-zinc-500 italic">Nenhuma resenha gerada ainda.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reflexões e Aprendizados */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white">Reflexões e Aprendizados</h2>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-white">Impressões Iniciais</CardTitle>
          </CardHeader>
          <CardContent>
            {editando ? (
              <Textarea
                value={formData.impressoesIniciais}
                onChange={(e) =>
                  setFormData({ ...formData, impressoesIniciais: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                placeholder="Suas primeiras impressões sobre o conteúdo..."
              />
            ) : (
              <p className="text-zinc-300 whitespace-pre-wrap text-sm sm:text-base">
                {midia.impressoesIniciais || (
                  <span className="text-zinc-500 italic">Nenhuma impressão registrada ainda.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-white">Principais Aprendizados</CardTitle>
          </CardHeader>
          <CardContent>
            {editando ? (
              <Textarea
                value={formData.principaisAprendizados}
                onChange={(e) =>
                  setFormData({ ...formData, principaisAprendizados: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                placeholder="O que você aprendeu com este conteúdo..."
              />
            ) : (
              <p className="text-zinc-300 whitespace-pre-wrap text-sm sm:text-base">
                {midia.principaisAprendizados || (
                  <span className="text-zinc-500 italic">Nenhum aprendizado registrado ainda.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-white">Trechos Memoráveis</CardTitle>
          </CardHeader>
          <CardContent>
            {editando ? (
              <Textarea
                value={formData.trechosMemoraveis}
                onChange={(e) =>
                  setFormData({ ...formData, trechosMemoraveis: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                placeholder="Trechos que você gostaria de lembrar..."
              />
            ) : (
              <p className="text-zinc-300 whitespace-pre-wrap text-sm sm:text-base">
                {midia.trechosMemoraveis || (
                  <span className="text-zinc-500 italic">Nenhum trecho registrado ainda.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-white">Reflexão</CardTitle>
          </CardHeader>
          <CardContent>
            {editando ? (
              <Textarea
                value={formData.reflexao}
                onChange={(e) => setFormData({ ...formData, reflexao: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                placeholder="Suas reflexões sobre o conteúdo..."
              />
            ) : (
              <p className="text-zinc-300 whitespace-pre-wrap text-sm sm:text-base">
                {midia.reflexao || (
                  <span className="text-zinc-500 italic">Nenhuma reflexão registrada ainda.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-white">Aprendizados Práticos</CardTitle>
          </CardHeader>
          <CardContent>
            {editando ? (
              <Textarea
                value={formData.aprendizadosPraticos}
                onChange={(e) =>
                  setFormData({ ...formData, aprendizadosPraticos: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                placeholder="Como você pode aplicar o que aprendeu..."
              />
            ) : (
              <p className="text-zinc-300 whitespace-pre-wrap text-sm sm:text-base">
                {midia.aprendizadosPraticos || (
                  <span className="text-zinc-500 italic">Nenhum aprendizado prático registrado ainda.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-white">Considerações Finais</CardTitle>
          </CardHeader>
          <CardContent>
            {editando ? (
              <Textarea
                value={formData.consideracoesFinais}
                onChange={(e) =>
                  setFormData({ ...formData, consideracoesFinais: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                placeholder="Suas considerações finais sobre o conteúdo..."
              />
            ) : (
              <p className="text-zinc-300 whitespace-pre-wrap text-sm sm:text-base">
                {midia.consideracoesFinais || (
                  <span className="text-zinc-500 italic">Nenhuma consideração final registrada ainda.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Citações */}
      {midia.citacoes && midia.citacoes.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Quote className="w-5 h-5 text-yellow-500" />
              Citações ({midia.citacoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {midia.citacoes.map((citacao) => (
              <div
                key={citacao.id}
                className="border-l-4 border-purple-500 pl-4 py-2 bg-zinc-800 rounded"
              >
                <p className="text-zinc-200 italic text-sm sm:text-base">&ldquo;{citacao.texto}&rdquo;</p>
                {citacao.pagina && (
                  <p className="text-xs text-zinc-500 mt-1">Página {citacao.pagina}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Modal de Resenha Gerada */}
      {generatedReview && (
        <ReviewDisplayModal
          review={generatedReview}
          midiaId={midiaId}
          open={!!generatedReview}
          onClose={() => setGeneratedReview(null)}
          onSave={() => {
            carregarMidia()
            setGeneratedReview(null)
          }}
        />
      )}
    </div>
  );
}
