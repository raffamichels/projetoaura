import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePremium } from '@/lib/middleware/premiumOnly';

// GET - Buscar viagem específica
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const premiumCheck = await requirePremium(req);
  if (premiumCheck instanceof NextResponse) {
    return premiumCheck;
  }
  const { userId } = premiumCheck;

  try {
    const viagem = await prisma.viagem.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        destinos: {
          include: {
            locaisSalvos: true,
          },
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
        despesas: {
          orderBy: { data: 'desc' },
        },
      },
    });

    if (!viagem) {
      return NextResponse.json(
        { error: 'Viagem não encontrada' },
        { status: 404 }
      );
    }

    // Calcular estatísticas
    const totalGasto = viagem.despesas.reduce(
      (acc, despesa) => acc + Number(despesa.valorConvertido || despesa.valor),
      0
    );

    const hoje = new Date();
    const dataInicio = new Date(viagem.dataInicio);
    const diasRestantes = Math.ceil(
      (dataInicio.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      ...viagem,
      totalGasto,
      diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
    });
  } catch (error) {
    console.error('Erro ao buscar viagem:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar viagem' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar viagem
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const premiumCheck = await requirePremium(req);
  if (premiumCheck instanceof NextResponse) {
    return premiumCheck;
  }
  const { userId } = premiumCheck;

  try {
    // Verificar se a viagem existe e pertence ao usuário
    const viagemExistente = await prisma.viagem.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!viagemExistente) {
      return NextResponse.json(
        { error: 'Viagem não encontrada' },
        { status: 404 }
      );
    }

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
      avaliacaoGeral,
      diario,
    } = body;

    const viagem = await prisma.viagem.update({
      where: { id: params.id },
      data: {
        ...(nome && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(proposito && { proposito }),
        ...(dataInicio && { dataInicio: new Date(dataInicio) }),
        ...(dataFim && { dataFim: new Date(dataFim) }),
        ...(orcamentoTotal !== undefined && {
          orcamentoTotal: orcamentoTotal ? Number(orcamentoTotal) : null,
        }),
        ...(notasGerais !== undefined && { notasGerais }),
        ...(status && { status }),
        ...(avaliacaoGeral !== undefined && {
          avaliacaoGeral: avaliacaoGeral ? Number(avaliacaoGeral) : null,
        }),
        ...(diario !== undefined && { diario }),
      },
      include: {
        destinos: true,
        transportes: true,
        hospedagens: true,
        atividades: true,
        despesas: true,
      },
    });

    return NextResponse.json(viagem);
  } catch (error) {
    console.error('Erro ao atualizar viagem:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar viagem' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir viagem
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const premiumCheck = await requirePremium(req);
  if (premiumCheck instanceof NextResponse) {
    return premiumCheck;
  }
  const { userId } = premiumCheck;

  try {
    // Verificar se a viagem existe e pertence ao usuário
    const viagem = await prisma.viagem.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!viagem) {
      return NextResponse.json(
        { error: 'Viagem não encontrada' },
        { status: 404 }
      );
    }

    // Excluir viagem (cascade deletará todos os relacionados)
    await prisma.viagem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir viagem:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir viagem' },
      { status: 500 }
    );
  }
}
