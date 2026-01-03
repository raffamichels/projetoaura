import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST - Criar página
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
    const { titulo, conteudo, moduloId, ordem } = body;

    if (!titulo || !moduloId) {
      return NextResponse.json(
        { error: 'Título e moduloId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o módulo pertence ao usuário
    const modulo = await prisma.modulo.findFirst({
      where: {
        id: moduloId,
        curso: {
          userId: user.id
        }
      }
    });

    if (!modulo) {
      return NextResponse.json({ error: 'Módulo não encontrado' }, { status: 404 });
    }

    const pagina = await prisma.pagina.create({
      data: {
        titulo,
        conteudo: conteudo || '',
        moduloId,
        ordem: ordem || 0,
      },
    });

    return NextResponse.json(
      { message: 'Página criada com sucesso', data: pagina },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar página:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
