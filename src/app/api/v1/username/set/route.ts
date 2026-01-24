import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { chooseUsernameSchema, RESERVED_USERNAMES } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se usuário já tem username
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });

    if (currentUser?.username) {
      return NextResponse.json(
        { error: 'Usuário já possui um username definido. Use a rota de atualização.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = chooseUsernameSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Username inválido' },
        { status: 400 }
      );
    }

    const { username } = validation.data;

    // Verificar reservados (dupla checagem)
    if (RESERVED_USERNAMES.includes(username)) {
      return NextResponse.json(
        { error: 'Este username não está disponível' },
        { status: 400 }
      );
    }

    // Verificar disponibilidade
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este username já está em uso' },
        { status: 400 }
      );
    }

    // Definir username
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        usernameChangedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        usernameChangedAt: true,
        name: true,
        email: true,
        image: true,
        plano: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Username definido com sucesso!',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Erro ao definir username:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
