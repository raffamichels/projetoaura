import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

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
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    // Se já tem username, redireciona para dashboard
    if (user?.username) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  // Se está em rota de dashboard
  if (isDashboardRoute) {
    // Se não está autenticado, redireciona para login
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', nextUrl);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Se não tem username, redireciona para escolher
    if (!user?.username) {
      return NextResponse.redirect(new URL('/choose-username', nextUrl));
    }
  }

  // Se está autenticado e tenta acessar rotas de auth, redireciona para dashboard
  if (isAuthRoute && isLoggedIn) {
    // Se não tem username, redireciona para escolher
    if (!user?.username) {
      return NextResponse.redirect(new URL('/choose-username', nextUrl));
    }
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/choose-username',
    '/login',
    '/register',
  ],
};
