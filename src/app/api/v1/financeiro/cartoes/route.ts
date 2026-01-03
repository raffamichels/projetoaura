import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';

// GET - Listar cartões do usuário
export async function GET() {
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

    const cartoes = await prisma.cartao.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: cartoes }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar cartões:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar novo cartão
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

    const body = await req.json();
    const { 
      nome, 
      bandeira, 
      ultimosDigitos, 
      limite, 
      diaVencimento, 
      diaFechamento,
      cor, 
      icone 
    } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const cartao = await prisma.cartao.create({
      data: {
        nome,
        bandeira,
        ultimosDigitos,
        limite: limite || null,
        diaVencimento: diaVencimento || null,
        diaFechamento: diaFechamento || null,
        cor: cor || '#3B82F6',
        icone: icone || 'credit-card',
        userId: user.id,
      },
    });

    // Registrar atividade
    await registrarAtividade({
      userId: user.id,
      tipo: 'financeiro_cartao_criado',
      titulo: `Cartão criado: ${nome}`,
      descricao: `${bandeira || 'Cartão'}${ultimosDigitos ? ` •••• ${ultimosDigitos}` : ''}`,
      metadata: {
        cartaoId: cartao.id,
        bandeira: bandeira,
      },
    });

    return NextResponse.json(
      { message: 'Cartão criado com sucesso', data: cartao },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar cartão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
