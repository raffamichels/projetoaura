// src/lib/recorrencia-utils.ts
// Funções auxiliares para lidar com compromissos recorrentes

import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter } from 'date-fns';
import { TipoRecorrencia } from '@/types/compromisso';

interface GerarRecorrenciasParams {
  dataInicial: Date;
  tipoRecorrencia: TipoRecorrencia;
  intervalo: number;
  dataFim?: Date;
  maxOcorrencias?: number;
}

/**
 * Gera as datas para compromissos recorrentes
 */
export function gerarDatasRecorrentes({
  dataInicial,
  tipoRecorrencia,
  intervalo,
  dataFim,
  maxOcorrencias = 52, // Default: 1 ano de semanas
}: GerarRecorrenciasParams): Date[] {
  const datas: Date[] = [dataInicial];
  let dataAtual = new Date(dataInicial);
  
  // Se não houver data fim, define um limite padrão de 1 ano
  const dataLimite = dataFim || addYears(dataInicial, 1);
  
  let contador = 1;
  
  while (contador < maxOcorrencias) {
    // Calcula próxima data baseado no tipo de recorrência
    switch (tipoRecorrencia) {
      case 'diario':
        dataAtual = addDays(dataAtual, intervalo);
        break;
      case 'semanal':
        dataAtual = addWeeks(dataAtual, intervalo);
        break;
      case 'mensal':
        dataAtual = addMonths(dataAtual, intervalo);
        break;
      case 'anual':
        dataAtual = addYears(dataAtual, intervalo);
        break;
    }
    
    // Verifica se ultrapassou a data limite
    if (isAfter(dataAtual, dataLimite)) {
      break;
    }
    
    datas.push(new Date(dataAtual));
    contador++;
  }
  
  return datas;
}

/**
 * Calcula quantas ocorrências serão criadas
 */
export function calcularQuantidadeOcorrencias(params: GerarRecorrenciasParams): number {
  return gerarDatasRecorrentes(params).length;
}

/**
 * Retorna descrição amigável da recorrência
 */
export function getDescricaoRecorrencia(
  tipo: TipoRecorrencia,
  intervalo: number
): string {
  if (!tipo) {
    return 'Recorrente';
  }
  
  const textos = {
    diario: intervalo === 1 ? 'Todos os dias' : `A cada ${intervalo} dias`,
    semanal: intervalo === 1 ? 'Toda semana' : `A cada ${intervalo} semanas`,
    mensal: intervalo === 1 ? 'Todo mês' : `A cada ${intervalo} meses`,
    anual: intervalo === 1 ? 'Todo ano' : `A cada ${intervalo} anos`,
  };
  
  return textos[tipo] || 'Recorrente';
}

/**
 * Gera um ID único para agrupar compromissos da mesma série
 */
export function gerarRecorrenciaGrupoId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}