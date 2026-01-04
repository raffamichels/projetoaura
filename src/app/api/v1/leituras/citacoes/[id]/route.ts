import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';

// PUT - Atualizar uma citação
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;
    const body = await req.json();

    // Verificar se a citação pertence ao usuário
    const citacaoExistente = await prisma.citacao.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!citacaoExistente) {
      return NextResponse.json({ error: 'Citação não encontrada' }, { status: 404 });
    }

    const dataUpdate: any = {};
    if (body.texto !== undefined) dataUpdate.texto = body.texto;
    if (body.autor !== undefined) dataUpdate.autor = body.autor;
    if (body.pagina !== undefined) dataUpdate.pagina = body.pagina;
    if (body.destaque !== undefined) dataUpdate.destaque = body.destaque;
    if (body.midiaId !== undefined) dataUpdate.midiaId = body.midiaId;

    const citacao = await prisma.citacao.update({
      where: { id },
      data: dataUpdate,
      include: {
        midia: {
          select: {
            titulo: true,
            tipo: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Citação atualizada com sucesso', data: citacao },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar citação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Excluir uma citação
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    // Verificar se a citação pertence ao usuário
    const citacao = await prisma.citacao.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!citacao) {
      return NextResponse.json({ error: 'Citação não encontrada' }, { status: 404 });
    }

    await prisma.citacao.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Citação excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir citação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
