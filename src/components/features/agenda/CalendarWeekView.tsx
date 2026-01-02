'use client';

import { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Compromisso } from '@/types/compromisso';

interface CalendarWeekViewProps {
  compromissos: Compromisso[];
  onSlotClick: (date: Date, hour: number) => void;
  onCompromissoClick: (compromisso: Compromisso) => void;
  currentDate: Date;
}

export function CalendarWeekView({ compromissos, onSlotClick, onCompromissoClick, currentDate }: CalendarWeekViewProps) {
  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Atualizar linha do tempo a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll para o horário atual ao carregar
  useEffect(() => {
    if (scrollContainerRef.current && !hasScrolledRef.current) {
      const currentHour = new Date().getHours();
      const currentMinutes = new Date().getMinutes();
      
      // Calcular posição em pixels (60px por hora)
      // Subtrair 150px para centralizar melhor na tela
      const scrollPosition = (currentHour * 60) + (currentMinutes) - 150;
      
      // Fazer scroll suave para a posição
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }, 100);
      
      hasScrolledRef.current = true;
    }
  }, []);

  // Gerar dias da semana
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Gerar horas do dia (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calcular posição da linha do tempo
  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hour * 60 + minutes); // Posição em pixels (1 minuto = 1 pixel)
  };

  // Verificar se é hoje
  const isToday = (date: Date) => isSameDay(date, new Date());

  // Buscar compromissos de um dia específico
  const getCompromissosForDay = (date: Date) => {
    return compromissos.filter(comp => {
      const compDate = parseISO(comp.data);
      return isSameDay(compDate, date);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header com dias da semana */}
      <div className="grid grid-cols-8 border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10">
        {/* Coluna de horas (vazia) */}
        <div className="w-16 border-r border-zinc-800"></div>

        {/* Dias da semana */}
        {weekDays.map((day, i) => (
          <div
            key={i}
            className={`p-3 text-center border-r border-zinc-800 ${
              isToday(day) ? 'bg-aura-500/10' : ''
            }`}
          >
            <div className="text-xs text-gray-400 uppercase">
              {format(day, 'EEE', { locale: ptBR })}
            </div>
            <div className={`text-xl font-bold mt-1 ${
              isToday(day) ? 'text-aura-400' : 'text-white'
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Grid de horários */}
      <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
        <div className="grid grid-cols-8 relative">
          {/* Coluna de horas */}
          <div className="w-16 relative">
            {hours.map(hour => (
              <div
                key={hour}
                className="h-[60px] border-b border-zinc-800 flex items-start justify-end pr-2 pt-0"
              >
                <span className="text-xs text-gray-500 -translate-y-2">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {weekDays.map((day, dayIndex) => {
            const dayCompromissos = getCompromissosForDay(day);

            return (
              <div
                key={dayIndex}
                className="relative border-r border-zinc-800"
              >
                {/* Grid de horas clicável */}
                {hours.map(hour => (
                  <button
                    key={hour}
                    onClick={() => onSlotClick(day, hour)}
                    className="w-full h-[60px] border-b border-zinc-800 hover:bg-aura-500/5 transition-colors text-left block"
                  />
                ))}

                {/* Compromissos do dia */}
                {dayCompromissos.map(comp => {
                  const style = getCompromissoStyle(comp);
                  return (
                    <button
                      key={comp.id}
                      onClick={() => onCompromissoClick(comp)}
                      className="absolute left-1 right-1 rounded-md px-2 py-1 text-left text-xs overflow-hidden hover:opacity-90 transition-opacity z-10"
                      style={{
                        top: style.top,
                        height: style.height,
                        backgroundColor: `${comp.cor}30`,
                        borderLeft: `3px solid ${comp.cor}`,
                      }}
                    >
                      <div className="font-semibold truncate" style={{ color: comp.cor }}>
                        {comp.titulo}
                      </div>
                      {comp.horaFim && (
                        <div className="text-gray-400 text-[10px]">
                          {comp.horaInicio} - {comp.horaFim}
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Linha do tempo (somente para hoje) */}
                {isToday(day) && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                    style={{ top: `${getCurrentTimePosition()}px` }}
                  >
                    <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}