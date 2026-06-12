import { prisma } from '@/lib/prisma';
import {
  XP_POR_ACAO,
  XP_LIMITES_DIARIOS,
  CONQUISTAS_DEFINICAO,
  getNivelByXP,
} from './config';

interface AwardXPResult {
  xpGanho: number;
  xpTotal: number;
  nivel: number;
  nivelAnterior: number;
  subiuNivel: boolean;
  tituloNivel: string;
}

export async function awardXP(
  userId: string,
  tipoAcao: keyof typeof XP_POR_ACAO
): Promise<AwardXPResult> {
  const xpGanho = XP_POR_ACAO[tipoAcao];
  if (!xpGanho) {
    return { xpGanho: 0, xpTotal: 0, nivel: 1, nivelAnterior: 1, subiuNivel: false, tituloNivel: 'Iniciante' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xpTotal: true, nivel: true },
  });

  if (!user) {
    return { xpGanho: 0, xpTotal: 0, nivel: 1, nivelAnterior: 1, subiuNivel: false, tituloNivel: 'Iniciante' };
  }

  const nivelAnterior = user.nivel;
  const novoXPTotal = user.xpTotal + xpGanho;
  const nivelInfo = getNivelByXP(novoXPTotal);

  const subiuNivel = nivelInfo.nivel > nivelAnterior;

  await prisma.user.update({
    where: { id: userId },
    data: {
      xpTotal: novoXPTotal,
      nivel: nivelInfo.nivel,
      xpAtualNivel: nivelInfo.xpAtualNivel,
    },
  });

  if (subiuNivel) {
    await prisma.notificacao.create({
      data: {
        tipo: 'CONQUISTA',
        titulo: 'Subiu de nível!',
        mensagem: `Parabéns! Você alcançou o nível ${nivelInfo.nivel} — ${nivelInfo.titulo}!`,
        dados: { nivel: nivelInfo.nivel, titulo: nivelInfo.titulo, xpGanho },
        userId,
      },
    });
  }

  return {
    xpGanho,
    xpTotal: novoXPTotal,
    nivel: nivelInfo.nivel,
    nivelAnterior,
    subiuNivel,
    tituloNivel: nivelInfo.titulo,
  };
}

