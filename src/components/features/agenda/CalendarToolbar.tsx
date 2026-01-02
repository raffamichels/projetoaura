'use client';

import { format, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewType = 'day' | 'week' | 'month' | 'year';

interface CalendarToolbarProps {
  currentDate: Date;
  view: ViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewType) => void;
  onToday: () => void;
}

export function CalendarToolbar({ currentDate, view, onDateChange, onViewChange, onToday }: CalendarToolbarProps) {
  
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-900/50 border-b border-zinc-800">
      {/* Navegação e Data */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="border-zinc-700 hover:bg-zinc-800"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Hoje
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="hover:bg-zinc-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-white capitalize">
          {getDateLabel()}
        </h2>
      </div>

      {/* Filtros de Visualização */}
      <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('day')}
          className={view === 'day' ? 'bg-zinc-700 text-white' : 'text-gray-400'}
        >
          Dia
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('week')}
          className={view === 'week' ? 'bg-zinc-700 text-white' : 'text-gray-400'}
        >
          Semana
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('month')}
          className={view === 'month' ? 'bg-zinc-700 text-white' : 'text-gray-400'}
        >
          Mês
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('year')}
          className={view === 'year' ? 'bg-zinc-700 text-white' : 'text-gray-400'}
        >
          Ano
        </Button>
      </div>
    </div>
  );
}