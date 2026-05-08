# Sarau Secreto — Sistema de Gestao

Sistema web completo para gestao financeira, operacional e de inteligencia de dados do Sarau Secreto. Centraliza vendas de ingressos (Sympla), consumo de bar (CSV), dados de bilheteria ao vivo (Yuzer Eagle) e metricas de artistas em um unico dashboard.

Funciona com ou sem servidor: em modo offline, o frontend exibe dados embedados para demonstracao imediata.

---

## Stack

### Frontend

| Tecnologia | Versao | Uso |
|---|---|---|
| React | 19 | UI declarativa |
| TypeScript | 5.7 | Tipagem estatica |
| Vite | 7 | Bundler e dev server |
| Tailwind CSS | 4.1 | Estilizacao utility-first |
| Recharts | 2.15 | Graficos e charts |
| Framer Motion | 12.6 | Animacoes |
| Lucide React | 0.484 | Icones |
| PapaParse | 5.5 | Parsing de CSV no browser |
| date-fns | 4.1 | Manipulacao de datas |
| class-variance-authority + tailwind-merge | — | Design system e variantes de componentes |
| sonner | 2.0 | Notificacoes toast |

### Backend (API)

| Tecnologia | Versao | Uso |
|---|---|---|
| Fastify | 5.3 | Framework HTTP |
| Prisma | 6.6 | ORM e migrations |
| SQLite | — | Banco de dados relacional |
| Zod | 3.24 | Validacao de schemas |
| JWT (@fastify/jwt) | 9.1 | Autenticacao stateless |
| bcryptjs | 2.4 | Hash de senhas |
| @fastify/cors | 11 | CORS |
| @fastify/multipart | 10 | Upload de arquivos |
| @fastify/rate-limit | 10 | Rate limiting |
| PapaParse | 5.5 | Parsing de CSV no servidor |

### Integracoes

| Integracao | Descricao |
|---|---|
| Yuzer Eagle API | Dados de vendas ao vivo e historico offline |
| Sympla API | Ingressos vendidos, eventos, participantes |

### Scripts de Automacao (pacotes/api/scripts/)

- `sympla-auto-sync.ts` — Sincroniza eventos, pedidos e participantes da Sympla API direto no banco
- `sympla-full-sync.sh` — Sync completo com fallback via cookies do navegador
- `sympla-full-import.py` — Importacao bulk via Python
- `sympla-aggregate-import.py` / `sympla-aggregate-import.sh` — Importacao agregada multi-evento
- `sympla-session-sync.sh` — Sync por sessao com renovacao de cookie
- `sympla-browser-sync.py` — Automacao via browser para login na Sympla
- `cleanup-sync.ts` — Limpeza de registros duplicados
- `check-dupes.ts` — Verificacao de duplicatas

---

## Funcionalidades

- Dashboard com KPIs agregados (receita total, tickets vendidos, bar, per capita)
- Gestao de eventos (CRUD completo + detalhamento por evento)
- Dashboard financeiro com graficos de receita x bar x ingressos
- Comparativo entre eventos lado a lado
- Insights avancados: CAGR, Pareto (80/20), correlacoes, analise de convergencia
- Cadastro e gestao de artistas com participacao em eventos
- Importacao de dados: CSV da Sympla e CSV de bar
- Integracao Yuzer Eagle: vendas ao vivo + historico offline
- Fallback offline embutido com dados de demonstracao
- Login JWT com modo demo integrado

---

## Setup Local

### Pre-requisitos

- Node.js 20+
- npm 10+

### Passo a passo

```bash
# 1. Clonar o repositorio
git clone <repo-url> sarau-secreto
cd sarau-secreto

# 2. Instalar dependencias (frontend + API)
npm install
cd packages/api && npm install && cd ../..

# 3. Configurar variaveis de ambiente
cp packages/api/.env.example packages/api/.env
# Editar packages/api/.env conforme necessario (para development o padrao ja funciona com SQLite)

# 4. Rodar migrations do Prisma
npm run db:migrate

# 5. Popular banco com dados de demonstracao
npm run seed

# 6. Iniciar em modo desenvolvimento (frontend + API simultaneamente)
npm run dev:all
```