export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xpTotal: true, nivel: true, createdAt: true },
  });

  if (!user) return [];

  const existingAchievements = await prisma.conquista.findMany({
    where: { userId },
    select: { tipo: true, desbloqueada: true, progressoAtual: true },
  });

  const existingMap = new Map(existingAchievements.map(a => [a.tipo, a]));

  const achievementsToCreate: typeof CONQUISTAS_DEFINICAO = [];

  for (const def of CONQUISTAS_DEFINICAO) {
    if (!existingMap.has(def.tipo)) {
      achievementsToCreate.push(def);
    }
  }

  if (achievementsToCreate.length > 0) {
    await prisma.conquista.createMany({
      data: achievementsToCreate.map(def => ({
        userId,
        tipo: def.tipo,
        titulo: def.titulo,
        descricao: def.descricao,
        icone: def.icone,
        categoria: def.categoria,
        xpReward: def.xpReward,
        progressoMeta: def.progressoMeta,
        progressoAtual: 0,
        desbloqueada: false,
      })),
    });
  }

  const allAchievements = await prisma.conquista.findMany({
    where: { userId, desbloqueada: false },
  });

  const unlockedTypes: string[] = [];

  const habitosAtivos = await prisma.habito.count({
    where: { userId, status: 'ATIVO' },
  });

  const totalAnotacoes = await prisma.anotacao.count({ where: { userId } });
  const totalCursos = await prisma.curso.count({ where: { userId } });
  const totalTransacoes = await prisma.transacao.count({ where: { userId } });
  const totalMidiasConcluidas = await prisma.midia.count({
    where: { userId, status: 'CONCLUIDO' },
  });
  const totalCitacoes = await prisma.citacao.count({ where: { userId } });
  const totalHabitoCompletados = await prisma.registroHabito.count({
    where: { userId, completado: true },
  });

  for (const achievement of allAchievements) {
    let progressoAtual = achievement.progressoAtual;
    let shouldUnlock = false;

    switch (achievement.tipo) {
      case 'primeiro_habito':
        progressoAtual = Math.min(totalHabitoCompletados, 1);
        shouldUnlock = totalHabitoCompletados >= 1;
        break;

      case '5_habitos_ativos':
        progressoAtual = habitosAtivos;
        shouldUnlock = habitosAtivos >= 5;
        break;

      case '10_habitos_ativos':
        progressoAtual = habitosAtivos;
        shouldUnlock = habitosAtivos >= 10;
        break;

      case 'primeira_nota':
        progressoAtual = Math.min(totalAnotacoes, 1);
        shouldUnlock = totalAnotacoes >= 1;
        break;

      case '10_anotacoes':
        progressoAtual = totalAnotacoes;
        shouldUnlock = totalAnotacoes >= 10;
        break;

      case '50_anotacoes':
        progressoAtual = totalAnotacoes;
        shouldUnlock = totalAnotacoes >= 50;
        break;

      case 'primeiro_curso':
        progressoAtual = Math.min(totalCursos, 1);
        shouldUnlock = totalCursos >= 1;
        break;

      case '3_cursos':
        progressoAtual = totalCursos;
        shouldUnlock = totalCursos >= 3;
        break;

      case '10_cursos':
        progressoAtual = totalCursos;
        shouldUnlock = totalCursos >= 10;
        break;

      case 'primeira_transacao':
        progressoAtual = Math.min(totalTransacoes, 1);
        shouldUnlock = totalTransacoes >= 1;
        break;

      case '50_transacoes':
        progressoAtual = totalTransacoes;
        shouldUnlock = totalTransacoes >= 50;
        break;

      case '100_transacoes':
        progressoAtual = totalTransacoes;
        shouldUnlock = totalTransacoes >= 100;
        break;

      case 'primeiro_livro':
        progressoAtual = Math.min(totalMidiasConcluidas, 1);
        shouldUnlock = totalMidiasConcluidas >= 1;
        break;

      case '5_livros':
        progressoAtual = totalMidiasConcluidas;
        shouldUnlock = totalMidiasConcluidas >= 5;
        break;

      case '10_livros':
        progressoAtual = totalMidiasConcluidas;
        shouldUnlock = totalMidiasConcluidas >= 10;
        break;

      case '20_citacoes':
        progressoAtual = totalCitacoes;
        shouldUnlock = totalCitacoes >= 20;
        break;

      case 'nivel_5':
        progressoAtual = user.nivel >= 5 ? 1 : 0;
        shouldUnlock = user.nivel >= 5;
        break;

      case 'nivel_10':
        progressoAtual = user.nivel >= 10 ? 1 : 0;
        shouldUnlock = user.nivel >= 10;
        break;

      case 'streak_3_dias':
      case 'streak_7_dias':
      case 'streak_30_dias':
      case 'streak_60_dias':
      case 'streak_365_dias': {
        const streakMeta = parseInt(achievement.tipo.split('_')[1]);
        const streakData = await calcularStreakAtual(userId);
        progressoAtual = streakData;
        shouldUnlock = streakData >= streakMeta;
        break;
      }

      case 'dia_perfeito': {
        const diasPerfeitos = await contarDiasPerfeitos(userId);
        progressoAtual = diasPerfeitos;
        shouldUnlock = diasPerfeitos >= 1;
        break;
      }

      default:
        break;
    }

    if (shouldUnlock || progressoAtual !== achievement.progressoAtual) {
      const data: Record<string, unknown> = {
        progressoAtual,
      };

      if (shouldUnlock && !achievement.desbloqueada) {
        data.desbloqueada = true;
        data.desbloqueadaEm = new Date();
        unlockedTypes.push(achievement.tipo);

        await prisma.notificacao.create({
          data: {
            tipo: 'CONQUISTA',
            titulo: `Conquista desbloqueada: ${achievement.titulo}!`,
            mensagem: achievement.descricao,
            dados: {
              conquistaTipo: achievement.tipo,
              titulo: achievement.titulo,
              icone: achievement.icone,
              xpReward: achievement.xpReward,
            },
            userId,
          },
        });

        await awardXP(userId, 'DIA_PERFEITO' as keyof typeof XP_POR_ACAO);
      }

      await prisma.conquista.update({
        where: { id: achievement.id },
        data,
      });
    }
  }

  return unlockedTypes;
}

