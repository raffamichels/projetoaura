import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiCreateRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { moduloSchema } from '@/lib/validations/estudos';

// POST - Criar módulo
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Rate limiting
    const rateLimitResult = await apiCreateRateLimiter.limit(`${user.id}:create`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const body = await req.json();

    // Validar dados de entrada
    const validationResult = moduloSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nome, descricao, cursoId, ordem } = validationResult.data;

    // Verificar se o curso pertence ao usuário
    const curso = await prisma.curso.findFirst({
      where: { id: cursoId, userId: user.id }
    });

    if (!curso) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
    }

    const modulo = await prisma.modulo.create({
      data: {
        nome,
        descricao,
        cursoId,
        ordem: ordem || 0,
      },
    });

    return NextResponse.json(
      { message: 'Módulo criado com sucesso', data: modulo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar módulo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
