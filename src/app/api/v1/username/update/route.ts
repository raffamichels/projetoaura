import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { updateUsernameSchema, RESERVED_USERNAMES } from '@/lib/validations/auth';

// Período mínimo entre alterações de username (30 dias em milissegundos)
const USERNAME_CHANGE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar dados atuais do usuário
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true, usernameChangedAt: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já tem username (se não tem, deve usar /set)
    if (!currentUser.username) {
      return NextResponse.json(
        { error: 'Você ainda não possui um username. Use a rota de definição.' },
        { status: 400 }
      );
    }

    // Verificar período de 30 dias
    if (currentUser.usernameChangedAt) {
      const lastChange = new Date(currentUser.usernameChangedAt);
      const nextChangeDate = new Date(lastChange.getTime() + USERNAME_CHANGE_COOLDOWN_MS);
      const now = new Date();

      if (now < nextChangeDate) {
        return NextResponse.json(
          {
            error: 'Você só pode alterar o username a cada 30 dias',
            nextChangeDate: nextChangeDate.toISOString(),
            daysRemaining: Math.ceil((nextChangeDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
          },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const validation = updateUsernameSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Username inválido' },
        { status: 400 }
      );
    }

    const { username } = validation.data;

    // Verificar se é o mesmo username atual
    if (username === currentUser.username) {
      return NextResponse.json(
        { error: 'O novo username deve ser diferente do atual' },
        { status: 400 }
      );
    }

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

    // Atualizar username
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

    // Calcular próxima data de alteração
    const nextChangeDate = new Date(Date.now() + USERNAME_CHANGE_COOLDOWN_MS);

    return NextResponse.json({
      success: true,
      message: 'Username atualizado com sucesso!',
      data: updatedUser,
      nextChangeDate: nextChangeDate.toISOString(),
    });
  } catch (error) {
    console.error('Erro ao atualizar username:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
