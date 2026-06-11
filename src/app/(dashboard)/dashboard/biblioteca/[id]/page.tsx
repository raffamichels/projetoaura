'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Film, ChevronLeft, Save, Trash2, Edit, X, Quote, Calendar, Clock, Globe, Sparkles, Share2 } from 'lucide-react';
import { Midia, StatusLeitura } from '@/types/midia';
import { StarRating } from '@/components/ui/star-rating';
import { GenerateReviewButton } from '@/components/leituras/GenerateReviewButton';
import { ReviewDisplayModal } from '@/components/leituras/ReviewDisplayModal';
// IMPORTAÇÃO NOVA AQUI:
import { ShareMidiaModal } from '@/components/share/ShareMidiaModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function DetalheMidiaPage() {
  const router = useRouter();
  const params = useParams();
  const midiaId = params.id as string;

  const [midia, setMidia] = useState<Midia | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [generatedReview, setGeneratedReview] = useState<string | null>(null);

  // ESTADO NOVO AQUI:
  const [shareOpen, setShareOpen] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);

  const [formData, setFormData] = useState({
    nota: 0,
    status: 'PROXIMO' as StatusLeitura,
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
          status: data.data.status || 'PROXIMO',
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
    setModalExcluir(true);
  };

  const confirmarExcluir = async () => {
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
      PROXIMO: { label: 'Próximo', className: 'text-[#8395A5]' },
      EM_ANDAMENTO: { label: 'Em andamento', className: 'text-[#117178]' },
      PAUSADO: { label: 'Pausado', className: 'text-[#D9A441]' },
      CONCLUIDO: { label: 'Concluído', className: 'text-green-700' },
    };
    return badges[status] || badges.PROXIMO;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#178E96] mx-auto mb-4"></div>
          <p className="text-[#44586A]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!midia) {
    return null;
  }

  const statusInfo = getStatusBadge(midia.status);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 lg:p-6">
      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button
          variant="default"
          onClick={() => router.push('/dashboard/biblioteca')}
          className="bg-white border border-[#E9E7DC] hover:bg-[#F4F3EC] text-[#44586A] hover:text-[#0E2A3F] w-full sm:w-auto"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex flex-wrap gap-2">

          {/* BOTÃO DE COMPARTILHAR */}
          <Button
            onClick={() => setShareOpen(true)}
            className="bg-[#178E96] hover:bg-[#117178] flex-1 sm:flex-none text-sm"
          >
            <Share2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Compartilhar</span>
          </Button>

          {!editando ? (
            <>
              <GenerateReviewButton
                midiaId={midiaId}
                onReviewGenerated={(review) => setGeneratedReview(review)}
              />
              <Button
                onClick={() => setEditando(true)}
                className="bg-[#178E96] hover:bg-[#117178] flex-1 sm:flex-none text-sm"
              >
                <Edit className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button
                variant="default"
                onClick={handleExcluir}
                className="border-[#E9E7DC] text-red-500 hover:text-red-600 hover:bg-red-50 px-3 sm:px-4"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                onClick={() => {
                  setEditando(false);
                  setFormData({
                    nota: midia.nota || 0,
                    status: midia.status || 'PROXIMO',
                    resenhaGeradaIA: midia.resenhaGeradaIA || '',
                    impressoesIniciais: midia.impressoesIniciais || '',
                    principaisAprendizados: midia.principaisAprendizados || '',
                    trechosMemoraveis: midia.trechosMemoraveis || '',
                    reflexao: midia.reflexao || '',
                    aprendizadosPraticos: midia.aprendizadosPraticos || '',
                    consideracoesFinais: midia.consideracoesFinais || '',
                  });
                }}
                className="bg-white border border-[#E9E7DC] text-[#44586A] hover:bg-[#F4F3EC] flex-1 sm:flex-none text-sm"
              >
                <X className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Cancelar</span>
              </Button>
              <Button
                onClick={handleSalvar}
                disabled={salvando}
                className="bg-[#178E96] hover:bg-[#117178] flex-1 sm:flex-none text-sm"
              >
                <Save className="w-4 h-4 sm:mr-2" />
                <span className="hidden xs:inline">{salvando ? 'Salvando...' : 'Salvar'}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hero Section - Capa e Informações Lado a Lado */}
      <Card className="bg-white border-[#E9E7DC] overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Capa */}
            <div className="shrink-0">
              {midia.capa ? (
                <img
                  src={midia.capa}
                  alt={`Capa de ${midia.titulo}`}
                  className="w-48 h-72 sm:w-56 sm:h-84 lg:w-64 lg:h-96 object-cover rounded-xl border border-[#D9D7CB] shadow-lg mx-auto lg:mx-0"
                />
              ) : (
                <div className="w-48 h-72 sm:w-56 sm:h-84 lg:w-64 lg:h-96 bg-[#F4F3EC] rounded-xl border border-[#E9E7DC] flex items-center justify-center mx-auto lg:mx-0">
                  {midia.tipo === 'LIVRO' ? (
                    <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-[#8395A5]" />
                  ) : (
                    <Film className="w-16 h-16 sm:w-20 sm:h-20 text-[#8395A5]" />
                  )}
                </div>
              )}
            </div>

            {/* Informações Principais */}
            <div className="flex-1 space-y-4 sm:space-y-6">
              {/* Título e Tipo */}
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  {midia.tipo === 'LIVRO' ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#E5F1F1] flex items-center justify-center">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#117178]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#F4F3EC] flex items-center justify-center">
                      <Film className="w-4 h-4 sm:w-5 sm:h-5 text-[#44586A]" />
                    </div>
                  )}
                  <span className="text-xs sm:text-sm font-medium text-[#44586A]">
                    {midia.tipo === 'LIVRO' ? 'Livro' : 'Filme'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0E2A3F] mb-2">
                  {midia.titulo}
                </h1>
                <p className="text-base sm:text-lg text-[#44586A]">
                  {midia.tipo === 'LIVRO' ? midia.autor : midia.diretor}
                </p>
              </div>

              {/* Status e Avaliação */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {editando ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusLeitura })}
                    className="px-3 py-1.5 rounded-full bg-[#F4F3EC] border border-[#D9D7CB] text-xs sm:text-sm font-medium text-[#0E2A3F] focus:outline-none focus:ring-2 focus:ring-[#178E96]"
                  >
                    <option value="PROXIMO">Próximo</option>
                    <option value="EM_ANDAMENTO">Em andamento</option>
                    <option value="PAUSADO">Pausado</option>
                    <option value="CONCLUIDO">Concluído</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F3EC] border border-[#D9D7CB]">
                    <div className={`w-2 h-2 rounded-full ${
                      midia.status === 'CONCLUIDO' ? 'bg-green-600' :
                      midia.status === 'EM_ANDAMENTO' ? 'bg-[#178E96]' :
                      midia.status === 'PAUSADO' ? 'bg-[#D9A441]' : 'bg-[#8395A5]'
                    }`} />
                    <span className={`text-xs sm:text-sm font-medium ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                )}

                {/* Avaliação */}
                <div className="flex items-center gap-2">
                  {editando ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F3EC] border border-[#D9D7CB]">
                      <StarRating
                        value={formData.nota}
                        onChange={(nota) => setFormData({ ...formData, nota })}
                        size="md"
                      />
                    </div>
                  ) : (
                    midia.nota && midia.nota > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F3EC] border border-[#D9D7CB]">
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
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-[#E9E7DC]">
                {midia.genero && (
                  <div className="space-y-1">
                    <p className="text-xs text-[#8395A5] uppercase tracking-wider">Gênero</p>
                    <p className="text-[#0E2A3F] font-medium">{midia.genero}</p>
                  </div>
                )}

                {midia.tipo === 'LIVRO' && (
                  <>
                    {midia.editora && (
                      <div className="space-y-1">
                        <p className="text-xs text-[#8395A5] uppercase tracking-wider">Editora</p>
                        <p className="text-[#0E2A3F] font-medium">{midia.editora}</p>
                      </div>
                    )}
                    {midia.fonte && (
                      <div className="space-y-1">
                        <p className="text-xs text-[#8395A5] uppercase tracking-wider">Fonte</p>
                        <p className="text-[#0E2A3F] font-medium">{midia.fonte}</p>
                      </div>
                    )}
                  </>
                )}

                {midia.tipo === 'FILME' && (
                  <>
                    {midia.anoLancamento && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-[#8395A5]" />
                          <p className="text-xs text-[#8395A5] uppercase tracking-wider">Ano</p>
                        </div>
                        <p className="text-[#0E2A3F] font-medium">{midia.anoLancamento}</p>
                      </div>
                    )}
                    {midia.duracao && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-[#8395A5]" />
                          <p className="text-xs text-[#8395A5] uppercase tracking-wider">Duração</p>
                        </div>
                        <p className="text-[#0E2A3F] font-medium">{midia.duracao} min</p>
                      </div>
                    )}
                  </>
                )}

                {midia.idioma && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-[#8395A5]" />
                      <p className="text-xs text-[#8395A5] uppercase tracking-wider">Idioma</p>
                    </div>
                    <p className="text-[#0E2A3F] font-medium">{midia.idioma}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resenha Gerada por IA - só mostra se já existir texto */}
      {midia.resenhaGeradaIA && (
        <Card className="bg-white border-[#E9E7DC]">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base md:text-lg text-[#0E2A3F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#D9A441]" />
              <span className="hidden xs:inline">Resenha Gerada por IA</span>
              <span className="xs:hidden">Resenha IA</span>
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
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {editando ? (
              <Textarea
                value={formData.resenhaGeradaIA}
                onChange={(e) =>
                  setFormData({ ...formData, resenhaGeradaIA: e.target.value })
                }
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] min-h-50 font-serif text-sm sm:text-base"
                placeholder="Resenha gerada pela IA..."
              />
            ) : (
              <p className="text-[#44586A] whitespace-pre-wrap text-sm sm:text-base font-serif leading-relaxed">
                {midia.resenhaGeradaIA || (
                  <span className="text-[#8395A5] italic text-xs sm:text-sm">Nenhuma resenha gerada ainda.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Anotações */}
      <div className="space-y-2">
        <Card className="bg-white border-[#E9E7DC]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#44586A] uppercase tracking-wider">Impressões Iniciais</span>
            </div>
            {editando ? (
              <Textarea
                value={formData.impressoesIniciais}
                onChange={(e) =>
                  setFormData({ ...formData, impressoesIniciais: e.target.value })
                }
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] min-h-16 text-sm resize-none"
                placeholder="Suas primeiras impressões..."
              />
            ) : (
              <p className="text-[#44586A] whitespace-pre-wrap text-sm">
                {midia.impressoesIniciais || (
                  <span className="text-[#8395A5] italic text-xs">Nenhuma impressão registrada.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E9E7DC]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#44586A] uppercase tracking-wider">Principais Aprendizados</span>
            </div>
            {editando ? (
              <Textarea
                value={formData.principaisAprendizados}
                onChange={(e) =>
                  setFormData({ ...formData, principaisAprendizados: e.target.value })
                }
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] min-h-16 text-sm resize-none"
                placeholder="O que você aprendeu..."
              />
            ) : (
              <p className="text-[#44586A] whitespace-pre-wrap text-sm">
                {midia.principaisAprendizados || (
                  <span className="text-[#8395A5] italic text-xs">Nenhum aprendizado registrado.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E9E7DC]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#44586A] uppercase tracking-wider">Trechos Memoráveis</span>
            </div>
            {editando ? (
              <Textarea
                value={formData.trechosMemoraveis}
                onChange={(e) =>
                  setFormData({ ...formData, trechosMemoraveis: e.target.value })
                }
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] min-h-16 text-sm resize-none"
                placeholder="Trechos marcantes..."
              />
            ) : (
              <p className="text-[#44586A] whitespace-pre-wrap text-sm">
                {midia.trechosMemoraveis || (
                  <span className="text-[#8395A5] italic text-xs">Nenhum trecho registrado.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E9E7DC]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#44586A] uppercase tracking-wider">Reflexão</span>
            </div>
            {editando ? (
              <Textarea
                value={formData.reflexao}
                onChange={(e) => setFormData({ ...formData, reflexao: e.target.value })}
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] min-h-16 text-sm resize-none"
                placeholder="Suas reflexões..."
              />
            ) : (
              <p className="text-[#44586A] whitespace-pre-wrap text-sm">
                {midia.reflexao || (
                  <span className="text-[#8395A5] italic text-xs">Nenhuma reflexão registrada.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E9E7DC]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#44586A] uppercase tracking-wider">Aprendizados Práticos</span>
            </div>
            {editando ? (
              <Textarea
                value={formData.aprendizadosPraticos}
                onChange={(e) =>
                  setFormData({ ...formData, aprendizadosPraticos: e.target.value })
                }
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] min-h-16 text-sm resize-none"
                placeholder="Como aplicar o que aprendeu..."
              />
            ) : (
              <p className="text-[#44586A] whitespace-pre-wrap text-sm">
                {midia.aprendizadosPraticos || (
                  <span className="text-[#8395A5] italic text-xs">Nenhum aprendizado prático registrado.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E9E7DC]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#44586A] uppercase tracking-wider">Considerações Finais</span>
            </div>
            {editando ? (
              <Textarea
                value={formData.consideracoesFinais}
                onChange={(e) =>
                  setFormData({ ...formData, consideracoesFinais: e.target.value })
                }
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] min-h-16 text-sm resize-none"
                placeholder="Suas considerações finais..."
              />
            ) : (
              <p className="text-[#44586A] whitespace-pre-wrap text-sm">
                {midia.consideracoesFinais || (
                  <span className="text-[#8395A5] italic text-xs">Nenhuma consideração final registrada.</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Citações */}
      {midia.citacoes && midia.citacoes.length > 0 && (
        <Card className="bg-white border-[#E9E7DC]">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-[#0E2A3F] text-sm sm:text-base md:text-lg">
              <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-[#D9A441]" />
              Citações ({midia.citacoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
            {midia.citacoes.map((citacao) => (
              <div
                key={citacao.id}
                className="border-l-4 border-[#178E96] pl-3 sm:pl-4 py-2 bg-[#F4F3EC] rounded"
              >
                <p className="text-[#0E2A3F] italic text-xs sm:text-sm md:text-base">&ldquo;{citacao.texto}&rdquo;</p>
                {citacao.pagina && (
                  <p className="text-xs text-[#8395A5] mt-1">Página {citacao.pagina}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* MODAL DE COMPARTILHAMENTO AQUI */}
      {midia && (
        <ShareMidiaModal
          midia={midia}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
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

      {/* Modal Confirmar Exclusão */}
      <ConfirmModal
        open={modalExcluir}
        onClose={() => setModalExcluir(false)}
        onConfirm={confirmarExcluir}
        title="Excluir Item da Biblioteca"
        description="Tem certeza que deseja excluir este item da sua biblioteca? Todas as anotações, reflexões e avaliações serão perdidas permanentemente. Esta ação não pode ser desfeita."
        confirmText="Excluir Item"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}