Acessar o frontend em http://localhost:5173

A API roda em http://localhost:3002 (proxy configurado no Vite)

### Variaveis de Ambiente (packages/api/.env)

```
DATABASE_URL="file:./prisma/dev.db"     # SQLite local (dev) ou URL do Neon (prod)
JWT_SECRET="seu-secret-aqui"            # Chave para assinatura dos tokens
PORT=3002                                # Porta do servidor API
NODE_ENV=development                      # development | production

# Sympla
SYMPLA_TOKEN="seu-token-aqui"
SYMPLA_API_BASE="https://api.sympla.com.br/public/v1.5.1"

# Yuzer Eagle
YUZER_API_BASE="https://api.eagle.yuzer.com.br/api"
YUZER_MASTER_COMPANY_ID="305"
YUZER_TOKEN_FILE="/caminho/para/token.txt"
YUZER_SALES_PANELS="27577,30670,33546"
```

---

## Scripts Disponiveis

### Raiz (frontend + orquestracao)

| Script | Descricao |
|---|---|
| `npm run dev` | Inicia Vite dev server (frontend apenas) |
| `npm run dev:api` | Inicia API Fastify com hot-reload |
| `npm run dev:all` | Frontend + API simultaneamente (concurrently) |
| `npm run build` | Build de producao (Prisma generate + Vite build) |
| `npm run preview` | Preview do build de producao |
| `npm run seed` | Popula banco com dados demo |
| `npm run db:studio` | Abre Prisma Studio (editor visual do banco) |
| `npm run db:migrate` | Executa migrations do Prisma |
| `npm run db:generate` | Gera Prisma Client |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

### API (packages/api)

