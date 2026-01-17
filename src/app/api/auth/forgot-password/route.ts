import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email/emailService';
import { forgotPasswordRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimit';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Mensagem genérica para todos os cenários (previne enumeração)
const GENERIC_SUCCESS_MESSAGE = 'Se o email existir e tiver senha cadastrada, você receberá instruções de redefinição.';

export async function POST(req: Request) {
  try {
    // 1. Rate limiting por IP
    const clientIP = getClientIP(req);
    const ipLimit = await forgotPasswordRateLimiter.limit(clientIP);

    if (!ipLimit.success) {
      return rateLimitResponse(ipLimit.resetTime);
    }

    // 2. Validar dados
    const body = await req.json();
    const validatedFields = forgotPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const { email } = validatedFields.data;
    const normalizedEmail = email.toLowerCase();

    // 3. Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    // 4. Se usuário não existe, retorna resposta genérica
    if (!user) {
      // Delay artificial para equalizar timing
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
      return NextResponse.json(
        { message: GENERIC_SUCCESS_MESSAGE },
        { status: 200 }
      );
    }

    // 5. Se usuário é OAuth (sem senha), retorna MESMA resposta genérica
    // NÃO revela que é conta OAuth - apenas não envia email
    if (!user.password || user.password === '') {
      // Delay artificial para equalizar timing
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
      return NextResponse.json(
        { message: GENERIC_SUCCESS_MESSAGE },
        { status: 200 }
      );
    }

    // 6. Usuário válido com senha - gera token e envia email
    const resetToken = await generatePasswordResetToken(normalizedEmail);
    await sendPasswordResetEmail(normalizedEmail, resetToken.token, user.name || undefined);

    return NextResponse.json(
      { message: GENERIC_SUCCESS_MESSAGE },
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
