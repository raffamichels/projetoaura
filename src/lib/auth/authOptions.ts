import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = (credentials.email as string).toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (!user) {
          return null;
        }

        // Verificar se usuário tem senha (não é conta OAuth)
        if (!user.password || user.password === '') {
          // Usuário OAuth tentando login com senha
          // Retorna null com mesmo comportamento de senha incorreta
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          usernameChangedAt: user.usernameChangedAt,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          plano: user.plano,
          planoExpiraEm: user.planoExpiraEm,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Verificar se o usuário já existe
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          // Calcular data de expiração do token
          const tokenExpiry = account.expires_at
            ? new Date(account.expires_at * 1000)
            : null;

          if (!existingUser) {
            // Criar novo usuário com dados do Google (SEM username - será solicitado depois)
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                password: '', // Senha vazia para login via Google
                username: null, // Username será definido na página choose-username
                emailVerified: new Date(),
                image: user.image,
                googleAccessToken: account.access_token,
                googleRefreshToken: account.refresh_token,
                googleTokenExpiry: tokenExpiry,
              }
            });

            // IMPORTANTE: Atualizar o user.id para o ID real do banco de dados
            user.id = newUser.id;
            user.username = newUser.username;
            user.usernameChangedAt = newUser.usernameChangedAt;
            user.plano = newUser.plano;
            user.planoExpiraEm = newUser.planoExpiraEm;
          } else {
            // Atualizar usuário existente com tokens do Google
            const updatedUser = await prisma.user.update({
              where: { email: user.email! },
              data: {
                emailVerified: new Date(),
                image: user.image || existingUser.image,
                googleAccessToken: account.access_token,
                googleRefreshToken: account.refresh_token || existingUser.googleRefreshToken,
                googleTokenExpiry: tokenExpiry,
              }
            });

            // IMPORTANTE: Atualizar o user.id para o ID real do banco de dados
            user.id = updatedUser.id;
            user.username = updatedUser.username;
            user.usernameChangedAt = updatedUser.usernameChangedAt;
            user.plano = updatedUser.plano;
            user.planoExpiraEm = updatedUser.planoExpiraEm;
          }
        } catch (error) {
          console.error('Erro ao criar/atualizar usuário do Google:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string | null | undefined;
        session.user.usernameChangedAt = token.usernameChangedAt as Date | null | undefined;
        session.user.name = token.name as string | null | undefined;
        session.user.image = token.image as string | null | undefined;
        session.user.emailVerified = (token.emailVerified as Date | null | undefined) ?? null;
        session.user.plano = token.plano as string | undefined;
        session.user.planoExpiraEm = token.planoExpiraEm as Date | null | undefined;
        session.user.createdAt = token.createdAt as Date | undefined;
        session.user.updatedAt = token.updatedAt as Date | undefined;
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        // Primeira vez que o usuário faz login
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.usernameChangedAt = user.usernameChangedAt;
        token.name = user.name;
        token.image = user.image;
        token.emailVerified = user.emailVerified;
        token.plano = user.plano;
        token.planoExpiraEm = user.planoExpiraEm;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
        token.lastUpdated = Date.now();
      } else {
        // Atualizar dados do usuário do banco periodicamente (a cada 30 segundos)
        const now = Date.now();
        const lastUpdated = (token.lastUpdated as number) || 0;
        const thirtySeconds = 30 * 1000; // 30 segundos em milissegundos

        const shouldUpdate =
          trigger === 'update' ||
          !token.plano ||
          (now - lastUpdated) > thirtySeconds;

        if (shouldUpdate) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              email: true,
              username: true,
              usernameChangedAt: true,
              name: true,
              image: true,
              emailVerified: true,
              plano: true,
              planoExpiraEm: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.username = dbUser.username;
            token.usernameChangedAt = dbUser.usernameChangedAt;
            token.name = dbUser.name;
            token.image = dbUser.image;
            token.emailVerified = dbUser.emailVerified;
            token.plano = dbUser.plano;
            token.planoExpiraEm = dbUser.planoExpiraEm;
            token.createdAt = dbUser.createdAt;
            token.updatedAt = dbUser.updatedAt;
            token.lastUpdated = now;
          }
        }
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for Vercel deployment
} satisfies NextAuthConfig;