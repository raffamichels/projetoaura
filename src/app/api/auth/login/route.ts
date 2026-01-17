import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations/auth';
import {
  loginRateLimiter,
  loginEmailRateLimiter,
  getClientIP,
  rateLimitResponse,
} from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting por IP
    const clientIP = getClientIP(req);
    const ipLimit = await loginRateLimiter.limit(clientIP);

    if (!ipLimit.success) {
      return rateLimitResponse(ipLimit.resetTime);
    }

    // 2. Pegar dados do body
    const body = await req.json();

    // 3. Validar dados
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 4. Rate limiting por email (proteção adicional contra ataques direcionados)
    const emailLimit = await loginEmailRateLimiter.limit(email.toLowerCase());

    if (!emailLimit.success) {
      return NextResponse.json(
        { error: 'Conta temporariamente bloqueada devido a muitas tentativas. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    // 5. Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // 6. Verificar se usuário tem senha (não é OAuth)
    if (!user.password || user.password === '') {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // 7. Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // 8. Login bem-sucedido - resetar rate limit do email
    await loginEmailRateLimiter.reset(email.toLowerCase());

    // 9. Retornar dados do usuário (sem a senha)
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plano: user.plano,
      },
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}