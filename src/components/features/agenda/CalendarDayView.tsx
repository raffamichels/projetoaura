'use client';

import { useState, useEffect, useRef } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Compromisso } from '@/types/compromisso';

interface CalendarDayViewProps {
  compromissos: Compromisso[];
  onSlotClick: (date: Date, hour: number) => void;
  onCompromissoClick: (compromisso: Compromisso) => void;
  currentDate: Date;
}

export function CalendarDayView({ compromissos, onSlotClick, onCompromissoClick, currentDate }: CalendarDayViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Função para realizar o scroll
  const scrollToCurrentTime = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();

    // Calcular posição em pixels (60px por hora) onde a barra está
    const barPosition = (currentHour * 60) + currentMinutes;

    // Subtrair metade da altura visível para centralizar a barra
    const containerHeight = container.clientHeight;
    const scrollPosition = barPosition - (containerHeight / 2);
    const targetScroll = Math.max(0, scrollPosition);

    container.scrollTop = targetScroll;
  };

  // Atualizar linha do tempo a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  // Definir scroll inicial na posição do horário atual
  useEffect(() => {
    // Aguardar o próximo frame de renderização
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToCurrentTime();

        // Tentar novamente para garantir
        const timer1 = setTimeout(scrollToCurrentTime, 100);
        const timer2 = setTimeout(scrollToCurrentTime, 300);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      });
    });
  }, [currentDate]);

  // Gerar horas do dia (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calcular posição da linha do tempo
  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hour * 60 + minutes); // Posição em pixels (1 minuto = 1 pixel)
  };

  // Verificar se é hoje
  const isToday = isSameDay(currentDate, new Date());

  // Buscar compromissos do dia atual
  const getDayCompromissos = () => {
    return compromissos.filter(comp => {
      const compDate = parseISO(comp.data);
      return isSameDay(compDate, currentDate);
    });
  };

  // Calcular posição e altura do compromisso
  const getCompromissoStyle = (compromisso: Compromisso) => {
    const [startHour, startMinute] = compromisso.horaInicio.split(':').map(Number);
    const top = (startHour * 60) + startMinute; // 60px por hora, 1px por minuto

    let height = 60; // Altura padrão 1 hora
    if (compromisso.horaFim) {
      const [endHour, endMinute] = compromisso.horaFim.split(':').map(Number);
      const endPosition = (endHour * 60) + endMinute;
      const startPosition = (startHour * 60) + startMinute;
      height = endPosition - startPosition;
    }

    return { top: `${top}px`, height: `${Math.max(height, 30)}px` };
  };

  const dayCompromissos = getDayCompromissos();

  return (
    <div className="flex flex-col flex-1 min-h-0 max-h-full relative">
      {/* Header com o dia - FIXO */}
      <div className="grid grid-cols-[auto_1fr] border-b-2 border-zinc-700 bg-gradient-to-b from-zinc-900 to-zinc-900/95 z-20 shadow-lg backdrop-blur-sm flex-shrink-0">
        {/* Coluna de horas (vazia) */}
        <div className="w-16 sm:w-20 border-r border-zinc-800"></div>

        {/* Dia */}
        <div
          className={`p-3 sm:p-4 text-center transition-all duration-200 ${
            isToday ? 'bg-aura-500/10 border-b-2 border-b-aura-500' : ''
          }`}
        >
          <div className="text-xs sm:text-sm text-gray-400 uppercase font-medium">
            {format(currentDate, 'EEEE', { locale: ptBR })}
          </div>
          <div className={`text-2xl sm:text-3xl font-bold mt-1 transition-colors ${
            isToday ? 'text-aura-400' : 'text-white'
          }`}>
            {format(currentDate, 'd')}
          </div>
          <div className="text-xs sm:text-sm text-gray-400 mt-1">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </div>
        </div>
      </div>

      {/* Grid de horários - SCROLLÁVEL */}
      <div
        className="flex-1 overflow-y-scroll overflow-x-hidden"
        ref={scrollContainerRef}
        style={{ height: '0px' }}
      >
        <div className="grid grid-cols-[auto_1fr] relative" style={{ height: '1440px' }}>
          {/* Coluna de horas */}
          <div className="w-16 sm:w-20 relative border-r border-zinc-800">
            {hours.map(hour => (
              <div
                key={hour}
                className="h-[60px] border-b border-zinc-800 flex items-start justify-end pr-2 sm:pr-3 pt-0"
              >
                <span className="text-xs sm:text-sm text-gray-500 -translate-y-2">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Coluna do dia */}
          <div className="relative">
            {/* Grid de horas clicável */}
            {hours.map(hour => (
              <button
                key={hour}
                onClick={() => onSlotClick(currentDate, hour)}
                className="w-full h-[60px] border-b border-zinc-800 hover:bg-aura-500/5 active:bg-aura-500/10 transition-colors text-left block touch-manipulation"
              />
            ))}

            {/* Compromissos do dia */}
            {dayCompromissos.map(comp => {
              const style = getCompromissoStyle(comp);
              return (
                <button
                  key={comp.id}
                  onClick={() => onCompromissoClick(comp)}
                  className="absolute left-2 right-2 sm:left-4 sm:right-4 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-left overflow-hidden hover:opacity-90 active:opacity-80 transition-opacity z-10 touch-manipulation"
                  style={{
                    top: style.top,
                    height: style.height,
                    backgroundColor: `${comp.cor}30`,
                    borderLeft: `4px solid ${comp.cor}`,
                  }}
                >
                  <div className="font-semibold truncate text-sm sm:text-base" style={{ color: comp.cor }}>
                    {comp.titulo}
                  </div>
                  {comp.horaFim && (
                    <div className="text-gray-400 text-xs sm:text-sm mt-1">
                      {comp.horaInicio} - {comp.horaFim}
                    </div>
                  )}
                  {comp.descricao && (
                    <div className="text-gray-500 text-xs mt-1 line-clamp-2 hidden sm:block">
                      {comp.descricao}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Linha do tempo (somente para hoje) */}
            {isToday && (
              <div
                className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                style={{ top: `${getCurrentTimePosition()}px` }}
              >
                <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
