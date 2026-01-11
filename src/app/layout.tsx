import { SessionProvider } from '@/components/providers/SessionProvider';
import { IntlProvider } from '@/components/providers/IntlProvider';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getMessages } from 'next-intl/server';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura - Gerenciamento Pessoal",
  description: "Sistema completo de gerenciamento pessoal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <IntlProvider initialMessages={messages}>
            {children}
          </IntlProvider>
        </SessionProvider>
      </body>
    </html>
  );
}