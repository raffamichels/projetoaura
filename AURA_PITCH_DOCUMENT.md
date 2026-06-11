# AURA — Documentação Completa do Sistema + Roteiro de Pitch

---

## ÍNDICE

1. [O que é o Aura](#1-o-que-é-o-aura)
2. [Premissa e Problema que Resolve](#2-premissa-e-problema-que-resolve)
3. [Modelo de Negócio](#3-modelo-de-negócio)
4. [Arquitetura e Stack Técnica](#4-arquitetura-e-stack-técnica)
5. [Módulos do Sistema — Explicação Completa](#5-módulos-do-sistema--explicação-completa)
   - 5.1 Dashboard Principal
   - 5.2 Agenda
   - 5.3 Financeiro
   - 5.4 Estudos
   - 5.5 Biblioteca
   - 5.6 Hábitos
   - 5.7 Viagens
   - 5.8 Perfil e Conquistas
   - 5.9 Configurações e Conta
   - 5.10 Assinatura e Planos
6. [Funcionalidades de IA](#6-funcionalidades-de-ia)
7. [Sistema de Autenticação e Segurança](#7-sistema-de-autenticação-e-segurança)
8. [Sistema de Planos (Free vs Premium)](#8-sistema-de-planos-free-vs-premium)
9. [Integrações Externas](#9-integrações-externas)
10. [Banco de Dados — Estrutura Completa](#10-banco-de-dados--estrutura-completa)
11. [Roteiro de Pitch de Negócios](#11-roteiro-de-pitch-de-negócios)

---

## 1. O que é o Aura

**Aura** é uma plataforma de gestão de vida pessoal all-in-one que une em um único lugar tudo que uma pessoa precisa para organizar sua vida: agenda, finanças, estudos, hábitos, leituras e viagens.

O nome "Aura" remete à ideia de energia, presença e clareza — a sensação de estar no controle da própria vida. O produto é uma aplicação web progressiva (PWA-ready) construída com tecnologia de ponta, com design escuro e sofisticado, e com inteligência artificial integrada para potencializar a produtividade do usuário.

**Tagline:** *Tudo que você precisa para viver com intenção.*

---

## 2. Premissa e Problema que Resolve

### O problema

A maioria das pessoas produtivas hoje usa entre 5 e 10 aplicativos diferentes para gerenciar a vida:
- Google Calendar ou Notion para agenda
- Mobills ou GuiaBolso para finanças
- Anki ou Notion para estudos
- Habitica ou Streaks para hábitos
- Goodreads para leituras
- TripIt ou planilhas para viagens

O resultado? **Fragmentação.** O usuário perde tempo alternando entre apps, perde contexto, não consegue ter uma visão unificada do que está acontecendo na sua vida, e inevitavelmente abandona parte dos sistemas.

### A solução

O Aura resolve isso com **uma única plataforma coesa**, onde todos os aspectos da vida se comunicam. O dashboard principal dá uma visão panorâmica instantânea: o que tem na agenda hoje, como estão as finanças do mês, qual hábito está em risco de quebrar a sequência, qual curso está em andamento.

### Por que agora

- O mercado de aplicativos de produtividade pessoal movimentou **USD 102 bilhões em 2023** e cresce 13% ao ano
- A geração Z e Millennials são os maiores consumidores de apps de autogestão e também os mais frustrados com a fragmentação
- A IA generativa abriu uma nova fronteira: apps que não apenas organizam, mas **pensam junto com o usuário**
- No Brasil, ainda não existe um produto local com essa proposta all-in-one com qualidade e IA integrada

---

## 3. Modelo de Negócio

O Aura opera no modelo **Freemium SaaS** — gratuito para começar, pago para desbloquear o potencial completo.

### Plano Free
- Acesso a todos os módulos com limitações de volume
- Sem funcionalidades de IA
- Sem módulo de viagens
- Suporte via comunidade

### Plano Premium
- **R$ 12,90/mês** (mensal)
- **R$ 129/ano** (anual — equivale a R$ 10,75/mês, desconto de 16%)

### O que o Premium desbloqueia

| Recurso | Free | Premium |
|---|---|---|
| Compromissos na agenda | 10/mês | Ilimitado |
| Transações financeiras | 20/mês | Ilimitado |
| Cursos ativos | 1 | Ilimitado |
| Itens na biblioteca | 10 | Ilimitado |
| Módulo de Viagens | ✗ | ✓ Completo |
| Anotações com IA | ✗ | ✓ |
| Gravação e transcrição de áudio | ✗ | ✓ |
| Geração de resenhas com IA | ✗ | ✓ |
| Backup diário | ✗ | ✓ |
| Relatórios avançados | Básico | Avançado |
| Exportação de dados | ✗ | PDF/Excel |
| Suporte | Comunidade | Prioritário |
| Acesso antecipado a novos recursos | ✗ | ✓ |
| Anúncios | Sim | Sem anúncios |

### Estratégia de conversão

O produto é desenhado para que o usuário sinta valor imediato no Free e naturalmente queira ir além — os limites de volume são atingidos no momento em que o usuário está mais engajado, criando o momento ideal de conversão.

---

## 4. Arquitetura e Stack Técnica

O Aura é construído com tecnologia moderna, escalável e de alta performance.

### Frontend
- **Next.js 16** com App Router — SSR/SSG/ISR híbrido
- **React 18** com Server Components
- **TypeScript** — tipagem estática em todo o código
- **Tailwind CSS v4** — design system com tokens customizados
- **Radix UI + shadcn/ui** — componentes acessíveis e estilizáveis
- **Phosphor Icons** — biblioteca de ícones consistente
- **Recharts** — gráficos e visualizações de dados

### Backend
- **Next.js API Routes** — endpoints REST organizados em `/api/v1/`
- **Prisma ORM** — modelagem e acesso ao banco de dados
- **PostgreSQL** (Supabase) — banco de dados relacional em produção

### IA e Serviços
- **Google Gemini AI** — transcrição de áudio e geração de anotações estruturadas
- **Vercel Blob** — armazenamento de arquivos de áudio
- **Stripe** — processamento de pagamentos e assinaturas
- **Google Calendar API** — sincronização de compromissos

### Infraestrutura
- **Vercel** — hospedagem com deploy contínuo
- **NextAuth v5** — autenticação segura (credenciais + Google OAuth)
- **next-intl** — internacionalização (PT-BR / EN)

### Segurança
- Senhas com hash bcrypt
- Tokens de verificação de email com expiração
- Tokens de reset de senha com expiração
- Proteção CSRF via NextAuth
- Validação de dados no cliente e no servidor
- Autorização por usuário em todas as queries (dados isolados por `userId`)

---

## 5. Módulos do Sistema — Explicação Completa

---

### 5.1 Dashboard Principal

**Premissa:** O usuário não precisa abrir cada módulo para saber como está sua vida. O dashboard é a "visão de cockpit" — tudo em uma tela, sem scroll excessivo.

**Como funciona:**

Ao entrar no Aura, o usuário vê um painel composto por cards que resumem cada área da vida:

- **Card de Agenda:** mostra os compromissos do dia atual com horário e categoria. Se não tiver compromissos, incentiva o usuário a criar um.
- **Card Financeiro:** mostra o saldo do mês atual — receitas vs despesas — com tendência visual.
- **Card de Hábitos:** mostra quantos hábitos foram completados hoje e quais ainda estão pendentes.
- **Card de Estudos:** mostra o curso ativo e o progresso do usuário.
- **Atividades Recentes:** lista as últimas ações realizadas no sistema (nova transação, hábito completado, livro adicionado etc.).
- **Banner de Upgrade:** para usuários Free, aparece um convite contextual para o Premium no momento certo.

O dashboard é totalmente responsivo — em mobile, os cards se reorganizam em coluna única. Em desktop, usam um layout de grid multi-coluna sem scroll vertical, tudo cabe na tela.

---

### 5.2 Agenda

**Premissa:** Uma agenda que funciona do jeito que a cabeça humana pensa — não apenas lista de eventos, mas visualização visual do tempo.

**Como funciona:**

O módulo de agenda oferece duas visualizações principais:

**Vista Semanal (desktop):**
- Grade com 7 dias e 24 horas visíveis
- Compromissos aparecem como blocos coloridos no horário exato
- Clique em qualquer slot de horário vazio para criar um compromisso com data e hora já preenchidas
- Clique em um compromisso existente para ver detalhes ou editar

**Vista Diária (mobile e desktop):**
- Foco em um único dia, hora por hora
- Navegação por setas para avançar ou voltar dias
- Ideal para planejamento detalhado do dia

**Criação de compromisso:**
- Título, descrição, data, hora de início e fim
- Categoria e cor customizável
- Opção de recorrência (diária, semanal, mensal)
- Sincronização com Google Calendar (quando autorizado)

**Recorrência:**
- Compromissos recorrentes criam instâncias individuais no banco de dados, vinculadas por um `recorrenciaGrupoId`
- Ao editar, o usuário pode escolher: alterar apenas esta ocorrência ou todas as futuras

**Google Calendar Sync:**
- O usuário pode autorizar o Aura a ler/escrever no Google Calendar
- Compromissos criados no Aura aparecem no Google Calendar e vice-versa
- Sincronização via webhooks e polling

---

### 5.3 Financeiro

**Premissa:** As pessoas têm medo de olhar para o próprio dinheiro. O Aura torna esse processo simples, visual e sem julgamento — o objetivo é clareza, não culpa.

O módulo financeiro é dividido em quatro seções integradas:

---

#### 5.3.1 Dashboard Financeiro

A tela principal do módulo mostra:

- **Saldo Total** em contas bancárias
- **Receitas do mês** com indicador de crescimento
- **Despesas do mês** com breakdown por tipo (fixas vs variáveis)
- **Sobra mensal** (quanto sobrou depois de todas as despesas)
- **Saldo livre** (sobra menos contribuições a objetivos financeiros)
- **Gastos por categoria:** gráfico de barras horizontal mostrando onde o dinheiro foi — alimentação, transporte, lazer etc., cada um com sua cor

O sistema inicializa automaticamente um conjunto de categorias padrão quando o usuário cria a conta, para que não precise configurar do zero.

---

#### 5.3.2 Transações

Lista completa de todas as movimentações financeiras, com:

- **Tipo:** Receita (verde) ou Despesa (vermelho)
- **Filtros em tempo real:** busca por texto, filtro por tipo
- **Totalizadores:** barra fixa no topo mostrando total de receitas, despesas e saldo do período filtrado
- **Detalhes por transação:** descrição, valor, data, categoria (com cor), conta bancária vinculada, cartão de crédito (se aplicável)
- **Transações fixas:** marcadas com ícone especial — são recorrentes mensalmente
- **Transações parceladas:** mostram "parcela 2/6" automaticamente

Criação de transação:
- Descrição livre
- Valor e data
- Tipo (receita ou despesa)
- Categoria (com criação inline se não existir)
- Conta bancária (obrigatório — toda transação sai de algum lugar)
- Cartão de crédito (opcional — para registrar que foi no cartão mas débita da conta)
- Marcar como fixa ou parcelada (com número de parcelas)

---

#### 5.3.3 Contas Bancárias e Cartões

**Contas Bancárias:**
- Suporta: Conta Corrente, Poupança, Investimento
- Cada conta tem: nome, banco, saldo atual, cor e ícone customizáveis
- O saldo é atualizado automaticamente conforme transações são registradas
- Toggle de privacidade: oculta todos os saldos com um clique

**Cartões de Crédito:**
- Bandeira, últimos 4 dígitos, limite, dia de vencimento e fechamento
- Os gastos no cartão ficam vinculados a uma conta bancária (para débito no dia do pagamento)
- Status ativo/inativo

---

#### 5.3.4 Objetivos Financeiros

**Premissa:** Poupar sem um objetivo é difícil. O Aura transforma metas financeiras em algo visual e motivador.

- **Criação de objetivo:** nome, valor meta, data alvo, cor e ícone
- **Contribuição progressiva:** o usuário registra aportes ao objetivo; o progresso é exibido em barra animada
- **Reserva de Emergência:** tipo especial de objetivo com ícone de escudo — o sistema destaca sua importância
- **Status:** Em Andamento, Concluído, Cancelado
- **Objetivos concluídos:** ficam em seção separada de "conquistas financeiras"
- **Saldo livre:** o dashboard financeiro desconta os objetivos do cálculo da sobra, incentivando o usuário a poupar antes de gastar

---

### 5.4 Estudos

**Premissa:** O conhecimento que não é organizado é esquecido. O Aura transforma o processo de aprendizado em algo estruturado, persistente e potencializado por IA.

**Estrutura:**

```
Curso
  └── Módulo
        └── Página (conteúdo do módulo)
  └── Anotação (nota avulsa vinculada ao curso)
```

**Funcionalidades:**

**Gerenciamento de Cursos:**
- Criar cursos com nome, descrição, cor e ícone
- Cada curso mostra contagem de módulos e anotações
- Dentro do curso: criar módulos, adicionar páginas com editor rico (Tiptap)

**Três modos de anotação:**

1. **Modo Texto Livre:**
   - Editor rico com formatação (negrito, listas, títulos etc.)
   - Salva normalmente

2. **Modo IA + Texto (Premium):**
   - O usuário cola um texto bruto (transcrição de vídeo, artigo, resumo manual bagunçado)
   - Escolhe o formato: "Padrão" ou "Notion" (Markdown estruturado)
   - A IA (Gemini) reorganiza o texto em uma anotação estruturada com títulos, tópicos, destaques e resumo
   - O resultado aparece pronto para salvar ou editar

3. **Modo Áudio (Premium):**
   - O usuário clica em "Gravar" e fala livremente sobre o que estudou
   - O áudio é gravado no navegador e enviado para o Vercel Blob
   - A IA transcreve o áudio e depois estrutura a transcrição em uma anotação organizada
   - A anotação fica com o player de áudio embutido, a transcrição original e o conteúdo estruturado

**Busca global:**
- Campo de busca que pesquisa em tempo real por cursos e anotações
- Resultados aparecem em modal organizado por tipo

---

### 5.5 Biblioteca

**Premissa:** Ler e assistir sem registrar é como não ter feito. A biblioteca do Aura é o diário cultural do usuário.

**Tipos de mídia:**
- **Livros:** autor, editora, gênero, fonte (físico, Kindle, emprestado, digital), idioma, data de início e conclusão
- **Filmes:** diretor, duração, ano de lançamento, idioma, data que assistiu

**Status de acompanhamento:**
- Próximo (lista de desejos)
- Em Andamento
- Pausado
- Concluído

**Avaliação:**
- Sistema de 1 a 5 estrelas
- Campos de reflexão: impressões iniciais, principais aprendizados, trechos memoráveis, reflexão pessoal, aprendizados práticos e considerações finais

**Resenha com IA (Premium):**
- O usuário preenche os campos de reflexão
- A IA gera uma resenha estruturada e pessoal com base nas respostas

**Citações:**
- Adicionar citações de qualquer livro ou filme
- Marcar como destaque para aparecer no painel da biblioteca
- Visualizar as 3 citações em destaque na tela principal do módulo

**Visualização:**
- Cards em carousel horizontal separados por tipo
- Filtros: Todos, Livros, Filmes, Em Andamento, Concluídos
- Capa visual como destaque de cada card

---

### 5.6 Hábitos

**Premissa:** Hábitos não se formam por força de vontade — se formam por sistemas. O Aura é o sistema.

**Criação de hábito:**
- Nome, descrição e horário sugerido
- Dias da semana (ex: apenas segunda, quarta e sexta) — vazio significa todos os dias
- Categoria (ex: Saúde, Finanças, Estudo)
- Cor e ícone customizáveis

**Visualização diária:**
- O usuário vê os hábitos do dia divididos em "Pendentes" e "Completados"
- Um checkbox marca o hábito como feito (com animação)
- Cada hábito mostra a sequência atual com ícone de chama
- Seletor de dia: 7 botões para navegar entre os dias da semana

**Sistema de streaks (sequências):**
- Cada hábito mantém a sequência atual de dias consecutivos
- Também mantém o recorde histórico de maior sequência
- Ao quebrar um hábito, a sequência volta a zero

**Gamificação:**
- A sequência aparece com ícone de chama proporcional ao tamanho
- O total de vezes completado fica registrado para cada hábito

**Encerramento de hábito:**
- O usuário pode "Encerrar" um hábito (soft delete) — ele para de aparecer no dia a dia mas o histórico é preservado
- Ou pode "Excluir" completamente

**Categorias de hábitos:**
- Criar categorias customizadas com cor e ícone
- Filtrar a lista de hábitos por categoria

**Estatísticas avançadas:**
- Card: progresso do dia (X de Y completados)
- Card: maior sequência ativa
- Card: recorde histórico de sequência
- Card: total de completamentos de todos os hábitos
- **Calendário de streaks:** visualização tipo heatmap (estilo GitHub) mostrando os últimos 3 meses de consistência
- **Gráfico de tendência semanal:** linha mostrando a evolução da taxa de completamento por semana
- **Estatísticas por dia da semana:** qual dia você é mais consistente, qual é o pior

---

### 5.7 Viagens

**Premissa (Premium):** Planejar uma viagem é a atividade de organização mais complexa que existe. O Aura torna isso prazeroso, não estressante.

**Este módulo é exclusivo para usuários Premium.** Usuários Free veem um card de apresentação com os benefícios e um botão de upgrade.

**Estrutura de uma viagem:**

```
Viagem
  ├── Destinos (cidades visitadas, em ordem)
  │     └── Locais Salvos (restaurantes, atrações, hospitais)
  ├── Transportes (voos, ônibus, trens, carros)
  ├── Hospedagens (hotéis, Airbnb, hostels)
  ├── Atividades (passeios e eventos planejados)
  └── Despesas (controle de gastos na viagem)
```

**Informações gerais da viagem:**
- Nome, descrição, propósito (Lazer, Trabalho, Estudo, Outro)
- Data de início e fim
- Orçamento total planejado
- Status: Planejada, Em Andamento, Concluída, Cancelada

**Controle de orçamento:**
- Cada despesa registrada é somada ao total gasto
- O card da viagem mostra uma barra de progresso do orçamento
- Alerta visual quando o orçamento foi ultrapassado

**Destinos:**
- Cada destino tem: cidade, país, datas de chegada e saída
- Fuso horário, idioma local, moeda, voltagem das tomadas
- Costumes locais, frases básicas no idioma local
- Previsão de clima e temperatura média

**Transportes:**
- Suporta: avião, carro, ônibus, trem, táxi, Uber e outros
- Para voos: companhia aérea, número do voo, assento, portão de embarque, conexão, código de reserva
- Upload do cartão de embarque (arquivo)

**Hospedagens:**
- Hotel, hostel, Airbnb ou outro
- Datas de check-in e check-out
- Endereço, telefone, website, código de reserva
- Upload do comprovante de reserva

**Locais Salvos:**
- Dentro de cada destino: restaurantes, atrações turísticas, hospitais, farmácias etc.
- Marcar como favorito para acesso rápido

**Documentos de Viagem:**
- Passaporte, visto, RG, CNH, seguro viagem, reservas
- Data de emissão e validade
- Upload do documento digitalizado

---

### 5.8 Perfil e Conquistas

**Premissa:** O Aura não é só um app de organização — é um reflexo da evolução do usuário.

**Aba Visão Geral:**
- Foto de perfil (upload com crop)
- Nome, email, username único
- Badge de plano atual (Free ou Premium)
- Badge de e-mail verificado
- Data de cadastro
- Para Premium: data de expiração e tipo de plano (mensal ou anual)

**Aba Estatísticas:**
- Total de compromissos criados
- Número de cursos ativos
- Metas financeiras alcançadas
- Dias consecutivos de uso do app
- Total de transações registradas
- Total de leituras/filmes concluídos
- Progresso geral de conquistas em %

**Aba Conquistas:**
- Sistema de badges desbloqueáveis que reconhecem o progresso do usuário:
  - **Primeiro Passo:** criar o primeiro compromisso
  - **Constante:** usar o app por 7 dias consecutivos
  - **Estudioso:** criar 3 cursos
  - **Organizado:** registrar 50 transações
  - **Realizador:** concluir 5 objetivos financeiros
  - **Leitor Ávido:** concluir 10 livros ou filmes
- Conquistas bloqueadas mostram progresso atual (ex: "4 de 10 leituras")
- Conquistas desbloqueadas têm destaque visual diferente

---

### 5.9 Configurações e Conta

**Minha Conta:**
- Editar nome, email e telefone
- Sistema de avatar com upload e crop
- **Username:** identificador único público do usuário
  - Validação em tempo real enquanto digita
  - Verificação de disponibilidade com debounce (sem spam de requests)
  - Regras: 3 a 30 caracteres, letras, números, underscore e ponto
  - Cooldown de 30 dias entre mudanças (para evitar squatting)

**Aparência:**
- Seletor de tema: Claro, Escuro, Sistema
- O tema escuro é o padrão e principal do produto

**Segurança:**
- Alterar senha com campo de senha atual como verificação
- Autenticação em Dois Fatores (em desenvolvimento)
- **Zona de Perigo:** excluir conta permanentemente com modal de confirmação dupla

**Planos e Faturamento:**
- Ver plano atual e data de renovação
- Opções de upgrade, downgrade ou cancelamento
- Integrado com Stripe para pagamentos

---

### 5.10 Assinatura e Planos

O fluxo de assinatura é gerenciado pelo Stripe:

1. Usuário acessa "Planos e Faturamento" ou clica em um recurso Premium
2. Escolhe o plano (mensal ou anual)
3. É redirecionado para o Checkout do Stripe (ambiente seguro)
4. Após pagamento, o webhook do Stripe notifica o Aura
5. O plano do usuário é atualizado no banco de dados
6. A sessão é renovada automaticamente para refletir o novo plano

**Cancelamento:**
- O usuário pode cancelar a qualquer momento
- Continua com acesso Premium até o final do período pago
- Após o fim, volta automaticamente para o plano Free

**Reativação:**
- Usuários que cancelaram podem reativar com um clique

---

## 6. Funcionalidades de IA

O Aura usa a API do **Google Gemini** para três funcionalidades de IA, todas exclusivas do plano Premium:

### 6.1 Anotações Estruturadas por Texto

**Endpoint:** `POST /api/generate-note`

**Fluxo:**
1. Usuário cola um texto bruto (pode ser bagunçado, informal, longo)
2. Escolhe o formato de saída: Padrão ou Notion (Markdown)
3. A IA analisa o conteúdo e gera uma anotação organizada com:
   - Título sugerido
   - Resumo em 2-3 frases
   - Tópicos principais estruturados
   - Destaques e pontos de atenção
   - Conclusão ou próximos passos

### 6.2 Transcrição e Estruturação de Áudio

**Endpoint:** `POST /api/v1/estudos/anotacoes/audio/process`

**Fluxo:**
1. Usuário grava áudio diretamente no navegador (sem limite de tempo)
2. O áudio é enviado para o Vercel Blob para armazenamento
3. A URL do áudio é enviada para a IA junto com a duração
4. Gemini transcreve o áudio
5. A transcrição é estruturada em anotação organizada
6. A anotação final contém: player de áudio, transcrição completa original e o conteúdo organizado

### 6.3 Geração de Resenhas

**Endpoint:** `POST /api/generate-review`

**Fluxo:**
1. Usuário preenche os campos de reflexão de um livro ou filme (impressões, aprendizados, trechos favoritos)
2. A IA usa essas reflexões pessoais para gerar uma resenha autêntica e personalizada
3. A resenha é salva no perfil do item da biblioteca

---

## 7. Sistema de Autenticação e Segurança

### Métodos de login
- **E-mail e senha:** senha com hash bcrypt
- **Google OAuth:** login com conta Google sem precisar de senha

### Verificação de e-mail
- Ao cadastrar, o usuário recebe um link de verificação por e-mail
- O link tem expiração e é invalidado após uso
- Funcionalidades ficam restritas até a verificação (configurável)

### Reset de senha
- O usuário solicita reset pelo e-mail
- Recebe link com token único e com expiração
- Após redefinir, o token é invalidado

### Escolha de username
- Após criar a conta, o usuário é redirecionado para escolher um username único
- Validação em tempo real com debounce
- Username fica permanentemente vinculado ao perfil público

### Isolamento de dados
- Todas as queries no banco de dados incluem `userId` como filtro obrigatório
- Nenhum usuário consegue ver ou manipular dados de outro

---

## 8. Sistema de Planos (Free vs Premium)

O controle de acesso é feito por um hook central chamado `usePlano()` que qualquer componente pode usar.

**Como funciona:**
```
usePlano() retorna:
  - plano: "FREE" | "PREMIUM"
  - isPremium: boolean
  - planoExpiraEm: Date | null
  - verificarRecurso(recurso): { temAcesso, diasRestantes }
```

**Recursos controlados pelo plano:**
- `VIAGENS` — módulo inteiro bloqueado para Free
- `GERAR_RESENHA_IA` — geração de resenha com IA
- `GRAVACAO_AUDIO` — anotações por áudio
- `GERAR_ANOTACAO_IA` — anotações estruturadas por IA

**Comportamento ao tentar acessar recurso Premium:**
- Um modal/drawer é exibido explicando o benefício
- Botão direto para upgrade
- O usuário não perde o contexto do que estava fazendo

---

## 9. Integrações Externas

| Serviço | Uso |
|---|---|
| **Google OAuth** | Login social |
| **Google Calendar API** | Sincronização bidirecional de compromissos |
| **Stripe** | Processamento de pagamentos e assinaturas recorrentes |
| **Google Gemini AI** | Transcrição de áudio, estruturação de anotações, geração de resenhas |
| **Vercel Blob** | Armazenamento de arquivos de áudio |
| **Vercel** | Hospedagem, deploy e edge functions |
| **Supabase / PostgreSQL** | Banco de dados em produção |

---

## 10. Banco de Dados — Estrutura Completa

O banco de dados é PostgreSQL, gerenciado pelo Prisma ORM. Abaixo está a lista de todas as tabelas (models) e o que cada uma armazena.

| Tabela | Descrição |
|---|---|
| `users` | Dados do usuário, plano, tokens Google e Stripe |
| `compromissos` | Eventos da agenda com recorrência e sync Google |
| `atividades` | Log de atividades recentes do usuário |
| `contas_bancarias` | Contas bancárias com saldo atualizado |
| `cartoes` | Cartões de crédito do usuário |
| `categorias` | Categorias financeiras com hierarquia (pai/filho) |
| `transacoes` | Transações financeiras vinculadas a conta e categoria |
| `objetivos_financeiros` | Metas de poupança com progresso |
| `cursos` | Cursos de estudo |
| `modulos` | Módulos dentro de cursos |
| `paginas` | Páginas de conteúdo dentro de módulos |
| `anotacoes` | Anotações com suporte a áudio e IA |
| `midias` | Livros e filmes da biblioteca |
| `citacoes` | Citações de livros e filmes |
| `waitlist` | Lista de espera para novos usuários (pré-lançamento) |
| `verification_tokens` | Tokens de verificação de e-mail |
| `password_reset_tokens` | Tokens de reset de senha |
| `viagens` | Viagens planejadas |
| `destinos_viagem` | Cidades visitadas em cada viagem |
| `locais_salvos` | Locais de interesse em cada destino |
| `transportes_viagem` | Transportes da viagem (voo, carro etc.) |
| `hospedagens_viagem` | Hospedagens reservadas |
| `atividades_viagem` | Atividades e passeios planejados |
| `despesas_viagem` | Controle de gastos durante a viagem |
| `documentos_viagem` | Documentos como passaporte e vistos |
| `habitos` | Hábitos com streaks e categorias |
| `registros_habitos` | Log diário de completamento de hábitos |
| `categorias_habitos` | Categorias customizadas de hábitos |
| `notificacoes` | Notificações do sistema (lembretes, conquistas) |
| `preferencias_notificacao` | Configurações de notificação por usuário |

---

## 11. Roteiro de Pitch de Negócios

> Este roteiro é para uma apresentação de slides de aproximadamente **12 a 15 minutos**. Cada slide tem um objetivo claro. O tom é direto, confiante e humano — não corporativo.

---

### SLIDE 1 — Abertura / Headline

**Visual:** Tela cheia com o logo do Aura centralizado sobre fundo escuro. Nenhum texto além do nome.

**O que dizer:**
> "Quantos apps você tem no celular para organizar a sua vida?"

*Pausa de 3 segundos.*

> "A maioria das pessoas que eu pergunto diz: cinco, seis, às vezes dez. E mesmo assim se sentem desorganizadas. Isso é o problema que o Aura resolve."

---

### SLIDE 2 — O Problema

**Visual:** 8 ícones de apps conhecidos espalhados pela tela (Google Calendar, Notion, Mobills, Habitica, Goodreads, TripIt, planilha do Excel, bloco de notas). Seta de caos apontando para cérebro sobrecarregado.

**O que dizer:**
> "A vida moderna exige que a gente gerencie muitas dimensões ao mesmo tempo: agenda, dinheiro, aprendizado, hábitos, leituras, viagens. Cada dimensão tem seu próprio app. Cada app tem sua própria lógica. E nenhum fala com o outro."
>
> "O resultado é que a gente gasta energia gerenciando os sistemas de gestão em vez de usar essa energia para viver."

**Dado de impacto:**
> "O mercado global de apps de produtividade pessoal é de USD 102 bilhões e cresce 13% ao ano. O problema não falta."

---

### SLIDE 3 — A Solução

**Visual:** Screenshot real do dashboard do Aura em tela cheia, limpo e elegante.

**O que dizer:**
> "O Aura é uma plataforma de gestão de vida pessoal all-in-one. Um único lugar para tudo que importa."
>
> "Não é um Notion mais bonito. Não é um Google Calendar com mais recursos. É uma plataforma pensada desde o início para ser o sistema operacional da vida do usuário."

**Listar os módulos brevemente:**
> "Agenda, finanças, estudos, hábitos, biblioteca de leituras e viagens — integrados, conversando entre si, com uma visão unificada no dashboard."

---

### SLIDE 4 — Demo ao Vivo (ou Screenshots em Sequência)

**Visual:** Sequência de screenshots ou demo navegando pelo produto real.

**O que mostrar:**
1. Dashboard com os cards de cada módulo
2. Agenda com visualização semanal
3. Financeiro com gráfico de gastos por categoria
4. Hábitos com streaks e heatmap
5. Estudos com a interface de gravação de áudio

**O que dizer enquanto mostra:**
> "O design é intencional. Dark mode por padrão, cores muted, sem poluição visual. Porque o usuário já tem estresse suficiente — o app não precisa adicionar mais."
>
> "Cada módulo foi projetado para ser rápido de usar. Criar um compromisso: dois cliques. Registrar uma transação: quinze segundos. Marcar um hábito: um toque."

---

### SLIDE 5 — O Diferencial: IA

**Visual:** Ícone de IA com fluxo visual mostrando: texto bagunçado → Aura IA → anotação estruturada.

**O que dizer:**
> "O que transforma o Aura de um app de organização para um parceiro de produtividade é a inteligência artificial integrada."
>
> "Três funcionalidades de IA que nenhum concorrente direto tem combinadas:"

1. **Anotações por IA:** cola um texto bruto de qualquer lugar — transcrição de vídeo, artigo, rascunho — e a IA organiza em uma anotação estruturada, com títulos, tópicos e resumo.

2. **Anotações por áudio:** fala livremente sobre o que acabou de estudar. A IA transcreve e estrutura a fala em uma anotação organizada. Estudou enquanto dirigia? Não perde o conteúdo.

3. **Resenhas personalizadas:** preenche as reflexões sobre um livro que acabou de ler e a IA gera uma resenha autêntica com base na sua perspectiva.

---

### SLIDE 6 — Modelo de Negócio

**Visual:** Tabela comparativa Free vs Premium com preços destacados.

**O que dizer:**
> "O modelo é Freemium SaaS. O usuário entra de graça, experimenta, se apaixona — e quando atinge os limites do plano gratuito, está no momento de maior engajamento. Esse é o momento de conversão."
>
> "R$ 12,90 por mês. Ou R$ 129 por ano — menos de R$ 11 por mês. Para ter o sistema operacional completo da própria vida."

**Comparação de mercado:**
> "O Notion cobra USD 10/mês e não tem financeiro, hábitos nem IA de áudio. O Mobills cobra R$ 19,90/mês e só faz finanças. O Aura entrega tudo isso e mais por R$ 12,90."

---

### SLIDE 7 — Mercado

**Visual:** Gráfico de tamanho de mercado com TAM / SAM / SOM.

**O que dizer:**
> "O mercado endereçável são brasileiros entre 22 e 40 anos, com ensino superior, que usam smartphone como ferramenta central de trabalho e vida. São aproximadamente 28 milhões de pessoas no Brasil."
>
> "Se capturarmos 1% desse mercado com ticket médio de R$ 10/mês, estamos falando de R$ 2,8 milhões de receita recorrente mensal."
>
> "E o mercado é global — a base do Aura suporta internacionalização. A expansão para o mercado hispânico e lusófono é natural."

---

### SLIDE 8 — Tração e Validação

**Visual:** Métricas reais ou projeções com gráfico de crescimento.

**O que dizer (adaptável à realidade atual):**
> "O produto está em produção. A base técnica está construída — autenticação, banco de dados, todos os módulos, integração com Stripe e IA."
>
> "Nossa tração atual: [inserir número real de usuários cadastrados, conversões, feedback]. Os primeiros usuários validaram a proposta — [inserir citação real de feedback positivo se houver]."
>
> "A lista de espera que construímos antes do lançamento já nos deu a confirmação de que a proposta ressoa."

---

### SLIDE 9 — Roadmap

**Visual:** Timeline horizontal com fases.

**Fase 1 — Agora (Concluído):**
- Todos os 8 módulos funcionando
- IA integrada (3 funcionalidades)
- Stripe e pagamentos
- Google Calendar sync

**Fase 2 — Próximos 3 meses:**
- App mobile nativo (React Native)
- Módulo de Metas (planejamento de objetivos de vida)
- Módulo de Treinos (planilhas e registro de atividades físicas)
- Relatórios avançados com exportação PDF

**Fase 3 — 6 a 12 meses:**
- IA proativa: sugestões baseadas nos padrões do usuário
- Modo colaborativo (compartilhar viagens, metas financeiras com parceiro)
- API pública para integrações
- Expansão internacional (ES, EN)

**O que dizer:**
> "O que foi construído até agora é a fundação sólida. O roadmap mostra onde vamos — e cada passo amplifica o valor para o usuário e o potencial de receita."

---

### SLIDE 10 — Time

**Visual:** Foto(s) e nome(s) com breve bio.

**O que dizer:**
> "O Aura nasceu de uma frustração pessoal real com a fragmentação dos apps de produtividade. Foi construído do zero com tecnologia moderna e atenção obsessiva a cada detalhe de UX."
>
> "[Inserir informações reais sobre o time aqui]"

---

### SLIDE 11 — A Oportunidade

**Visual:** Número grande e chamativo — a captação que está sendo buscada, ou a oportunidade de mercado.

**O que dizer:**
> "O mercado de produtividade pessoal é gigante e está em crescimento acelerado. A IA abriu uma nova janela de oportunidade que não existia há 2 anos. O Brasil ainda não tem um produto local com essa proposta e essa qualidade."
>
> "O Aura está posicionado para ser a referência em gestão de vida pessoal no mercado brasileiro — e depois, global."

---

### SLIDE 12 — Encerramento / Call to Action

**Visual:** Tela limpa com logo do Aura, tagline e QR code para acesso ao produto.

**O que dizer:**
> "O Aura é para quem acredita que a vida organizada é a base de tudo mais. Para quem quer clareza, intenção e controle — sem precisar de dez apps para isso."

*Pausa.*

> "O produto está no ar. Você pode acessar agora e experimentar. E eu estou aqui para conversar sobre como fazer isso crescer."

**Tagline final:**
> *"Tudo que você precisa para viver com intenção."*

---

## DICAS ADICIONAIS PARA A APRESENTAÇÃO

### Sobre o produto
- Sempre mostrar o produto real, não mockups — a credibilidade aumenta muito
- Mostrar o fluxo de IA ao vivo se possível — é o maior diferencial visual
- Destacar o design: é um produto que as pessoas **querem usar**, não apenas precisam usar

### Sobre os números
- Ser honesto sobre o estágio atual — investidores preferem honestidade a exagero
- Ter os dados de CAC, LTV e churn estimados na ponta da língua, mesmo que sejam projeções

### Sobre as perguntas difíceis
- **"Por que não o Notion?"** → O Notion é uma ferramenta em branco. O Aura é um produto com propósito — cada módulo foi pensado para aquela necessidade específica, com UX dedicada.
- **"Por que não o Google?"** → O Google Calendar não tem finanças, hábitos, biblioteca ou IA de estudo. São produtos diferentes.
- **"Como você retém usuários?"** → O efeito de lock-in é natural: o histórico financeiro, os streaks de hábitos, as anotações — tudo está no Aura. Quanto mais o usuário usa, mais valioso fica o app para ele.
- **"E se um grande player copiar?"** → A velocidade de execução e o foco em produto são nosso moat por ora. E o relacionamento com a base de usuários leais é difícil de replicar.

---

*Documento gerado em abril de 2026. Aura — gestão de vida pessoal all-in-one.*
