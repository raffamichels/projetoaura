import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';
import { decimalParaNumero } from '@/lib/financeiro-helper';
import { getDataAtualNoTimezone, getTimezoneDefault } from '@/lib/timezone';

// GET - Listar contas bancárias do usuário
export async function GET() {
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

    const contas = await prisma.contaBancaria.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const agora = new Date();
    const referenciaLocal = getDataAtualNoTimezone(getTimezoneDefault());
    const inicioMesAtual = new Date(Date.UTC(referenciaLocal.getFullYear(), referenciaLocal.getMonth(), 1));
    const transacoes = contas.length > 0
      ? await prisma.transacao.findMany({
          where: {
            userId: user.id,
            contaBancariaId: { in: contas.map((conta) => conta.id) },
            data: { lte: agora },
          },
          select: { contaBancariaId: true, valor: true, tipo: true, cartaoId: true, data: true },
        })
      : [];

    const contasConvertidas = contas.map((conta) => ({
      ...conta,
      saldoInicial: decimalParaNumero(conta.saldoInicial),
      saldoAtual: decimalParaNumero(conta.saldoInicial) + transacoes
        .filter((transacao) => transacao.contaBancariaId === conta.id)
        .reduce((saldo, transacao) => {
          // Compra do mês corrente no cartão entra somente na próxima fatura.
          if (transacao.tipo === 'DESPESA' && transacao.cartaoId && transacao.data >= inicioMesAtual) {
            return saldo;
          }
          const valor = decimalParaNumero(transacao.valor);
          return saldo + (transacao.tipo === 'RECEITA' ? valor : -valor);
        }, 0),
    }));

    return NextResponse.json({ data: contasConvertidas }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar nova conta bancária
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
    const { nome, tipo, banco, saldoInicial, cor, icone } = body;

    if (!nome || !tipo) {
      return NextResponse.json(
        { error: 'Nome e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    const conta = await prisma.contaBancaria.create({
      data: {
        nome,
        tipo,
        banco,
        saldoInicial: saldoInicial || 0,
        saldoAtual: saldoInicial || 0,
        cor: cor || '#10B981',
        icone: icone || 'wallet',
        userId: user.id,
      },
    });

    // Registrar atividade
    await registrarAtividade({
      userId: user.id,
      tipo: 'financeiro_conta_criada',
      titulo: `Conta criada: ${nome}`,
      descricao: `${tipo} • Saldo inicial: R$ ${saldoInicial || 0}`,
      metadata: {
        contaId: conta.id,
        tipo: tipo,
      },
    });

    return NextResponse.json(
      { message: 'Conta criada com sucesso', data: conta },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
