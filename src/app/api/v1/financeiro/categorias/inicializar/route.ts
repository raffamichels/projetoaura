import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { CATEGORIAS_PADRAO_RECEITA, CATEGORIAS_PADRAO_DESPESA } from '@/types/financeiro';

// POST - Criar categorias padrão para o usuário
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

    // Verificar se já tem categorias
    const jaTemCategorias = await prisma.categoria.count({
      where: { userId: user.id },
    });

    if (jaTemCategorias > 0) {
      return NextResponse.json(
        { error: 'Usuário já possui categorias criadas' },
        { status: 400 }
      );
    }

    // Criar categorias de receita
    const categoriasReceita = await prisma.$transaction(
      CATEGORIAS_PADRAO_RECEITA.map((cat) =>
        prisma.categoria.create({
          data: {
            nome: cat.nome,
            tipo: 'RECEITA',
            icone: cat.icone,
            cor: cat.cor,
            userId: user.id,
          },
        })
      )
    );

    // Criar categorias de despesa
    const categoriasDespesa = await prisma.$transaction(
      CATEGORIAS_PADRAO_DESPESA.map((cat) =>
        prisma.categoria.create({
          data: {
            nome: cat.nome,
            tipo: 'DESPESA',
            icone: cat.icone,
            cor: cat.cor,
            userId: user.id,
          },
        })
      )
    );

    const totalCriadas = categoriasReceita.length + categoriasDespesa.length;

    return NextResponse.json(
      { 
        message: `${totalCriadas} categorias padrão criadas com sucesso`,
        data: {
          receitas: categoriasReceita.length,
          despesas: categoriasDespesa.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar categorias padrão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
