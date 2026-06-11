'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TipoRecorrencia } from '@/types/compromisso';
import { Calendar, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RecorrenciaConfigProps {
  isRecorrente: boolean;
  tipoRecorrencia: TipoRecorrencia;
  intervaloRecorrencia: number;
  dataFimRecorrencia: string;
  onRecorrenteChange: (value: boolean) => void;
  onTipoChange: (value: TipoRecorrencia) => void;
  onIntervaloChange: (value: number) => void;
  onDataFimChange: (value: string) => void;
}

export function RecorrenciaConfig({
  isRecorrente,
  tipoRecorrencia,
  intervaloRecorrencia,
  dataFimRecorrencia,
  onRecorrenteChange,
  onTipoChange,
  onIntervaloChange,
  onDataFimChange,
}: RecorrenciaConfigProps) {
  const t = useTranslations('agenda');

  const tiposRecorrencia = [
    { value: 'diario', label: t('daily'), icon: '📅' },
    { value: 'semanal', label: t('weekly'), icon: '📆' },
    { value: 'mensal', label: t('monthly'), icon: '🗓️' },
    { value: 'anual', label: t('yearly'), icon: '📋' },
  ];

  const getTextoIntervalo = () => {
    switch (tipoRecorrencia) {
      case 'diario': return t('daily').toLowerCase();
      case 'semanal': return t('weekly').toLowerCase();
      case 'mensal': return t('monthly').toLowerCase();
      case 'anual': return t('yearly').toLowerCase();
      default: return '';
    }
  };

  const getTextoRepeteSingular = () => {
    switch (tipoRecorrencia) {
      case 'diario': return t('repeatsSingleDay');
      case 'semanal': return t('repeatsSingleWeek');
      case 'mensal': return t('repeatsSingleMonth');
      case 'anual': return t('repeatsSingleYear');
      default: return '';
    }
  };

  const getTextoRepetePlural = () => {
    switch (tipoRecorrencia) {
      case 'diario': return t('repeatsEveryDays', { count: intervaloRecorrencia });
      case 'semanal': return t('repeatsEveryWeeks', { count: intervaloRecorrencia });
      case 'mensal': return t('repeatsEveryMonths', { count: intervaloRecorrencia });
      case 'anual': return t('repeatsEveryYears', { count: intervaloRecorrencia });
      default: return '';
    }
  };

  return (
    <div className="p-3 border border-[#E9E7DC] rounded-lg bg-[#FDFCFB]">
      {/* Toggle Recorrente */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-[#117178]" />
          <Label className="text-[#0E2A3F] text-sm font-medium">
            {t('recurringAppointment')}
          </Label>
        </div>
        <button
          type="button"
          onClick={() => onRecorrenteChange(!isRecorrente)}
          className={`
            relative inline-flex h-5 w-9 items-center rounded-full transition-colors
            ${isRecorrente ? 'bg-[#178E96]' : 'bg-[#D9D7CB]'}
          `}
        >
          <span
            className={`
              inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
              ${isRecorrente ? 'translate-x-5' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>

      {/* Configurações de Recorrência */}
      {isRecorrente && (
        <div className="space-y-3 pt-3 mt-3 border-t border-[#E9E7DC]">
          {/* Tipo de Recorrência */}
          <div className="space-y-1.5">
            <Label className="text-[#44586A] text-xs">{t('repeat')}</Label>
            <div className="grid grid-cols-4 gap-1">
              {tiposRecorrencia.map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => onTipoChange(tipo.value as TipoRecorrencia)}
                  className={`
                    px-1.5 py-1.5 rounded-md border text-xs font-medium transition-all
                    flex flex-col items-center gap-0.5
                    ${tipoRecorrencia === tipo.value
                      ? 'border-[#178E96] bg-[#E5F1F1] text-[#117178]'
                      : 'border-[#E9E7DC] hover:border-[#D9D7CB] text-[#44586A]'
                    }
                  `}
                >
                  <span className="text-sm">{tipo.icon}</span>
                  <span className="text-[10px]">{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intervalo e Data de Término na mesma linha */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[#44586A] text-xs">
                {t('every')}
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={intervaloRecorrencia}
                  onChange={(e) => onIntervaloChange(parseInt(e.target.value) || 1)}
                  className="bg-white border-[#D9D7CB] text-[#0E2A3F] w-14 h-8 text-sm focus:border-[#178E96]"
                />
                <span className="text-[#44586A] text-xs truncate">{getTextoIntervalo()}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[#44586A] text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#8395A5]" />
                {t('endsOn')}
              </Label>
              <Input
                type="date"
                value={dataFimRecorrencia}
                onChange={(e) => onDataFimChange(e.target.value)}
                className="bg-white border-[#D9D7CB] text-[#0E2A3F] h-8 text-sm focus:border-[#178E96]"
              />
            </div>
          </div>

          {/* Texto informativo */}
          <p className="text-[10px] text-[#8395A5]">
            {intervaloRecorrencia === 1
              ? getTextoRepeteSingular()
              : getTextoRepetePlural()
            }
            {dataFimRecorrencia ? ` • ${t('appointmentsUntilDate')}` : ` • ${t('noEndDate')}`}
          </p>
        </div>
      )}
    </div>
  );
}