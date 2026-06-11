'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface CalendarioData {
  data: string;
  completados: number;
  total: number;
  nivel: number;
  diaSemana: number;
}

interface StreakCalendarProps {
  dados: CalendarioData[];
}

const DIAS_SEMANA_CURTOS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function StreakCalendar({ dados }: StreakCalendarProps) {
  const t = useTranslations('habits');

  // Organizar dados em semanas (colunas)
  const semanas = useMemo(() => {
    if (!dados || dados.length === 0) return [];

    const result: CalendarioData[][] = [];
    let semanaAtual: CalendarioData[] = [];

    // Preencher dias vazios no início da primeira semana
    const primeiroDia = dados[0];
    for (let i = 0; i < primeiroDia.diaSemana; i++) {
      semanaAtual.push({
        data: '',
        completados: 0,
        total: 0,
        nivel: -1, // -1 = dia vazio
        diaSemana: i,
      });
    }

    for (const dia of dados) {
      semanaAtual.push(dia);

      if (dia.diaSemana === 6) {
        result.push(semanaAtual);
        semanaAtual = [];
      }
    }

    // Adicionar última semana se não estiver completa
    if (semanaAtual.length > 0) {
      result.push(semanaAtual);
    }

    return result;
  }, [dados]);

  const getNivelColor = (nivel: number) => {
    switch (nivel) {
      case -1: return 'bg-transparent';
      case 0: return 'bg-[#E9E7DC]';
      case 1: return 'bg-[#178E96]/25';
      case 2: return 'bg-[#178E96]/50';
      case 3: return 'bg-[#178E96]/75';
      case 4: return 'bg-[#178E96]';
      default: return 'bg-[#E9E7DC]';
    }
  };

  const formatarData = (dataStr: string) => {
    if (!dataStr) return '';
    // Parse YYYY-MM-DD manualmente para evitar problemas de timezone
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return data.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-3">
      {/* Labels dos dias da semana */}
      <div className="flex gap-1">
        <div className="w-4 mr-1" />
        {DIAS_SEMANA_CURTOS.map((dia, index) => (
          <div
            key={index}
            className="w-3 h-3 text-[10px] text-[#8395A5] flex items-center justify-center"
          >
            {index % 2 === 0 ? dia : ''}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {semanas.map((semana, semanaIndex) => (
          <div key={semanaIndex} className="flex flex-col gap-[3px]">
            {semana.map((dia, diaIndex) => (
              <div
                key={`${semanaIndex}-${diaIndex}`}
                className={`w-3 h-3 rounded-sm ${getNivelColor(dia.nivel)} transition-colors group relative`}
                title={dia.data ? `${formatarData(dia.data)}: ${dia.completados}/${dia.total}` : ''}
              >
                {/* Tooltip */}
                {dia.nivel >= 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-[#E9E7DC] rounded shadow-sm text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <p className="font-medium text-[#0E2A3F]">{formatarData(dia.data)}</p>
                    <p className="text-[#44586A]">
                      {dia.total === 0
                        ? t('noHabitsScheduled')
                        : `${dia.completados}/${dia.total} ${t('completed').toLowerCase()}`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-end gap-2 text-xs text-[#8395A5]">
        <span>{t('less')}</span>
        <div className="flex gap-[3px]">
          <div className="w-3 h-3 rounded-sm bg-[#E9E7DC]" />
          <div className="w-3 h-3 rounded-sm bg-[#178E96]/25" />
          <div className="w-3 h-3 rounded-sm bg-[#178E96]/50" />
          <div className="w-3 h-3 rounded-sm bg-[#178E96]/75" />
          <div className="w-3 h-3 rounded-sm bg-[#178E96]" />
        </div>
        <span>{t('more')}</span>
      </div>
    </div>
  );
}
