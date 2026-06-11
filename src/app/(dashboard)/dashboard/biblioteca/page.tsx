'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Quote, Film, MoreVertical } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { Midia, Citacao, StatusLeitura } from '@/types/midia';
import { NovaMidiaModal } from '@/components/leituras/NovaMidiaModal';
import { CitacoesModal } from '@/components/leituras/CitacoesModal';
import { GerenciarCitacoesModal } from '@/components/leituras/GerenciarCitacoesModal';

export default function BibliotecaPage() {
  const [midias, setMidias] = useState<Midia[]>([]);
  const [citacoesDestaque, setCitacoesDestaque] = useState<Citacao[]>([]);
  const [todasCitacoes, setTodasCitacoes] = useState<Citacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMidiaAberto, setModalMidiaAberto] = useState(false);
  const [modalCitacaoAberto, setModalCitacaoAberto] = useState(false);
  const [modalGerenciarCitacoes, setModalGerenciarCitacoes] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [midiasRes, citacoesDestaqueRes, todasCitacoesRes] = await Promise.all([
        fetch('/api/v1/leituras/midias'),
        fetch('/api/v1/leituras/citacoes?destaque=true'),
        fetch('/api/v1/leituras/citacoes'),
      ]);

      if (midiasRes.ok) {
        const midiasData = await midiasRes.json();
        setMidias(midiasData.data);
      }

      if (citacoesDestaqueRes.ok) {
        const citacoesData = await citacoesDestaqueRes.json();
        setCitacoesDestaque(citacoesData.data);
      }

      if (todasCitacoesRes.ok) {
        const citacoesData = await todasCitacoesRes.json();
        setTodasCitacoes(citacoesData.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: StatusLeitura) => {
    const badges = {
      PROXIMO: { label: 'Próximo', className: 'text-[#44586A]' },
      EM_ANDAMENTO: { label: 'Em andamento', className: 'text-[#117178]' },
      PAUSADO: { label: 'Pausado', className: 'text-[#D9A441]' },
      CONCLUIDO: { label: 'Concluído', className: 'text-green-700' },
    };
    return badges[status] || badges.PROXIMO;
  };

  const midiasPorTipo = {
    total: midias.length,
    livros: midias.filter((m) => m.tipo === 'LIVRO').length,
    filmes: midias.filter((m) => m.tipo === 'FILME').length,
    emAndamento: midias.filter((m) => m.status === 'EM_ANDAMENTO').length,
    concluidos: midias.filter((m) => m.status === 'CONCLUIDO').length,
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

  return (
    <div className="space-y-4 sm:space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0E2A3F]">Biblioteca</h1>
          <p className="text-sm sm:text-base text-[#44586A]">Organize seus livros e filmes</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setModalCitacaoAberto(true)}
            variant="default"
            className="flex-1 sm:flex-none border-[#D9D7CB] hover:bg-[#F4F3EC] h-auto py-2 text-sm"
          >
            <Quote className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Nova Citação</span>
            <span className="xs:hidden">Citação</span>
          </Button>
          <Button
            onClick={() => setModalMidiaAberto(true)}
            className="flex-1 sm:flex-none bg-[#178E96] hover:bg-[#117178] h-auto py-2 text-sm"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Adicionar Item</span>
            <span className="xs:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Frases Inspiradoras */}
      {citacoesDestaque.length > 0 && (
        <Card className="bg-white border-[#E9E7DC]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[#0E2A3F] text-lg sm:text-xl">
              <div className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-[#D9A441]" />
                Frases Inspiradoras
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalGerenciarCitacoes(true)}
                className="h-8 w-8 p-0 hover:bg-[#F4F3EC]"
              >
                <MoreVertical className="w-4 h-4 text-[#44586A]" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {citacoesDestaque.slice(0, 3).map((citacao) => (
              <div key={citacao.id} className="border-l-4 border-[#178E96] pl-4 py-2">
                <p className="text-[#44586A] italic text-sm sm:text-base">&ldquo;{citacao.texto}&rdquo;</p>
                {citacao.autor && (
                  <p className="text-xs sm:text-sm text-[#44586A] mt-2">— {citacao.autor}</p>
                )}
                {citacao.midia && (
                  <p className="text-xs text-[#8395A5] mt-1">
                    {citacao.midia.tipo === 'LIVRO' ? '📚' : '🎬'} {citacao.midia.titulo}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="bg-white border-[#E9E7DC]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#44586A]">
              Total
            </CardTitle>
            <BookOpen className="w-4 h-4 text-[#178E96]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0E2A3F]">{midiasPorTipo.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E9E7DC]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#44586A]">
              Livros
            </CardTitle>
            <BookOpen className="w-4 h-4 text-[#154F6D]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0E2A3F]">{midiasPorTipo.livros}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E9E7DC]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#44586A]">
              Filmes
            </CardTitle>
            <Film className="w-4 h-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0E2A3F]">{midiasPorTipo.filmes}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E9E7DC]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#44586A]">
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#117178]">{midiasPorTipo.emAndamento}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E9E7DC]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#44586A]">
              Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{midiasPorTipo.concluidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Biblioteca */}
      <div className="space-y-6">
        {midias.length === 0 ? (
          <Card className="bg-white border-[#E9E7DC]">
            <CardContent className="p-6 sm:p-8 text-center">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-[#8395A5] mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-[#44586A] mb-3 sm:mb-4">
                Você ainda não tem livros ou filmes cadastrados
              </p>
              <Button
                onClick={() => setModalMidiaAberto(true)}
                className="bg-[#178E96] hover:bg-[#117178] h-auto py-2.5 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeiro item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Livros */}
            {midias.filter((m) => m.tipo === 'LIVRO').length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0E2A3F] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#117178]" />
                    Livros
                  </h2>
                  <span className="text-sm text-[#8395A5]">
                    {midias.filter((m) => m.tipo === 'LIVRO').length} {midias.filter((m) => m.tipo === 'LIVRO').length === 1 ? 'livro' : 'livros'}
                  </span>
                </div>
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4 min-w-max">
                    {midias.filter((m) => m.tipo === 'LIVRO').map((midia) => {
                      const statusInfo = getStatusBadge(midia.status);
                      return (
                        <Card
                          key={midia.id}
                          className="bg-white border-[#E9E7DC] hover:border-[#D9D7CB] cursor-pointer transition-colors w-64 flex-shrink-0"
                          onClick={() => window.location.href = `/dashboard/biblioteca/${midia.id}`}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Capa */}
                            {midia.capa && (
                              <div className="flex justify-center">
                                <img
                                  src={midia.capa}
                                  alt={`Capa de ${midia.titulo}`}
                                  className="w-full h-80 object-cover rounded-lg border border-[#D9D7CB] shadow-lg"
                                />
                              </div>
                            )}

                            {/* Título */}
                            <div className="flex items-start gap-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: midia.cor + '20', color: midia.cor }}
                              >
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-[#0E2A3F] font-semibold text-sm line-clamp-2">{midia.titulo}</h3>
                                <p className="text-xs text-[#44586A] truncate mt-1">{midia.autor}</p>
                              </div>
                            </div>

                            {/* Status e Nota */}
                            <div className="flex items-center justify-between gap-4 text-xs pt-2 border-t border-[#E9E7DC]">
                              <div className={statusInfo.className}>
                                {statusInfo.label}
                              </div>
                              {midia.nota && midia.nota > 0 && (
                                <StarRating value={midia.nota} size="sm" readonly />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Filmes */}
            {midias.filter((m) => m.tipo === 'FILME').length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0E2A3F] flex items-center gap-2">
                    <Film className="w-5 h-5 text-pink-400" />
                    Filmes
                  </h2>
                  <span className="text-sm text-[#8395A5]">
                    {midias.filter((m) => m.tipo === 'FILME').length} {midias.filter((m) => m.tipo === 'FILME').length === 1 ? 'filme' : 'filmes'}
                  </span>
                </div>
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4 min-w-max">
                    {midias.filter((m) => m.tipo === 'FILME').map((midia) => {
                      const statusInfo = getStatusBadge(midia.status);
                      return (
                        <Card
                          key={midia.id}
                          className="bg-white border-[#E9E7DC] hover:border-[#D9D7CB] cursor-pointer transition-colors w-64 flex-shrink-0"
                          onClick={() => window.location.href = `/dashboard/biblioteca/${midia.id}`}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Capa */}
                            {midia.capa && (
                              <div className="flex justify-center">
                                <img
                                  src={midia.capa}
                                  alt={`Capa de ${midia.titulo}`}
                                  className="w-full h-80 object-cover rounded-lg border border-[#D9D7CB] shadow-lg"
                                />
                              </div>
                            )}

                            {/* Título */}
                            <div className="flex items-start gap-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: midia.cor + '20', color: midia.cor }}
                              >
                                <Film className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-[#0E2A3F] font-semibold text-sm line-clamp-2">{midia.titulo}</h3>
                                <p className="text-xs text-[#44586A] truncate mt-1">{midia.diretor}</p>
                              </div>
                            </div>

                            {/* Status e Nota */}
                            <div className="flex items-center justify-between gap-4 text-xs pt-2 border-t border-[#E9E7DC]">
                              <div className={statusInfo.className}>
                                {statusInfo.label}
                              </div>
                              {midia.nota && midia.nota > 0 && (
                                <StarRating value={midia.nota} size="sm" readonly />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Citações */}
      {todasCitacoes.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0E2A3F] mb-3 sm:mb-4">Citações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {todasCitacoes.slice(0, 6).map((citacao) => (
              <Card
                key={citacao.id}
                className="bg-white border-[#E9E7DC] hover:border-[#D9D7CB] cursor-pointer transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-amber-50 text-[#D9A441]">
                      <Quote className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0E2A3F] text-sm italic line-clamp-3">
                        &ldquo;{citacao.texto}&rdquo;
                      </p>
                      {citacao.autor && (
                        <p className="text-xs text-[#8395A5] mt-2">— {citacao.autor}</p>
                      )}
                      {citacao.midia && (
                        <p className="text-xs text-[#8395A5] mt-1">
                          {citacao.midia.tipo === 'LIVRO' ? '📚' : '🎬'} {citacao.midia.titulo}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modais */}
      <NovaMidiaModal
        aberto={modalMidiaAberto}
        onFechar={() => setModalMidiaAberto(false)}
        onSucesso={carregarDados}
      />

      <CitacoesModal
        aberto={modalCitacaoAberto}
        onFechar={() => setModalCitacaoAberto(false)}
        onSucesso={carregarDados}
        midias={midias}
      />

      <GerenciarCitacoesModal
        aberto={modalGerenciarCitacoes}
        onFechar={() => setModalGerenciarCitacoes(false)}
        onAtualizar={carregarDados}
      />
    </div>
  );
}
