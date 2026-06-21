'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, ArrowLeft, ClockCounterClockwise, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AtividadeExclusao {
  id: string;
  tipo: string;
  titulo: string;
  descricao?: string;
  createdAt: string;
}

export default function HistoricoFinanceiroPage() {
  const router = useRouter();
  const [atividades, setAtividades] = useState<AtividadeExclusao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await fetch('/api/v1/atividades?exclusoesFinanceiras=true&limite=100');
        if (response.ok) {
          const data = await response.json();
          setAtividades(data.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    void carregar();
  }, []);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/financeiro')} className="text-ink-soft">
        <ArrowLeft className="h-4 w-4" /> Voltar ao Financeiro
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-ink">
            <ClockCounterClockwise className="h-8 w-8 text-brand" /> Histórico financeiro
          </h1>
          <p className="mt-2 text-ink-soft">Consulte itens excluídos e acesse os itens que ainda podem ser restaurados.</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/financeiro/contas#inativos')}>
          <Archive className="h-4 w-4" /> Ver arquivados e desativados
        </Button>
      </div>

      <Card className="border-line bg-surface p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-ink">Exclusões permanentes</h2>
        <p className="mb-5 text-sm text-ink-faint">Este é um registro de auditoria; itens excluídos não podem ser restaurados.</p>

        {loading ? (
          <div className="py-10 text-center text-ink-faint">Carregando histórico...</div>
        ) : atividades.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-faint">
            Nenhuma exclusão financeira registrada.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {atividades.map((atividade) => (
              <div key={atividade.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <Trash className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{atividade.titulo}</p>
                  {atividade.descricao && <p className="text-xs text-ink-faint">{atividade.descricao}</p>}
                </div>
                <time className="whitespace-nowrap text-xs text-ink-faint">
                  {new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(atividade.createdAt))}
                </time>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
