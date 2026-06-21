'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner, X } from '@phosphor-icons/react';
import type { SugestaoMidia } from '@/types/midia';

interface ImageSearchSelectorProps {
  tipo: 'livro' | 'filme';
  titulo: string;
  capaAtual: string;
  onSelecionar: (sugestao: SugestaoMidia) => void;
  onRemoverCapa: () => void;
}

export function ImageSearchSelector({
  tipo,
  titulo,
  capaAtual,
  onSelecionar,
  onRemoverCapa,
}: ImageSearchSelectorProps) {
  const [sugestoes, setSugestoes] = useState<SugestaoMidia[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const ultimaBuscaRef = useRef('');

  // Limpa sugestões quando o tipo muda
  useEffect(() => {
    setSugestoes([]);
    setMostrarSugestoes(false);
    ultimaBuscaRef.current = '';
  }, [tipo]);

  // Busca automática quando o título muda (com debounce)
  useEffect(() => {
    const query = titulo.trim();

    // Não busca se o título estiver vazio ou for igual à última busca
    if (!query || query === ultimaBuscaRef.current) {
      return;
    }

    // Debounce de 500ms após parar de digitar
    const timeoutId = setTimeout(() => {
      buscarCapas(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [titulo, tipo]);

  const buscarCapas = async (query: string) => {
    if (!query.trim()) {
      setSugestoes([]);
      setMostrarSugestoes(false);
      return;
    }

    // Evita buscar o mesmo termo duas vezes
    if (query === ultimaBuscaRef.current) {
      return;
    }

    ultimaBuscaRef.current = query;
    setBuscando(true);

    try {
      const response = await fetch(
        `/api/v1/leituras/buscar-capas?q=${encodeURIComponent(query)}&tipo=${tipo}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar capas');
      }

      const data = await response.json();

      setSugestoes(data.sugestoes || []);
      setMostrarSugestoes(true);
    } catch (error) {
      console.error('Erro ao buscar capas:', error);
      setSugestoes([]);
    } finally {
      setBuscando(false);
    }
  };

  const handleSelecionar = (sugestao: SugestaoMidia) => {
    // Evita disparar outra busca caso a API normalize o título selecionado.
    ultimaBuscaRef.current = sugestao.titulo.trim();
    onSelecionar(sugestao);
    setMostrarSugestoes(false);
  };

  return (
    <div className="space-y-2">
      {buscando && (
        <div className="flex items-center gap-2 text-[#44586A] text-sm">
          <Spinner className="w-4 h-4 animate-spin" />
          <span>Buscando {tipo === 'livro' ? 'livros' : 'filmes'} para "{titulo}"...</span>
        </div>
      )}

      {mostrarSugestoes && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-ink-soft">
              Selecione {tipo === 'livro' ? 'o livro' : 'o filme'} ({sugestoes.length} {sugestoes.length === 1 ? 'resultado' : 'resultados'})
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMostrarSugestoes(false)}
              className="text-ink-soft hover:text-ink h-auto p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {sugestoes.length === 0 ? (
            <div className="bg-surface-hover border border-line-strong rounded-lg p-6 text-center">
              <p className="text-ink-soft">Nenhum resultado encontrado para "{titulo}"</p>
              <p className="text-xs text-ink-faint mt-1">Tente um termo de busca diferente</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-45 overflow-y-auto p-1">
              {sugestoes.map((sugestao) => (
                <button
                  key={sugestao.id}
                  type="button"
                  onClick={() => handleSelecionar(sugestao)}
                  className={`group relative rounded-lg overflow-hidden transition-all hover:ring-2 hover:ring-brand ${
                    capaAtual === sugestao.capa ? 'ring-2 ring-brand' : 'ring-1 ring-zinc-700'
                  }`}
                  title={`${sugestao.titulo}${sugestao.autor ? ` - ${sugestao.autor}` : ''}${sugestao.ano ? ` (${sugestao.ano})` : ''}`}
                >
                  <div className="aspect-[2/3] bg-surface-hover">
                    <img
                      src={sugestao.capa}
                      alt={sugestao.titulo}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-xs font-medium text-ink line-clamp-2">
                        {sugestao.titulo}
                      </p>
                      {(sugestao.autor || sugestao.ano) && (
                        <p className="text-xs text-ink-soft line-clamp-1">
                          {sugestao.autor}
                          {sugestao.autor && sugestao.ano && ' • '}
                          {sugestao.ano}
                        </p>
                      )}
                    </div>
                  </div>
                  {capaAtual === sugestao.capa && (
                    <div className="absolute top-2 right-2 bg-brand rounded-full p-1">
                      <svg className="w-3 h-3 text-ink" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview da capa atual */}
      {capaAtual && (
        <div>
          <Label className="text-ink-soft text-xs">Capa Selecionada</Label>
          <div className="mt-1 relative inline-block">
            <img
              src={capaAtual}
              alt="Preview da capa"
              className="w-20 h-28 object-cover rounded-md border border-line-strong"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onRemoverCapa}
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
              title="Remover capa"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
