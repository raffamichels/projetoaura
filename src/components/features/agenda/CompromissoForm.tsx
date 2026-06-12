'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Compromisso, TipoRecorrencia } from '@/types/compromisso';
import { UpgradeToPremiumModal } from '@/components/planos/UpgradeToPremiumModal';
import { verificarAcessoRecurso } from '@/lib/planos-helper';
import { RecursoPremium, PlanoUsuario } from '@/types/planos';
import { Crown, Clock, Tag, TextAlignLeft, ArrowsClockwise, Calendar } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

interface CompromissoFormProps {
  onClose: () => void;
  onSave: (data: { id: string; titulo: string }) => void;
  initialDate?: Date;
  initialHour?: string;
  initialData?: Compromisso | null;
}

export function CompromissoForm({ onClose, onSave, initialDate, initialHour, initialData }: CompromissoFormProps) {
  const t = useTranslations('agenda');
  const isEditMode = !!initialData;

  const categorias = [
    { value: 'trabalho', label: t('work'), cor: '#8B5CF6' },
    { value: 'pessoal', label: t('personal'), cor: '#3B82F6' },
    { value: 'saude', label: t('health'), cor: '#10B981' },
    { value: 'estudo', label: t('study'), cor: '#F97316' },
    { value: 'lazer', label: t('leisure'), cor: '#EC4899' },
    { value: 'outro', label: t('other'), cor: '#6B7280' },
  ];

  const tiposRecorrencia = [
    { value: 'diario', label: t('daily') },
    { value: 'semanal', label: t('weekly') },
    { value: 'mensal', label: t('monthly') },
    { value: 'anual', label: t('yearly') },
  ];

  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [data, setData] = useState(
    initialData
      ? initialData.data.split('T')[0]
      : initialDate
        ? initialDate.toISOString().split('T')[0]
        : ''
  );
  const [horaInicio, setHoraInicio] = useState(initialData?.horaInicio || initialHour || '');
  const [horaFim, setHoraFim] = useState(initialData?.horaFim || '');
  const [categoria, setCategoria] = useState(initialData?.categoria || 'trabalho');

  // Estados de recorrência
  const [isRecorrente, setIsRecorrente] = useState(initialData?.isRecorrente || false);
  const [tipoRecorrencia, setTipoRecorrencia] = useState<TipoRecorrencia>(
    initialData?.tipoRecorrencia || 'semanal'
  );
  const [intervaloRecorrencia, setIntervaloRecorrencia] = useState(
    initialData?.intervaloRecorrencia || 1
  );
  const [dataFimRecorrencia, setDataFimRecorrencia] = useState(
    initialData?.dataFimRecorrencia?.split('T')[0] || ''
  );

  // Estado Google Calendar
  const [syncWithGoogle, setSyncWithGoogle] = useState(initialData?.syncWithGoogle || false);
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  // Verificar se o usuário tem acesso ao recurso de sincronização com Google
  const plano = (session?.user?.plano as PlanoUsuario) || PlanoUsuario.FREE;
  const planoExpiraEm = session?.user?.planoExpiraEm;
  const acessoRecurso = verificarAcessoRecurso(
    plano,
    planoExpiraEm,
    RecursoPremium.SINCRONIZAR_GOOGLE_CALENDAR
  );
  const canSyncGoogle = acessoRecurso.temAcesso;

  // Verificar se usuário tem autenticação do Google
  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {
        const response = await fetch('/api/v1/agenda/google-auth-status');
        if (response.ok) {
          const data = await response.json();
          setHasGoogleAuth(data.hasAuth);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação do Google:', error);
      }
    };

    checkGoogleAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditMode
        ? `/api/v1/agenda/compromissos/${initialData.id}`
        : '/api/v1/agenda/compromissos';

      const method = isEditMode ? 'PUT' : 'POST';

      const payload = {
        titulo,
        descricao,
        data: `${data}T${horaInicio}:00`,
        horaInicio,
        horaFim,
        categoria,
        cor: categorias.find(c => c.value === categoria)?.cor,
        // Dados de recorrência
        isRecorrente,
        tipoRecorrencia: isRecorrente ? tipoRecorrencia : null,
        intervaloRecorrencia: isRecorrente ? intervaloRecorrencia : null,
        dataFimRecorrencia: isRecorrente && dataFimRecorrencia
          ? `${dataFimRecorrencia}T23:59:59`
          : null,
        // Integração Google Calendar
        syncWithGoogle: hasGoogleAuth ? syncWithGoogle : false,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        onSave(result.data);
        onClose();
      } else {
        const error = await response.json();
        alert(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} compromisso: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      {/* Título - campo principal destacado */}
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder={t('titlePlaceholder')}
        required
        className="w-full bg-transparent border-none text-ink text-lg font-medium placeholder:text-ink-faint focus:outline-none focus:ring-0 py-2"
        autoFocus
      />

      <div className="border-t border-line" />

      {/* Lista de campos com ícones */}
      <div className="space-y-0.5">
        {/* Data e Hora */}
        <div className="flex items-center gap-3 py-2.5 px-1 hover:bg-surface-hover rounded-lg transition-colors">
          <Clock className="w-5 h-5 text-ink-soft flex-shrink-0" />
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className="bg-surface border border-line-strong rounded-md px-2 py-1 text-sm text-ink focus:border-brand focus:outline-none"
            />
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              required
              className="bg-surface border border-line-strong rounded-md px-2 py-1 text-sm text-ink focus:border-brand focus:outline-none w-24"
            />
            <span className="text-ink-faint">-</span>
            <input
              type="time"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
              className="bg-surface border border-line-strong rounded-md px-2 py-1 text-sm text-ink focus:border-brand focus:outline-none w-24"
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="flex items-center gap-3 py-2.5 px-1 hover:bg-surface-hover rounded-lg transition-colors">
          <Tag className="w-5 h-5 text-ink-soft flex-shrink-0" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {categorias.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategoria(cat.value)}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-medium transition-all
                  ${categoria === cat.value
                    ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-surface'
                    : 'opacity-60 hover:opacity-100'
                  }
                `}
                style={{
                  backgroundColor: `${cat.cor}20`,
                  color: cat.cor,
                  '--tw-ring-color': categoria === cat.value ? cat.cor : undefined,
                } as React.CSSProperties}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <div className="flex items-start gap-3 py-2.5 px-1 hover:bg-surface-hover rounded-lg transition-colors">
          <TextAlignLeft className="w-5 h-5 text-ink-soft flex-shrink-0 mt-0.5" />
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={t('descriptionPlaceholder')}
            rows={2}
            className="flex-1 bg-transparent border-none text-sm text-ink placeholder:text-ink-faint focus:outline-none resize-none"
          />
        </div>

        {/* Recorrência */}
        <div className="flex items-start gap-3 py-2.5 px-1 hover:bg-surface-hover rounded-lg transition-colors">
          <ArrowsClockwise className="w-5 h-5 text-ink-soft flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{t('recurringAppointment')}</span>
              <button
                type="button"
                onClick={() => setIsRecorrente(!isRecorrente)}
                className={`
                  relative w-9 h-5 rounded-full transition-colors
                  ${isRecorrente ? 'bg-brand' : 'bg-line-strong'}
                `}
              >
                <span
                  className={`
                    absolute top-0.5 w-4 h-4 bg-surface rounded-full transition-transform
                    ${isRecorrente ? 'left-[18px]' : 'left-0.5'}
                  `}
                />
              </button>
            </div>

            {isRecorrente && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tiposRecorrencia.map((tipo) => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => setTipoRecorrencia(tipo.value as TipoRecorrencia)}
                      className={`
                        px-2.5 py-1 rounded-md text-xs font-medium transition-all border
                        ${tipoRecorrencia === tipo.value
                          ? 'border-brand bg-brand-soft text-brand-dark'
                          : 'border-line text-ink-soft hover:border-line-strong'
                        }
                      `}
                    >
                      {tipo.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-ink-soft">{t('every')}</span>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={intervaloRecorrencia}
                    onChange={(e) => setIntervaloRecorrencia(parseInt(e.target.value) || 1)}
                    className="w-14 bg-surface border border-line-strong rounded-md px-2 py-1 text-ink text-center focus:border-brand focus:outline-none"
                  />
                  <span className="text-ink-soft">
                    {tipoRecorrencia === 'diario' && t('daily').toLowerCase()}
                    {tipoRecorrencia === 'semanal' && t('weekly').toLowerCase()}
                    {tipoRecorrencia === 'mensal' && t('monthly').toLowerCase()}
                    {tipoRecorrencia === 'anual' && t('yearly').toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-ink-faint" />
                  <span className="text-ink-soft">{t('endsOn')}</span>
                  <input
                    type="date"
                    value={dataFimRecorrencia}
                    onChange={(e) => setDataFimRecorrencia(e.target.value)}
                    className="bg-surface border border-line-strong rounded-md px-2 py-1 text-ink focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Google Calendar */}
        {hasGoogleAuth && (
          <div className="flex items-center gap-3 py-2.5 px-1 hover:bg-surface-hover rounded-lg transition-colors">
            <svg className="w-5 h-5 text-ink-soft flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H18V18zm0-6h-4.5v-4.5H18V12z"/>
            </svg>
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${!canSyncGoogle ? 'text-ink-faint' : 'text-ink'}`}>
                  {t('sendToGoogleCalendar')}
                </span>
                {!canSyncGoogle && <Crown className="w-4 h-4 text-gold" />}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!canSyncGoogle) {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setSyncWithGoogle(!syncWithGoogle);
                }}
                className={`
                  relative w-9 h-5 rounded-full transition-colors
                  ${syncWithGoogle && canSyncGoogle ? 'bg-brand' : 'bg-line-strong'}
                  ${!canSyncGoogle && 'opacity-50 cursor-not-allowed'}
                `}
              >
                <span
                  className={`
                    absolute top-0.5 w-4 h-4 bg-surface rounded-full transition-transform
                    ${syncWithGoogle && canSyncGoogle ? 'left-[18px]' : 'left-0.5'}
                  `}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Aviso sobre recorrência ao editar */}
      {isEditMode && initialData?.isRecorrente && (
        <div className="mx-1 p-2 bg-[#FFF7E6] dark:bg-gold/10 border border-gold/30 rounded-lg">
          <p className="text-xs text-[#B8860B] dark:text-gold">
            ⚠️ {t('recurringEditWarning')}
          </p>
        </div>
      )}

      {/* Botões */}
      <div className="flex justify-end gap-2 pt-3 border-t border-line mt-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="px-4 h-9 text-sm text-ink-soft hover:text-ink"
          disabled={loading}
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          className="px-6 h-9 text-sm bg-brand hover:bg-brand-dark text-white rounded-full"
          disabled={loading}
        >
          {loading
            ? (isEditMode ? t('updating') : `${t('save').slice(0, -1)}ando...`)
            : (isEditMode ? t('update') : t('save'))}
        </Button>
      </div>

      {/* Modal de Upgrade */}
      <UpgradeToPremiumModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        recurso={t('googleCalendarSync')}
        descricao={t('googleSyncPremium')}
      />
    </form>
  );
}
