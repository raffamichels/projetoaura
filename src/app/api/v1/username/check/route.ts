import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { usernameCheckRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimit';
import { RESERVED_USERNAMES, usernameRegex } from '@/lib/validations/auth';

export async function GET(req: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP = getClientIP(req);
    const ipLimit = await usernameCheckRateLimiter.limit(`username-check:${clientIP}`);

    if (!ipLimit.success) {
      return rateLimitResponse(ipLimit.resetTime);
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username')?.toLowerCase().trim();

    if (!username) {
      return NextResponse.json(
        { error: 'Username é obrigatório' },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (username.length < 3) {
      return NextResponse.json({
        available: false,
        reason: 'too_short',
        message: 'Username deve ter no mínimo 3 caracteres',
      });
    }

    if (username.length > 30) {
      return NextResponse.json({
        available: false,
        reason: 'too_long',
        message: 'Username deve ter no máximo 30 caracteres',
      });
    }

    // Validar formato
    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        available: false,
        reason: 'invalid_characters',
        message: 'Username pode conter apenas letras, números, underscore (_) e ponto (.)',
      });
    }

    // Validar pontos
    if (username.startsWith('.') || username.endsWith('.')) {
      return NextResponse.json({
        available: false,
        reason: 'invalid_dots',
        message: 'Username não pode começar ou terminar com ponto',
      });
    }

    if (username.includes('..')) {
      return NextResponse.json({
        available: false,
        reason: 'consecutive_dots',
        message: 'Username não pode ter pontos consecutivos',
      });
    }

    // Verificar reservados
    if (RESERVED_USERNAMES.includes(username)) {
      return NextResponse.json({
        available: false,
        reason: 'reserved',
        message: 'Este username não está disponível',
      });
    }

    // Verificar no banco
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingUser,
      reason: existingUser ? 'taken' : null,
      message: existingUser ? 'Este username já está em uso' : null,
    });
  } catch (error) {
    console.error('Erro ao verificar username:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
