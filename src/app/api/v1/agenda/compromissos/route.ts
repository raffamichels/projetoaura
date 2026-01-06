import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { TipoRecorrencia } from '@/types/compromisso';
import {
  gerarDatasRecorrentes,
  gerarRecorrenciaGrupoId,
} from '@/lib/recorrencia-utils';
import { registrarAtividade } from '@/lib/atividades-helper';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GoogleCalendarService } from '@/lib/googleCalendar';

// POST - Criar novo compromisso
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
      titulo,
      descricao,
      data,
      horaInicio,
      horaFim,
      categoria,
      cor,
      isRecorrente,
      tipoRecorrencia,
      intervaloRecorrencia,
      dataFimRecorrencia,
      syncWithGoogle,
    } = body;

    // Validações básicas
    if (!titulo || !data || !horaInicio) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' }, 
        { status: 400 }
      );
    }

    // Se NÃO for recorrente, cria apenas um compromisso
    if (!isRecorrente) {
      let googleEventId: string | null = null;

      // Sincronizar com Google Calendar se solicitado
      if (syncWithGoogle) {
        const googleService = new GoogleCalendarService();
        
        googleEventId = await googleService.createEvent(user.id, {
          titulo,
          descricao,
          // Garante string ISO
          data: typeof data === 'string' ? data : new Date(data).toISOString(),
          horaInicio,
          horaFim,
          isRecorrente: false,
        });
      }

      const compromisso = await prisma.compromisso.create({
        data: {
          titulo,
          descricao,
          data: new Date(data),
          horaInicio,
          horaFim,
          categoria,
          cor: cor || '#8B5CF6',
          isRecorrente: false,
          syncWithGoogle: syncWithGoogle || false,
          googleEventId,
          userId: user.id,
        },
      });

      // Registrar atividade
      await registrarAtividade({
        userId: user.id,
        tipo: 'compromisso_criado',
        titulo: `Compromisso criado: ${titulo}`,
        descricao: `${format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}${categoria ? ` • ${categoria}` : ''}`,
        metadata: {
          compromissoId: compromisso.id,
          categoria: categoria,
        },
      });

      return NextResponse.json(
        { message: 'Compromisso criado com sucesso', data: compromisso },
        { status: 201 }
      );
    }

    // SE FOR RECORRENTE, cria múltiplas instâncias
    const dataInicial = new Date(data);
    const dataFim = dataFimRecorrencia ? new Date(dataFimRecorrencia) : undefined;

    // Gerar as datas
    const datas = gerarDatasRecorrentes({
      dataInicial,
      tipoRecorrencia: tipoRecorrencia as TipoRecorrencia,
      intervalo: intervaloRecorrencia || 1,
      dataFim,
      maxOcorrencias: 100, // Limite de segurança
    });

    // Gerar ID do grupo para ligar todas as instâncias
    const grupoId = gerarRecorrenciaGrupoId();

    // Sincronizar com Google Calendar se solicitado (uma única recorrência no Google)
    let googleEventId: string | null = null;
    
    if (syncWithGoogle) {
      const googleService = new GoogleCalendarService();

      googleEventId = await googleService.createEvent(user.id, {
        titulo,
        descricao,
        data: dataInicial.toISOString(), 
        horaInicio,
        horaFim,
        isRecorrente: true,
        // CORREÇÃO AQUI: Garante string ou undefined (remove null e converte Enum)
        tipoRecorrencia: tipoRecorrencia ? String(tipoRecorrencia) : undefined,
        intervaloRecorrencia: intervaloRecorrencia || 1,
        dataFimRecorrencia: dataFim ? dataFim.toISOString() : undefined,
      });
    }

    // Criar todas as instâncias
    const compromissos = await prisma.$transaction(
      datas.map((dataOcorrencia, index) => {
        // Manter a mesma hora da data inicial
        const dataComHora = new Date(dataOcorrencia);
        dataComHora.setHours(dataInicial.getHours());
        dataComHora.setMinutes(dataInicial.getMinutes());

        return prisma.compromisso.create({
          data: {
            titulo,
            descricao,
            data: dataComHora,
            horaInicio,
            horaFim,
            categoria,
            cor: cor || '#8B5CF6',
            isRecorrente: true,
            tipoRecorrencia,
            intervaloRecorrencia,
            dataFimRecorrencia: dataFim,
            recorrenciaGrupoId: grupoId,
            recorrenciaInstancia: index + 1,
            syncWithGoogle: syncWithGoogle || false,
            googleEventId: index === 0 ? googleEventId : null, // Só a primeira instância tem o googleEventId
            userId: user.id,
          },
        });
      })
    );

    // Registrar atividade para série recorrente
    await registrarAtividade({
      userId: user.id,
      tipo: 'compromisso_criado',
      titulo: `Série de compromissos criada: ${titulo}`,
      descricao: `${compromissos.length} compromissos recorrentes criados${categoria ? ` • ${categoria}` : ''}`,
      metadata: {
        compromissoId: compromissos[0].id,
        recorrenciaGrupoId: grupoId,
        quantidade: compromissos.length,
        categoria: categoria,
      },
    });

    return NextResponse.json(
      { 
        message: `${compromissos.length} compromissos criados com sucesso`,
        data: compromissos[0], // Retorna o primeiro
        quantidadeCriados: compromissos.length,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar compromisso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Buscar compromissos
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

    const compromissos = await prisma.compromisso.findMany({
      where: { userId: user.id },
      orderBy: { data: 'asc' },
    });

    return NextResponse.json({ data: compromissos }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar compromissos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}