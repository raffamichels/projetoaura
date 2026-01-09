'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TipoMidia,
  StatusLeitura,
  FonteLivro,
  GENEROS_LIVRO,
  GENEROS_FILME,
  CORES_MIDIA,
} from '@/types/midia';
import { ImageSearchSelector } from './ImageSearchSelector';
import { StarRating } from '@/components/ui/star-rating';

interface NovaMidiaModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

export function NovaMidiaModal({ aberto, onFechar, onSucesso }: NovaMidiaModalProps) {
  const [carregando, setCarregando] = useState(false);
  const [tipoAnterior, setTipoAnterior] = useState(TipoMidia.LIVRO);
  const [formData, setFormData] = useState({
    tipo: TipoMidia.LIVRO,
    titulo: '',
    capa: '',
    cor: CORES_MIDIA[0],
    autor: '',
    editora: '',
    genero: '',
    fonte: FonteLivro.FISICO,
    diretor: '',
    duracao: '',
    anoLancamento: '',
    idioma: '',
    status: StatusLeitura.PROXIMO,
    nota: '',
    dataInicio: '',
    dataConclusao: '',
  });

  // Limpa a capa quando o modal fecha
  useEffect(() => {
    if (!aberto) {
      // Quando o modal fecha, limpa todo o formulário
      limparFormulario();
    }
  }, [aberto]);

  // Limpa a capa quando o tipo muda
  useEffect(() => {
    if (formData.tipo !== tipoAnterior) {
      setFormData(prev => ({ ...prev, capa: '' }));
      setTipoAnterior(formData.tipo);
    }
  }, [formData.tipo, tipoAnterior]);

  const limparFormulario = () => {
    setFormData({
      tipo: TipoMidia.LIVRO,
      titulo: '',
      capa: '',
      cor: CORES_MIDIA[0],
      autor: '',
      editora: '',
      genero: '',
      fonte: FonteLivro.FISICO,
      diretor: '',
      duracao: '',
      anoLancamento: '',
      idioma: '',
      status: StatusLeitura.PROXIMO,
      nota: '',
      dataInicio: '',
      dataConclusao: '',
    });
    setTipoAnterior(TipoMidia.LIVRO);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const payload: any = {
        tipo: formData.tipo,
        titulo: formData.titulo,
        capa: formData.capa || null,
        cor: formData.cor,
        status: formData.status,
        idioma: formData.idioma || null,
        nota: formData.nota ? parseInt(formData.nota) : null,
        dataInicio: formData.dataInicio || null,
        dataConclusao: formData.dataConclusao || null,
      };

      if (formData.tipo === TipoMidia.LIVRO) {
        payload.autor = formData.autor || null;
        payload.editora = formData.editora || null;
        payload.genero = formData.genero || null;
        payload.fonte = formData.fonte || null;
      } else {
        payload.diretor = formData.diretor || null;
        payload.duracao = formData.duracao ? parseInt(formData.duracao) : null;
        payload.anoLancamento = formData.anoLancamento ? parseInt(formData.anoLancamento) : null;
        payload.genero = formData.genero || null;
      }

      const res = await fetch('/api/v1/leituras/midias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        limparFormulario();
        onSucesso();
        onFechar();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao criar item');
      }
    } catch (error) {
      console.error('Erro ao criar item:', error);
      alert('Erro ao criar item');
    } finally {
      setCarregando(false);
    }
  };

  const generos = formData.tipo === TipoMidia.LIVRO ? GENEROS_LIVRO : GENEROS_FILME;

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-white text-base sm:text-lg">Adicionar {formData.tipo === TipoMidia.LIVRO ? 'Livro' : 'Filme'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Tipo */}
          <div>
            <Label className="text-zinc-300 text-sm sm:text-base">Tipo</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                type="button"
                variant="default"
                onClick={() => setFormData({ ...formData, tipo: TipoMidia.LIVRO })}
                className={`text-sm sm:text-base ${formData.tipo === TipoMidia.LIVRO ? 'bg-purple-600 hover:bg-purple-700' : 'border-zinc-700'}`}
              >
                📚 Livro
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => setFormData({ ...formData, tipo: TipoMidia.FILME })}
                className={`text-sm sm:text-base ${formData.tipo === TipoMidia.FILME ? 'bg-purple-600 hover:bg-purple-700' : 'border-zinc-700'}`}
              >
                🎬 Filme
              </Button>
            </div>
          </div>

          {/* Título */}
          <div>
            <Label htmlFor="titulo" className="text-zinc-300 text-sm sm:text-base">
              Título <span className="text-red-400">*</span>
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white mt-1 text-sm sm:text-base"
              required
            />
          </div>

          {/* Campos específicos de Livro */}
          {formData.tipo === TipoMidia.LIVRO && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="autor" className="text-zinc-300 text-sm sm:text-base">Autor</Label>
                  <Input
                    id="autor"
                    value={formData.autor}
                    onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white mt-1 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="editora" className="text-zinc-300 text-sm sm:text-base">Editora</Label>
                  <Input
                    id="editora"
                    value={formData.editora}
                    onChange={(e) => setFormData({ ...formData, editora: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white mt-1 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fonte" className="text-zinc-300 text-sm sm:text-base">Fonte</Label>
                <select
                  id="fonte"
                  value={formData.fonte}
                  onChange={(e) => setFormData({ ...formData, fonte: e.target.value as FonteLivro })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white mt-1 text-sm sm:text-base"
                >
                  <option value={FonteLivro.FISICO}>Físico</option>
                  <option value={FonteLivro.DIGITAL}>Digital</option>
                  <option value={FonteLivro.KINDLE}>Kindle</option>
                  <option value={FonteLivro.EMPRESTADO}>Emprestado</option>
                </select>
              </div>
            </>
          )}

          {/* Campos específicos de Filme */}
          {formData.tipo === TipoMidia.FILME && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="diretor" className="text-zinc-300 text-sm sm:text-base">Diretor</Label>
                  <Input
                    id="diretor"
                    value={formData.diretor}
                    onChange={(e) => setFormData({ ...formData, diretor: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white mt-1 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="anoLancamento" className="text-zinc-300 text-sm sm:text-base">Ano de Lançamento</Label>
                  <Input
                    id="anoLancamento"
                    type="number"
                    value={formData.anoLancamento}
                    onChange={(e) => setFormData({ ...formData, anoLancamento: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white mt-1 text-sm sm:text-base"
                    placeholder="Ex: 2023"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duracao" className="text-zinc-300 text-sm sm:text-base">Duração (minutos)</Label>
                <Input
                  id="duracao"
                  type="number"
                  value={formData.duracao}
                  onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1 text-sm sm:text-base"
                  placeholder="Ex: 120"
                />
              </div>
            </>
          )}

          {/* Campos comuns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="genero" className="text-zinc-300 text-sm sm:text-base">Gênero</Label>
              <select
                id="genero"
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white mt-1 text-sm sm:text-base"
              >
                <option value="">Selecione...</option>
                {generos.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="idioma" className="text-zinc-300 text-sm sm:text-base">Idioma</Label>
              <Input
                id="idioma"
                value={formData.idioma}
                onChange={(e) => setFormData({ ...formData, idioma: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1 text-sm sm:text-base"
                placeholder="Ex: Português"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="status" className="text-zinc-300 text-sm sm:text-base">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusLeitura })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white mt-1 text-sm sm:text-base"
              >
                <option value={StatusLeitura.PROXIMO}>Próximo</option>
                <option value={StatusLeitura.EM_ANDAMENTO}>Em andamento</option>
                <option value={StatusLeitura.PAUSADO}>Pausado</option>
                <option value={StatusLeitura.CONCLUIDO}>Concluído</option>
              </select>
            </div>

            <div>
              <Label className="text-zinc-300 text-sm sm:text-base mb-2 block">Avaliação</Label>
              <StarRating
                value={parseInt(formData.nota) || 0}
                onChange={(nota) => setFormData({ ...formData, nota: nota.toString() })}
                size="lg"
                showLabel
              />
            </div>
          </div>

          {/* Busca de Capa Automática */}
          <ImageSearchSelector
            tipo={formData.tipo === TipoMidia.LIVRO ? 'livro' : 'filme'}
            titulo={formData.titulo}
            capaAtual={formData.capa}
            onSelecionarCapa={(url) => setFormData({ ...formData, capa: url })}
          />

          <div>
            <Label className="text-zinc-300 text-sm sm:text-base">Cor</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CORES_MIDIA.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${
                    formData.cor === cor ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''
                  }`}
                  style={{ backgroundColor: cor }}
                  onClick={() => setFormData({ ...formData, cor })}
                />
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-3 sm:pt-4">
            <Button
              type="button"
              variant="default"
              onClick={onFechar}
              disabled={carregando}
              className="border-zinc-700 w-full sm:w-auto text-sm sm:text-base"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={carregando}
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-sm sm:text-base"
            >
              {carregando ? 'Criando...' : `Criar ${formData.tipo === TipoMidia.LIVRO ? 'Livro' : 'Filme'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
