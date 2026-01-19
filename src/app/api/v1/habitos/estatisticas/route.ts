import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiReadRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import {
  getInicioDoDiaNoTimezone,
  getDiaSemanaNoTimezone,
  getTimezoneFromRequest,
  formatarDataString,
  subtrairDias,
  normalizarParaInicioDoDia,
  diferencaEmDias,
} from '@/lib/timezone';

// Função auxiliar para verificar se um hábito deve ser feito em um determinado dia
function habitoDeveSerFeitoNoDia(diasSemana: number[], diaSemana: number): boolean {
  // Se diasSemana está vazio, o hábito é diário
  if (diasSemana.length === 0) return true;
  return diasSemana.includes(diaSemana);
}

// GET - Buscar estatísticas gerais de hábitos
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Rate limiting
    const rateLimitResult = await apiReadRateLimiter.limit(`${user.id}:read`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    // Obter timezone do cliente
    const { searchParams } = new URL(req.url);
    const timezoneParam = searchParams.get('timezone');
    const timezone = getTimezoneFromRequest(timezoneParam);

    // Data de hoje no timezone do usuário
    const hoje = getInicioDoDiaNoTimezone(timezone);
    const diaSemanaHoje = getDiaSemanaNoTimezone(timezone);

    // Buscar todos os hábitos ativos com seus registros
    const habitosAtivos = await prisma.habito.findMany({
      where: {
        userId: user.id,
        status: 'ATIVO',
      },
      select: {
        id: true,
        diasSemana: true,
        sequenciaAtual: true,
        maiorSequencia: true,
        totalCompletados: true,
        createdAt: true,
        registros: {
          where: {
            data: hoje,
            completado: true,
          },
          take: 1,
        },
      },
    });

    // Encontrar a data do primeiro hábito criado
    const primeiroHabitoCriado = habitosAtivos.length > 0
      ? habitosAtivos.reduce((min, h) => h.createdAt < min ? h.createdAt : min, habitosAtivos[0].createdAt)
      : hoje;

    // Calcular quantos dias desde o primeiro hábito
    const dataPrimeiroHabito = normalizarParaInicioDoDia(new Date(primeiroHabitoCriado));
    const diasDesdeInicio = diferencaEmDias(hoje, dataPrimeiroHabito) + 1;

    // Usar no máximo 90 dias, ou menos se tiver menos tempo de uso
    const diasParaAnalise = Math.min(diasDesdeInicio, 90);

    // Filtrar apenas hábitos que devem ser feitos HOJE
    const habitosHoje = habitosAtivos.filter(h =>
      habitoDeveSerFeitoNoDia(h.diasSemana, diaSemanaHoje)
    );

    // Contar completados hoje (apenas dos hábitos que devem ser feitos hoje)
    const completadosHoje = habitosHoje.filter(h => h.registros.length > 0).length;
    const totalHabitosHoje = habitosHoje.length;
    const pendentesHoje = totalHabitosHoje - completadosHoje;

    // Calcular sequência global (dias consecutivos com TODOS os hábitos completados)
    const { sequenciaAtual, maiorSequencia } = await calcularSequenciaGlobal(
      user.id,
      habitosAtivos,
      timezone
    );

    // Total de completados (todos os tempos, todos os hábitos)
    const totalCompletados = habitosAtivos.reduce(
      (sum, h) => sum + h.totalCompletados,
      0
    );

    // Taxa de conclusão de hoje
    const taxaConclusaoHoje = totalHabitosHoje > 0
      ? Math.round((completadosHoje / totalHabitosHoje) * 100)
      : 0;

    // Buscar dados dos últimos 7 dias para gráfico
    const seteDiasAtras = subtrairDias(hoje, 6);

    const registrosUltimos7Dias = await prisma.registroHabito.groupBy({
      by: ['data'],
      where: {
        userId: user.id,
        data: {
          gte: seteDiasAtras,
          lte: hoje,
        },
        completado: true,
      },
      _count: {
        id: true,
      },
    });

    // Formatar dados para gráfico
    const dadosGrafico = [];
    for (let i = 6; i >= 0; i--) {
      const data = subtrairDias(hoje, i);
      const diaSemana = data.getDay();

      // Contar quantos hábitos devem ser feitos neste dia
      const habitosNesteDia = habitosAtivos.filter(h =>
        habitoDeveSerFeitoNoDia(h.diasSemana, diaSemana)
      ).length;

      const registro = registrosUltimos7Dias.find(r => {
        const dataRegistro = normalizarParaInicioDoDia(new Date(r.data));
        return dataRegistro.getTime() === data.getTime();
      });

      dadosGrafico.push({
        data: formatarDataString(data),
        completados: registro?._count.id || 0,
        total: habitosNesteDia,
      });
    }

    // Buscar dados do período calculado para calendário e tendências
    const dataInicioPeriodo = subtrairDias(hoje, diasParaAnalise - 1);

    const registrosPeriodo = await prisma.registroHabito.findMany({
      where: {
        userId: user.id,
        data: {
          gte: dataInicioPeriodo,
          lte: hoje,
        },
        completado: true,
      },
      select: {
        habitoId: true,
        data: true,
      },
    });

    // Agrupar registros por data para o calendário
    const registrosPorDataCalendario = new Map<string, Set<string>>();
    for (const reg of registrosPeriodo) {
      const dataStr = formatarDataString(normalizarParaInicioDoDia(new Date(reg.data)));
      if (!registrosPorDataCalendario.has(dataStr)) {
        registrosPorDataCalendario.set(dataStr, new Set());
      }
      registrosPorDataCalendario.get(dataStr)!.add(reg.habitoId);
    }

    // Gerar dados do calendário (período calculado)
    const calendarioStreak = [];
    let diasComHabitos = 0;
    let diasCompletosTotal = 0;

    for (let i = diasParaAnalise - 1; i >= 0; i--) {
      const data = subtrairDias(hoje, i);
      const diaSemana = data.getDay();
      const dataStr = formatarDataString(data);

      // Quantos hábitos devem ser feitos neste dia
      const habitosNesteDia = habitosAtivos.filter(h =>
        habitoDeveSerFeitoNoDia(h.diasSemana, diaSemana)
      );
      const totalNesteDia = habitosNesteDia.length;

      // Quantos foram completados
      const completadosNesteDia = registrosPorDataCalendario.get(dataStr) || new Set();
      const completadosCount = habitosNesteDia.filter(h => completadosNesteDia.has(h.id)).length;

      // Calcular nível (0-4) baseado na porcentagem
      let nivel = 0;
      if (totalNesteDia > 0) {
        diasComHabitos++;
        const porcentagem = (completadosCount / totalNesteDia) * 100;
        if (porcentagem === 100) {
          nivel = 4;
          diasCompletosTotal++;
        } else if (porcentagem >= 75) {
          nivel = 3;
        } else if (porcentagem >= 50) {
          nivel = 2;
        } else if (porcentagem > 0) {
          nivel = 1;
        }
      }

      calendarioStreak.push({
        data: dataStr,
        completados: completadosCount,
        total: totalNesteDia,
        nivel,
        diaSemana,
      });
    }

    // Dados semanais para gráfico de tendência (usar semanas do período calculado)
    const semanasParaAnalise = Math.min(Math.ceil(diasParaAnalise / 7), 12);
    const tendenciaSemanal = [];
    const diaSemanaHojeNum = hoje.getDay();

    for (let semana = semanasParaAnalise - 1; semana >= 0; semana--) {
      let inicioSemana = subtrairDias(hoje, (semana * 7) + diaSemanaHojeNum);

      // Não incluir semanas antes do início do período
      if (inicioSemana < dataInicioPeriodo) {
        inicioSemana = new Date(dataInicioPeriodo);
      }

      let completadosSemana = 0;
      let totalSemana = 0;

      for (let dia = 0; dia < 7; dia++) {
        const dataAtual = new Date(inicioSemana);
        dataAtual.setDate(dataAtual.getDate() + dia);

        if (dataAtual > hoje || dataAtual < dataInicioPeriodo) continue;

        const diaSemana = dataAtual.getDay();
        const dataStr = formatarDataString(dataAtual);

        const habitosNesteDia = habitosAtivos.filter(h =>
          habitoDeveSerFeitoNoDia(h.diasSemana, diaSemana)
        );

        totalSemana += habitosNesteDia.length;

        const completadosNesteDia = registrosPorDataCalendario.get(dataStr) || new Set();
        completadosSemana += habitosNesteDia.filter(h => completadosNesteDia.has(h.id)).length;
      }

      const taxaSemana = totalSemana > 0 ? Math.round((completadosSemana / totalSemana) * 100) : 0;

      tendenciaSemanal.push({
        semana: semanasParaAnalise - semana,
        dataInicio: formatarDataString(inicioSemana),
        completados: completadosSemana,
        total: totalSemana,
        taxa: taxaSemana,
      });
    }

    // Calcular taxa de sucesso geral (período calculado)
    const taxaSucessoGeral = diasComHabitos > 0
      ? Math.round((diasCompletosTotal / diasComHabitos) * 100)
      : 0;

    // Encontrar melhor semana
    const melhorSemana = tendenciaSemanal.reduce((melhor, atual) =>
      atual.taxa > melhor.taxa ? atual : melhor
    , tendenciaSemanal[0]);

    // Estatísticas por dia da semana (período calculado)
    const estatisticasPorDia = Array.from({ length: 7 }, (_, diaSemana) => {
      let completados = 0;
      let total = 0;

      for (let i = diasParaAnalise - 1; i >= 0; i--) {
        const data = subtrairDias(hoje, i);
        if (data.getDay() !== diaSemana) continue;

        const dataStr = formatarDataString(data);
        const habitosNesteDia = habitosAtivos.filter(h =>
          habitoDeveSerFeitoNoDia(h.diasSemana, diaSemana)
        );

        total += habitosNesteDia.length;
        const completadosNesteDia = registrosPorDataCalendario.get(dataStr) || new Set();
        completados += habitosNesteDia.filter(h => completadosNesteDia.has(h.id)).length;
      }

      return {
        dia: diaSemana,
        completados,
        total,
        taxa: total > 0 ? Math.round((completados / total) * 100) : 0,
      };
    });

    // Melhor e pior dia
    const diasComDados = estatisticasPorDia.filter(d => d.total > 0);
    const melhorDia = diasComDados.length > 0
      ? diasComDados.reduce((m, a) => a.taxa > m.taxa ? a : m)
      : null;
    const piorDia = diasComDados.length > 0
      ? diasComDados.reduce((m, a) => a.taxa < m.taxa ? a : m)
      : null;

    return NextResponse.json({
      data: {
        // Dados básicos
        totalHabitos: totalHabitosHoje,
        completadosHoje,
        pendentesHoje,
        maiorSequenciaAtual: sequenciaAtual,
        maiorSequenciaHistorica: maiorSequencia,
        totalCompletados,
        taxaConclusaoHoje,
        dadosGrafico,
        // Novos dados
        calendarioStreak,
        tendenciaSemanal,
        taxaSucessoGeral,
        diasCompletosTotal,
        diasComHabitos,
        melhorSemana,
        estatisticasPorDia,
        melhorDia,
        piorDia,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Calcular sequência global: dias consecutivos em que TODOS os hábitos do dia foram completados
async function calcularSequenciaGlobal(
  userId: string,
  habitosAtivos: { id: string; diasSemana: number[] }[],
  timezone: string
): Promise<{ sequenciaAtual: number; maiorSequencia: number }> {
  if (habitosAtivos.length === 0) {
    return { sequenciaAtual: 0, maiorSequencia: 0 };
  }

  // Buscar todos os registros dos últimos 365 dias no timezone do usuário
  const hoje = getInicioDoDiaNoTimezone(timezone);
  const umAnoAtras = subtrairDias(hoje, 365);

  const registros = await prisma.registroHabito.findMany({
    where: {
      userId,
      data: {
        gte: umAnoAtras,
        lte: hoje,
      },
      completado: true,
    },
    select: {
      habitoId: true,
      data: true,
    },
  });

  // Agrupar registros por data
  const registrosPorData = new Map<string, Set<string>>();
  for (const reg of registros) {
    const dataStr = formatarDataString(normalizarParaInicioDoDia(new Date(reg.data)));
    if (!registrosPorData.has(dataStr)) {
      registrosPorData.set(dataStr, new Set());
    }
    registrosPorData.get(dataStr)!.add(reg.habitoId);
  }

  // Função para verificar se um dia está completo
  const diaCompleto = (data: Date): boolean => {
    const diaSemana = data.getDay();
    const dataStr = formatarDataString(data);

    // Quais hábitos devem ser feitos neste dia?
    const habitosNesteDia = habitosAtivos.filter(h =>
      habitoDeveSerFeitoNoDia(h.diasSemana, diaSemana)
    );

    // Se não há hábitos para este dia, não conta como dia completo
    if (habitosNesteDia.length === 0) return false;

    // Verificar se todos foram completados
    const completadosNesteDia = registrosPorData.get(dataStr) || new Set();
    return habitosNesteDia.every(h => completadosNesteDia.has(h.id));
  };

  // Calcular sequência atual (contando para trás a partir de hoje)
  let sequenciaAtual = 0;
  let dataAtual = new Date(hoje);

  while (true) {
    const diaSemana = dataAtual.getDay();
    const habitosNesteDia = habitosAtivos.filter(h =>
      habitoDeveSerFeitoNoDia(h.diasSemana, diaSemana)
    );

    // Se não há hábitos para este dia, pula para o dia anterior
    if (habitosNesteDia.length === 0) {
      dataAtual = subtrairDias(dataAtual, 1);
      if (dataAtual < umAnoAtras) break;
      continue;
    }

    if (diaCompleto(dataAtual)) {
      sequenciaAtual++;
      dataAtual = subtrairDias(dataAtual, 1);
      if (dataAtual < umAnoAtras) break;
    } else {
      break;
    }
  }

  // Calcular maior sequência histórica
  let maiorSequencia = sequenciaAtual;
  let sequenciaTemp = 0;

  // Iterar todos os dias do período
  for (let i = 365; i >= 0; i--) {
    const data = subtrairDias(hoje, i);

    const diaSemana = data.getDay();
    const habitosNesteDia = habitosAtivos.filter(h =>
      habitoDeveSerFeitoNoDia(h.diasSemana, diaSemana)
    );

    // Se não há hábitos para este dia, mantém a sequência
    if (habitosNesteDia.length === 0) {
      continue;
    }

    if (diaCompleto(data)) {
      sequenciaTemp++;
      maiorSequencia = Math.max(maiorSequencia, sequenciaTemp);
    } else {
      sequenciaTemp = 0;
    }
  }

  return { sequenciaAtual, maiorSequencia };
}
