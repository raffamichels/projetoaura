import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { CONQUISTAS_DEFINICAO } from '@/lib/gamification/config';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const conquistas = await prisma.conquista.findMany({
      where: { userId: user.id },
      orderBy: [{ desbloqueada: 'desc' }, { criadaEm: 'asc' }],
    });

    const definicoesMap = new Map(CONQUISTAS_DEFINICAO.map(d => [d.tipo, d]));

    const result = conquistas.map(c => {
      const def = definicoesMap.get(c.tipo);
      return {
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
        percentualProgresso: c.progressoMeta > 0
          ? Math.min(Math.round((c.progressoAtual / c.progressoMeta) * 100), 100)
          : 0,
      };
    });

    const totalDesbloqueadas = result.filter(c => c.desbloqueada).length;

    return NextResponse.json({
      data: {
        conquistas: result,
        total: result.length,
        desbloqueadas: totalDesbloqueadas,
        percentual: result.length > 0
          ? Math.round((totalDesbloqueadas / result.length) * 100)
          : 0,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
