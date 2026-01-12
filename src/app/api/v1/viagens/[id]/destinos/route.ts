import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePremium } from '@/lib/middleware/premiumOnly';

// GET - Listar destinos da viagem
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const premiumCheck = await requirePremium(req);
  if (premiumCheck instanceof NextResponse) {
    return premiumCheck;
  }
  const { userId } = premiumCheck;

  const { id } = await params;

  try {
    // Verificar se a viagem pertence ao usuário
    const viagem = await prisma.viagem.findFirst({
      where: { id, userId },
    });

    if (!viagem) {
      return NextResponse.json(
        { error: 'Viagem não encontrada' },
        { status: 404 }
      );
    }

    const destinos = await prisma.destinoViagem.findMany({
      where: { viagemId: id },
      include: { locaisSalvos: true },
      orderBy: { ordem: 'asc' },
    });

    return NextResponse.json(destinos);
  } catch (error) {
    console.error('Erro ao buscar destinos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar destinos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo destino
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const premiumCheck = await requirePremium(req);
  if (premiumCheck instanceof NextResponse) {
    return premiumCheck;
  }
  const { userId } = premiumCheck;

  const { id } = await params;

  try {
    // Verificar se a viagem pertence ao usuário
    const viagem = await prisma.viagem.findFirst({
      where: { id, userId },
    });

    if (!viagem) {
      return NextResponse.json(
        { error: 'Viagem não encontrada' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      nome,
      cidade,
      pais,
      dataChegada,
      dataSaida,
      ordem,
      ...restoDosDados
    } = body;

    if (!nome || !cidade || !pais || !dataChegada || !dataSaida) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    const destino = await prisma.destinoViagem.create({
      data: {
        nome,
        cidade,
        pais,
        dataChegada: new Date(dataChegada),
        dataSaida: new Date(dataSaida),
        ordem: ordem || 0,
        viagemId: id,
        ...restoDosDados,
      },
      include: { locaisSalvos: true },
    });

    return NextResponse.json(destino, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar destino:', error);
    return NextResponse.json(
      { error: 'Erro ao criar destino' },
      { status: 500 }
    );
  }
}
