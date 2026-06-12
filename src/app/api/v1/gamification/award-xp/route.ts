import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { awardXP } from '@/lib/gamification/engine';
import { XP_POR_ACAO } from '@/lib/gamification/config';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { tipoAcao } = body;

    if (!tipoAcao || !Object.keys(XP_POR_ACAO).includes(tipoAcao)) {
      return NextResponse.json({ error: 'Tipo de ação inválido' }, { status: 400 });
    }

    const result = await awardXP(user.id, tipoAcao as keyof typeof XP_POR_ACAO);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Erro ao conceder XP:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
