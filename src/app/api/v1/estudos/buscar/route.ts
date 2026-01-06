import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// GET - Buscar conteúdo
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
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query de busca deve ter pelo menos 2 caracteres' },
        { status: 400 }
      );
    }

    const searchTerm = query.trim().toLowerCase();

    // Buscar em cursos
    const cursos = await prisma.curso.findMany({
      where: {
        userId: user.id,
        OR: [
          { nome: { contains: searchTerm, mode: 'insensitive' } },
          { descricao: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        cor: true,
        icone: true,
      }
    });

    // Buscar em páginas
    const paginas = await prisma.pagina.findMany({
      where: {
        modulo: {
          curso: {
            userId: user.id
          }
        },
        OR: [
          { titulo: { contains: searchTerm, mode: 'insensitive' } },
          { conteudo: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      include: {
        modulo: {
          include: {
            curso: {
              select: {
                id: true,
                nome: true,
                cor: true
              }
            }
          }
        }
      },
      take: 20
    });

    // Buscar em anotações
    const anotacoes = await prisma.anotacao.findMany({
      where: {
        userId: user.id,
        OR: [
          { titulo: { contains: searchTerm, mode: 'insensitive' } },
          { conteudo: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      include: {
        curso: {
          select: {
            id: true,
            nome: true,
            cor: true
          }
        }
      },
      take: 20
    });

    const resultados = {
      cursos: cursos.map(c => ({
        ...c,
        tipo: 'curso' as const
      })),
      paginas: paginas.map(p => ({
        ...p,
        tipo: 'pagina' as const
      })),
      anotacoes: anotacoes.map(a => ({
        ...a,
        tipo: 'anotacao' as const
      })),
      total: cursos.length + paginas.length + anotacoes.length
    };

    return NextResponse.json({ data: resultados }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
