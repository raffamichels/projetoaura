'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Edit3,
  Activity,
  Clock,
  Sparkles
} from 'lucide-react';
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
    'edit': Edit3,
    'activity': Activity,
  };
  return icones[icone] || Activity;
};

const getTipoTexto = (tipo: string, t: (key: string) => string) => {
  const tipos: Record<string, { texto: string; cor: string }> = {
    'compromisso_criado': { texto: t('created'), cor: 'bg-green-500/10 text-green-400 border-green-500/20' },
    'compromisso_editado': { texto: t('edited'), cor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'compromisso_excluido': { texto: t('deleted'), cor: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };
  return tipos[tipo] || { texto: t('action'), cor: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
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
      <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-aura-400" />
            {t('recentActivities')}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {t('yourTodayActions')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aura-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (atividades.length === 0) {
    return (
      <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-aura-400" />
            {t('recentActivities')}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {t('yourTodayActions')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-aura-500/20 blur-xl rounded-full"></div>
              <Clock className="w-12 h-12 text-gray-600 relative" />
            </div>
            <p className="text-gray-400 mb-2 font-medium">{t('noActivityToday')}</p>
            <p className="text-sm text-gray-500 max-w-sm">
              {t('startCreatingAppointments')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-aura-400" />
          {t('recentActivities')}
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm">
          {t('yourTodayActions')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Container com altura limitada e scroll */}
        <div className="max-h-[350px] overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          {atividades.map((atividade) => {
            const IconeComponent = getIcone(atividade.icone);
            const tipoInfo = getTipoTexto(atividade.tipo, t);

            return (
              <div
                key={atividade.id}
                className="group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer"
              >
                {/* Ícone com glow */}
                <div className="relative flex-shrink-0">
                  <div
                    className="absolute inset-0 blur-md opacity-50 rounded-lg"
                    style={{ backgroundColor: atividade.cor }}
                  ></div>
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
                    <h4 className="font-semibold text-sm sm:text-base text-white truncate group-hover:text-aura-400 transition-colors">
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
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-1">
                      {atividade.descricao}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500">
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
                  <div className="w-1.5 h-8 bg-aura-500 rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}