import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getPasswordResetTokenByToken, deletePasswordResetToken } from '@/lib/tokens';

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = resetPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: validatedFields.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validatedFields.data;

    // Busca token
    const resetToken = await getPasswordResetTokenByToken(token);

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verifica expiração
    if (new Date() > resetToken.expires) {
      await deletePasswordResetToken(resetToken.id);
      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo link de redefinição.' },
        { status: 400 }
      );
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualiza senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Remove token usado
    await deletePasswordResetToken(resetToken.id);

    return NextResponse.json(
      { message: 'Senha redefinida com sucesso!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    );
  }
}
