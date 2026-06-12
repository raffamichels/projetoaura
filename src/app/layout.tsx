import { SessionProvider } from '@/components/providers/SessionProvider';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
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
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aura",
  },
  icons: {
    icon: [
      { url: '/logo-aura.png', sizes: '192x192' },
      { url: '/logo-aura.png', sizes: '512x512' },
    ],
    shortcut: '/logo-aura.png',
    apple: [
      { url: '/logo-aura.png', sizes: '180x180' },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
        <ThemeProvider>
          <SessionProvider>
            <IntlProvider initialMessages={messages}>
              {children}
            </IntlProvider>
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}