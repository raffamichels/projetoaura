'use client';

import type { IconProps } from '@phosphor-icons/react';

interface ComingSoonProps {
  icon: React.ComponentType<IconProps>;
  title: string;
  description: string;
  features?: string[];
}

export function ComingSoon({ icon: Icon, title, description, features }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-8 animate-fade-in">
      <div className="max-w-4xl w-full">

        {/* Card Principal */}
        <div className="relative overflow-hidden rounded-3xl bg-surface border border-line shadow-sm animate-slide-up">

          {/* Conteúdo */}
          <div className="relative z-10 p-12 md:p-16 text-center">

            {/* Ícone */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-brand-soft border border-brand/20 mb-8 animate-scale-in">
              <Icon className="w-12 h-12 text-brand" strokeWidth={1.5} />
            </div>

            {/* Badge Em Breve */}
            <div className="inline-block mb-6 animate-fade-in-delay-1">
              <div className="px-4 py-2 rounded-full bg-brand-soft border border-brand/30">
                <span className="text-sm font-semibold text-brand-dark">
                  Em Breve
                </span>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-5xl md:text-6xl font-bold text-ink mb-6 animate-fade-in-delay-2">
              {title}
            </h1>

            {/* Descrição */}
            <p className="text-xl text-ink-soft max-w-2xl mx-auto mb-12 animate-fade-in-delay-3">
              {description}
            </p>

            {/* Features (se houver) */}
            {features && features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto animate-fade-in-delay-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-surface-hover border border-line hover:border-line-strong transition-all duration-150"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <p className="text-sm text-ink-soft">{feature}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Mensagem de rodapé */}
            <div className="mt-12 pt-8 border-t border-line animate-fade-in-delay-5">
              <p className="text-ink-faint text-sm">
                Estamos trabalhando duro para trazer essa funcionalidade para você
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>

          </div>
        </div>

        {/* Cards de Info Extras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-fade-in-delay-6">
          {/* Premium Feature */}
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                <span className="text-gold text-xl">👑</span>
              </div>
              <h3 className="font-semibold text-ink">Recurso Premium</h3>
            </div>
            <p className="text-sm text-ink-soft">
              Esta funcionalidade estará disponível para usuários premium com recursos exclusivos
            </p>
          </div>

          {/* Notificação */}
          <div className="p-6 rounded-2xl bg-blue-soft border border-[#D5E2EC] dark:border-brand-blue/30 hover:border-[#B9CEDC] dark:hover:border-brand-blue/50 transition-all duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-soft flex items-center justify-center">
                <span className="text-brand-blue text-xl">🔔</span>
              </div>
              <h3 className="font-semibold text-ink">Seja Notificado</h3>
            </div>
            <p className="text-sm text-ink-soft">
              Você será notificado quando esta funcionalidade for lançada
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
