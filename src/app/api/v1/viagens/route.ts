import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePremium } from '@/lib/middleware/premiumOnly';

// GET - Listar todas as viagens do usuário
export async function GET(req: NextRequest) {
  const premiumCheck = await requirePremium(req);
  if (premiumCheck instanceof NextResponse) {
    return premiumCheck;
  }
  const { userId } = premiumCheck;

  try {
    const viagens = await prisma.viagem.findMany({
      where: { userId },
      include: {
        destinos: {
          orderBy: { ordem: 'asc' },
        },
        transportes: {
          orderBy: { dataHora: 'asc' },
        },
        hospedagens: {
          orderBy: { checkIn: 'asc' },
        },
        atividades: {
          orderBy: { data: 'asc' },
        },
        despesas: true,
      },
      orderBy: { dataInicio: 'desc' },
    });

    // Calcular totais e dias restantes para cada viagem
    const viagensComDetalhes = viagens.map((viagem) => {
      const totalGasto = viagem.despesas.reduce(
        (acc, despesa) => acc + Number(despesa.valorConvertido || despesa.valor),
        0
      );

      const hoje = new Date();
      const dataInicio = new Date(viagem.dataInicio);
      const diasRestantes = Math.ceil(
        (dataInicio.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...viagem,
        totalGasto,
        diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
      };
    });

    return NextResponse.json(viagensComDetalhes);
  } catch (error) {
    console.error('Erro ao buscar viagens:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar viagens' },
      { status: 500 }
    );
  }
}

// POST - Criar nova viagem
export async function POST(req: NextRequest) {
  const premiumCheck = await requirePremium(req);
  if (premiumCheck instanceof NextResponse) {
    return premiumCheck;
  }
  const { userId } = premiumCheck;

  try {
    const body = await req.json();
    const {
      nome,
      descricao,
      proposito,
      dataInicio,
      dataFim,
      orcamentoTotal,
      notasGerais,
      status,
    } = body;

    // Validações básicas
    if (!nome || !dataInicio || !dataFim) {
      return NextResponse.json(
        { error: 'Nome, data de início e data de fim são obrigatórios' },
        { status: 400 }
      );
    }

    const viagem = await prisma.viagem.create({
      data: {
        nome,
        descricao,
        proposito: proposito || 'LAZER',
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        orcamentoTotal: orcamentoTotal ? Number(orcamentoTotal) : null,
        notasGerais,
        status: status || 'PLANEJADA',
        userId,
      },
      include: {
        destinos: true,
        transportes: true,
        hospedagens: true,
        atividades: true,
        despesas: true,
      },
    });

    return NextResponse.json(viagem, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    return NextResponse.json(
      { error: 'Erro ao criar viagem' },
      { status: 500 }
    );
  }
}
