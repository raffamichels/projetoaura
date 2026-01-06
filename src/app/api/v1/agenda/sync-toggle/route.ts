import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { GoogleCalendarService } from '@/lib/googleCalendar';

// POST - Ativar sincronização automática do Google Calendar
export async function POST() {
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

    // Verificar se o usuário tem autenticação do Google
    if (!user.googleAccessToken || !user.googleRefreshToken) {
      return NextResponse.json(
        { error: 'Conecte-se ao Google Calendar primeiro' },
        { status: 400 }
      );
    }

    // Configurar watch
    const googleService = new GoogleCalendarService();
    const watchResult = await googleService.setupCalendarWatch(user.id);

    if (!watchResult) {
      return NextResponse.json(
        { error: 'Erro ao configurar sincronização automática' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Sincronização automática ativada',
        channelId: watchResult.channelId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao ativar sincronização:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Desativar sincronização automática do Google Calendar
export async function DELETE() {
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

    // Parar watch
    const googleService = new GoogleCalendarService();
    const success = await googleService.stopCalendarWatch(user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao desativar sincronização automática' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Sincronização automática desativada' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao desativar sincronização:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// GET - Sincronizar manualmente eventos do Google Calendar
export async function GET() {
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

    // Verificar se o usuário tem autenticação do Google
    if (!user.googleAccessToken || !user.googleRefreshToken) {
      return NextResponse.json(
        { error: 'Conecte-se ao Google Calendar primeiro' },
        { status: 400 }
      );
    }

    // Sincronizar eventos
    const googleService = new GoogleCalendarService();
    const updatedCount = await googleService.syncEventsFromGoogle(user.id);

    return NextResponse.json(
      {
        message: `Sincronização concluída`,
        updatedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao sincronizar eventos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
