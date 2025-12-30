'use client';

import { Compromisso } from '@/types/compromisso';
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, List, Grid3x3 } from 'lucide-react';
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

export default function AgendaPage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);
  const hoje = new Date();

  // Buscar compromissos
  useEffect(() => {
    fetchCompromissos();
  }, []);

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
    fetchCompromissos(); // Recarrega a lista
  };

  // Calcular estatísticas
  const hoje_str = hoje.toISOString().split('T')[0];
  const compromissosHoje = compromissos.filter((c) => 
    c.data.split('T')[0] === hoje_str
  ).length;

  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  
  const compromissosSemana = compromissos.filter((c) => {
    const dataComp = new Date(c.data);
    return dataComp >= inicioSemana && dataComp <= fimSemana;
  }).length;

  const compromissosMes = compromissos.filter((c) => {
    const dataComp = new Date(c.data);
    return dataComp.getMonth() === hoje.getMonth() && 
           dataComp.getFullYear() === hoje.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Agenda</h1>
          <p className="text-gray-400">
            Organize seus compromissos e eventos
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-aura-500 hover:bg-aura-600 shadow-lg shadow-aura-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Compromisso
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Data Atual */}
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-aura-500" />
            <div>
              <p className="text-sm text-gray-400">Hoje</p>
              <p className="text-lg font-semibold text-white">
                {hoje.toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('calendar')}
              className={view === 'calendar' ? 'bg-zinc-700' : ''}
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Calendário
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('list')}
              className={view === 'list' ? 'bg-zinc-700' : ''}
            >
              <List className="w-4 h-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Hoje</p>
              <p className="text-2xl font-bold text-white">{compromissosHoje}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-aura-500/10 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-aura-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Esta Semana</p>
              <p className="text-2xl font-bold text-white">{compromissosSemana}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Este Mês</p>
              <p className="text-2xl font-bold text-white">{compromissosMes}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando...</p>
          </div>
        ) : compromissos.length === 0 ? (
          <div className="text-center py-20">
            <CalendarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum Compromisso
            </h3>
            <p className="text-gray-400 mb-6">
              Você ainda não tem compromissos agendados
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-aura-500 hover:bg-aura-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Compromisso
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {compromissos.map((comp) => (
              <div
                key={comp.id}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                style={{ borderLeftWidth: '4px', borderLeftColor: comp.cor }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{comp.titulo}</h4>
                    {comp.descricao && (
                      <p className="text-sm text-gray-400 mb-2">{comp.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📅 {new Date(comp.data).toLocaleDateString('pt-BR')}</span>
                      <span>🕒 {comp.horaInicio}</span>
                      {comp.horaFim && <span>→ {comp.horaFim}</span>}
                      {comp.categoria && (
                        <span className="capitalize">🏷️ {comp.categoria}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de Criar Compromisso */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Novo Compromisso</DialogTitle>
            <DialogDescription className="text-gray-400">
              Preencha os detalhes do seu compromisso
            </DialogDescription>
          </DialogHeader>
          <CompromissoForm
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}