import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { transcribeAudio, OutputFormat } from '@/lib/ai/audio-transcriber';
import { verificarAcessoRecurso } from '@/lib/planos-helper';
import { RecursoPremium, PlanoUsuario } from '@/types/planos';

export const runtime = 'nodejs';
// Aumentar o timeout para 300s (5 minutos) - requer Vercel Pro
export const maxDuration = 300;

interface ProcessAudioRequest {
  audioUrl: string;
  audioDuracao: number;
  formato?: OutputFormat;
  cor?: string;
  cursoId?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário tem acesso ao recurso premium
    const plano = (session.user.plano as PlanoUsuario) || PlanoUsuario.FREE;
    const planoExpiraEm = session.user.planoExpiraEm;
    const acessoRecurso = verificarAcessoRecurso(plano, planoExpiraEm, RecursoPremium.GERAR_RESENHA_IA);

    if (!acessoRecurso.temAcesso) {
      return NextResponse.json(
        { error: 'Recurso disponível apenas para usuários Premium', code: 'PREMIUM_REQUIRED' },
        { status: 403 }
      );
    }

    const body: ProcessAudioRequest = await request.json();
    const { audioUrl, audioDuracao, formato = 'padrao', cor = '#FBBF24', cursoId } = body;

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'URL do áudio é obrigatória' },
        { status: 400 }
      );
    }

    // Validar duração (máximo 45 minutos para garantir processamento)
    if (audioDuracao && audioDuracao > 2700) {
      return NextResponse.json(
        { error: 'Áudio muito longo. Máximo permitido: 45 minutos.' },
        { status: 400 }
      );
    }

    console.log(`🎙️ Processando áudio: ${audioUrl} (${audioDuracao}s)`);

    // Transcrever e organizar o áudio com Gemini
    const resultado = await transcribeAudio({
      audioUrl,
      userName: session.user.name,
      formato,
    });

    console.log(`✅ Transcrição concluída: "${resultado.title}"`);

    // Criar a anotação no banco de dados
    const anotacao = await prisma.anotacao.create({
      data: {
        titulo: resultado.title,
        conteudo: resultado.content,
        cor,
        tipoOrigem: 'audio',
        audioUrl,
        audioDuracao,
        transcricaoOriginal: resultado.transcricaoOriginal,
        cursoId: cursoId || null,
        userId: session.user.id,
      },
      include: {
        curso: {
          select: {
            id: true,
            nome: true,
            cor: true,
          },
        },
      },
    });

    console.log(`📝 Anotação criada: ${anotacao.id}`);

    return NextResponse.json({
      success: true,
      data: anotacao,
    });
  } catch (error) {
    console.error('❌ Erro ao processar áudio:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
