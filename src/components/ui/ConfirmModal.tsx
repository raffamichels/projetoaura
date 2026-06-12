'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Warning, Trash, X } from '@phosphor-icons/react';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30',
          icon: <Trash className="w-6 h-6 text-red-600 dark:text-red-400" />,
          buttonBg: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30',
          icon: <Warning className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          buttonBg: 'bg-amber-600 hover:bg-amber-700',
        };
      case 'info':
        return {
          iconBg: 'bg-brand-soft border border-[#C9E2E3] dark:border-brand/30',
          icon: <Warning className="w-6 h-6 text-brand" />,
          buttonBg: 'bg-brand hover:bg-brand-dark',
        };
      default:
        return {
          iconBg: 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30',
          icon: <Trash className="w-6 h-6 text-red-600 dark:text-red-400" />,
          buttonBg: 'bg-red-600 hover:bg-red-700',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-surface border-line rounded-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl text-ink mb-2">
                {title}
              </DialogTitle>
              <DialogDescription className="text-ink-soft text-sm leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <Button
            variant="default"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-surface border border-line-strong text-ink-soft hover:bg-surface-hover hover:text-ink rounded-xl h-11 duration-150"
          >
            <X className="w-4 h-4 mr-2" />
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={isLoading}
            className={`flex-1 ${styles.buttonBg} text-white font-semibold rounded-xl h-11 duration-150`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Processando...
              </div>
            ) : (
              <>
                <Trash className="w-4 h-4 mr-2" />
                {confirmText}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
