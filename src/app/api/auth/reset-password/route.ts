import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimit';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
});

export async function POST(req: Request) {
  try {
    // 1. Rate limiting por IP
    const clientIP = getClientIP(req);
    const ipLimit = await resetPasswordRateLimiter.limit(clientIP);

    if (!ipLimit.success) {
      return rateLimitResponse(ipLimit.resetTime);
    }

    // 2. Validar dados
    const body = await req.json();
    const validatedFields = resetPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: validatedFields.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validatedFields.data;

    // 3. Usar transação atômica para prevenir race condition
    // Deleta o token PRIMEIRO e retorna os dados em uma única operação
    const result = await prisma.$transaction(async (tx) => {
      // Tenta deletar o token (atômico - só uma requisição consegue)
      const deletedToken = await tx.passwordResetToken.delete({
        where: { token }
      }).catch(() => null);

      // Se token não existe ou já foi deletado
      if (!deletedToken) {
        return { success: false, error: 'Token inválido ou já utilizado' };
      }

      // Verifica expiração
      if (new Date() > deletedToken.expires) {
        return { success: false, error: 'Token expirado. Solicite um novo link de redefinição.' };
      }

      // Busca usuário
      const user = await tx.user.findUnique({
        where: { email: deletedToken.email }
      });

      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Atualiza senha
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      return { success: true };
    });

    // 4. Retornar resposta baseada no resultado da transação
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Senha redefinida com sucesso!' },
      { status: 200 }
    );

  } catch (error) {
    // Tratar erro de constraint (token já deletado por outra requisição)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Token inválido ou já utilizado' },
        { status: 400 }
      );
    }

    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    );
  }
}
