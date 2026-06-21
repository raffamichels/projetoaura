import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { 
  calcularResumoMensal,
  agruparGastosPorCategoria,
  decimalParaNumero,
} from '@/lib/financeiro-helper';
import { format } from 'date-fns';
import { getDataAtualNoTimezone, getTimezoneDefault } from '@/lib/timezone';

// GET - Dashboard financeiro com resumos
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
    const mes = searchParams.get('mes') || format(
      getDataAtualNoTimezone(getTimezoneDefault()),
      'yyyy-MM'
    );

    // Parse mês
    const [ano, mesNum] = mes.split('-');
    const dataInicio = new Date(Date.UTC(Number(ano), Number(mesNum) - 1, 1));
    const dataFim = new Date(Date.UTC(Number(ano), Number(mesNum), 1));
    const dataInicioFatura = new Date(Date.UTC(Number(ano), Number(mesNum) - 2, 1));

    // Compras no cartão entram no orçamento como fatura no mês seguinte.
    const [transacoesRegistradasNoMes, comprasDaFatura] = await Promise.all([
      prisma.transacao.findMany({
        where: {
          userId: user.id,
          data: { gte: dataInicio, lt: dataFim },
        },
        include: { categoria: true, cartao: true },
      }),
      prisma.transacao.findMany({
        where: {
          userId: user.id,
          tipo: 'DESPESA',
          cartaoId: { not: null },
          data: { gte: dataInicioFatura, lt: dataInicio },
        },
        include: { categoria: true, cartao: true },
      }),
    ]);

    const comprasCartaoDoMes = transacoesRegistradasNoMes.filter(
      (transacao) => transacao.tipo === 'DESPESA' && transacao.cartaoId
    );
    const transacoes = [
      ...transacoesRegistradasNoMes.filter(
        (transacao) => !(transacao.tipo === 'DESPESA' && transacao.cartaoId)
      ),
      ...comprasDaFatura,
    ];

    const agruparFaturas = (compras: typeof comprasDaFatura) => Array.from(
      compras.reduce((faturas, compra) => {
        if (!compra.cartaoId || !compra.cartao) return faturas;
        const atual = faturas.get(compra.cartaoId) || {
          cartaoId: compra.cartaoId,
          cartaoNome: compra.cartao.nome,
          total: 0,
          quantidade: 0,
        };
        atual.total += decimalParaNumero(compra.valor);
        atual.quantidade += 1;
        faturas.set(compra.cartaoId, atual);
        return faturas;
      }, new Map<string, { cartaoId: string; cartaoNome: string; total: number; quantidade: number }>())
        .values()
    );
    const faturasPorCartao = agruparFaturas(comprasDaFatura);
    const proximasFaturasPorCartao = agruparFaturas(comprasCartaoDoMes);

    // Converter Decimal para número e Date para string
    const transacoesConvertidas = transacoes.map((t) => ({
      ...t,
      valor: decimalParaNumero(t.valor),
      data: t.data.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      observacoes: t.observacoes ?? undefined,
      categoriaId: t.categoriaId ?? undefined,
      contaBancariaId: t.contaBancariaId ?? undefined,
      cartaoId: t.cartaoId ?? undefined,
      objetivoId: t.objetivoId ?? undefined,
      parcelaNumero: t.parcelaNumero ?? undefined,
      parcelaTotais: t.parcelaTotais ?? undefined,
      grupoParcelaId: t.grupoParcelaId ?? undefined,
      categoria: t.categoria ? {
        ...t.categoria,
        createdAt: t.categoria.createdAt.toISOString(),
        updatedAt: t.categoria.updatedAt.toISOString(),
        categoriaPaiId: t.categoria.categoriaPaiId ?? undefined,
      } : undefined,
    }));

    // Calcular resumo mensal
    const resumoMensal = calcularResumoMensal(transacoesConvertidas);

    // Agrupar gastos por categoria
    const gastosPorCategoria = agruparGastosPorCategoria(transacoesConvertidas);

    // Buscar saldo total de contas
    const contas = await prisma.contaBancaria.findMany({
      where: { 
        userId: user.id,
        ativa: true,
        createdAt: { lt: dataFim },
      },
    });

    // Reconstruir o saldo no fim do mês selecionado. Usar saldoAtual faria
    // uma conta criada em junho aparecer indevidamente ao consultar maio.
    const transacoesAteOFimDoMes = contas.length > 0
      ? await prisma.transacao.findMany({
          where: {
            userId: user.id,
            contaBancariaId: { in: contas.map((conta) => conta.id) },
            data: { lt: dataFim },
          },
          select: { valor: true, tipo: true, data: true, cartaoId: true },
        })
      : [];

    const saldoInicialContas = contas.reduce(
      (acc, conta) => acc + decimalParaNumero(conta.saldoInicial),
      0
    );
    const movimentacaoAteOFimDoMes = transacoesAteOFimDoMes.reduce((acc, transacao) => {
      const valor = decimalParaNumero(transacao.valor);
      if (transacao.tipo === 'DESPESA' && transacao.cartaoId && transacao.data >= dataInicio) {
        return acc;
      }
      return acc + (transacao.tipo === 'RECEITA' ? valor : -valor);
    }, 0);
    const saldoContas = saldoInicialContas + movimentacaoAteOFimDoMes;

    // Buscar objetivos ativos
    const objetivos = await prisma.objetivoFinanceiro.findMany({
      where: {
        userId: user.id,
        status: 'EM_ANDAMENTO',
      },
    });

    const objetivosConvertidos = objetivos.map((obj) => ({
      ...obj,
      valorMeta: decimalParaNumero(obj.valorMeta),
      valorAtual: decimalParaNumero(obj.valorAtual),
    }));

    const totalObjetivos = objetivosConvertidos.reduce((acc, obj) => {
      return acc + obj.valorAtual;
    }, 0);

    // Buscar transações recentes (últimas 10)
    const transacoesRecentes = await prisma.transacao.findMany({
      where: {
        userId: user.id,
        data: { gte: dataInicio, lt: dataFim },
      },
      include: {
        categoria: true,
        contaBancaria: true,
        cartao: true,
      },
      orderBy: { data: 'desc' },
      take: 10,
    });

    const transacoesRecentesConvertidas = transacoesRecentes.map((t) => ({
      ...t,
      valor: decimalParaNumero(t.valor),
      data: t.data.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      observacoes: t.observacoes ?? undefined,
      categoriaId: t.categoriaId ?? undefined,
      contaBancariaId: t.contaBancariaId ?? undefined,
      cartaoId: t.cartaoId ?? undefined,
      objetivoId: t.objetivoId ?? undefined,
      parcelaNumero: t.parcelaNumero ?? undefined,
      parcelaTotais: t.parcelaTotais ?? undefined,
      grupoParcelaId: t.grupoParcelaId ?? undefined,
      categoria: t.categoria ? {
        ...t.categoria,
        createdAt: t.categoria.createdAt.toISOString(),
        updatedAt: t.categoria.updatedAt.toISOString(),
        categoriaPaiId: t.categoria.categoriaPaiId ?? undefined,
      } : undefined,
      contaBancaria: t.contaBancaria ? {
        ...t.contaBancaria,
        banco: t.contaBancaria.banco ?? undefined,
        saldoInicial: decimalParaNumero(t.contaBancaria.saldoInicial),
        saldoAtual: decimalParaNumero(t.contaBancaria.saldoAtual),
        createdAt: t.contaBancaria.createdAt.toISOString(),
        updatedAt: t.contaBancaria.updatedAt.toISOString(),
      } : undefined,
      cartao: t.cartao ? {
        ...t.cartao,
        bandeira: t.cartao.bandeira ?? undefined,
        ultimosDigitos: t.cartao.ultimosDigitos ?? undefined,
        limite: t.cartao.limite ? decimalParaNumero(t.cartao.limite) : undefined,
        diaVencimento: t.cartao.diaVencimento ?? undefined,
        diaFechamento: t.cartao.diaFechamento ?? undefined,
        createdAt: t.cartao.createdAt.toISOString(),
        updatedAt: t.cartao.updatedAt.toISOString(),
      } : undefined,
    }));

    return NextResponse.json({
      data: {
        mes: mes,
        resumoMensal,
        gastosPorCategoria,
        saldoContas,
        totalObjetivos,
        saldoLivre: saldoContas - totalObjetivos,
        transacoesRecentes: transacoesRecentesConvertidas,
        faturasCartao: faturasPorCartao,
        totalFaturasCartao: faturasPorCartao.reduce((total, fatura) => total + fatura.total, 0),
        proximasFaturasCartao: proximasFaturasPorCartao,
        totalProximasFaturasCartao: proximasFaturasPorCartao.reduce((total, fatura) => total + fatura.total, 0),
        estatisticas: {
          totalContas: contas.length,
          totalCategorias: gastosPorCategoria.length,
          totalObjetivosAtivos: objetivos.length,
          totalTransacoesMes: transacoes.length,
        },
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
