'use client';

import { useTranslations } from 'next-intl';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface TendenciaData {
  semana: number;
  dataInicio: string;
  completados: number;
  total: number;
  taxa: number;
}

interface TrendChartProps {
  dados: TendenciaData[];
}

export function TrendChart({ dados }: TrendChartProps) {
  const t = useTranslations('habits');

  const formatarSemana = (semana: number) => {
    return `S${semana}`;
  };

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTaxa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#178E96" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#178E96" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="semana"
            tickFormatter={formatarSemana}
            stroke="var(--ink-faint)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            stroke="var(--ink-faint)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--ink)',
            }}
            labelFormatter={(semana) => `${t('week')} ${semana}`}
            // Correção aplicada abaixo: aceita number | undefined e usa fallback
            formatter={(value: number | undefined) => [
              `${value ?? 0}%`, 
              t('successRate')
            ]}
          />
          <Area
            type="monotone"
            dataKey="taxa"
            stroke="#178E96"
            strokeWidth={2}
            fill="url(#colorTaxa)"
            dot={{ fill: '#178E96', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#178E96' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}