'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CompromissoForm } from '@/components/features/agenda/CompromissoForm';
import { CalendarWeekView } from '@/components/features/agenda/CalendarWeekView';
import { CalendarToolbar } from '@/components/features/agenda/CalendarToolbar';
import { Compromisso } from '@/types/compromisso';
import { format } from 'date-fns';
import { CompromissoDetails } from '@/components/features/agenda/CompromissoDetails';

type ViewType = 'day' | 'week' | 'month' | 'year';

export default function AgendaPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompromisso, setSelectedCompromisso] = useState<Compromisso | null>(null);

  useEffect(() => {
    fetchCompromissos();
  }, []);

  // Detectar query parameter "novo=true" e abrir modal
  useEffect(() => {
    const novoParam = searchParams.get('novo');
    if (novoParam === 'true') {
      // Aguarda um pouco para garantir que a página carregou
      setTimeout(() => {
        setIsModalOpen(true);
      }, 300);
    }
  }, [searchParams]);

  const fetchCompromissos = async () => {
    try {
      const response = await fetch('/api/v1/agenda/compromissos');
      if (response.ok) {
        const data = await response.json();
        setCompromissos(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar compromissos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    fetchCompromissos();
    setSelectedDate(null);
    setSelectedHour(null);
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedCompromisso(null);
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setSelectedDate(date);
    setSelectedHour(hour);
    setSelectedCompromisso(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCompromissoClick = (compromisso: Compromisso) => {
    setSelectedCompromisso(compromisso);
    setIsDetailsOpen(true);
  };

  const handleEdit = (compromisso: Compromisso) => {
    setIsDetailsOpen(false);
    setSelectedCompromisso(compromisso);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteSuccess = (id: string) => {
    setCompromissos(compromissos.filter(c => c.id !== id));
    setIsDetailsOpen(false);
    setSelectedCompromisso(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Agenda</h1>
          <p className="text-sm sm:text-base text-gray-400">
            Organize seus compromissos e eventos
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedDate(null);
            setSelectedHour(null);
            setSelectedCompromisso(null);
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-aura-500 hover:bg-aura-600 shadow-lg shadow-aura-500/25 h-auto py-2.5 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Compromisso
        </Button>
      </div>

      <CalendarToolbar
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onToday={handleToday}
      />

      <Card className="flex-1 bg-zinc-900/50 border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando calendário...</p>
            </div>
          </div>
        ) : view === 'week' ? (
          <CalendarWeekView
            compromissos={compromissos}
            onSlotClick={handleSlotClick}
            onCompromissoClick={handleCompromissoClick}
            currentDate={currentDate}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xl font-semibold text-white mb-2">
                Visualização de {view === 'day' ? 'Dia' : view === 'month' ? 'Mês' : 'Ano'}
              </p>
              <p className="text-gray-400">Em desenvolvimento</p>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Detalhes do Compromisso */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Detalhes do Compromisso</DialogTitle>
            <DialogDescription className="text-gray-400">
              Visualize e gerencie seu compromisso
            </DialogDescription>
          </DialogHeader>
          {selectedCompromisso && (
            <CompromissoDetails
              compromisso={selectedCompromisso}
              onEdit={handleEdit}
              onDelete={handleDeleteSuccess}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Criar/Editar Compromisso */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {isEditMode 
                ? 'Editar Compromisso'
                : selectedDate && selectedHour !== null
                  ? `Novo Compromisso - ${format(selectedDate, 'dd/MM/yyyy')} às ${String(selectedHour).padStart(2, '0')}:00`
                  : 'Novo Compromisso'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isEditMode ? 'Atualize as informações do compromisso' : 'Preencha os detalhes do seu compromisso'}
            </DialogDescription>
          </DialogHeader>
          <CompromissoForm
            onClose={() => {
              setIsModalOpen(false);
              setIsEditMode(false);
              setSelectedCompromisso(null);
            }}
            onSave={handleSave}
            initialData={isEditMode ? selectedCompromisso : undefined}
            initialDate={selectedDate || undefined}
            initialHour={selectedHour !== null ? String(selectedHour).padStart(2, '0') + ':00' : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}