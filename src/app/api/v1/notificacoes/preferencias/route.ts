import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiReadRateLimiter, apiCreateRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { preferenciaNotificacaoSchema } from '@/lib/validations/notificacoes';

// GET - Obter preferências de notificação
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

    // Buscar ou criar preferências
    let preferencias = await prisma.preferenciaNotificacao.findUnique({
      where: { userId: user.id },
    });

    // Se não existir, criar com valores padrão
    if (!preferencias) {
      preferencias = await prisma.preferenciaNotificacao.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      data: {
        lembreteHabitoAtivo: preferencias.lembreteHabitoAtivo,
        resumoDiarioAtivo: preferencias.resumoDiarioAtivo,
        horarioResumoDiario: preferencias.horarioResumoDiario,
        alertaSequenciaAtivo: preferencias.alertaSequenciaAtivo,
        toastAtivo: preferencias.toastAtivo,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar preferências de notificação
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

    // Rate limiting
    const rateLimitResult = await apiCreateRateLimiter.limit(`${user.id}:update`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const body = await req.json();

    // Validar dados de entrada
    const validationResult = preferenciaNotificacaoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      lembreteHabitoAtivo,
      resumoDiarioAtivo,
      horarioResumoDiario,
      alertaSequenciaAtivo,
      toastAtivo,
    } = validationResult.data;

    // Upsert - criar se não existir, atualizar se existir
    const preferencias = await prisma.preferenciaNotificacao.upsert({
      where: { userId: user.id },
      update: {
        ...(lembreteHabitoAtivo !== undefined && { lembreteHabitoAtivo }),
        ...(resumoDiarioAtivo !== undefined && { resumoDiarioAtivo }),
        ...(horarioResumoDiario !== undefined && { horarioResumoDiario }),
        ...(alertaSequenciaAtivo !== undefined && { alertaSequenciaAtivo }),
        ...(toastAtivo !== undefined && { toastAtivo }),
      },
      create: {
        userId: user.id,
        lembreteHabitoAtivo: lembreteHabitoAtivo ?? true,
        resumoDiarioAtivo: resumoDiarioAtivo ?? true,
        horarioResumoDiario: horarioResumoDiario ?? '07:00',
        alertaSequenciaAtivo: alertaSequenciaAtivo ?? true,
        toastAtivo: toastAtivo ?? true,
      },
    });

    return NextResponse.json({
      message: 'Preferências atualizadas',
      data: {
        lembreteHabitoAtivo: preferencias.lembreteHabitoAtivo,
        resumoDiarioAtivo: preferencias.resumoDiarioAtivo,
        horarioResumoDiario: preferencias.horarioResumoDiario,
        alertaSequenciaAtivo: preferencias.alertaSequenciaAtivo,
        toastAtivo: preferencias.toastAtivo,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
