'use client';

import { format, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
        return format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        return format(weekStart, "MMMM 'de' yyyy", { locale: ptBR });
      case 'month':
        return format(startOfMonth(currentDate), "MMMM 'de' yyyy", { locale: ptBR });
      case 'year':
        return format(startOfYear(currentDate), 'yyyy');
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-900/95 border-b-2 border-zinc-700 sticky top-0 z-30 backdrop-blur-md shadow-xl">
      {/* Primeira linha: Botões de ação e navegação */}
      <div className="flex items-center justify-between gap-2 w-full">
        {/* Grupo de botões à esquerda */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onToday}
            className="border-zinc-700 hover:bg-zinc-800 hover:border-aura-500 text-xs px-2 sm:px-3 h-8 sm:h-9 transition-all duration-200 hover:shadow-lg hover:shadow-aura-500/20"
          >
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Hoje</span>
          </Button>

          {onRefresh && (
            <Button
              variant="default"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="border-zinc-700 hover:bg-zinc-800 hover:border-blue-500 text-xs px-2 sm:px-3 h-8 sm:h-9 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline ml-1.5">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </Button>
          )}
        </div>

        {/* Navegação central */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-zinc-800/50 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="hover:bg-zinc-700 h-7 w-7 sm:h-8 sm:w-8 transition-all duration-200 hover:text-aura-400"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="hover:bg-zinc-700 h-7 w-7 sm:h-8 sm:w-8 transition-all duration-200 hover:text-aura-400"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white capitalize truncate bg-zinc-800/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg max-w-[120px] sm:max-w-[200px] md:max-w-none">
            {getDateLabel()}
          </h2>
        </div>
      </div>

      {/* Segunda linha: Filtros de Visualização */}
      <div className="flex items-center gap-1 bg-zinc-800/60 rounded-lg p-1 w-full shadow-inner">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('day')}
          className={`flex-1 text-xs px-2 sm:px-3 h-7 sm:h-8 transition-all duration-200 ${
            view === 'day'
              ? 'bg-aura-600 text-white shadow-lg shadow-aura-500/30 hover:bg-aura-700'
              : 'text-gray-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          Dia
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('week')}
          className={`flex-1 text-xs px-2 sm:px-3 h-7 sm:h-8 transition-all duration-200 ${
            view === 'week'
              ? 'bg-aura-600 text-white shadow-lg shadow-aura-500/30 hover:bg-aura-700'
              : 'text-gray-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          Semana
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('month')}
          className={`flex-1 text-xs px-2 sm:px-3 h-7 sm:h-8 transition-all duration-200 ${
            view === 'month'
              ? 'bg-aura-600 text-white shadow-lg shadow-aura-500/30 hover:bg-aura-700'
              : 'text-gray-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          Mês
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('year')}
          className={`flex-1 text-xs px-2 sm:px-3 h-7 sm:h-8 transition-all duration-200 ${
            view === 'year'
              ? 'bg-aura-600 text-white shadow-lg shadow-aura-500/30 hover:bg-aura-700'
              : 'text-gray-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          Ano
        </Button>
      </div>
    </div>
  );
}