import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Na versão 16.x, a configuração mudou para cá:
  serverExternalPackages: ['jsdom'],
};

export default withNextIntl(nextConfig);