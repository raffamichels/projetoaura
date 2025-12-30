import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    plano?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      plano?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    plano?: string;
  }
}