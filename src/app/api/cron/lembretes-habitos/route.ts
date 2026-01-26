import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Chave secreta para autenticar requisições do cron
const CRON_SECRET = process.env.CRON_SECRET;

// GET - Executado a cada 5 minutos pelo Vercel Cron
// Envia lembretes para hábitos com horário configurado
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação do cron
    const authHeader = req.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter hora atual (UTC) arredondada para 5 minutos
    const now = new Date();
    const minutos = Math.floor(now.getUTCMinutes() / 5) * 5;
    const horaAtual = now.getUTCHours().toString().padStart(2, '0') + ':' + minutos.toString().padStart(2, '0');

    // Também verificar os 5 minutos anteriores (para pegar hábitos que possam ter passado)
    const minutosAnterior = minutos === 0 ? 55 : minutos - 5;
    const horaAnterior = minutos === 0
      ? (now.getUTCHours() === 0 ? 23 : now.getUTCHours() - 1).toString().padStart(2, '0') + ':55'
      : now.getUTCHours().toString().padStart(2, '0') + ':' + minutosAnterior.toString().padStart(2, '0');

    const diaSemana = now.getDay();
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    // Buscar hábitos com horário configurado neste intervalo
    const habitos = await prisma.habito.findMany({
      where: {
        status: 'ATIVO',
        dataEncerramento: null,
        horario: {
          not: null,
        },
        OR: [
          { horario: horaAtual },
          { horario: horaAnterior },
        ],
        AND: [
          {
            OR: [
              { diasSemana: { isEmpty: true } }, // Todos os dias
              { diasSemana: { has: diaSemana } }, // Dias específicos
            ],
          },
        ],
      },
      include: {
        user: {
          include: {
            preferenciaNotificacao: true,
          },
        },
        registros: {
          where: {
            data: hoje,
          },
          take: 1,
        },
      },
    });

    const notificacoesCriadas: string[] = [];

    for (const habito of habitos) {
      // Verificar se o usuário tem lembretes ativos
      const prefNotif = habito.user.preferenciaNotificacao;
      if (prefNotif && !prefNotif.lembreteHabitoAtivo) continue;

      // Verificar se hábito já foi completado hoje
      if (habito.registros.length > 0 && habito.registros[0].completado) continue;

      // Verificar se já existe notificação de lembrete para este hábito hoje
      const notificacaoExistente = await prisma.notificacao.findFirst({
        where: {
          userId: habito.userId,
          tipo: 'LEMBRETE_HABITO',
          dados: {
            path: ['habitoId'],
            equals: habito.id,
          },
          createdAt: {
            gte: hoje,
          },
        },
      });

      if (notificacaoExistente) continue;

      // Criar notificação de lembrete
      const notificacao = await prisma.notificacao.create({
        data: {
          tipo: 'LEMBRETE_HABITO',
          titulo: `Hora de: ${habito.nome}`,
          mensagem: habito.sequenciaAtual > 0
            ? `Você está em uma sequência de ${habito.sequenciaAtual} dias. Não perca o ritmo!`
            : 'É hora de completar seu hábito!',
          dados: {
            habitoId: habito.id,
            habitoNome: habito.nome,
            sequenciaAtual: habito.sequenciaAtual,
          },
          userId: habito.userId,
        },
      });

      notificacoesCriadas.push(notificacao.id);
    }

    return NextResponse.json({
      success: true,
      message: `Lembretes enviados: ${notificacoesCriadas.length}`,
      horaVerificada: horaAtual,
      habitosVerificados: habitos.length,
      notificacoes: notificacoesCriadas,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro no cron de lembretes:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
