import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { PlanoUsuario } from '@/types/planos';

// GET - Obter informações do plano do usuário
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        plano: true,
        planoExpiraEm: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      plano: user.plano,
      planoExpiraEm: user.planoExpiraEm,
      ativo: !user.planoExpiraEm || new Date() < new Date(user.planoExpiraEm),
    });
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    return NextResponse.json({ error: 'Erro ao buscar plano' }, { status: 500 });
  }
}

// PUT - Atualizar plano do usuário (para uso administrativo ou processamento de pagamento)
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { plano, planoExpiraEm } = body;

    // Validar plano
    if (plano && !Object.values(PlanoUsuario).includes(plano)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // Calcular data de expiração se for Premium e não foi fornecida
    let dataExpiracao = planoExpiraEm ? new Date(planoExpiraEm) : undefined;

    if (plano === PlanoUsuario.PREMIUM && !dataExpiracao) {
      // Por padrão, Premium dura 30 dias
      dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 30);
    } else if (plano === PlanoUsuario.FREE) {
      // Free não tem expiração
      dataExpiracao = undefined;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plano: plano || user.plano,
        planoExpiraEm: dataExpiracao,
      },
      select: {
        id: true,
        plano: true,
        planoExpiraEm: true,
      },
    });

    return NextResponse.json({
      success: true,
      plano: updatedUser.plano,
      planoExpiraEm: updatedUser.planoExpiraEm,
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 });
  }
}
