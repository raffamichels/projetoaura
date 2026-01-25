import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  // Verificar se há cookie de sessão presente
  const hasSessionCookie = req.cookies.has('authjs.session-token') ||
                           req.cookies.has('__Secure-authjs.session-token');

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

  // Se está na rota de escolha de username e não tem cookie, redireciona para login
  if (isChooseUsernamePage && !hasSessionCookie) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Se está em rota de dashboard e não tem cookie, redireciona para login
  if (isDashboardRoute && !hasSessionCookie) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se tem cookie e está em rota de auth, redireciona para dashboard
  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
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
