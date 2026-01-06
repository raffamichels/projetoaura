import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { 
  calcularResumoMensal,
  agruparGastosPorCategoria,
  decimalParaNumero,
} from '@/lib/financeiro-helper';
import { format } from 'date-fns';

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
    const mes = searchParams.get('mes') || format(new Date(), 'yyyy-MM');

    // Parse mês
    const [ano, mesNum] = mes.split('-');
    const dataInicio = new Date(`${ano}-${mesNum}-01`);
    const dataFim = new Date(dataInicio);
    dataFim.setMonth(dataFim.getMonth() + 1);

    // Buscar transações do mês
    const transacoes = await prisma.transacao.findMany({
      where: {
        userId: user.id,
        data: {
          gte: dataInicio,
          lt: dataFim,
        },
      },
      include: {
        categoria: true,
      },
    });

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
      },
    });

    const saldoContas = contas.reduce((acc, conta) => {
      return acc + decimalParaNumero(conta.saldoAtual);
    }, 0);

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
      where: { userId: user.id },
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