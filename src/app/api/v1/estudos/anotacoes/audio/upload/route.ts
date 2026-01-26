import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

// Limite de 100MB para áudio (suficiente para ~1 hora em WebM/Opus)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Tipos de áudio permitidos
const ALLOWED_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus', // Formato preferido do MediaRecorder
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
];

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

    const formData = await request.formData();
    const file = formData.get('audio') as File | null;
    const duration = formData.get('duration') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo de áudio enviado' },
        { status: 400 }
      );
    }

    // Verificar tipo do arquivo
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de arquivo não suportado. Use: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.type.split('/')[1] || 'webm';
    const fileName = `audio-notes/${session.user.id}/${timestamp}.${extension}`;

    console.log(`📤 Uploading audio: ${fileName} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);

    // Upload para Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    console.log(`✅ Audio uploaded successfully: ${blob.url}`);

    return NextResponse.json({
      success: true,
      url: blob.url,
      size: file.size,
      duration: duration ? parseInt(duration) : null,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('❌ Erro ao fazer upload do áudio:', error);

    // Verificar se é erro do Vercel Blob
    if (error instanceof Error) {
      if (error.message.includes('BLOB_STORE_NOT_FOUND')) {
        return NextResponse.json(
          { error: 'Vercel Blob não configurado. Adicione BLOB_READ_WRITE_TOKEN ao ambiente.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno ao fazer upload do áudio' },
      { status: 500 }
    );
  }
}
