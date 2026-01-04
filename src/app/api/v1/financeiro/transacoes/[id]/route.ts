import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';

// GET - Buscar transação específica
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

    const transacao = await prisma.transacao.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        categoria: true,
        contaBancaria: true,
        cartao: true,
        objetivo: true,
      },
    });

    if (!transacao) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: transacao }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar transação
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

    const transacaoExistente = await prisma.transacao.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!transacaoExistente) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
    }

    const body = await req.json();
    const {
      descricao,
      valor,
      data,
      tipo,
      observacoes,
      categoriaId,
      contaBancariaId,
      cartaoId,
    } = body;

    // VALIDAÇÃO CRÍTICA: Conta bancária é OBRIGATÓRIA
    if (!contaBancariaId) {
      return NextResponse.json(
        { error: 'Conta bancária é obrigatória para toda transação' },
        { status: 400 }
      );
    }

    // Validar se a conta existe e pertence ao usuário
    const conta = await prisma.contaBancaria.findFirst({
      where: { id: contaBancariaId, userId: user.id },
    });
    if (!conta) {
      return NextResponse.json(
        { error: 'Conta bancária não encontrada ou não pertence ao usuário' },
        { status: 404 }
      );
    }

    // Validar cartão se fornecido (opcional)
    if (cartaoId) {
      const cartao = await prisma.cartao.findFirst({
        where: { id: cartaoId, userId: user.id },
      });
      if (!cartao) {
        return NextResponse.json(
          { error: 'Cartão não encontrado ou não pertence ao usuário' },
          { status: 404 }
        );
      }
    }

    // Reverter saldo anterior (sempre tem conta, pois é obrigatória)
    const operacaoReversa = transacaoExistente.tipo === 'DESPESA' ? 'increment' : 'decrement';
    await prisma.contaBancaria.update({
      where: { id: transacaoExistente.contaBancariaId },
      data: {
        saldoAtual: {
          [operacaoReversa]: Number(transacaoExistente.valor),
        },
      },
    });

    // Atualizar transação
    const transacao = await prisma.transacao.update({
      where: { id },
      data: {
        descricao,
        valor,
        data: data ? new Date(data) : undefined,
        tipo,
        observacoes,
        categoriaId,
        contaBancariaId,
        cartaoId,
      },
    });

    // Aplicar novo saldo (sempre, pois conta é obrigatória)
    const operacao = tipo === 'DESPESA' ? 'decrement' : 'increment';
    await prisma.contaBancaria.update({
      where: { id: contaBancariaId },
      data: {
        saldoAtual: {
          [operacao]: valor,
        },
      },
    });

    // Registrar atividade
    await registrarAtividade({
      userId: user.id,
      tipo: 'financeiro_transacao_editada',
      titulo: `${tipo === 'RECEITA' ? 'Receita' : 'Despesa'} atualizada: ${descricao}`,
      descricao: `R$ ${valor.toFixed(2)}`,
      metadata: {
        transacaoId: transacao.id,
      },
    });

    return NextResponse.json(
      { message: 'Transação atualizada com sucesso', data: transacao },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir transação
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
    const { searchParams } = new URL(req.url);
    const excluirTodas = searchParams.get('excluirTodas') === 'true';

    const transacao = await prisma.transacao.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!transacao) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
    }

    // Se for parcela e usuário quer excluir todas
    if (transacao.isParcela && transacao.grupoParcelaId && excluirTodas) {
      // Buscar todas as parcelas do grupo
      const parcelas = await prisma.transacao.findMany({
        where: {
          grupoParcelaId: transacao.grupoParcelaId,
          userId: user.id,
        },
      });

      // Excluir todas
      await prisma.transacao.deleteMany({
        where: {
          grupoParcelaId: transacao.grupoParcelaId,
          userId: user.id,
        },
      });

      // Reverter saldo da primeira parcela (sempre tem conta, pois é obrigatória)
      const operacaoReversa = transacao.tipo === 'DESPESA' ? 'increment' : 'decrement';
      await prisma.contaBancaria.update({
        where: { id: transacao.contaBancariaId },
        data: {
          saldoAtual: {
            [operacaoReversa]: Number(transacao.valor),
          },
        },
      });

      // Registrar atividade
      await registrarAtividade({
        userId: user.id,
        tipo: 'financeiro_transacao_excluida',
        titulo: `${parcelas.length} parcelas excluídas: ${transacao.descricao}`,
        descricao: `Total: R$ ${(Number(transacao.valor) * parcelas.length).toFixed(2)}`,
        metadata: {
          grupoParcelaId: transacao.grupoParcelaId,
          quantidade: parcelas.length,
        },
      });

      return NextResponse.json(
        {
          message: `${parcelas.length} parcelas excluídas com sucesso`,
          quantidade: parcelas.length,
        },
        { status: 200 }
      );
    }

    // Excluir apenas esta transação
    await prisma.transacao.delete({
      where: { id },
    });

    // Reverter saldo (sempre, pois conta é obrigatória)
    const operacaoReversa = transacao.tipo === 'DESPESA' ? 'increment' : 'decrement';
    await prisma.contaBancaria.update({
      where: { id: transacao.contaBancariaId },
      data: {
        saldoAtual: {
          [operacaoReversa]: Number(transacao.valor),
        },
      },
    });

    // Reverter objetivo se tiver
    if (transacao.objetivoId) {
      await prisma.objetivoFinanceiro.update({
        where: { id: transacao.objetivoId },
        data: {
          valorAtual: {
            decrement: Number(transacao.valor),
          },
        },
      });
    }

    // Registrar atividade
    await registrarAtividade({
      userId: user.id,
      tipo: 'financeiro_transacao_excluida',
      titulo: `${transacao.tipo === 'RECEITA' ? 'Receita' : 'Despesa'} excluída: ${transacao.descricao}`,
      descricao: `R$ ${Number(transacao.valor).toFixed(2)}`,
      metadata: {
        transacaoId: id,
      },
    });

    return NextResponse.json(
      { message: 'Transação excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
