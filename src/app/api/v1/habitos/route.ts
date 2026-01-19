import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiReadRateLimiter, apiCreateRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { habitoSchema } from '@/lib/validations/habitos';

// GET - Listar hábitos do usuário com registro do dia especificado
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

    // Rate limiting
    const rateLimitResult = await apiReadRateLimiter.limit(`${user.id}:read`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    // Obter parâmetro de dia da semana (opcional)
    const { searchParams } = new URL(req.url);
    const diaSemanaParam = searchParams.get('diaSemana');

    // Data de hoje (início do dia)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Dia da semana atual (0=Dom, 1=Seg, ..., 6=Sab)
    const diaSemanaAtual = hoje.getDay();

    // Usar o dia passado como parâmetro ou o dia atual
    const diaSemanaFiltro = diaSemanaParam !== null ? parseInt(diaSemanaParam, 10) : diaSemanaAtual;

    const habitos = await prisma.habito.findMany({
      where: {
        userId: user.id,
        status: 'ATIVO',
      },
      include: {
        registros: {
          where: {
            data: hoje,
          },
          take: 1,
        },
      },
      orderBy: [
        { horario: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Filtrar hábitos que devem aparecer no dia selecionado
    // Se diasSemana está vazio = todos os dias
    // Se diasSemana tem valores = só nos dias especificados
    const habitosFiltrados = habitos.filter(h =>
      h.diasSemana.length === 0 || h.diasSemana.includes(diaSemanaFiltro)
    );

    // Verificar se está visualizando o dia atual
    const isVisualizandoHoje = diaSemanaFiltro === diaSemanaAtual;

    // Formatar resposta com informação de conclusão do dia
    // completadoHoje só é true quando visualizando o dia atual E o hábito foi completado hoje
    // Quando visualizando outro dia, todos aparecem como pendentes (mostrando a rotina daquele dia)
    const habitosFormatados = habitosFiltrados.map(habito => ({
      id: habito.id,
      nome: habito.nome,
      descricao: habito.descricao,
      horario: habito.horario,
      diasSemana: habito.diasSemana,
      sequenciaAtual: habito.sequenciaAtual,
      maiorSequencia: habito.maiorSequencia,
      totalCompletados: habito.totalCompletados,
      cor: habito.cor,
      icone: habito.icone,
      completadoHoje: isVisualizandoHoje && habito.registros.length > 0 && habito.registros[0].completado,
    }));

    return NextResponse.json({
      data: habitosFormatados,
      diaSemanaAtual,
      diaSemanaFiltro,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar hábitos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar novo hábito
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

    // Rate limiting
    const rateLimitResult = await apiCreateRateLimiter.limit(`${user.id}:create`);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const body = await req.json();

    // Validar dados de entrada
    const validationResult = habitoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nome, descricao, horario, diasSemana, cor, icone } = validationResult.data;

    const habito = await prisma.habito.create({
      data: {
        nome,
        descricao,
        horario,
        diasSemana,
        cor,
        icone,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Hábito criado com sucesso', data: habito },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar hábito:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
