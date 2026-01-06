import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { GoogleCalendarService } from '@/lib/googleCalendar';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ hasAuth: false }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ hasAuth: false }, { status: 200 });
    }

    const hasAuth = await GoogleCalendarService.userHasGoogleAuth(user.id);

    return NextResponse.json({ hasAuth }, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar autenticação do Google:', error);
    return NextResponse.json({ hasAuth: false }, { status: 200 });
  }
}
