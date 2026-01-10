import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVerificationTokenByToken, deleteVerificationToken } from '@/lib/tokens';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token não fornecido' },
      { status: 400 }
    );
  }

  try {
    // Busca token no banco
    const verificationToken = await getVerificationTokenByToken(token);

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      );
    }

    // Verifica se token expirou
    if (new Date() > verificationToken.expires) {
      await deleteVerificationToken(verificationToken.id);
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Atualiza emailVerified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });

    // Remove token usado
    await deleteVerificationToken(verificationToken.id);

    return NextResponse.json(
      { message: 'Email verificado com sucesso!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar email' },
      { status: 500 }
    );
  }
}
