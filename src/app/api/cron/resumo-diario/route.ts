import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Chave secreta para autenticar requisições do cron
const CRON_SECRET = process.env.CRON_SECRET;

// GET - Executado a cada hora pelo Vercel Cron
// Envia resumo diário para usuários que configuraram esse horário
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação do cron
    const authHeader = req.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter hora atual (UTC)
    const now = new Date();
    const horaAtual = now.getUTCHours().toString().padStart(2, '0') + ':00';

    // Buscar usuários com resumo diário ativo nesse horário
    const preferencias = await prisma.preferenciaNotificacao.findMany({
      where: {
        resumoDiarioAtivo: true,
        horarioResumoDiario: {
          startsWith: horaAtual.substring(0, 2), // Comparar apenas a hora
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const notificacoesCriadas: string[] = [];

    for (const pref of preferencias) {
      // Buscar hábitos ativos do usuário para hoje
      const hoje = new Date();
      hoje.setUTCHours(0, 0, 0, 0);
      const diaSemana = hoje.getDay();

      const habitos = await prisma.habito.findMany({
        where: {
          userId: pref.userId,
          status: 'ATIVO',
          dataEncerramento: null,
          OR: [
            { diasSemana: { isEmpty: true } }, // Todos os dias
            { diasSemana: { has: diaSemana } }, // Dias específicos
          ],
        },
        select: {
          id: true,
          nome: true,
          sequenciaAtual: true,
        },
      });

      if (habitos.length === 0) continue;

      // Verificar se já existe notificação de resumo hoje
      const notificacaoExistente = await prisma.notificacao.findFirst({
        where: {
          userId: pref.userId,
          tipo: 'RESUMO_DIARIO',
          createdAt: {
            gte: hoje,
          },
        },
      });

      if (notificacaoExistente) continue;

      // Criar notificação de resumo diário
      const totalHabitos = habitos.length;
      const maiorSequencia = Math.max(...habitos.map(h => h.sequenciaAtual), 0);

      const notificacao = await prisma.notificacao.create({
        data: {
          tipo: 'RESUMO_DIARIO',
          titulo: `Bom dia${pref.user.name ? `, ${pref.user.name.split(' ')[0]}` : ''}! ☀️`,
          mensagem: `Você tem ${totalHabitos} hábito${totalHabitos > 1 ? 's' : ''} para hoje. ${
            maiorSequencia > 0 ? `Sua maior sequência atual é de ${maiorSequencia} dias. Mantenha o ritmo!` : 'Comece bem o dia!'
          }`,
          dados: {
            totalHabitos,
            maiorSequencia,
            habitos: habitos.map(h => ({ id: h.id, nome: h.nome })),
          },
          userId: pref.userId,
        },
      });

      notificacoesCriadas.push(notificacao.id);
    }

    return NextResponse.json({
      success: true,
      message: `Resumos diários enviados: ${notificacoesCriadas.length}`,
      horaVerificada: horaAtual,
      notificacoes: notificacoesCriadas,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro no cron de resumo diário:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
