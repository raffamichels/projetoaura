import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';

// GET - Listar todas as mídias (livros e filmes)
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
    const tipo = searchParams.get('tipo');
    const status = searchParams.get('status');

    const where: any = { userId: user.id };
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;

    const midias = await prisma.midia.findMany({
      where,
      include: {
        _count: {
          select: { citacoes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: midias }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar mídias:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar uma nova mídia (livro ou filme)
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

    // Validações
    if (!body.titulo) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 });
    }

    if (!body.tipo || !['LIVRO', 'FILME'].includes(body.tipo)) {
      return NextResponse.json({ error: 'Tipo inválido (LIVRO ou FILME)' }, { status: 400 });
    }

    const midia = await prisma.midia.create({
      data: {
        tipo: body.tipo,
        titulo: body.titulo,
        capa: body.capa,
        cor: body.cor || '#8B5CF6',
        autor: body.autor,
        editora: body.editora,
        genero: body.genero,
        fonte: body.fonte,
        diretor: body.diretor,
        duracao: body.duracao,
        anoLancamento: body.anoLancamento,
        idioma: body.idioma,
        status: body.status || 'PROXIMO',
        nota: body.nota,
        dataInicio: body.dataInicio ? new Date(body.dataInicio) : null,
        dataConclusao: body.dataConclusao ? new Date(body.dataConclusao) : null,
        userId: user.id,
      },
    });

    // Registrar atividade
    const tipoAtividadeCriado = body.tipo === 'LIVRO'
      ? 'leitura_livro_criado'
      : 'leitura_filme_criado';

    await registrarAtividade({
      userId: user.id,
      tipo: tipoAtividadeCriado as any,
      titulo: body.titulo,
      descricao: body.tipo === 'LIVRO'
        ? `Livro: ${body.titulo}${body.autor ? ` - ${body.autor}` : ''}`
        : `Filme: ${body.titulo}${body.diretor ? ` - ${body.diretor}` : ''}`,
      metadata: { midiaId: midia.id, tipo: body.tipo },
    });

    return NextResponse.json(
      { message: `${body.tipo === 'LIVRO' ? 'Livro' : 'Filme'} criado com sucesso`, data: midia },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar mídia:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
