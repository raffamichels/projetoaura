import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Pegar dados do body
    const body = await req.json();

    // 2. Validar dados
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 3. Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // 4. Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // 5. Retornar dados do usuário (sem a senha)
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