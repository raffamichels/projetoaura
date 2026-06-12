'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TipoRecorrencia } from '@/types/compromisso';
import { Calendar, ArrowsClockwise } from '@phosphor-icons/react';
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
    <div className="p-3 border border-line rounded-lg bg-surface-soft">
      {/* Toggle Recorrente */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowsClockwise className="w-3.5 h-3.5 text-brand-dark" />
          <Label className="text-ink text-sm font-medium">
            {t('recurringAppointment')}
          </Label>
        </div>
        <button
          type="button"
          onClick={() => onRecorrenteChange(!isRecorrente)}
          className={`
            relative inline-flex h-5 w-9 items-center rounded-full transition-colors
            ${isRecorrente ? 'bg-brand' : 'bg-line-strong'}
          `}
        >
          <span
            className={`
              inline-block h-3.5 w-3.5 transform rounded-full bg-surface transition-transform
              ${isRecorrente ? 'translate-x-5' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>

      {/* Configurações de Recorrência */}
      {isRecorrente && (
        <div className="space-y-3 pt-3 mt-3 border-t border-line">
          {/* Tipo de Recorrência */}
          <div className="space-y-1.5">
            <Label className="text-ink-soft text-xs">{t('repeat')}</Label>
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
                      ? 'border-brand bg-brand-soft text-brand-dark'
                      : 'border-line hover:border-line-strong text-ink-soft'
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
              <Label className="text-ink-soft text-xs">
                {t('every')}
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={intervaloRecorrencia}
                  onChange={(e) => onIntervaloChange(parseInt(e.target.value) || 1)}
                  className="bg-surface border-line-strong text-ink w-14 h-8 text-sm focus:border-brand"
                />
                <span className="text-ink-soft text-xs truncate">{getTextoIntervalo()}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-ink-soft text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3 text-ink-faint" />
                {t('endsOn')}
              </Label>
              <Input
                type="date"
                value={dataFimRecorrencia}
                onChange={(e) => onDataFimChange(e.target.value)}
                className="bg-surface border-line-strong text-ink h-8 text-sm focus:border-brand"
              />
            </div>
          </div>

          {/* Texto informativo */}
          <p className="text-[10px] text-ink-faint">
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