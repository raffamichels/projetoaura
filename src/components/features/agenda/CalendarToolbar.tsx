'use client';

import { format, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

type ViewType = 'day' | 'week' | 'month' | 'year';

interface CalendarToolbarProps {
  currentDate: Date;
  view: ViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewType) => void;
  onToday: () => void;
  onRefresh?: () => void;
}

export function CalendarToolbar({ currentDate, view, onDateChange, onViewChange, onToday, onRefresh }: CalendarToolbarProps) {
  const t = useTranslations('agenda');
  const locale = useLocale();
  const dateLocale = locale === 'pt' ? ptBR : enUS;

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!onRefresh) return;

    setIsSyncing(true);
    try {
      const response = await fetch('/api/v1/agenda/sync-toggle');
      if (response.ok) {
        const data = await response.json();
        console.log(`Sincronizados ${data.updatedCount} compromissos`);
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePrevious = () => {
    let newDate: Date;
    switch (view) {
      case 'day':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        onDateChange(newDate);
        break;
      case 'week':
        onDateChange(subWeeks(currentDate, 1));
        break;
      case 'month':
        onDateChange(subMonths(currentDate, 1));
        break;
      case 'year':
        onDateChange(subYears(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    let newDate: Date;
    switch (view) {
      case 'day':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        onDateChange(newDate);
        break;
      case 'week':
        onDateChange(addWeeks(currentDate, 1));
        break;
      case 'month':
        onDateChange(addMonths(currentDate, 1));
        break;
      case 'year':
        onDateChange(addYears(currentDate, 1));
        break;
    }
  };

  const getDateLabel = () => {
    switch (view) {
      case 'day':
        return format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: dateLocale });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        return format(weekStart, "MMMM 'de' yyyy", { locale: dateLocale });
      case 'month':
        return format(startOfMonth(currentDate), "MMMM 'de' yyyy", { locale: dateLocale });
      case 'year':
        return format(startOfYear(currentDate), 'yyyy');
    }
  };

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-white border-b border-[#E9E7DC] sticky top-0 z-30 shrink-0">
      {/* Primeira linha: Navegação e data */}
      <div className="flex items-center justify-between gap-2 w-full">
        {/* Botões de navegação */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="hover:bg-[#F4F3EC] h-8 w-8 sm:h-9 sm:w-9 text-[#0E2A3F]"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="hover:bg-[#F4F3EC] h-8 w-8 sm:h-9 sm:w-9 text-[#0E2A3F]"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Data central */}
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-[#0E2A3F] capitalize truncate flex-1 text-center">
          {getDateLabel()}
        </h2>

        {/* Botões de ação */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToday}
            className="hover:bg-[#F4F3EC] h-8 w-8 sm:h-9 sm:w-9 text-[#44586A]"
            title={t('today')}
          >
            <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </Button>

          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSync}
              disabled={isSyncing}
              className="hover:bg-[#F4F3EC] h-8 w-8 sm:h-9 sm:w-9 text-[#44586A]"
              title={isSyncing ? t('synchronizing') : t('synchronize')}
            >
              <RefreshCw className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Segunda linha: Filtros de Visualização - mais compacto */}
      <div className="flex items-center gap-0.5 bg-[#F4F3EC] rounded-md p-0.5 w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('day')}
          className={`flex-1 text-xs h-7 transition-all ${
            view === 'day'
              ? 'bg-[#178E96] text-white hover:bg-[#117178]'
              : 'text-[#44586A] hover:text-[#0E2A3F] hover:bg-[#E9E7DC]'
          }`}
        >
          {t('day')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('week')}
          className={`flex-1 text-xs h-7 transition-all ${
            view === 'week'
              ? 'bg-[#178E96] text-white hover:bg-[#117178]'
              : 'text-[#44586A] hover:text-[#0E2A3F] hover:bg-[#E9E7DC]'
          }`}
        >
          {t('week')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('month')}
          className={`flex-1 text-xs h-7 transition-all ${
            view === 'month'
              ? 'bg-[#178E96] text-white hover:bg-[#117178]'
              : 'text-[#44586A] hover:text-[#0E2A3F] hover:bg-[#E9E7DC]'
          }`}
        >
          {t('month')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('year')}
          className={`flex-1 text-xs h-7 transition-all hidden sm:flex ${
            view === 'year'
              ? 'bg-[#178E96] text-white hover:bg-[#117178]'
              : 'text-[#44586A] hover:text-[#0E2A3F] hover:bg-[#E9E7DC]'
          }`}
        >
          {t('year')}
        </Button>
      </div>
    </div>
  );
}