import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email/emailService';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = forgotPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const { email } = validatedFields.data;

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Por segurança, sempre retorna sucesso mesmo que usuário não exista
    // Isso previne enumeration attacks
    if (!user) {
      return NextResponse.json(
        { message: 'Se o email existir, você receberá instruções de redefinição' },
        { status: 200 }
      );
    }

    // Verifica se usuário tem senha (não é OAuth)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Esta conta usa login social. Não é possível redefinir senha.' },
        { status: 400 }
      );
    }

    // Gera token de reset
    const resetToken = await generatePasswordResetToken(email);

    // Envia email
    await sendPasswordResetEmail(email, resetToken.token, user.name || undefined);

    return NextResponse.json(
      { message: 'Se o email existir, você receberá instruções de redefinição' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar esqueci senha:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
