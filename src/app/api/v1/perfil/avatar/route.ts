import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { put, del } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB' },
        { status: 400 }
      );
    }

    // Criar nome único para o arquivo
    const uniqueSuffix = `${session.user.id}-${Date.now()}`;
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `avatars/avatar-${uniqueSuffix}.${extension}`;

    // Buscar usuário atual para deletar avatar antigo se existir
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Deletar avatar antigo do Vercel Blob se existir
    if (currentUser?.image && currentUser.image.includes('blob.vercel-storage.com')) {
      try {
        await del(currentUser.image);
      } catch {
        // Ignorar erro se não conseguir deletar o arquivo antigo
      }
    }

    // Upload para Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Atualizar usuário no banco com a URL do blob
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: blob.url },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plano: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Avatar atualizado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload do avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar usuário atual para deletar avatar do Vercel Blob
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Deletar avatar do Vercel Blob se existir
    if (currentUser?.image && currentUser.image.includes('blob.vercel-storage.com')) {
      try {
        await del(currentUser.image);
      } catch {
        // Ignorar erro se não conseguir deletar o arquivo
      }
    }

    // Remover avatar do usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plano: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Avatar removido com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao remover avatar:', error);
    return NextResponse.json(
      { error: 'Erro ao remover avatar' },
      { status: 500 }
    );
  }
}