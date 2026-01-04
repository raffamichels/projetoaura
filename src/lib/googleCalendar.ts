import { google, calendar_v3 } from 'googleapis'; // Adicionei calendar_v3
import { prisma } from '@/lib/prisma';

export interface GoogleCalendarEventInput {
  titulo: string;
  descricao?: string;
  data: string;
  horaInicio: string;
  horaFim?: string;
  isRecorrente: boolean;
  tipoRecorrencia?: string;
  intervaloRecorrencia?: number;
  dataFimRecorrencia?: string;
}

export class GoogleCalendarService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );
  }

  // Configurar tokens do usuário
  async setUserCredentials(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleAccessToken || !user?.googleRefreshToken) {
      throw new Error('Usuário não autenticado com Google');
    }

    this.oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    // Verificar se o token expirou e renovar se necessário
    if (user.googleTokenExpiry && user.googleTokenExpiry < new Date()) {
      await this.refreshAccessToken(userId);
    }
  }

  // Renovar access token
  private async refreshAccessToken(userId: string) {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: credentials.access_token,
          googleTokenExpiry: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : null,
        },
      });

      this.oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error('Erro ao renovar token do Google:', error);
      throw new Error('Falha ao renovar token do Google');
    }
  }

  // Converter tipo de recorrência para formato do Google Calendar
  private convertRecurrenceToRRule(
    tipoRecorrencia: string,
    intervalo: number,
    dataFim?: string
  ): string[] {
    const freq = tipoRecorrencia.toUpperCase();
    let rrule = `RRULE:FREQ=${freq};INTERVAL=${intervalo}`;

    if (dataFim) {
      const until = dataFim.replace(/[-:]/g, '').split('T')[0] + 'T235959Z';
      rrule += `;UNTIL=${until}`;
    }

    return [rrule];
  }

  // Helper para construir o objeto de evento (evita duplicação de código)
  private buildEventObject(eventData: GoogleCalendarEventInput): calendar_v3.Schema$Event {
    // Construir data/hora de início
    const [year, month, day] = eventData.data.split('T')[0].split('-');
    const startDateTime = `${year}-${month}-${day}T${eventData.horaInicio}:00`;

    // Construir data/hora de fim
    let endDateTime: string;
    if (eventData.horaFim) {
      endDateTime = `${year}-${month}-${day}T${eventData.horaFim}:00`;
    } else {
      // Se não tiver hora fim, adicionar 1 hora
      const [hora, minuto] = eventData.horaInicio.split(':');
      const horaFim = String(parseInt(hora) + 1).padStart(2, '0');
      endDateTime = `${year}-${month}-${day}T${horaFim}:${minuto}:00`;
    }

    const event: calendar_v3.Schema$Event = {
      summary: eventData.titulo,
      description: eventData.descricao,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Sao_Paulo',
      },
    };

    // Adicionar recorrência se necessário
    if (eventData.isRecorrente && eventData.tipoRecorrencia) {
      event.recurrence = this.convertRecurrenceToRRule(
        eventData.tipoRecorrencia,
        eventData.intervaloRecorrencia || 1,
        eventData.dataFimRecorrencia
      );
    }

    return event;
  }

  // Criar evento no Google Calendar
  async createEvent(
    userId: string,
    eventData: GoogleCalendarEventInput
  ): Promise<string | null> {
    try {
      await this.setUserCredentials(userId);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      // AQUI ESTAVA O ERRO DE 'ANY' - Agora usa o helper tipado
      const event = this.buildEventObject(eventData);

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      return response.data.id || null;
    } catch (error) {
      console.error('Erro ao criar evento no Google Calendar:', error);
      return null;
    }
  }

  // Atualizar evento no Google Calendar
  async updateEvent(
    userId: string,
    googleEventId: string,
    eventData: GoogleCalendarEventInput
  ): Promise<boolean> {
    try {
      await this.setUserCredentials(userId);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // AQUI TAMBÉM TINHA 'ANY'
      const event = this.buildEventObject(eventData);

      await calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: event,
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar evento no Google Calendar:', error);
      return false;
    }
  }

  // Deletar evento do Google Calendar
  async deleteEvent(userId: string, googleEventId: string): Promise<boolean> {
    try {
      await this.setUserCredentials(userId);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
      });

      return true;
    } catch (error) {
      console.error('Erro ao deletar evento do Google Calendar:', error);
      return false;
    }
  }

  // Verificar se o usuário tem autenticação do Google configurada
  // Este é o único método ESTÁTICO (Static)
  static async userHasGoogleAuth(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
      },
    });

    return !!(user?.googleAccessToken && user?.googleRefreshToken);
  }
}