import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeHTML } from '@/lib/sanitize';
import { apiCreateRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { paginaSchema } from '@/lib/validations/estudos';

// POST - Criar página
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
    const validationResult = paginaSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { titulo, conteudo, moduloId, ordem } = validationResult.data;

    // Verificar se o módulo pertence ao usuário
    const modulo = await prisma.modulo.findFirst({
      where: {
        id: moduloId,
        curso: {
          userId: user.id
        }
      }
    });

    if (!modulo) {
      return NextResponse.json({ error: 'Módulo não encontrado' }, { status: 404 });
    }

    // Sanitizar conteúdo HTML para prevenir XSS
    const conteudoSanitizado = conteudo ? sanitizeHTML(conteudo) : '';

    const pagina = await prisma.pagina.create({
      data: {
        titulo,
        conteudo: conteudoSanitizado,
        moduloId,
        ordem: ordem || 0,
      },
    });

    return NextResponse.json(
      { message: 'Página criada com sucesso', data: pagina },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar página:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
