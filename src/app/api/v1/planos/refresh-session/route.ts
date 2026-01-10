import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

/**
 * Endpoint para forçar atualização da sessão
 * Útil após atualizar o plano do usuário
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Retornar a sessão atual
    // O callback JWT será chamado e atualizará os dados do banco
    return NextResponse.json({
      success: true,
      message: 'Sessão atualizada',
      plano: session.user.plano,
    });
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    return NextResponse.json({ error: 'Erro ao atualizar sessão' }, { status: 500 });
  }
}
