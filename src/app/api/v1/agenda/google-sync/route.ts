import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

// Webhook para receber notificações do Google Calendar
export async function POST(req: NextRequest) {
  try {
    // Verificar se é uma notificação do Google
    const channelId = req.headers.get('x-goog-channel-id');
    const resourceState = req.headers.get('x-goog-resource-state');
    const resourceId = req.headers.get('x-goog-resource-id');

    console.log('Webhook recebido:', { channelId, resourceState, resourceId });

    // Se for apenas um sync (primeira notificação), retornar OK
    if (resourceState === 'sync') {
      return NextResponse.json({ message: 'Sync received' }, { status: 200 });
    }

    // Se for uma mudança real (exists ou not_exists)
    if (resourceState === 'exists' && channelId) {
      // Buscar o usuário associado ao channelId
      const user = await prisma.user.findFirst({
        where: {
          googleCalendarChannelId: channelId,
        },
      });

      if (!user) {
        console.log('Usuário não encontrado para channelId:', channelId);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      // Sincronizar eventos do Google Calendar
      await syncGoogleCalendarEvents(user.id);

      return NextResponse.json({ message: 'Events synced' }, { status: 200 });
    }

    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Erro no webhook do Google Calendar:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Função para sincronizar eventos do Google Calendar
async function syncGoogleCalendarEvents(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleAccessToken || !user?.googleRefreshToken) {
      console.log('Usuário sem tokens do Google');
      return;
    }

    // Configurar OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    // Verificar se o token expirou e renovar se necessário
    if (user.googleTokenExpiry && user.googleTokenExpiry < new Date()) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: credentials.access_token,
          googleTokenExpiry: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : null,
        },
      });
      oauth2Client.setCredentials(credentials);
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Buscar eventos modificados recentemente (últimas 24 horas)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: 'primary',
      updatedMin: oneDayAgo.toISOString(),
      singleEvents: true,
      orderBy: 'updated',
    });

    const events = response.data.items || [];

    // Atualizar compromissos locais que foram modificados no Google
    for (const event of events) {
      if (!event.id) continue;

      // Buscar compromisso local com este googleEventId
      const compromisso = await prisma.compromisso.findFirst({
        where: {
          googleEventId: event.id,
          userId: userId,
          syncWithGoogle: true,
        },
      });

      if (!compromisso) continue;

      // Se o evento foi deletado no Google
      if (event.status === 'cancelled') {
        await prisma.compromisso.delete({
          where: { id: compromisso.id },
        });
        console.log(`Compromisso ${compromisso.id} deletado (removido do Google)`);
        continue;
      }

      // Extrair informações do evento do Google
      const startDateTime = event.start?.dateTime || event.start?.date;
      const endDateTime = event.end?.dateTime || event.end?.date;

      if (!startDateTime) continue;

      const dataEvento = new Date(startDateTime);
      const horaInicio = event.start?.dateTime
        ? new Date(startDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
        : compromisso.horaInicio;

      const horaFim = event.end?.dateTime
        ? new Date(endDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
        : compromisso.horaFim;

      // Verificar se houve mudanças
      const tituloMudou = event.summary !== compromisso.titulo;
      const descricaoMudou = (event.description || '') !== (compromisso.descricao || '');
      const dataMudou = dataEvento.getTime() !== compromisso.data.getTime();
      const horaMudou = horaInicio !== compromisso.horaInicio || horaFim !== compromisso.horaFim;

      if (tituloMudou || descricaoMudou || dataMudou || horaMudou) {
        // Atualizar o compromisso local
        await prisma.compromisso.update({
          where: { id: compromisso.id },
          data: {
            titulo: event.summary || compromisso.titulo,
            descricao: event.description || compromisso.descricao,
            data: dataEvento,
            horaInicio,
            horaFim,
          },
        });

        console.log(`Compromisso ${compromisso.id} atualizado do Google Calendar`);
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar eventos do Google Calendar:', error);
  }
}
