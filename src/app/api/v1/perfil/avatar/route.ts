import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth'; // Importa a função auth do seu arquivo de configuração v5
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs'; // Importado para usar existsSync e mkdirSync

export async function POST(req: NextRequest) {
  try {
    // CORREÇÃO: Usa auth() em vez de getServerSession(authOptions)
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

    // Converter file para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Criar nome único para o arquivo
    const uniqueSuffix = `${session.user.id}-${Date.now()}`;
    // Fallback seguro caso o nome do arquivo não tenha extensão
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `avatar-${uniqueSuffix}.${extension}`;

    // Definir caminho
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    const filepath = path.join(uploadsDir, filename);

    // Criar diretório se não existir
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Salvar arquivo
    await writeFile(filepath, buffer);

    // URL pública do avatar
    const avatarUrl = `/uploads/avatars/${filename}`;

    // Atualizar usuário no banco
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: avatarUrl },
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

export async function DELETE(req: NextRequest) {
  try {
    // CORREÇÃO: Usa auth() em vez de getServerSession(authOptions)
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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