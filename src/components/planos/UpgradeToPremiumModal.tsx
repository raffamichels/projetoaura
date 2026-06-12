'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Sparkle, Calendar, Check, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface UpgradeToPremiumModalProps {
  open: boolean;
  onClose: () => void;
  recurso?: string;
  descricao?: string;
}

export function UpgradeToPremiumModal({
  open,
  onClose,
  recurso,
  descricao,
}: UpgradeToPremiumModalProps) {
  const t = useTranslations('premium');
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/premium');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-surface border-line">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center">
              <Crown className="w-6 h-6 text-brand" />
            </div>
            <div>
              <DialogTitle className="text-xl text-ink">{recurso}</DialogTitle>
              <DialogDescription className="text-ink-soft">
                {descricao}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-surface-hover border border-line rounded-lg p-4">
            <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold" />
              {t('features')}
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-ink-soft">
                  <Sparkle className="w-4 h-4 inline mr-1 text-gold" />
                  {t('aiReviews')}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-ink-soft">
                  <Calendar className="w-4 h-4 inline mr-1 text-brand-blue" />
                  {t('googleCalendar')}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-ink-soft">{t('pomodoroTimer')}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-ink-soft">{t('prioritySupport')}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-ink-soft">{t('earlyAccess')}</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-soft border border-brand/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-ink mb-1">{t('price')}</div>
            <div className="text-sm text-ink-soft">{t('perMonth')}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="default"
            onClick={onClose}
            className="flex-1 bg-surface border border-line text-ink-soft hover:bg-surface-hover"
          >
            {t('notNow')}
          </Button>
          <Button
            onClick={handleUpgrade}
            className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold"
          >
            <Crown className="w-4 h-4 mr-2" />
            {t('upgrade')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
