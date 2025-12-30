import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Pegar dados do body
    const body = await req.json();

    // 2. Validar dados
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // 3. Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // 4. Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        plano: true,
        createdAt: true,
      },
    });

    // 6. Retornar sucesso
    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}


