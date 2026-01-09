'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Compromisso, TipoRecorrencia } from '@/types/compromisso';
import { RecorrenciaConfig } from '@/components/features/agenda/RecorrenciaConfig';
import { Checkbox } from '@/components/ui/checkbox';

interface CompromissoFormProps {
  onClose: () => void;
  onSave: (data: { id: string; titulo: string }) => void;
  initialDate?: Date;
  initialHour?: string;
  initialData?: Compromisso | null;
}

const categorias = [
  { value: 'trabalho', label: 'Trabalho', cor: '#8B5CF6' },
  { value: 'pessoal', label: 'Pessoal', cor: '#3B82F6' },
  { value: 'saude', label: 'Saúde', cor: '#10B981' },
  { value: 'estudo', label: 'Estudo', cor: '#F97316' },
  { value: 'lazer', label: 'Lazer', cor: '#EC4899' },
  { value: 'outro', label: 'Outro', cor: '#6B7280' },
];

export function CompromissoForm({ onClose, onSave, initialDate, initialHour, initialData }: CompromissoFormProps) {
  const isEditMode = !!initialData;
  
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

  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

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
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
      {/* Título */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="titulo" className="text-gray-300 text-sm sm:text-base">
          Título *
        </Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Reunião com cliente"
          required
          className="bg-zinc-800/50 border-zinc-700 text-white text-sm sm:text-base h-9 sm:h-10"
        />
      </div>

      {/* Descrição */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="descricao" className="text-gray-300 text-sm sm:text-base">
          Descrição
        </Label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Adicione detalhes sobre o compromisso..."
          rows={3}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-sm sm:text-base placeholder:text-gray-500 focus:border-aura-500 focus:ring-1 focus:ring-aura-500 resize-none"
        />
      </div>

      {/* Data */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="data" className="text-gray-300 text-sm sm:text-base">
          Data {isRecorrente && '(data inicial)'}*
        </Label>
        <Input
          id="data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          className="bg-zinc-800/50 border-zinc-700 text-white text-sm sm:text-base h-9 sm:h-10"
        />
      </div>

      {/* Horários */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="horaInicio" className="text-gray-300 text-sm sm:text-base">
            Início *
          </Label>
          <Input
            id="horaInicio"
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
            className="bg-zinc-800/50 border-zinc-700 text-white text-sm sm:text-base h-9 sm:h-10"
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="horaFim" className="text-gray-300 text-sm sm:text-base">
            Término
          </Label>
          <Input
            id="horaFim"
            type="time"
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 text-white text-sm sm:text-base h-9 sm:h-10"
          />
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-gray-300 text-sm sm:text-base">Categoria *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
          {categorias.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategoria(cat.value)}
              className={`
                px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all
                ${categoria === cat.value
                  ? 'border-2 scale-105'
                  : 'border-zinc-700 hover:border-zinc-600'
                }
              `}
              style={{
                borderColor: categoria === cat.value ? cat.cor : undefined,
                backgroundColor: categoria === cat.value ? `${cat.cor}20` : undefined,
                color: categoria === cat.value ? cat.cor : undefined,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Configuração de Recorrência */}
      <RecorrenciaConfig
        isRecorrente={isRecorrente}
        tipoRecorrencia={tipoRecorrencia}
        intervaloRecorrencia={intervaloRecorrencia}
        dataFimRecorrencia={dataFimRecorrencia}
        onRecorrenteChange={setIsRecorrente}
        onTipoChange={setTipoRecorrencia}
        onIntervaloChange={setIntervaloRecorrencia}
        onDataFimChange={setDataFimRecorrencia}
      />

      {/* Sincronização com Google Calendar */}
      {hasGoogleAuth && (
        <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <Checkbox
              id="syncWithGoogle"
              checked={syncWithGoogle}
              onCheckedChange={(checked) => setSyncWithGoogle(checked as boolean)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="syncWithGoogle"
                className="text-xs sm:text-sm font-medium text-gray-300 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 23C5.935 23 1 18.065 1 12S5.935 1 12 1s11 4.935 11 11-4.935 11-11 11z"/>
                  <path d="M12 4.5c-4.136 0-7.5 3.364-7.5 7.5s3.364 7.5 7.5 7.5 7.5-3.364 7.5-7.5-3.364-7.5-7.5-7.5zm0 13.5c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z"/>
                </svg>
                Enviar para Google Agenda
              </Label>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                {syncWithGoogle
                  ? 'Este compromisso será sincronizado com sua agenda do Google'
                  : 'Ative para adicionar este compromisso ao Google Calendar'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Aviso sobre recorrência ao editar */}
      {isEditMode && initialData?.isRecorrente && (
        <div className="p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-[10px] sm:text-xs text-yellow-400">
            ⚠️ Este compromisso faz parte de uma série recorrente.
            Ao salvar, você será perguntado se deseja atualizar apenas este ou todos os futuros.
          </p>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 sticky bottom-0 bg-zinc-900 pb-2">
        <Button
          type="button"
          variant="default"
          onClick={onClose}
          className="flex-1 border-zinc-700 hover:bg-zinc-800 h-9 sm:h-10 text-sm sm:text-base"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-aura-500 hover:bg-aura-600 h-9 sm:h-10 text-sm sm:text-base"
          disabled={loading}
        >
          {loading
            ? (isEditMode ? 'Atualizando...' : 'Salvando...')
            : (isEditMode ? 'Atualizar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
}