| Script | Descricao |
|---|---|
| `npm run dev` | API com hot-reload |
| `npm run build` | Compila TypeScript |
| `npm run start` | Sobe em producao (dist/) |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:migrate` | Migrations dev |
| `npm run prisma:deploy` | Migrations producao |
| `npm run prisma:studio` | Prisma Studio |
| `npm run seed` | Seed do banco |

---

## Deploy

### Frontend (Cloudflare Pages)

O frontend e uma SPA React pura. O build gera arquivos estaticos em `dist/`.

```bash
npm run build
# Enviar a pasta dist/ para Cloudflare Pages
# Configurar rotas SPA: adicionar regra de rewrite para /* -> /index.html
```

### API (Servidor Node.js)

A API Fastify pode ser deployada em qualquer provedor que suporte Node.js:

```bash
cd packages/api
npm run build
npm run start
```

Configurar as variaveis `DATABASE_URL`, `JWT_SECRET` e `PORT` no ambiente de producao.

Para banco de dados em producao, recomenda-se usar Neon (PostgreSQL serverless) ou outro provider PostgreSQL. Ajustar `DATABASE_URL` no `.env` e o provider em `schema.prisma` de `sqlite` para `postgresql`.

---

## Estrutura de Diretorios

```
sarau-secreto/
├── src/                        # Frontend React
│   ├── app.tsx                 # Aplicacao principal (router, sidebar, layout)
│   ├── main.tsx                # Entry point
│   ├── index.css               # Estilos globais + Tailwind
│   ├── app/                    # Paginas
│   │   ├── login.tsx           # Tela de login
│   │   ├── insights/           # Dashboard principal + insights
│   │   │   ├── dashboard.tsx   # KPI dashboard
│   │   │   └── page.tsx        # Insights avancados
│   │   ├── eventos/            # Gestao de eventos
│   │   │   ├── list.tsx        # Lista de eventos
│   │   │   └── detail.tsx      # Detalhamento por evento
│   │   ├── financeiro/         # Dashboard financeiro
│   │   │   └── page.tsx        # Receita x bar x ingressos
│   │   ├── comparativo/        # Comparativo entre eventos
│   │   │   └── page.tsx        # Tabela comparativa
│   │   ├── metas/              # Metas e projecoes
│   │   │   └── page.tsx
│   │   ├── artistas/           # Gestao de artistas
│   │   │   ├── list.tsx        # Lista de artistas
│   │   │   └── detail.tsx      # Perfil do artista
│   │   ├── import/             # Importacao de dados
│   │   │   └── page.tsx        # Upload Sympla CSV / bar CSV
│   │   └── settings/           # Configuracoes
│   │       └── page.tsx
│   └── lib/                    # Utilitarios e providers
│       ├── api.ts              # Cliente HTTP + fallback offline
│       ├── auth.tsx            # Contexto de autenticacao
│       ├── data-context.tsx    # Contexto de dados globais
│       ├── period-context.tsx  # Filtro de periodo
│       ├── period-filter.tsx   # Componente seletor de periodo
│       ├── chart-renderer.tsx  # Renderizacao de graficos
│       ├── design-system.tsx   # Componentes de UI do design system
│       ├── ui.tsx              # Componentes base (button, card, input, etc.)
│       └── toast.tsx           # Sistema de notificacoes
├── packages/api/               # Backend Fastify
│   ├── src/
│   │   ├── index.ts            # Entry point do servidor
│   │   ├── routes/             # Rotas HTTP
│   │   │   ├── auth.ts         # Login / me
│   │   │   ├── events.ts       # CRUD de eventos
│   │   │   ├── import.ts       # Upload Sympla CSV / bar CSV
│   │   │   ├── insights.ts     # Overview, evento, comparacao
│   │   │   ├── convergence.ts  # Analise de convergencia
│   │   │   ├── yuzer.ts        # Integracao Yuzer Eagle
│   │   │   ├── sympla-sync.ts  # Sincronizacao Sympla
│   │   │   └── artists.ts      # CRUD de artistas
│   │   └── lib/                # Bibliotecas internas
│   │       ├── convergence-engine.ts  # Motor de convergencia
│   │       ├── cost-allocation.ts     # Alocacao de custos
│   │       ├── sympla.ts              # Helper Sympla
│   │       ├── sympla-api.ts          # Cliente Sympla API
│   │       ├── utils.ts               # Utilitarios gerais
│   │       ├── yuzer.ts               # Helper Yuzer
│   │       └── yuzer-history.ts       # Historico Yuzer offline
│   ├── prisma/
│   │   ├── schema.prisma       # Schema do banco de dados
│   │   ├── migrations/         # Migrations versionadas
│   │   └── seed.ts             # Dados de demonstracao
│   └── scripts/                # Scripts de automacao
│       ├── sympla-auto-sync.ts
│       ├── sympla-full-sync.sh
│       ├── sympla-full-import.py
│       ├── sympla-aggregate-import.py
│       ├── sympla-aggregate-import.sh
│       ├── sympla-session-sync.sh
│       ├── sympla-browser-sync.py
│       ├── cleanup-sync.ts
│       ├── check-dupes.ts
│       └── sympla-sync.ts
├── public/                     # Assets estaticos (logo, etc.)
├── scripts/                    # Scripts de build
│   └── build.sh                # Pipeline de build (Prisma + Vite)
├── package.json                # Dependencias do frontend
├── vite.config.ts              # Configuracao do Vite
├── tsconfig.json               # TypeScript config
└── .gitignore
```

---

## Credenciais de Demonstracao

```
Email: admin@osarausecreto.com
Senha: sarau2024
```

O sistema funciona em modo totalmente offline: caso a API nao esteja disponivel, o login e feito localmente e os dados sao carregados de datasets embedados no frontend. Isso permite testar todas as funcionalidades sem necessidade de configurar o backend.

---

## Modelo de Dados

O banco SQLite e gerenciado via Prisma ORM com os seguintes modelos:

- **User** — Usuarios do sistema (autenticacao)
- **Event** — Eventos com metadata (data, local, capacidade, status)
- **Ticket** — Ingressos vendidos (comprador, tipo, valor, check-in)
- **Product** — Produtos de bar (nome, categoria, precos)
- **BarSale** — Vendas de bar (produto, quantidade, total, metodo de pagamento)
- **Artist** — Artistas (nome, genero, contato, redes sociais)
- **EventArtistJoin** — Relacionamento N:N entre eventos e artistas
- **ImportBatch** — Historico de importacoes (fonte, registros, status)
- **SymplaSync** — Registro de sincronizacoes com a Sympla

---

## Licenca

Uso interno — Sarau Secreto.
