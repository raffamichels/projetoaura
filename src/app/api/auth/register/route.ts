import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email/emailService';
import { registerRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

// Sanitizar nome removendo caracteres potencialmente perigosos
function sanitizeName(name: string): string {
  return name
    .replace(/<[^>]*>/g, '') // Remove tags HTML
    .replace(/[<>\"'&]/g, '') // Remove caracteres especiais
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting por IP
    const clientIP = getClientIP(req);
    const ipLimit = await registerRateLimiter.limit(clientIP);

    if (!ipLimit.success) {
      return rateLimitResponse(ipLimit.resetTime);
    }

    // 2. Pegar dados do body
    const body = await req.json();

    // 3. Validar dados
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // 4. Sanitizar nome para prevenir XSS
    const sanitizedName = sanitizeName(name);
    const normalizedEmail = email.toLowerCase();

    // 5. Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 6. Resposta genérica para prevenir enumeração de usuários
    // Mesmo status e mensagem independente se email existe ou não
    const genericSuccessMessage = 'Se o email for válido, você receberá instruções para ativar sua conta.';

    if (existingUser) {
      // Se usuário já existe e não verificou email, reenvia verificação
      if (!existingUser.emailVerified) {
        try {
          const verificationToken = await generateVerificationToken(normalizedEmail);
          await sendVerificationEmail(normalizedEmail, verificationToken.token, existingUser.name || sanitizedName);
        } catch {
          // Silencia erro de email para não vazar informação
        }
      }

      // Delay artificial para equalizar timing de resposta
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

      // Retorna mesma mensagem de sucesso (não revela que email existe)
      return NextResponse.json(
        { message: genericSuccessMessage },
        { status: 200 }
      );
    }

    // 7. Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. Criar usuário (emailVerified = null)
    await prisma.user.create({
      data: {
        name: sanitizedName,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    // 9. Gerar token de verificação
    const verificationToken = await generateVerificationToken(normalizedEmail);

    // 10. Enviar email de verificação
    await sendVerificationEmail(normalizedEmail, verificationToken.token, sanitizedName);

    // 11. Retornar mesma mensagem genérica de sucesso
    return NextResponse.json(
      { message: genericSuccessMessage },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Erro ao criar usuário', error, { endpoint: '/api/auth/register' });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}


