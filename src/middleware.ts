import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // DEBUG - remover depois
  console.log('MIDDLEWARE:', pathname, 'token:', token ? `id=${token.id}, username=${token.username}` : 'null');

  // Rotas protegidas do dashboard
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Rota de escolha de username
  const isChooseUsernamePage = pathname === '/choose-username';

  // Rotas de autenticação (login, register, etc)
  const isAuthRoute = pathname.startsWith('/login') ||
                      pathname.startsWith('/register') ||
                      pathname.startsWith('/verify-email') ||
                      pathname.startsWith('/forgot-password') ||
                      pathname.startsWith('/reset-password');

  // Se está na rota de escolha de username
  if (isChooseUsernamePage) {
    // Se não está autenticado, redireciona para login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Se já tem username, redireciona para dashboard
    if (token.username) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Se está em rota de dashboard
  if (isDashboardRoute) {
    // Se não está autenticado, redireciona para login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Se não tem username, redireciona para escolher
    if (!token.username) {
      return NextResponse.redirect(new URL('/choose-username', request.url));
    }
  }

  // Se está autenticado e tenta acessar rotas de auth, redireciona para dashboard
  if (isAuthRoute && token) {
    // Se não tem username, redireciona para escolher
    if (!token.username) {
      return NextResponse.redirect(new URL('/choose-username', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/choose-username',
    '/login',
    '/register',
  ],
};
