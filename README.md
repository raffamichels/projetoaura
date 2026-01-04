<div align="center">

# 🌟 Aura

### Plataforma Inteligente de Gestão Pessoal e Financeira

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Transforme sua vida com gestão inteligente de finanças, agenda e produtividade - tudo em um só lugar.**

[Demo](#) • [Documentação](#documentação) • [Roadmap](#roadmap)

</div>

---

## 📖 Sobre o Projeto

**Aura** é uma plataforma moderna e completa de gestão pessoal que combina o melhor de três mundos:

- 💰 **Gestão Financeira Completa** - Controle total sobre suas finanças pessoais
- 📅 **Agenda Inteligente** - Organize compromissos com recorrência avançada
- ✅ **Produtividade** - Acompanhe atividades e metas diárias

Desenvolvida com as tecnologias mais modernas do mercado, Aura oferece uma experiência fluida, rápida e intuitiva, colocando o usuário no controle total de sua vida financeira e produtiva.

---

## ✨ Principais Funcionalidades

### 💰 Módulo Financeiro

#### **Gestão de Transações**
- ✅ Receitas e despesas com categorização inteligente
- ✅ Parcelamento automático (2-48 parcelas)
- ✅ Despesas fixas recorrentes
- ✅ Sugestão de categoria via Machine Learning
- ✅ Filtros avançados por tipo, período e categoria
- ✅ Busca em tempo real

#### **Contas e Cartões**
- ✅ Múltiplas contas bancárias (corrente, poupança, investimento)
- ✅ Gestão de cartões de crédito com limites
- ✅ Controle de datas de vencimento e fechamento
- ✅ Saldos consolidados em tempo real
- ✅ Personalização com cores e ícones

#### **Objetivos Financeiros**
- ✅ Criação de metas com valores e datas
- ✅ Reserva de emergência com cálculo automático
- ✅ Sistema de contribuições incrementais
- ✅ Conclusão automática ao atingir meta
- ✅ Acompanhamento visual de progresso

#### **Categorias Personalizáveis**
- ✅ Categorias padrão pré-configuradas
- ✅ Criação de categorias customizadas
- ✅ Separação por tipo (receita/despesa)
- ✅ Visualização com cores e ícones
- ✅ Análise de gastos por categoria

#### **Dashboard Inteligente**
- ✅ Resumo mensal de receitas e despesas
- ✅ Gráficos de gastos por categoria
- ✅ Saldo livre calculado automaticamente
- ✅ Análise de despesas fixas vs variáveis
- ✅ KPIs financeiros em tempo real

### 📅 Módulo de Agenda

- ✅ Visualização semanal moderna e intuitiva
- ✅ **Sistema avançado de recorrência**:
  - Diária (a cada X dias)
  - Semanal (dias específicos da semana)
  - Mensal (dia do mês ou dia da semana)
  - Personalizada
- ✅ Edição de instâncias únicas ou série completa
- ✅ Cores personalizadas por compromisso
- ✅ Navegação por semanas/meses
- ✅ Integração com sistema de notificações

### ✅ Módulo de Produtividade

- ✅ Registro de atividades recentes
- ✅ Histórico completo de ações
- ✅ Timeline de eventos do sistema
- ✅ Integração entre módulos

---

## 🛠️ Stack Tecnológica

### **Frontend**
- **[Next.js 15.1](https://nextjs.org/)** - Framework React com App Router e Server Components
- **[React 19](https://react.dev/)** - Biblioteca para interfaces de usuário
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes reutilizáveis e acessíveis
- **[Lucide Icons](https://lucide.dev/)** - Ícones modernos e customizáveis
- **[date-fns](https://date-fns.org/)** - Manipulação de datas moderna

### **Backend**
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Endpoints RESTful
- **[NextAuth.js](https://next-auth.js.org/)** - Autenticação completa
- **[Prisma ORM](https://www.prisma.io/)** - ORM type-safe para TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional

### **Ferramentas de Desenvolvimento**
- **[ESLint](https://eslint.org/)** - Linter para código JavaScript/TypeScript
- **[PostCSS](https://postcss.org/)** - Processador CSS
- **[Prisma Studio](https://www.prisma.io/studio)** - Interface visual do banco de dados

---

## 🏗️ Arquitetura do Projeto

```
aura/
├── src/
│   ├── app/                          # App Router do Next.js
│   │   ├── (auth)/                   # Rotas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/              # Rotas protegidas
│   │   │   └── dashboard/
│   │   │       ├── agenda/           # Módulo de agenda
│   │   │       ├── financeiro/       # Módulo financeiro
│   │   │       │   ├── categorias/
│   │   │       │   ├── contas/
│   │   │       │   ├── objetivos/
│   │   │       │   └── transacoes/
│   │   │       └── page.tsx          # Dashboard principal
│   │   └── api/                      # API Routes
│   │       ├── auth/                 # Endpoints de autenticação
│   │       └── v1/                   # API versionada
│   │           ├── agenda/
│   │           ├── atividades/
│   │           └── financeiro/       # 27 endpoints REST
│   ├── components/                   # Componentes React
│   │   ├── dashboard/                # Layout do dashboard
│   │   ├── features/                 # Features específicas
│   │   │   └── agenda/
│   │   ├── financeiro/               # 6 modais financeiros
│   │   ├── providers/                # Context providers
│   │   └── ui/                       # shadcn/ui components
│   ├── lib/                          # Utilitários e helpers
│   │   ├── auth/                     # Configuração NextAuth
│   │   ├── validations/              # Schemas de validação
│   │   ├── financeiro-helper.ts      # Helpers financeiros
│   │   ├── recorrencia-utils.ts      # Lógica de recorrência
│   │   └── prisma.ts                 # Cliente Prisma
│   └── types/                        # TypeScript types
│       ├── compromisso.ts
│       ├── financeiro.ts
│       └── next-auth.d.ts
├── prisma/
│   ├── migrations/                   # Histórico de migrações
│   └── schema.prisma                 # Schema do banco de dados
└── public/                           # Arquivos estáticos
```

---

## 🚀 Getting Started

### Pré-requisitos

- **Node.js** 18.0 ou superior
- **PostgreSQL** 14.0 ou superior
- **npm** ou **yarn**

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/aura.git
cd aura
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Database
DATABASE_URL="(Pegue a env)"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-super-segura"
```

4. **Execute as migrações do banco de dados**
```bash
npx prisma migrate deploy
```

5. **Gere o Prisma Client**
```bash
npx prisma generate
```

6. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) 🎉

---

## 📊 Modelo de Dados

### Principais Entidades

```prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  senha           String
  nome            String
  createdAt       DateTime @default(now())
  
  // Relações
  transacoes      Transacao[]
  contas          ContaBancaria[]
  cartoes         Cartao[]
  objetivos       Objetivo[]
  compromissos    Compromisso[]
}

model Transacao {
  id              String   @id @default(uuid())
  descricao       String
  valor           Float
  data            DateTime
  tipo            TipoTransacao  // RECEITA | DESPESA
  isFixa          Boolean
  isParcela       Boolean
  
  // Relações opcionais
  categoria       Categoria?
  contaBancaria   ContaBancaria?
  cartao          Cartao?
}

model Objetivo {
  id              String   @id @default(uuid())
  nome            String
  valorMeta       Float
  valorAtual      Float
  concluido       Boolean
  
  contribuicoes   ContribuicaoObjetivo[]
}

model Compromisso {
  id              String   @id @default(uuid())
  titulo          String
  inicio          DateTime
  fim             DateTime
  
  // Sistema de recorrência
  isRecorrente    Boolean
  padraoRecorrencia String?
  dataFimRecorrencia DateTime?
  instanciaPaiId  String?
}
```

---

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Criar nova conta
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout

### Financeiro (27 endpoints)

#### Transações
- `GET /api/v1/financeiro/transacoes` - Listar transações
- `POST /api/v1/financeiro/transacoes` - Criar transação
- `GET /api/v1/financeiro/transacoes/:id` - Detalhes
- `PUT /api/v1/financeiro/transacoes/:id` - Atualizar
- `DELETE /api/v1/financeiro/transacoes/:id` - Excluir

#### Contas Bancárias
- `GET /api/v1/financeiro/contas` - Listar contas
- `POST /api/v1/financeiro/contas` - Criar conta
- `GET /api/v1/financeiro/contas/:id` - Detalhes
- `PUT /api/v1/financeiro/contas/:id` - Atualizar
- `DELETE /api/v1/financeiro/contas/:id` - Excluir

#### Cartões
- `GET /api/v1/financeiro/cartoes` - Listar cartões
- `POST /api/v1/financeiro/cartoes` - Criar cartão
- `GET /api/v1/financeiro/cartoes/:id` - Detalhes
- `PUT /api/v1/financeiro/cartoes/:id` - Atualizar
- `DELETE /api/v1/financeiro/cartoes/:id` - Excluir

#### Objetivos
- `GET /api/v1/financeiro/objetivos` - Listar objetivos
- `POST /api/v1/financeiro/objetivos` - Criar objetivo
- `POST /api/v1/financeiro/objetivos/:id/contribuir` - Contribuir
- `GET /api/v1/financeiro/objetivos/:id` - Detalhes
- `PUT /api/v1/financeiro/objetivos/:id` - Atualizar
- `DELETE /api/v1/financeiro/objetivos/:id` - Excluir

#### Categorias
- `GET /api/v1/financeiro/categorias` - Listar categorias
- `POST /api/v1/financeiro/categorias` - Criar categoria
- `POST /api/v1/financeiro/categorias/inicializar` - Categorias padrão
- `GET /api/v1/financeiro/categorias/:id` - Detalhes
- `PUT /api/v1/financeiro/categorias/:id` - Atualizar
- `DELETE /api/v1/financeiro/categorias/:id` - Excluir

#### Dashboard
- `GET /api/v1/financeiro/dashboard` - Dashboard completo

### Agenda
- `GET /api/v1/agenda/compromissos` - Listar compromissos
- `POST /api/v1/agenda/compromissos` - Criar compromisso
- `GET /api/v1/agenda/compromissos/:id` - Detalhes
- `PUT /api/v1/agenda/compromissos/:id` - Atualizar
- `DELETE /api/v1/agenda/compromissos/:id` - Excluir

### Atividades
- `GET /api/v1/atividades` - Histórico de atividades

---

## 🎨 Design System

### Paleta de Cores

```css
/* Dark Theme */
--background: #09090b (zinc-950)
--card: #18181b (zinc-900)
--border: #27272a (zinc-800)

/* Brand Colors */
--purple: #8B5CF6
--pink: #EC4899
--blue: #3B82F6
--green: #10B981
--orange: #F59E0B
--red: #EF4444
```

### Componentes UI

Todos os componentes seguem o padrão **shadcn/ui** com customizações:
- ✅ Acessibilidade (ARIA)
- ✅ Dark mode nativo
- ✅ Animações suaves
- ✅ Responsividade
- ✅ TypeScript 100%

---

## 🧪 Testes

```bash
# Executar testes unitários
npm run test

# Executar testes e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📦 Build e Deploy

### Build de Produção

```bash
npm run build
```

### Deploy

#### Vercel (Recomendado)
```bash
npx vercel
```

#### Docker
```dockerfile
# Dockerfile incluído no projeto
docker build -t aura .
docker run -p 3000:3000 aura
```

---

## 🗺️ Roadmap

### ✅ Versão 1.0 (Atual)
- [x] Sistema de autenticação
- [x] Módulo financeiro completo
- [x] Agenda com recorrência
- [x] Dashboard principal
- [x] 6 modais financeiros
- [x] 27 endpoints REST

### 🚧 Versão 1.1 (Em Desenvolvimento)
- [ ] Notificações push
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Gráficos avançados com Chart.js
- [ ] Modo claro/escuro toggle
- [ ] Multi-idioma (i18n)

### 🔮 Versão 2.0 (Planejado)
- [ ] Mobile app (React Native)
- [ ] Sincronização bancária (Open Banking)
- [ ] IA para análise de gastos
- [ ] Previsões financeiras com ML
- [ ] Comunidade e compartilhamento
- [ ] Assinatura Premium

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Minha feature incrível'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Convenção de Commits

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção
```

---

## 📄 Licença



---

## 👨‍💻 Autor

**Raffael** 

- Website: 
- Email: raffaelarcego@gmail.com
- LinkedIn: 
---

## 🙏 Agradecimentos

- [Next.js Team](https://nextjs.org/) - Framework incrível
- [Vercel](https://vercel.com/) - Hosting e deploy
- [shadcn](https://twitter.com/shadcn) - Componentes UI
- [Prisma](https://www.prisma.io/) - ORM type-safe
- Comunidade open-source 💜

---

<div align="center">

**Feito com ❤️ e muito ☕**

⭐ **Se gostou do projeto, deixe uma estrela!** ⭐

</div>
