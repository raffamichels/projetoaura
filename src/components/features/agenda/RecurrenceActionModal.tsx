'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowsClockwise, Calendar } from '@phosphor-icons/react';
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
      <DialogContent className="bg-surface border-line text-ink sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowsClockwise className="w-5 h-5 text-brand-dark" />
            {isEdit ? t('editRecurring') : t('deleteRecurring')}
          </DialogTitle>
          <DialogDescription className="text-ink-soft">
            {t('partOfSeries', { title: compromissoTitulo })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-ink-soft">
            {isEdit ? t('howToEdit') : t('howToDelete')}
          </p>

          {/* Opção 1: Apenas este */}
          <button
            onClick={() => onConfirm(false)}
            className="w-full p-4 border-2 border-line rounded-lg hover:border-brand hover:bg-brand-soft transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-ink-soft group-hover:text-brand-dark mt-0.5" />
              <div>
                <h4 className="font-semibold text-ink group-hover:text-brand-dark mb-1">
                  {t('onlyThis')}
                </h4>
                <p className="text-sm text-ink-soft">
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
            className="w-full p-4 border-2 border-line rounded-lg hover:border-brand hover:bg-brand-soft transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <ArrowsClockwise className="w-5 h-5 text-ink-soft group-hover:text-brand-dark mt-0.5" />
              <div>
                <h4 className="font-semibold text-ink group-hover:text-brand-dark mb-1">
                  {t('thisAndFuture')}
                </h4>
                <p className="text-sm text-ink-soft">
                  {isEdit
                    ? t('thisAndFutureEditDesc')
                    : t('thisAndFutureDeleteDesc')
                  }
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-line">
          <Button
            variant="default"
            onClick={onClose}
            className="border-line hover:bg-surface-hover text-ink-soft"
          >
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}