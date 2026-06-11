'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Bell,
  CheckCheck,
  Flame,
  Calendar,
  AlertTriangle,
  Award,
  Info,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mapeamento de ícones por tipo de notificação
const TIPO_CONFIG = {
  LEMBRETE_HABITO: {
    icon: Bell,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  RESUMO_DIARIO: {
    icon: Calendar,
    bgColor: 'bg-[#E5F1F1]',
    iconColor: 'text-[#178E96]',
  },
  SEQUENCIA_RISCO: {
    icon: AlertTriangle,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  CONQUISTA: {
    icon: Award,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  SISTEMA: {
    icon: Info,
    bgColor: 'bg-[#F4F3EC]',
    iconColor: 'text-[#8395A5]',
  },
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('notifications');
  const {
    notificacoes,
    unreadCount,
    isLoading,
    marcarComoLida,
    marcarTodasComoLidas,
  } = useNotifications();

  const handleNotificationClick = useCallback(async (id: string, lida: boolean) => {
    if (!lida) {
      await marcarComoLida(id);
    }
  }, [marcarComoLida]);

  const handleMarkAllRead = useCallback(async () => {
    await marcarTodasComoLidas();
  }, [marcarTodasComoLidas]);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative text-white hover:text-white hover:bg-white/15 h-8 w-8 sm:h-9 sm:w-9 duration-150"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:top-0 sm:right-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-white border border-[#E3E1D6] text-[#0E2A3F] rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#E9E7DC]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#E5F1F1] rounded-lg">
                    <Bell className="w-5 h-5 text-[#178E96]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0E2A3F]">{t('title')}</h3>
                    <p className="text-xs text-[#8395A5]">
                      {unreadCount > 0
                        ? t('unreadCount', { count: unreadCount })
                        : t('allRead')}
                    </p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-[#117178] hover:text-[#178E96] transition-colors duration-150"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    {t('markAllRead')}
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#178E96] animate-spin" />
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <div className="p-3 bg-[#F4F3EC] rounded-full mb-3">
                    <Bell className="w-6 h-6 text-[#8395A5]" />
                  </div>
                  <p className="text-sm text-[#44586A] text-center">{t('noNotifications')}</p>
                  <p className="text-xs text-[#8395A5] text-center mt-1">{t('noNotificationsDesc')}</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E9E7DC]">
                  {notificacoes.map((notif) => {
                    const config = TIPO_CONFIG[notif.tipo] || TIPO_CONFIG.SISTEMA;
                    const Icon = config.icon;

                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id, notif.lida)}
                        className={`w-full p-4 text-left transition-colors duration-150 hover:bg-[#F4F3EC] ${
                          !notif.lida
                            ? 'bg-[#178E96]/5 border-l-2 border-l-[#178E96]'
                            : 'opacity-70'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${config.bgColor}`}>
                            <Icon className={`w-4 h-4 ${config.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium truncate ${
                                !notif.lida ? 'text-[#0E2A3F]' : 'text-[#5E7081]'
                              }`}>
                                {notif.titulo}
                              </p>
                              {!notif.lida && (
                                <span className="w-2 h-2 bg-[#178E96] rounded-full shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-[#5E7081] line-clamp-2 mt-0.5">
                              {notif.mensagem}
                            </p>
                            <p className="text-[10px] text-[#8395A5] mt-1.5">
                              {formatTime(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notificacoes.length > 0 && (
              <div className="p-3 border-t border-[#E9E7DC] bg-[#F4F3EC]">
                <p className="text-[10px] text-[#8395A5] text-center">
                  {t('showingRecent', { count: notificacoes.length })}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
