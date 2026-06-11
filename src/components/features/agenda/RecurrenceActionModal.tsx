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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('agenda');
  const isEdit = action === 'edit';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-[#E9E7DC] text-[#0E2A3F] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#117178]" />
            {isEdit ? t('editRecurring') : t('deleteRecurring')}
          </DialogTitle>
          <DialogDescription className="text-[#44586A]">
            {t('partOfSeries', { title: compromissoTitulo })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-[#44586A]">
            {isEdit ? t('howToEdit') : t('howToDelete')}
          </p>

          {/* Opção 1: Apenas este */}
          <button
            onClick={() => onConfirm(false)}
            className="w-full p-4 border-2 border-[#E9E7DC] rounded-lg hover:border-[#178E96] hover:bg-[#E5F1F1] transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#44586A] group-hover:text-[#117178] mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#0E2A3F] group-hover:text-[#117178] mb-1">
                  {t('onlyThis')}
                </h4>
                <p className="text-sm text-[#44586A]">
                  {isEdit
                    ? t('onlyThisEditDesc')
                    : t('onlyThisDeleteDesc')
                  }
                </p>
              </div>
            </div>
          </button>

          {/* Opção 2: Este e os futuros */}
          <button
            onClick={() => onConfirm(true)}
            className="w-full p-4 border-2 border-[#E9E7DC] rounded-lg hover:border-[#178E96] hover:bg-[#E5F1F1] transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-[#44586A] group-hover:text-[#117178] mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#0E2A3F] group-hover:text-[#117178] mb-1">
                  {t('thisAndFuture')}
                </h4>
                <p className="text-sm text-[#44586A]">
                  {isEdit
                    ? t('thisAndFutureEditDesc')
                    : t('thisAndFutureDeleteDesc')
                  }
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#E9E7DC]">
          <Button
            variant="default"
            onClick={onClose}
            className="border-[#E9E7DC] hover:bg-[#F4F3EC] text-[#44586A]"
          >
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}