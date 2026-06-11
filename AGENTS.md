# AGENTS.md

## Project overview

Aura is a personal management platform (finance, calendar, studies, library, travel, habits) built with:
- **Next.js 16.1.1** (App Router, React 19)
- **TypeScript 5** with strict mode
- **Tailwind CSS v4** (not v3 — uses `@tailwindcss/postcss` plugin, not the v3 config format)
- **Prisma 5** + PostgreSQL (Neon)
- **next-auth v5 beta** (cookie-based session, NOT JWT)
- **next-intl** for i18n (locales: `pt`, `en`; default `pt`)
- **shadcn/ui** (new-york style, lucide icons)
- **React Compiler** enabled (`reactCompiler: true` in `next.config.ts`)

## Commands

```bash
# Dev server
npm run dev

# Build (generates Prisma client first)
npm run build          # runs: prisma generate && next build

# Lint
npm run lint           # runs: eslint

# Install (auto-generates Prisma client via postinstall)
npm install

# Prisma
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma studio
```

**No test scripts exist.** The README mentions `npm run test` but there is no test runner configured.

**No typecheck script exists.** Run `npx tsc --noEmit` manually if needed.

## Build gotchas

- `npm run build` runs `prisma generate` before `next build`. If Prisma client is stale, run `npx prisma generate` first.
- If `npx prisma generate` hangs on Windows, run `regenerate-prisma.bat` (kills Node processes, then regenerates).
- `postinstall` hook also runs `prisma generate`, so `npm install` alone is sufficient for fresh clones.

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, register (public)
│   ├── (dashboard)/        # All protected routes (Sidebar + HeaderWrapper layout)
│   │   └── dashboard/
│   │       ├── agenda/     # Calendar module
│   │       ├── financeiro/ # Financial module (transacoes, contas, cartoes, objetivos, categorias)
│   │       ├── estudos/    # Studies module (cursos, modulos, paginas, anotacoes)
│   │       ├── biblioteca/ # Library module (midias, citacoes)
│   │       └── perfil/     # User profile
│   ├── api/                # API routes
│   │   ├── auth/           # next-auth handlers
│   │   └── v1/             # Versioned REST API (agenda, financeiro, estudos, leituras, atividades, perfil)
│   └── premium/            # Premium/subscription page
├── components/
│   ├── dashboard/          # Sidebar, Header, AtividadesRecentes
│   ├── features/agenda/    # Calendar-specific components
│   ├── financeiro/         # 6 modal components
│   ├── estudos/            # RichTextEditor, ResizableImage
│   ├── leituras/           # Library components
│   ├── providers/          # SessionProvider, IntlProvider
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── auth/               # NextAuth config (auth.ts, authOptions.ts)
│   ├── validations/        # Zod schemas
│   └── utils.ts            # cn() helper (clsx + tailwind-merge)
├── hooks/                  # usePlano, useAutoRefreshSession
├── contexts/               # NotificationContext
├── i18n/                   # next-intl config + locale JSON files
├── types/                  # TypeScript type definitions
└── middleware.ts           # Route protection (cookie-based)
```

## Key conventions

- **Path alias**: `@/*` maps to `./src/*`
- **Auth**: Cookie-based (`authjs.session-token`). Dashboard routes protected by `src/middleware.ts`.
- **API pattern**: REST under `/api/v1/{module}/{resource}`. Responses follow `{ data: ... }` shape.
- **UI components**: Use shadcn/ui via `@/components/ui/*`. Add new ones with `npx shadcn@latest add`.
- **State management**: Client-side (`'use client'`), SWR for data fetching, React hooks/contexts.
- **Internationalization**: Use `useTranslations()` from `next-intl`. All user-facing strings should go in `src/i18n/locales/pt.json` and `en.json`.
- **Styling**: Tailwind CSS v4 utility classes. Dark theme is dark-mode-first (`.dark` class on html). Dashboard uses a light warm palette (`bg-[#F2F1E9]`, `text-[#0E2A3F]`).
- **Database**: Prisma schema at `prisma/schema.prisma` (952 lines, ~30 models). PostgreSQL on Neon.

## Deployment

- **Vercel** is the deploy target. `vercel.json` defines two cron jobs: daily summary and habit reminders.
- No CI/CD workflows (`.github/workflows/`) exist.
- Environment variables are in `.env` (committed to repo — contains real secrets).

## Environment

Required env vars (see `.env`):
- `DATABASE_URL`, `DIRECT_URL` — PostgreSQL (Neon)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`
- `GEMINI_API_KEY` — AI review generation
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google Calendar sync
- `RESEND_API_KEY`, `EMAIL_FROM` — Transactional email
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob storage
- `TMDB_API_KEY` — Movie/TV cover images
