import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper';
import { 
  gerarGrupoParcelaId, 
  gerarDatasParcelas, 
  calcularValorParcela,
  formatarDescricaoParcela,
  sugerirCategoria,
} from '@/lib/financeiro-helper';

// GET - Listar transações do usuário
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
    const tipo = searchParams.get('tipo'); // RECEITA ou DESPESA
    const mes = searchParams.get('mes'); // 2026-01
    const categoriaId = searchParams.get('categoriaId');
    const isFixa = searchParams.get('isFixa');

    // Construir filtros
    const where: any = { userId: user.id };
    
    if (tipo) where.tipo = tipo;
    if (categoriaId) where.categoriaId = categoriaId;
    if (isFixa !== null) where.isFixa = isFixa === 'true';
    
    // Filtrar por mês
    if (mes) {
      const [ano, mesNum] = mes.split('-');
      const dataInicio = new Date(`${ano}-${mesNum}-01`);
      const dataFim = new Date(dataInicio);
      dataFim.setMonth(dataFim.getMonth() + 1);
      
      where.data = {
        gte: dataInicio,
        lt: dataFim,
      };
    }

    const transacoes = await prisma.transacao.findMany({
      where,
      include: {
        categoria: true,
        contaBancaria: true,
        cartao: true,
      },
      orderBy: { data: 'desc' },
    });

    return NextResponse.json({ data: transacoes }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar nova transação
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
    const { 
      descricao,
      valor,
      data,
      tipo,
      observacoes,
      isFixa,
      isParcela,
      parcelaTotais,
      categoriaId,
      contaBancariaId,
      cartaoId,
      objetivoId,
    } = body;

    // Validações básicas
    if (!descricao || !valor || !data || !tipo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: descricao, valor, data, tipo' },
        { status: 400 }
      );
    }

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

    // Sugerir categoria se não fornecida
    let categoriaFinal = categoriaId;
    if (!categoriaFinal) {
      const categoriaSugerida = sugerirCategoria(descricao);
      if (categoriaSugerida) {
        const categoria = await prisma.categoria.findFirst({
          where: {
            userId: user.id,
            nome: categoriaSugerida,
            tipo: tipo,
          },
        });
        if (categoria) {
          categoriaFinal = categoria.id;
        }
      }
    }

    // SE FOR TRANSAÇÃO NORMAL (não fixa, não parcela)
    if (!isFixa && !isParcela) {
      const transacao = await prisma.transacao.create({
        data: {
          descricao,
          valor,
          data: new Date(data),
          tipo,
          observacoes,
          isFixa: false,
          isParcela: false,
          categoriaId: categoriaFinal,
          contaBancariaId,
          cartaoId,
          objetivoId,
          userId: user.id,
        },
      });

      // Atualizar saldo da conta (sempre, pois conta é obrigatória)
      const operacao = tipo === 'DESPESA' ? 'decrement' : 'increment';
      await prisma.contaBancaria.update({
        where: { id: contaBancariaId },
        data: {
          saldoAtual: {
            [operacao]: valor,
          },
        },
      });

      // Atualizar objetivo se fornecido
      if (objetivoId) {
        await prisma.objetivoFinanceiro.update({
          where: { id: objetivoId },
          data: {
            valorAtual: {
              increment: valor,
            },
          },
        });
      }

      // Registrar atividade
      await registrarAtividade({
        userId: user.id,
        tipo: 'financeiro_transacao_criada',
        titulo: `${tipo === 'RECEITA' ? 'Receita' : 'Despesa'}: ${descricao}`,
        descricao: `R$ ${valor.toFixed(2)}`,
        metadata: {
          transacaoId: transacao.id,
          tipo: tipo,
          valor: valor,
        },
      });

      return NextResponse.json(
        { message: 'Transação criada com sucesso', data: transacao },
        { status: 201 }
      );
    }

    // SE FOR TRANSAÇÃO FIXA (mensal)
    if (isFixa && !isParcela) {
      const transacao = await prisma.transacao.create({
        data: {
          descricao,
          valor,
          data: new Date(data),
          tipo,
          observacoes,
          isFixa: true,
          isParcela: false,
          categoriaId: categoriaFinal,
          contaBancariaId,
          cartaoId,
          userId: user.id,
        },
      });

      // Atualizar saldo da conta (sempre, pois conta é obrigatória)
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
        tipo: 'financeiro_transacao_criada',
        titulo: `${tipo === 'RECEITA' ? 'Receita' : 'Despesa'} fixa: ${descricao}`,
        descricao: `R$ ${valor.toFixed(2)} • Mensal`,
        metadata: {
          transacaoId: transacao.id,
          tipo: tipo,
          isFixa: true,
        },
      });

      return NextResponse.json(
        { message: 'Despesa fixa criada com sucesso', data: transacao },
        { status: 201 }
      );
    }

    // SE FOR TRANSAÇÃO PARCELADA
    if (isParcela && parcelaTotais) {
      const grupoId = gerarGrupoParcelaId();
      const dataInicial = new Date(data);
      const datas = gerarDatasParcelas(dataInicial, parcelaTotais);
      const valorParcela = calcularValorParcela(valor, parcelaTotais);

      // Criar todas as parcelas
      const parcelas = await prisma.$transaction(
        datas.map((dataParcela, index) =>
          prisma.transacao.create({
            data: {
              descricao: formatarDescricaoParcela(descricao, index + 1, parcelaTotais),
              valor: valorParcela,
              data: dataParcela,
              tipo,
              observacoes,
              isFixa: false,
              isParcela: true,
              parcelaNumero: index + 1,
              parcelaTotais,
              grupoParcelaId: grupoId,
              categoriaId: categoriaFinal,
              contaBancariaId,
              cartaoId,
              userId: user.id,
            },
          })
        )
      );

      // Atualizar saldo da conta com a primeira parcela
      const operacao = tipo === 'DESPESA' ? 'decrement' : 'increment';
      await prisma.contaBancaria.update({
        where: { id: contaBancariaId },
        data: {
          saldoAtual: {
            [operacao]: valorParcela,
          },
        },
      });

      // Registrar atividade
      await registrarAtividade({
        userId: user.id,
        tipo: 'financeiro_transacao_criada',
        titulo: `${tipo === 'RECEITA' ? 'Receita' : 'Despesa'} parcelada: ${descricao}`,
        descricao: `${parcelaTotais}x de R$ ${valorParcela.toFixed(2)} = R$ ${valor.toFixed(2)}`,
        metadata: {
          grupoParcelaId: grupoId,
          tipo: tipo,
          parcelas: parcelaTotais,
          valorTotal: valor,
        },
      });

      return NextResponse.json(
        { 
          message: `${parcelaTotais} parcelas criadas com sucesso`,
          data: parcelas[0],
          quantidadeParcelas: parcelas.length,
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: 'Tipo de transação inválido' }, { status: 400 });

  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}