'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Bell, Clock } from 'lucide-react';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('notifications');

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-zinc-800 h-8 w-8 sm:h-9 sm:w-9"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-aura-500/10 rounded-lg">
                  <Bell className="w-5 h-5 text-aura-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{t('title')}</h3>
                  <p className="text-xs text-gray-400">{t('subtitle')}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 px-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <div className="p-3 bg-gradient-to-br from-aura-500/20 to-blue-500/20 rounded-full mb-3">
                  <Clock className="w-6 h-6 text-aura-400" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">{t('comingSoon')}</h4>
                <p className="text-xs text-gray-400 text-center">
                  {t('comingSoonDescription')}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
