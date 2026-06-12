'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, CalendarCheck, CalendarX, PencilSimple, Pulse, Clock, Sparkle } from '@phosphor-icons/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Atividade {
  id: string;
  tipo: string;
  titulo: string;
  descricao?: string;
  icone: string;
  cor: string;
  createdAt: string;
}

const getIcone = (icone: string) => {
  const icones: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    'calendar': Calendar,
    'calendar-check': CalendarCheck,
    'calendar-x': CalendarX,
    'edit': PencilSimple,
    'activity': Pulse,
  };
  return icones[icone] || Pulse;
};

const getTipoTexto = (tipo: string, t: (key: string) => string) => {
  const tipos: Record<string, { texto: string; cor: string }> = {
    'compromisso_criado': { texto: t('created'), cor: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' },
    'compromisso_editado': { texto: t('edited'), cor: 'bg-blue-soft text-brand-blue border-[#D5E2EC] dark:border-brand-blue/30' },
    'compromisso_excluido': { texto: t('deleted'), cor: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30' },
  };
  return tipos[tipo] || { texto: t('action'), cor: 'bg-surface-hover text-ink-faint border-line' };
};

export function AtividadesRecentes() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const dateLocale = locale === 'pt' ? ptBR : enUS;

  useEffect(() => {
    fetchAtividades();
  }, []);

  const fetchAtividades = async () => {
    try {
      const response = await fetch('/api/v1/atividades');
      if (response.ok) {
        const data = await response.json();
        const todasAtividades = data.data || [];
        
        // Filtrar apenas atividades de hoje
        const hoje = new Date();
        const inicioDia = new Date(hoje.setHours(0, 0, 0, 0));
        const fimDia = new Date(hoje.setHours(23, 59, 59, 999));
        
        const atividadesHoje = todasAtividades.filter((atividade: Atividade) => {
          const dataAtividade = new Date(atividade.createdAt);
          return dataAtividade >= inicioDia && dataAtividade <= fimDia;
        });
        
        setAtividades(atividadesHoje);
      }
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-ink flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-brand" />
            {t('recentActivities')}
          </CardTitle>
          <CardDescription className="text-ink-soft">
            {t('yourTodayActions')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (atividades.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-ink flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-brand" />
            {t('recentActivities')}
          </CardTitle>
          <CardDescription className="text-ink-soft">
            {t('yourTodayActions')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-ink-faint" />
            </div>
            <p className="text-ink-soft mb-2 font-medium">{t('noActivityToday')}</p>
            <p className="text-sm text-ink-faint max-w-sm">
              {t('startCreatingAppointments')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-ink flex items-center gap-2 text-lg sm:text-xl">
          <Sparkle className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
          {t('recentActivities')}
        </CardTitle>
        <CardDescription className="text-ink-soft text-sm">
          {t('yourTodayActions')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Container com altura limitada e scroll */}
        <div className="max-h-[350px] overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 scrollbar-thin">
          {atividades.map((atividade) => {
            const IconeComponent = getIcone(atividade.icone);
            const tipoInfo = getTipoTexto(atividade.tipo, t);

            return (
              <div
                key={atividade.id}
                className="group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-line bg-surface hover:bg-surface-hover hover:border-line-strong transition-all duration-150 cursor-pointer"
              >
                {/* Ícone */}
                <div className="relative flex-shrink-0">
                  <div
                    className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${atividade.cor}20` }}
                  >
                    <IconeComponent
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: atividade.cor }}
                    />
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm sm:text-base text-ink truncate group-hover:text-brand-dark transition-colors duration-150">
                      {atividade.titulo}
                    </h4>
                    <Badge
                      variant="default"
                      className={`flex-shrink-0 text-xs ${tipoInfo.cor}`}
                    >
                      {tipoInfo.texto}
                    </Badge>
                  </div>

                  {atividade.descricao && (
                    <p className="text-xs sm:text-sm text-ink-soft mb-2 line-clamp-1">
                      {atividade.descricao}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-ink-faint">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(atividade.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </span>
                  </div>
                </div>

                {/* Indicador de hover - oculto em mobile */}
                <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-8 bg-brand rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}