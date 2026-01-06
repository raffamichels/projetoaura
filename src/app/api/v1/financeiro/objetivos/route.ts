import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';
import { calcularProgressoObjetivo, calcularFaltaObjetivo } from '@/lib/financeiro-helper';

// GET - Listar objetivos do usuário
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const objetivos = await prisma.objetivoFinanceiro.findMany({
      where: { 
        userId: user.id,
        ...(status && { status: status as 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO' }),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular campos extras
    const objetivosComCalculo = objetivos.map((obj) => {
      const valorMeta = Number(obj.valorMeta);
      const valorAtual = Number(obj.valorAtual);
      
      return {
        ...obj,
        valorMeta,
        valorAtual,
        porcentagemAtingida: calcularProgressoObjetivo(valorAtual, valorMeta),
        falta: calcularFaltaObjetivo(valorAtual, valorMeta),
      };
    });

    return NextResponse.json({ data: objetivosComCalculo }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar objetivos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar novo objetivo
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
      descricao,
      valorMeta,
      dataMeta,
      isReservaEmergencia,
      cor,
      icone,
    } = body;

    if (!nome || !valorMeta) {
      return NextResponse.json(
        { error: 'Nome e valor meta são obrigatórios' },
        { status: 400 }
      );
    }

    const objetivo = await prisma.objetivoFinanceiro.create({
      data: {
        nome,
        descricao,
        valorMeta,
        dataMeta: dataMeta ? new Date(dataMeta) : null,
        isReservaEmergencia: isReservaEmergencia || false,
        cor: cor || '#F59E0B',
        icone: icone || 'target',
        userId: user.id,
      },
    });

    // Registrar atividade
    await registrarAtividade({
      userId: user.id,
      tipo: 'financeiro_objetivo_criado',
      titulo: `Objetivo criado: ${nome}`,
      descricao: `Meta: R$ ${Number(valorMeta).toFixed(2)}${isReservaEmergencia ? ' • Reserva de emergência' : ''}`,
      metadata: {
        objetivoId: objetivo.id,
        valorMeta: Number(valorMeta),
        isReservaEmergencia: isReservaEmergencia,
      },
    });

    return NextResponse.json(
      { message: 'Objetivo criado com sucesso', data: objetivo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar objetivo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}