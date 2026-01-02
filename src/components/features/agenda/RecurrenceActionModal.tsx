'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar } from 'lucide-react';

interface RecurrenceActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'edit' | 'delete';
  onConfirm: (applyToAll: boolean) => void;
  compromissoTitulo: string;
}

export function RecurrenceActionModal({
  isOpen,
  onClose,
  action,
  onConfirm,
  compromissoTitulo,
}: RecurrenceActionModalProps) {
  
  const isEdit = action === 'edit';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-aura-400" />
            {isEdit ? 'Editar Compromisso Recorrente' : 'Excluir Compromisso Recorrente'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {compromissoTitulo} faz parte de uma série recorrente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-300">
            Como você deseja {isEdit ? 'editar' : 'excluir'} este compromisso?
          </p>

          {/* Opção 1: Apenas este */}
          <button
            onClick={() => onConfirm(false)}
            className="w-full p-4 border-2 border-zinc-700 rounded-lg hover:border-aura-500 hover:bg-aura-500/5 transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 group-hover:text-aura-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white group-hover:text-aura-400 mb-1">
                  Apenas este compromisso
                </h4>
                <p className="text-sm text-gray-400">
                  {isEdit 
                    ? 'Modifica somente esta ocorrência. As demais permanecerão inalteradas.'
                    : 'Remove somente esta ocorrência. As demais permanecerão na agenda.'
                  }
                </p>
              </div>
            </div>
          </button>

          {/* Opção 2: Este e os futuros */}
          <button
            onClick={() => onConfirm(true)}
            className="w-full p-4 border-2 border-zinc-700 rounded-lg hover:border-aura-500 hover:bg-aura-500/5 transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-aura-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white group-hover:text-aura-400 mb-1">
                  Este e todos os futuros
                </h4>
                <p className="text-sm text-gray-400">
                  {isEdit 
                    ? 'Modifica esta ocorrência e todas as próximas da série.'
                    : 'Remove esta ocorrência e todas as próximas da série.'
                  }
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}