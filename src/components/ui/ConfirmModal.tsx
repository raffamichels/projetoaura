'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X } from 'lucide-react';

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
          iconBg: 'bg-red-50 border border-red-200',
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          buttonBg: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50 border border-amber-200',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          buttonBg: 'bg-amber-600 hover:bg-amber-700',
        };
      case 'info':
        return {
          iconBg: 'bg-[#E5F1F1] border border-[#C9E2E3]',
          icon: <AlertTriangle className="w-6 h-6 text-[#178E96]" />,
          buttonBg: 'bg-[#178E96] hover:bg-[#117178]',
        };
      default:
        return {
          iconBg: 'bg-red-50 border border-red-200',
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          buttonBg: 'bg-red-600 hover:bg-red-700',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white border-[#E3E1D6] rounded-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl text-[#0E2A3F] mb-2">
                {title}
              </DialogTitle>
              <DialogDescription className="text-[#44586A] text-sm leading-relaxed">
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
            className="flex-1 bg-white border border-[#D9D7CB] text-[#44586A] hover:bg-[#F4F3EC] hover:text-[#0E2A3F] rounded-xl h-11 duration-150"
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
                <Trash2 className="w-4 h-4 mr-2" />
                {confirmText}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
