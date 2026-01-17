import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import DOMPurify from 'isomorphic-dompurify';
import { apiCreateRateLimiter, rateLimitResponse } from '@/lib/rateLimit';
import { paginaSchema } from '@/lib/validations/estudos';

// Configuração de sanitização para prevenir XSS
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
    'img', 'a', 'span', 'div', 'mark'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'class', 'style', 'target', 'rel',
    'data-width', 'data-height', 'data-align', 'width', 'height'
  ],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  ALLOW_DATA_ATTR: true,
};

// Função para sanitizar HTML
function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
}

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
