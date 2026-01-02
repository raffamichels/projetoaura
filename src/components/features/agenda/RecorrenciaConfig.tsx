'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TipoRecorrencia } from '@/types/compromisso';
import { Calendar, RefreshCw } from 'lucide-react';

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
  
  const tiposRecorrencia = [
    { value: 'diario', label: 'Diariamente', icon: '📅' },
    { value: 'semanal', label: 'Semanalmente', icon: '📆' },
    { value: 'mensal', label: 'Mensalmente', icon: '🗓️' },
    { value: 'anual', label: 'Anualmente', icon: '📋' },
  ];

  const getTextoIntervalo = () => {
    switch (tipoRecorrencia) {
      case 'diario': return 'dia(s)';
      case 'semanal': return 'semana(s)';
      case 'mensal': return 'mês(es)';
      case 'anual': return 'ano(s)';
      default: return '';
    }
  };

  return (
    <div className="space-y-4 p-4 border border-zinc-700 rounded-lg bg-zinc-800/30">
      {/* Toggle Recorrente */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-aura-400" />
          <Label className="text-gray-300 font-semibold">
            Compromisso Recorrente
          </Label>
        </div>
        <button
          type="button"
          onClick={() => onRecorrenteChange(!isRecorrente)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isRecorrente ? 'bg-aura-500' : 'bg-zinc-600'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isRecorrente ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Configurações de Recorrência */}
      {isRecorrente && (
        <div className="space-y-4 pt-2 border-t border-zinc-700">
          {/* Tipo de Recorrência */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Repetir</Label>
            <div className="grid grid-cols-2 gap-2">
              {tiposRecorrencia.map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => onTipoChange(tipo.value as TipoRecorrencia)}
                  className={`
                    px-3 py-2 rounded-lg border text-sm font-medium transition-all
                    flex items-center gap-2 justify-center
                    ${tipoRecorrencia === tipo.value
                      ? 'border-aura-500 bg-aura-500/20 text-aura-400'
                      : 'border-zinc-700 hover:border-zinc-600 text-gray-300'
                    }
                  `}
                >
                  <span>{tipo.icon}</span>
                  <span>{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intervalo */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">
              A cada
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="365"
                value={intervaloRecorrencia}
                onChange={(e) => onIntervaloChange(parseInt(e.target.value) || 1)}
                className="bg-zinc-800/50 border-zinc-700 text-white w-20"
              />
              <span className="text-gray-400 text-sm">{getTextoIntervalo()}</span>
            </div>
            <p className="text-xs text-gray-500">
              {intervaloRecorrencia === 1 
                ? `Repete todo(a) ${tipoRecorrencia === 'diario' ? 'dia' : tipoRecorrencia === 'semanal' ? 'semana' : tipoRecorrencia === 'mensal' ? 'mês' : 'ano'}`
                : `Repete a cada ${intervaloRecorrencia} ${getTextoIntervalo()}`
              }
            </p>
          </div>

          {/* Data de Término (Opcional) */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">
              Termina em (opcional)
            </Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Input
                type="date"
                value={dataFimRecorrencia}
                onChange={(e) => onDataFimChange(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white flex-1"
              />
            </div>
            <p className="text-xs text-gray-500">
              {dataFimRecorrencia 
                ? 'Os compromissos serão criados até esta data'
                : 'Sem data de término (cria até 1 ano no futuro)'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}