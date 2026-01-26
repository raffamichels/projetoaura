import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiReadRateLimiter, apiUpdateRateLimiter, apiDeleteRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { habitoUpdateSchema } from '@/lib/validations/habitos';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Buscar hábito específico com histórico
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Buscar últimos 30 dias de registros
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    trintaDiasAtras.setHours(0, 0, 0, 0);

    const habito = await prisma.habito.findFirst({
      where: { id, userId: user.id },
      include: {
        registros: {
          where: {
            data: {
              gte: trintaDiasAtras,
            },
          },
          orderBy: { data: 'desc' },
        },
      },
    });

    if (!habito) {
      return NextResponse.json({ error: 'Hábito não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: habito }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar hábito:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar hábito
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const rateLimitResult = await apiUpdateRateLimiter.limit(`${user.id}:update`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    // Verificar se o hábito pertence ao usuário
    const habitoExistente = await prisma.habito.findFirst({
      where: { id, userId: user.id },
    });

    if (!habitoExistente) {
      return NextResponse.json({ error: 'Hábito não encontrado' }, { status: 404 });
    }

    const body = await req.json();

    // Validar dados de entrada
    const validationResult = habitoUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const habito = await prisma.habito.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(
      { message: 'Hábito atualizado com sucesso', data: habito },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar hábito:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir hábito
// Query params:
// - tipo: 'encerrar' (soft delete - preserva histórico) ou 'excluir' (hard delete - remove tudo)
// - diaSemana: (opcional) número 0-6 para remover apenas um dia específico do hábito
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const rateLimitResult = await apiDeleteRateLimiter.limit(`${user.id}:delete`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    // Verificar se o hábito pertence ao usuário
    const habitoExistente = await prisma.habito.findFirst({
      where: { id, userId: user.id },
    });

    if (!habitoExistente) {
      return NextResponse.json({ error: 'Hábito não encontrado' }, { status: 404 });
    }

    // Obter parâmetros
    const tipoExclusao = req.nextUrl.searchParams.get('tipo') || 'excluir';
    const diaSemanaParam = req.nextUrl.searchParams.get('diaSemana');

    if (tipoExclusao === 'encerrar') {
      // Verificar se é para remover apenas um dia específico
      if (diaSemanaParam !== null) {
        const diaSemana = parseInt(diaSemanaParam, 10);

        // Se diasSemana está vazio, significa "todos os dias"
        // Nesse caso, criamos um array com todos os dias EXCETO o dia a remover
        let novosDiasSemana: number[];

        if (habitoExistente.diasSemana.length === 0) {
          // Todos os dias: criar array [0,1,2,3,4,5,6] sem o dia removido
          novosDiasSemana = [0, 1, 2, 3, 4, 5, 6].filter(d => d !== diaSemana);
        } else {
          // Dias específicos: remover o dia do array
          novosDiasSemana = habitoExistente.diasSemana.filter(d => d !== diaSemana);
        }

        // Se não sobrou nenhum dia, encerrar o hábito completamente
        if (novosDiasSemana.length === 0) {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          await prisma.habito.update({
            where: { id },
            data: {
              dataEncerramento: hoje,
              status: 'CONCLUIDO',
            },
          });

          return NextResponse.json(
            { message: 'Hábito encerrado com sucesso. O histórico foi preservado.' },
            { status: 200 }
          );
        }

        // Atualizar o hábito removendo apenas o dia específico
        await prisma.habito.update({
          where: { id },
          data: {
            diasSemana: novosDiasSemana,
          },
        });

        return NextResponse.json(
          { message: 'Dia removido do hábito com sucesso. O histórico foi preservado.' },
          { status: 200 }
        );
      }

      // Soft delete completo: preenche dataEncerramento para preservar histórico
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      await prisma.habito.update({
        where: { id },
        data: {
          dataEncerramento: hoje,
          status: 'CONCLUIDO',
        },
      });

      return NextResponse.json(
        { message: 'Hábito encerrado com sucesso. O histórico foi preservado.' },
        { status: 200 }
      );
    } else {
      // Hard delete: remove o hábito e todos os registros (cascade)
      await prisma.habito.delete({
        where: { id },
      });

      return NextResponse.json(
        { message: 'Hábito excluído com sucesso' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Erro ao excluir hábito:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
