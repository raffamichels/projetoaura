'use client';

import { ComingSoon } from '@/components/dashboard/ComingSoon';
import { Plane } from 'lucide-react';

export default function ViagensPage() {
  return (
    <ComingSoon
      icon={Plane}
      title="Viagens"
      description="Planeje suas viagens com roteiros personalizados, controle de gastos e registro de memórias inesquecíveis"
      features={[
        'Planejamento de roteiros',
        'Controle de orçamento de viagem',
        'Diário de bordo e fotos',
      ]}
    />
  );
}
