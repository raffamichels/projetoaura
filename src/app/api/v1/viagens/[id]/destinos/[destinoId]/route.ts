import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePremium } from '@/lib/middleware/premiumOnly';

// DELETE - Excluir destino
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; destinoId: string }> }
) {
  const premiumCheck = await requirePremium(req);
  if (premiumCheck instanceof NextResponse) {
    return premiumCheck;
  }
  const { userId } = premiumCheck;

  const { id, destinoId } = await params;

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

    // Verificar se o destino existe e pertence à viagem
    const destino = await prisma.destinoViagem.findFirst({
      where: {
        id: destinoId,
        viagemId: id,
      },
    });

    if (!destino) {
      return NextResponse.json(
        { error: 'Destino não encontrado' },
        { status: 404 }
      );
    }

    // Excluir destino
    await prisma.destinoViagem.delete({
      where: { id: destinoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir destino:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir destino' },
      { status: 500 }
    );
  }
}