async function calcularStreakAtual(userId: string): Promise<number> {
  const habitosAtivos = await prisma.habito.findMany({
    where: { userId, status: 'ATIVO' },
    select: { id: true, diasSemana: true },
  });

  if (habitosAtivos.length === 0) return 0;

  const registros = await prisma.registroHabito.findMany({
    where: {
      userId,
      completado: true,
      data: {
        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      },
    },
    select: { habitoId: true, data: true },
  });

  const registrosPorData = new Map<string, Set<string>>();
  for (const reg of registros) {
    const dataStr = reg.data.toISOString().split('T')[0];
    if (!registrosPorData.has(dataStr)) {
      registrosPorData.set(dataStr, new Set());
    }
    registrosPorData.get(dataStr)!.add(reg.habitoId);
  }

  let streak = 0;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    const diaSemana = data.getDay();
    const dataStr = data.toISOString().split('T')[0];

    const habitosNesteDia = habitosAtivos.filter(h =>
      h.diasSemana.length === 0 || h.diasSemana.includes(diaSemana)
    );

    if (habitosNesteDia.length === 0) continue;

    const completados = registrosPorData.get(dataStr) || new Set();
    const todosCompletados = habitosNesteDia.every(h => completados.has(h.id));

    if (todosCompletados) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function contarDiasPerfeitos(userId: string): Promise<number> {
  const registros = await prisma.registroHabito.findMany({
    where: { userId, completado: true },
    select: { data: true },
  });

  const diasCompletos = new Set<string>();
  for (const reg of registros) {
    diasCompletos.add(reg.data.toISOString().split('T')[0]);
  }

  const habitosAtivos = await prisma.habito.findMany({
    where: { userId, status: 'ATIVO' },
    select: { id: true, diasSemana: true },
  });

  if (habitosAtivos.length === 0) return 0;

  let diasPerfeitos = 0;

  for (const dataStr of diasCompletos) {
    const data = new Date(dataStr + 'T00:00:00');
    const diaSemana = data.getDay();

    const habitosNesteDia = habitosAtivos.filter(h =>
      h.diasSemana.length === 0 || h.diasSemana.includes(diaSemana)
    );

    if (habitosNesteDia.length === 0) continue;

    const registrosDoDia = await prisma.registroHabito.findMany({
      where: {
        userId,
        data: data,
        completado: true,
      },
      select: { habitoId: true },
    });

    const completadosIds = new Set(registrosDoDia.map(r => r.habitoId));
    const todosCompletados = habitosNesteDia.every(h => completadosIds.has(h.id));

    if (todosCompletados) {
      diasPerfeitos++;
    }
  }

  return diasPerfeitos;
}

export async function getGamificationStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xpTotal: true, nivel: true, xpAtualNivel: true },
  });

  if (!user) return null;

  const nivelInfo = getNivelByXP(user.xpTotal);

  const conquistas = await prisma.conquista.findMany({
    where: { userId },
    orderBy: [{ desbloqueada: 'desc' }, { criadaEm: 'asc' }],
  });

  const totalConquistas = conquistas.length;
  const conquistasDesbloqueadas = conquistas.filter(c => c.desbloqueada).length;

  return {
    xpTotal: user.xpTotal,
    nivel: nivelInfo.nivel,
    tituloNivel: nivelInfo.titulo,
    xpAtualNivel: nivelInfo.xpAtualNivel,
    xpProximoNivel: nivelInfo.xpProximoNivel,
    conquistas: conquistas.map(c => ({
      id: c.id,
      tipo: c.tipo,
      titulo: c.titulo,
      descricao: c.descricao,
      icone: c.icone,
      categoria: c.categoria,
      xpReward: c.xpReward,
      desbloqueada: c.desbloqueada,
      desbloqueadaEm: c.desbloqueadaEm,
      progressoAtual: c.progressoAtual,
      progressoMeta: c.progressoMeta,
    })),
    totalConquistas,
    conquistasDesbloqueadas,
    percentualConquistas: totalConquistas > 0
      ? Math.round((conquistasDesbloqueadas / totalConquistas) * 100)
      : 0,
  };
}
