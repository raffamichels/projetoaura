import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { registrarAtividade } from '@/lib/atividades-helper'; // ✅ ADICIONAR
import { GoogleCalendarService } from '@/lib/googleCalendar';
import { verificarAcessoRecurso } from '@/lib/planos-helper';
import { RecursoPremium } from '@/types/planos';

// PUT - Atualizar compromisso
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

    // Buscar compromisso
    const compromisso = await prisma.compromisso.findUnique({
      where: { id },
    });

    if (!compromisso) {
      return NextResponse.json({ error: 'Compromisso não encontrado' }, { status: 404 });
    }

    if (compromisso.userId !== user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
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
      applyToFuture, // true = editar este e futuros, false = só este
      isRecorrente,
      tipoRecorrencia,
      intervaloRecorrencia,
      dataFimRecorrencia,
      syncWithGoogle,
    } = body;

    // Verificar se o usuário quer sincronizar com Google Calendar
    if (syncWithGoogle && !compromisso.syncWithGoogle) {
      // Se está tentando ATIVAR a sincronização, verificar plano
      const acessoRecurso = verificarAcessoRecurso(
        user.plano,
        user.planoExpiraEm,
        RecursoPremium.SINCRONIZAR_GOOGLE_CALENDAR
      );

      if (!acessoRecurso.temAcesso) {
        return NextResponse.json(
          {
            error: acessoRecurso.motivo || 'Sincronização com Google Calendar disponível apenas para usuários Premium',
            planoAtual: acessoRecurso.planoEfetivo,
            recursoNecessario: RecursoPremium.SINCRONIZAR_GOOGLE_CALENDAR
          },
          { status: 403 }
        );
      }
    }

    // Se NÃO for recorrente OU for "apenas este", atualiza apenas um
    if (!compromisso.isRecorrente || applyToFuture === false) {
      // Atualizar Google Calendar se existir sincronização
      if (compromisso.syncWithGoogle && compromisso.googleEventId) {
        const googleService = new GoogleCalendarService();
        await googleService.updateEvent(user.id, compromisso.googleEventId, {
          titulo,
          descricao,
          data: new Date(data).toISOString(),
          horaInicio,
          horaFim: horaFim || undefined,
          isRecorrente: isRecorrente || false,
          tipoRecorrencia: isRecorrente ? tipoRecorrencia : undefined,
          intervaloRecorrencia: isRecorrente ? intervaloRecorrencia : undefined,
          dataFimRecorrencia: isRecorrente && dataFimRecorrencia ? new Date(dataFimRecorrencia).toISOString() : undefined,
        });
      }

      const updated = await prisma.compromisso.update({
        where: { id },
        data: {
          titulo,
          descricao,
          data: new Date(data),
          horaInicio,
          horaFim,
          categoria,
          cor: cor || '#8B5CF6',
          // Se remover recorrência, limpa os campos
          isRecorrente: isRecorrente || false,
          tipoRecorrencia: isRecorrente ? tipoRecorrencia : null,
          intervaloRecorrencia: isRecorrente ? intervaloRecorrencia : null,
          dataFimRecorrencia: isRecorrente && dataFimRecorrencia ? new Date(dataFimRecorrencia) : null,
          // Se editar só este, remove do grupo
          recorrenciaGrupoId: applyToFuture === false ? null : compromisso.recorrenciaGrupoId,
          syncWithGoogle: syncWithGoogle !== undefined ? syncWithGoogle : compromisso.syncWithGoogle,
        },
      });

      // ✅ ADICIONAR: Registrar atividade
      await registrarAtividade({
        userId: user.id,
        tipo: 'compromisso_editado',
        titulo: `Compromisso atualizado: ${titulo}`,
        descricao: applyToFuture === false
          ? 'Compromisso individual atualizado'
          : 'Compromisso atualizado',
        metadata: {
          compromissoId: id,
          applyToFuture: applyToFuture || false,
        },
      });

      return NextResponse.json(
        { message: 'Compromisso atualizado com sucesso', data: updated },
        { status: 200 }
      );
    }

    // Se for "este e futuros", atualiza todos da série com data >= este
    if (applyToFuture === true && compromisso.recorrenciaGrupoId) {
      // Atualizar Google Calendar se a primeira instância tiver sincronização
      const primeiraInstancia = await prisma.compromisso.findFirst({
        where: {
          recorrenciaGrupoId: compromisso.recorrenciaGrupoId,
          recorrenciaInstancia: 1,
          userId: user.id,
        },
      });

      if (primeiraInstancia?.syncWithGoogle && primeiraInstancia.googleEventId) {
        const googleService = new GoogleCalendarService();
        await googleService.updateEvent(user.id, primeiraInstancia.googleEventId, {
          titulo,
          descricao,
          data: new Date(data).toISOString(),
          horaInicio,
          horaFim: horaFim || undefined,
          isRecorrente: true,
          tipoRecorrencia: tipoRecorrencia || undefined,
          intervaloRecorrencia: intervaloRecorrencia || undefined,
          dataFimRecorrencia: dataFimRecorrencia ? new Date(dataFimRecorrencia).toISOString() : undefined,
        });
      }

      const updated = await prisma.compromisso.updateMany({
        where: {
          recorrenciaGrupoId: compromisso.recorrenciaGrupoId,
          data: {
            gte: compromisso.data, // Maior ou igual à data deste
          },
          userId: user.id,
        },
        data: {
          titulo,
          descricao,
          horaInicio,
          horaFim,
          categoria,
          cor: cor || '#8B5CF6',
          isRecorrente,
          tipoRecorrencia: isRecorrente ? tipoRecorrencia : null,
          intervaloRecorrencia: isRecorrente ? intervaloRecorrencia : null,
          dataFimRecorrencia: isRecorrente && dataFimRecorrencia ? new Date(dataFimRecorrencia) : null,
        },
      });

      // ✅ ADICIONAR: Registrar atividade para série
      await registrarAtividade({
        userId: user.id,
        tipo: 'compromisso_editado',
        titulo: `Série de compromissos atualizada: ${titulo}`,
        descricao: `${updated.count} compromissos da série foram atualizados`,
        metadata: {
          compromissoId: id,
          recorrenciaGrupoId: compromisso.recorrenciaGrupoId,
          quantidade: updated.count,
          applyToFuture: true,
        },
      });

      return NextResponse.json(
        {
          message: `${updated.count} compromissos atualizados com sucesso`,
          data: { count: updated.count },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (error) {
    console.error('Erro ao atualizar compromisso:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Excluir compromisso
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
    
    // Buscar o parâmetro applyToFuture da URL
    const { searchParams } = new URL(req.url);
    const applyToFuture = searchParams.get('applyToFuture') === 'true';

    // Buscar compromisso ANTES de excluir (para registrar atividade)
    const compromisso = await prisma.compromisso.findUnique({
      where: { id },
    });

    if (!compromisso) {
      return NextResponse.json({ error: 'Compromisso não encontrado' }, { status: 404 });
    }

    if (compromisso.userId !== user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Se NÃO for recorrente OU for "apenas este", exclui apenas um
    if (!compromisso.isRecorrente || applyToFuture === false) {
      // Excluir do Google Calendar se existir sincronização
      if (compromisso.syncWithGoogle && compromisso.googleEventId) {
        const googleService = new GoogleCalendarService();
        await googleService.deleteEvent(user.id, compromisso.googleEventId);
      }

      await prisma.compromisso.delete({
        where: { id },
      });

      // ✅ ADICIONAR: Registrar atividade
      await registrarAtividade({
        userId: user.id,
        tipo: 'compromisso_excluido',
        titulo: `Compromisso excluído: ${compromisso.titulo}`,
        descricao: applyToFuture === false
          ? 'Compromisso individual removido'
          : 'Compromisso removido',
        metadata: {
          compromissoId: id,
          applyToFuture: applyToFuture || false,
        },
      });

      return NextResponse.json(
        { message: 'Compromisso excluído com sucesso' },
        { status: 200 }
      );
    }

    // Se for "este e futuros", exclui todos da série com data >= este
    if (applyToFuture === true && compromisso.recorrenciaGrupoId) {
      // Excluir do Google Calendar se a primeira instância tiver sincronização
      const primeiraInstancia = await prisma.compromisso.findFirst({
        where: {
          recorrenciaGrupoId: compromisso.recorrenciaGrupoId,
          recorrenciaInstancia: 1,
          userId: user.id,
        },
      });

      if (primeiraInstancia?.syncWithGoogle && primeiraInstancia.googleEventId) {
        const googleService = new GoogleCalendarService();
        await googleService.deleteEvent(user.id, primeiraInstancia.googleEventId);
      }

      const deleted = await prisma.compromisso.deleteMany({
        where: {
          recorrenciaGrupoId: compromisso.recorrenciaGrupoId,
          data: {
            gte: compromisso.data,
          },
          userId: user.id,
        },
      });

      // ✅ ADICIONAR: Registrar atividade para série
      await registrarAtividade({
        userId: user.id,
        tipo: 'compromisso_excluido',
        titulo: `Série de compromissos excluída: ${compromisso.titulo}`,
        descricao: `${deleted.count} compromissos da série foram removidos`,
        metadata: {
          compromissoId: id,
          recorrenciaGrupoId: compromisso.recorrenciaGrupoId,
          quantidade: deleted.count,
          applyToFuture: true,
        },
      });

      return NextResponse.json(
        {
          message: `${deleted.count} compromissos excluídos com sucesso`,
          count: deleted.count,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (error) {
    console.error('Erro ao excluir compromisso:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}