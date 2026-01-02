'use client';

import { useState } from 'react';
import { Compromisso } from '@/types/compromisso';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Tag, Edit, Trash2, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RecurrenceActionModal } from '@/components/features/agenda/RecurrenceActionModal';
import { getDescricaoRecorrencia } from '@/lib/recorrencia-utils';

interface CompromissoDetailsProps {
  compromisso: Compromisso;
  onEdit: (compromisso: Compromisso) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function CompromissoDetails({ 
  compromisso, 
  onEdit, 
  onDelete, 
  onClose 
}: CompromissoDetailsProps) {
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [recurrenceAction, setRecurrenceAction] = useState<'edit' | 'delete'>('delete');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = () => {
    if (compromisso.isRecorrente) {
      setRecurrenceAction('edit');
      setShowRecurrenceModal(true);
    } else {
      onEdit(compromisso);
    }
  };

  const handleDeleteClick = () => {
    if (compromisso.isRecorrente) {
      setRecurrenceAction('delete');
      setShowRecurrenceModal(true);
    } else {
      handleDelete(false);
    }
  };

  const handleDelete = async (applyToFuture: boolean) => {
    if (!compromisso.isRecorrente) {
      // Confirmação simples para não-recorrente
      if (!confirm('Tem certeza que deseja excluir este compromisso?')) {
        return;
      }
    }

    setIsDeleting(true);

    try {
      const url = `/api/v1/agenda/compromissos/${compromisso.id}${
        applyToFuture ? '?applyToFuture=true' : '?applyToFuture=false'
      }`;

      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(compromisso.id);
        onClose();
      } else {
        alert('Erro ao excluir compromisso');
      }
    } catch {
      alert('Erro ao conectar com o servidor');
    } finally {
      setIsDeleting(false);
      setShowRecurrenceModal(false);
    }
  };

  const handleRecurrenceConfirm = (applyToFuture: boolean) => {
    if (recurrenceAction === 'delete') {
      handleDelete(applyToFuture);
    } else {
      // Para edição, passa a informação para o formulário
      setShowRecurrenceModal(false);
      onEdit({
        ...compromisso,
        // @ts-expect-error - Adiciona flag temporária para saber se aplica a futuros
        _applyToFuture: applyToFuture,
      });
    }
  };

  return (
    <>
      <div className="w-full max-w-md p-4 space-y-4">
        {/* Header com cor */}
        <div 
          className="h-2 -mx-4 -mt-4 rounded-t-lg"
          style={{ backgroundColor: compromisso.cor }}
        />

        {/* Título */}
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{compromisso.titulo}</h3>
          {compromisso.descricao && (
            <p className="text-sm text-gray-400">{compromisso.descricao}</p>
          )}
        </div>

        {/* Badge de Recorrente */}
        {compromisso.isRecorrente && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-aura-500/10 border border-aura-500/30 rounded-full">
            <RefreshCw className="w-3 h-3 text-aura-400" />
            <span className="text-xs text-aura-400 font-medium">
              {getDescricaoRecorrencia(
                compromisso.tipoRecorrencia ?? 'semanal',
                compromisso.intervaloRecorrencia || 1
              )}
            </span>
          </div>
        )}

        {/* Informações */}
        <div className="space-y-2">
          {/* Data */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">
              {format(parseISO(compromisso.data), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>

          {/* Horário */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">
              {compromisso.horaInicio}
              {compromisso.horaFim && ` - ${compromisso.horaFim}`}
            </span>
          </div>

          {/* Categoria */}
          {compromisso.categoria && (
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 capitalize">{compromisso.categoria}</span>
            </div>
          )}

          {/* Informação adicional sobre recorrência */}
          {compromisso.isRecorrente && compromisso.dataFimRecorrencia && (
            <div className="text-xs text-gray-500 pt-2 border-t border-zinc-800">
              Repete até {format(parseISO(compromisso.dataFimRecorrencia), "dd/MM/yyyy")}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2 border-t border-zinc-700">
          <Button
            onClick={handleEditClick}
            className="flex-1 bg-aura-500 hover:bg-aura-600"
            disabled={isDeleting}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            onClick={handleDeleteClick}
            variant="outline"
            className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>

      {/* Modal de Ação de Recorrência */}
      <RecurrenceActionModal
        isOpen={showRecurrenceModal}
        onClose={() => setShowRecurrenceModal(false)}
        action={recurrenceAction}
        onConfirm={handleRecurrenceConfirm}
        compromissoTitulo={compromisso.titulo}
      />
    </>
  );
}