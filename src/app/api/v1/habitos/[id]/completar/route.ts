import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { apiCreateRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { registroHabitoSchema } from '@/lib/validations/habitos';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Marcar hábito como completo/incompleto para uma data
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Verificar se o hábito pertence ao usuário
    const habito = await prisma.habito.findFirst({
      where: { id, userId: user.id },
    });

    if (!habito) {
      return NextResponse.json({ error: 'Hábito não encontrado' }, { status: 404 });
    }

    const body = await req.json();

    // Validar dados de entrada
    const validationResult = registroHabitoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data, completado, notas } = validationResult.data;

    // Normalizar data para início do dia
    const dataRegistro = new Date(data);
    dataRegistro.setHours(0, 0, 0, 0);

    // Verificar se já existe registro para este dia
    const registroExistente = await prisma.registroHabito.findUnique({
      where: {
        habitoId_data: {
          habitoId: id,
          data: dataRegistro,
        },
      },
    });

    let registro;

    if (registroExistente) {
      // Atualizar registro existente
      registro = await prisma.registroHabito.update({
        where: { id: registroExistente.id },
        data: {
          completado,
          horaCompleto: completado ? new Date() : null,
          notas,
        },
      });
    } else {
      // Criar novo registro
      registro = await prisma.registroHabito.create({
        data: {
          habitoId: id,
          userId: user.id,
          data: dataRegistro,
          completado,
          horaCompleto: completado ? new Date() : null,
          notas,
        },
      });
    }

    // Recalcular sequência
    const { sequenciaAtual, maiorSequencia, totalCompletados } = await calcularSequencia(id);

    // Atualizar hábito com nova sequência
    const habitoAtualizado = await prisma.habito.update({
      where: { id },
      data: {
        sequenciaAtual,
        maiorSequencia,
        totalCompletados,
      },
    });

    return NextResponse.json({
      message: completado ? 'Hábito marcado como completo' : 'Hábito desmarcado',
      data: {
        registro,
        sequenciaAtual: habitoAtualizado.sequenciaAtual,
        maiorSequencia: habitoAtualizado.maiorSequencia,
        totalCompletados: habitoAtualizado.totalCompletados,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao completar hábito:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Função auxiliar para calcular sequência
async function calcularSequencia(habitoId: string): Promise<{
  sequenciaAtual: number;
  maiorSequencia: number;
  totalCompletados: number;
}> {
  // Buscar todos os registros completados ordenados por data
  const registros = await prisma.registroHabito.findMany({
    where: {
      habitoId,
      completado: true,
    },
    orderBy: { data: 'desc' },
  });

  const totalCompletados = registros.length;

  if (totalCompletados === 0) {
    return { sequenciaAtual: 0, maiorSequencia: 0, totalCompletados: 0 };
  }

  // Calcular sequência atual (dias consecutivos até hoje)
  let sequenciaAtual = 0;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let dataEsperada = new Date(hoje);

  for (const registro of registros) {
    const dataRegistro = new Date(registro.data);
    dataRegistro.setHours(0, 0, 0, 0);

    // Verificar se é o dia esperado ou o dia anterior (para permitir completar no mesmo dia)
    const diffDias = Math.floor((dataEsperada.getTime() - dataRegistro.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias === 0 || diffDias === 1) {
      sequenciaAtual++;
      dataEsperada = new Date(dataRegistro);
      dataEsperada.setDate(dataEsperada.getDate() - 1);
    } else {
      break;
    }
  }

  // Calcular maior sequência histórica
  let maiorSequencia = 0;
  let sequenciaTemp = 0;
  let dataAnterior: Date | null = null;

  // Ordenar por data crescente para calcular maior sequência
  const registrosOrdenados = [...registros].sort((a, b) =>
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  for (const registro of registrosOrdenados) {
    const dataRegistro = new Date(registro.data);
    dataRegistro.setHours(0, 0, 0, 0);

    if (dataAnterior === null) {
      sequenciaTemp = 1;
    } else {
      const diffDias = Math.floor((dataRegistro.getTime() - dataAnterior.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDias === 1) {
        sequenciaTemp++;
      } else {
        maiorSequencia = Math.max(maiorSequencia, sequenciaTemp);
        sequenciaTemp = 1;
      }
    }

    dataAnterior = dataRegistro;
  }

  maiorSequencia = Math.max(maiorSequencia, sequenciaTemp, sequenciaAtual);

  return { sequenciaAtual, maiorSequencia, totalCompletados };
}
