import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';

// GET - Buscar uma mídia específica por ID
export async function GET(
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

    const midia = await prisma.midia.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        citacoes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!midia) {
      return NextResponse.json({ error: 'Mídia não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: midia }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar mídia:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar uma mídia
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

    // Verificar se a mídia pertence ao usuário
    const midiaExistente = await prisma.midia.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!midiaExistente) {
      return NextResponse.json({ error: 'Mídia não encontrada' }, { status: 404 });
    }

    const dataUpdate: any = {};

    // Campos básicos
    if (body.titulo !== undefined) dataUpdate.titulo = body.titulo;
    if (body.capa !== undefined) dataUpdate.capa = body.capa;
    if (body.cor !== undefined) dataUpdate.cor = body.cor;
    if (body.status !== undefined) dataUpdate.status = body.status;
    if (body.nota !== undefined) dataUpdate.nota = body.nota;
    if (body.idioma !== undefined) dataUpdate.idioma = body.idioma;

    // Campos específicos de livro
    if (body.autor !== undefined) dataUpdate.autor = body.autor;
    if (body.editora !== undefined) dataUpdate.editora = body.editora;
    if (body.genero !== undefined) dataUpdate.genero = body.genero;
    if (body.fonte !== undefined) dataUpdate.fonte = body.fonte;

    // Campos específicos de filme
    if (body.diretor !== undefined) dataUpdate.diretor = body.diretor;
    if (body.duracao !== undefined) dataUpdate.duracao = body.duracao;
    if (body.anoLancamento !== undefined) dataUpdate.anoLancamento = body.anoLancamento;

    // Datas
    if (body.dataInicio !== undefined) {
      dataUpdate.dataInicio = body.dataInicio ? new Date(body.dataInicio) : null;
    }
    if (body.dataConclusao !== undefined) {
      dataUpdate.dataConclusao = body.dataConclusao ? new Date(body.dataConclusao) : null;
    }

    // Resenha gerada por IA
    if (body.resenhaGeradaIA !== undefined) dataUpdate.resenhaGeradaIA = body.resenhaGeradaIA;

    // Reflexões e aprendizados
    if (body.impressoesIniciais !== undefined) dataUpdate.impressoesIniciais = body.impressoesIniciais;
    if (body.principaisAprendizados !== undefined) dataUpdate.principaisAprendizados = body.principaisAprendizados;
    if (body.trechosMemoraveis !== undefined) dataUpdate.trechosMemoraveis = body.trechosMemoraveis;
    if (body.reflexao !== undefined) dataUpdate.reflexao = body.reflexao;
    if (body.aprendizadosPraticos !== undefined) dataUpdate.aprendizadosPraticos = body.aprendizadosPraticos;
    if (body.consideracoesFinais !== undefined) dataUpdate.consideracoesFinais = body.consideracoesFinais;

    const midia = await prisma.midia.update({
      where: { id },
      data: dataUpdate,
      include: {
        citacoes: true,
      },
    });

    // Registrar atividade
    const tipoAtividade = midia.tipo === 'LIVRO'
      ? 'leitura_livro_editado'
      : 'leitura_filme_editado';

    await registrarAtividade({
      userId: user.id,
      tipo: tipoAtividade as any,
      titulo: midia.titulo,
      descricao: `Atualizado: ${midia.titulo}`,
      metadata: { midiaId: midia.id, tipo: midia.tipo },
    });

    return NextResponse.json(
      { message: 'Mídia atualizada com sucesso', data: midia },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar mídia:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Excluir uma mídia
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

    // Verificar se a mídia pertence ao usuário
    const midia = await prisma.midia.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!midia) {
      return NextResponse.json({ error: 'Mídia não encontrada' }, { status: 404 });
    }

    await prisma.midia.delete({
      where: { id },
    });

    // Registrar atividade
    const tipoAtividadeExcluir = midia.tipo === 'LIVRO'
      ? 'leitura_livro_excluido'
      : 'leitura_filme_excluido';

    await registrarAtividade({
      userId: user.id,
      tipo: tipoAtividadeExcluir as any,
      titulo: midia.titulo,
      descricao: `Excluído: ${midia.titulo}`,
      metadata: { tipo: midia.tipo },
    });

    return NextResponse.json(
      { message: 'Mídia excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir mídia:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
