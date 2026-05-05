# Sistema Sarau Secreto — Plano de Desenvolvimento

> **MVP desta noite:** Dashboard de insights que cruza dados Sympla + bar e entrega inteligência real para o sócio.

---

## 1. Nome & Identidade

**Nome do produto:** `Sistema Sarau Secreto`
**Domínio futuro:** `sistema.osarausecreto.com.br` (ou `gestao.osarausecreto.com.br`)
**Repositório:** `sarau-secreto` (separado do music-connect — são projetos distintos)
**Assets reutilizáveis do music-connect:**
- `public/brand/sarau-logo-black.png` → cópia direta
- `public/brand/sarau-logo-white.png` → cópia direta
- `public/og-sarau.png` → referência de identidade visual

---

## 2. Visão Final do Produto (onde isso chega)

```
Sistema Sarau Secreto
│
├── Módulo 1: Insights (AGORA)
│   ├── Import CSV Sympla
│   ├── Import CSV Bar
│   └── Dashboard inteligente
│
├── Módulo 2: Site Público (Fase 2)
│   ├── Landing do evento
│   ├── Venda de ingresso própria
│   └── Countdown + local secreto
│
├── Módulo 3: CRM de Público (Fase 3)
│   ├── Perfis de compradores
│   ├── Segmentação por frequência
│   └── Comunicação direta
│
├── Módulo 4: Operacional (Fase 4)
│   ├── Equipe + produção
│   ├── Fornecedores
│   └── Financeiro CNPJ
│
└── Módulo 5: Comunidade (Fase 5)
    ├── Clube do vinho
    ├── Artistas (canal Khem opcional)
    └── Automação IA
```

**Princípio arquitetural:** cada módulo é independente mas usa a mesma base (banco, auth, deploy). Construir a fundação certa no MVP garante que os módulos futuros apenas crescem sobre ela — não reescrevem.

---

## 3. Arquitetura Técnica

### Stack

| Camada | Tecnologia | Nota |
|--------|-----------|------|
| Frontend | React 19 + TypeScript + Vite 7 + Tailwind v4 | mesma stack do ecossistema |
| Backend | Fastify 5 + Prisma ORM | mesma stack do ecossistema |
| Banco | PostgreSQL via Neon (free tier) | |
| Deploy | Cloudflare Pages + Functions | gratuito |
| Auth | JWT + bcrypt | simples, sem OAuth por ora |
| Gráficos | Recharts | já decidido |
| CSV | Papaparse (FE) + multer (BE) | |
| Assets | Cloudflare R2 (futuro) | logos, OG images |

### Estrutura do Repositório

```
sarau-secreto/
├── packages/
│   ├── web/                     ← React 19 + Vite (frontend)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Events.tsx
│   │   │   │   ├── EventDetail.tsx
│   │   │   │   ├── Import.tsx
│   │   │   │   └── Comparison.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/          ← primitivos (Button, Card, Badge)
│   │   │   │   ├── charts/      ← wrappers Recharts
│   │   │   │   └── layout/      ← Sidebar, Header
│   │   │   ├── lib/
│   │   │   │   ├── api.ts       ← cliente HTTP tipado
│   │   │   │   └── utils.ts
│   │   │   └── types/
│   │   │       └── index.ts     ← tipos compartilhados FE
│   │   └── public/
│   │       └── brand/           ← logos do Sarau (copiar do music-connect)
│   │
│   └── api/                     ← Fastify 5 + Prisma (backend)
│       ├── prisma/
│       │   └── schema.prisma
│       └── src/
│           ├── routes/
│           │   ├── auth.ts
│           │   ├── events.ts
│           │   ├── import.ts
│           │   └── insights.ts
│           ├── lib/
│           │   ├── jwt.ts
│           │   ├── csv/
│           │   │   ├── sympla-parser.ts   ← parser específico Sympla
│           │   │   └── bar-parser.ts      ← parser flexível do bar
│           │   └── insights/
│           │       ├── overview.ts        ← agregados gerais
│           │       ├── event.ts           ← insights por evento
│           │       └── comparison.ts      ← evolução entre eventos
│           └── server.ts
│
├── package.json                 ← monorepo (npm workspaces)
├── turbo.json                   ← turborepo (build paralelo)
└── wrangler.jsonc               ← Cloudflare deploy
```

### Modelo de Dados (Prisma)

```prisma
// Event — o evento em si
model Event {
  id          String    @id @default(cuid())
  name        String
  date        DateTime
  venue       String?
  capacity    Int?
  symplaUrl   String?
  createdAt   DateTime  @default(now())
  tickets     Ticket[]
  barSales    BarSale[]
  imports     ImportBatch[]
}

// Ticket — ingresso importado do Sympla
model Ticket {
  id            String   @id @default(cuid())
  eventId       String
  event         Event    @relation(fields: [eventId], references: [id])
  buyerName     String?
  buyerEmail    String?
  ticketType    String   // meia, inteira, vip, gratuito
  price         Float
  purchasedAt   DateTime?
  checkedIn     Boolean  @default(false)
  checkedInAt   DateTime?
  paymentMethod String?
  batchId       String
  batch         ImportBatch @relation(fields: [batchId], references: [id])
}

// Product — catálogo do bar
model Product {
  id        String    @id @default(cuid())
  name      String
  category  String    // cerveja, vinho, drink, agua, comida
  price     Float
  barSales  BarSale[]
}

// BarSale — venda do bar
model BarSale {
  id          String   @id @default(cuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id])
  productId   String?
  product     Product? @relation(fields: [productId], references: [id])
  productName String   // raw (caso produto não exista no catálogo)
  category    String?
  quantity    Int
  unitPrice   Float
  total       Float
  soldAt      DateTime?
  paymentMethod String?
  batchId     String
  batch       ImportBatch @relation(fields: [batchId], references: [id])
}

// ImportBatch — rastreio de importações
model ImportBatch {
  id        String    @id @default(cuid())
  eventId   String
  event     Event     @relation(fields: [eventId], references: [id])
  type      String    // sympla | bar
  fileName  String
  rowCount  Int
  createdAt DateTime  @default(now())
  createdBy String
  tickets   Ticket[]
  barSales  BarSale[]
}

// User — sócios e admins
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("admin") // admin | viewer
  createdAt DateTime @default(now())
}
```

---

## 4. MVP — O Que Entregar Esta Noite

### Objetivo do MVP
> Um sócio entra no sistema, faz upload dos CSVs do Sympla e do bar de um evento, e vê insights reais: quantas pessoas vieram, quanto gastaram no bar, quais produtos venderam mais, horário de pico, e quanto a edição rendeu ao total.

### Escopo do MVP (sem cortar o essencial)

**✅ Incluído:**
- Auth (login JWT — 1 usuário fixo seed)
- CRUD de Eventos (criar, listar, ver detalhes)
- Import CSV Sympla (upload → preview → confirmar)
- Import CSV Bar (upload → preview → confirmar)
- Parser flexível (auto-detecta colunas em PT/EN)
- Dashboard Overview (todos os eventos)
- Dashboard de Evento (insights de uma edição)
- 8 insights cruzados (ver seção 5)

**❌ Fora do MVP:**
- Comparativo entre eventos (Fase 1.1)
- Site público
- CRM
- OAuth / multi-usuário
- Mobile / PWA

---

## 5. Os 8 Insights do MVP

Estes são os insights que cruzam Sympla + bar e têm valor real para o sócio:

### 1. Receita Total do Evento
```
Receita Ingressos (Sympla) + Receita Bar = Total da Edição
```
*Por que importa: visão consolidada de faturamento por edição*

### 2. Gasto per Capita no Bar
```
Receita Bar ÷ Pessoas que Fizeram Check-in
```
*Por que importa: mede o comportamento de consumo por pessoa presente*

### 3. Taxa de Conversão (Ingresso → Bar)
```
Pessoas que fizeram check-in vs. Total de ingressos vendidos
(No-show rate como inverso)
```
*Por que importa: entender perda de receita potencial*

### 4. Timeline de Vendas de Ingresso
```
Gráfico: Vendas por semana/dia antes do evento
(antecipado, dia antes, dia do evento)
```
*Por que importa: saber quando comunicar, quando lançar lotes*

### 5. Vendas do Bar por Horário
```
Gráfico: Receita bar por hora durante o evento
(19h, 20h, 21h, 22h, 23h, 00h...)
```
*Por que importa: pico de demanda = escalar equipe no horário certo*

### 6. Ranking de Produtos
```
Top 10 produtos por volume e por receita
```
*Por que importa: comprar mais do que vende, tirar o que não vende*

### 7. Mix de Receita
```
Gráfico pizza: % ingressos vs % bar na receita total
```
*Por que importa: entender dependência de cada fonte*

### 8. Comparativo por Tipo de Ingresso
```
Meia entrada vs. Inteira vs. VIP — quantidade e receita gerada
```
*Por que importa: calibrar precificação dos próximos lotes*

---

## 6. Parser CSV — Estratégia

O maior risco técnico é o CSV do bar — não existe um formato padrão.
A solução é um parser em duas camadas:

### Sympla (padrão conhecido)
```typescript
// Colunas esperadas do Sympla (export padrão):
// Nome, Email, Tipo de Ingresso, Valor, Data de Compra, Check-in, Horário do Check-in, Forma de Pagamento
const SYMPLA_MAP = {
  buyerName: ['nome', 'name', 'comprador'],
  buyerEmail: ['email', 'e-mail'],
  ticketType: ['tipo de ingresso', 'ticket type', 'tipo'],
  price: ['valor', 'value', 'price', 'preço'],
  purchasedAt: ['data de compra', 'purchase date', 'data'],
  checkedIn: ['check-in', 'checked in', 'presença'],
  checkedInAt: ['horário do check-in', 'check-in time'],
  paymentMethod: ['forma de pagamento', 'payment method'],
}
```

### Bar (flexível)
```typescript
// Colunas comuns de sistemas de bar (iFood, Stone, sistema próprio):
const BAR_MAP = {
  productName: ['produto', 'item', 'descrição', 'product', 'name'],
  category: ['categoria', 'category', 'grupo'],
  quantity: ['quantidade', 'qty', 'qtd', 'amount'],
  unitPrice: ['preço unitário', 'valor unit', 'unit price', 'preço'],
  total: ['total', 'subtotal', 'valor total'],
  soldAt: ['horário', 'hora', 'time', 'data', 'datetime'],
  paymentMethod: ['pagamento', 'payment', 'forma'],
}
// Se total não existir: total = quantity * unitPrice
// Se soldAt não existir: marca como null (sem timeline, mas ainda importa)
```

**Preview antes de confirmar:** mostrar 5 linhas mapeadas ao usuário para ele validar antes de salvar no banco. Isso evita importação errada.

---

## 7. Design Visual

O Sistema Sarau Secreto tem identidade própria — **não** é o tiagohanna.com.

**Paleta:**
- Background: `#0a0a0a` (preto profundo)
- Surface: `#111111` / `#1a1a1a`
- Accent: `#c8a96e` (dourado/âmbar — remetendo ao jazz, velas, noite)
- Accent 2: `#8b5cf6` (violeta — mistério, o local secreto)
- Texto: `#f5f0e8` (off-white quente)
- Success: `#22c55e` | Error: `#ef4444`

**Tom do dashboard:** noturno, elegante, minimal. Nada de cores néon.
Fontes: `Inter` (interface) + `Playfair Display` (headings opcionais)

**Logo:** usar `sarau-logo-white.png` do music-connect diretamente.

---

## 8. API Endpoints (MVP)

```
POST /api/auth/login
GET  /api/auth/me

GET  /api/events
POST /api/events
GET  /api/events/:id

POST /api/import/sympla          ← multipart/form-data, eventId no body
POST /api/import/bar             ← multipart/form-data, eventId no body
GET  /api/import/preview/sympla  ← recebe file, retorna 5 linhas mapeadas
GET  /api/import/preview/bar     ← recebe file, retorna 5 linhas mapeadas
GET  /api/imports                ← histórico por evento

GET  /api/insights/overview      ← todos os eventos, KPIs gerais
GET  /api/insights/event/:id     ← os 8 insights de um evento específico
```

---

## 9. Sequência de Implementação (Esta Noite)

### Fase A: Fundação (30min)
- [ ] A1. Criar repositório `sarau-secreto` com estrutura monorepo
- [ ] A2. Setup Fastify 5 + Prisma + PostgreSQL (Neon)
- [ ] A3. Setup React 19 + Vite + Tailwind v4
- [ ] A4. Copiar logos do music-connect
- [ ] A5. Schema Prisma + migrate + seed (1 usuário admin + 1 evento de exemplo)

### Fase B: Backend Core (45min)
- [ ] B1. Auth (login + JWT middleware)
- [ ] B2. Route /api/events (CRUD básico)
- [ ] B3. Parser Sympla (+ testes unitários com fixture CSV)
- [ ] B4. Parser Bar (+ testes com fixture CSV)
- [ ] B5. Route /api/import (preview + confirmar)

### Fase C: Insights Engine (30min)
- [ ] C1. Aggregator: receita total (ingressos + bar)
- [ ] C2. Aggregator: gasto per capita, no-show rate
- [ ] C3. Aggregator: timeline de ingressos
- [ ] C4. Aggregator: vendas do bar por hora
- [ ] C5. Aggregator: ranking de produtos
- [ ] C6. Route /api/insights/overview + /api/insights/event/:id

### Fase D: Frontend (60min)
- [ ] D1. Layout base (Sidebar + Header com logo)
- [ ] D2. Página Login
- [ ] D3. Página Dashboard (overview com KPIs)
- [ ] D4. Página Eventos (lista)
- [ ] D5. Página Import (upload → preview → confirmar)
- [ ] D6. Página Evento (os 8 insights com gráficos)

### Fase E: Deploy (15min)
- [ ] E1. Wrangler config (Cloudflare Pages + Functions)
- [ ] E2. Variáveis de ambiente (DATABASE_URL, JWT_SECRET)
- [ ] E3. Deploy + smoke test

**Total estimado: ~3h**

---

## 10. Dados de Teste

Para o MVP funcionar antes de ter CSVs reais, criar fixtures:

**`packages/api/src/fixtures/sympla-sample.csv`**
```csv
Nome,Email,Tipo de Ingresso,Valor,Data de Compra,Check-in,Horário do Check-in,Forma de Pagamento
João Silva,joao@email.com,Inteira,40.00,2024-11-01 14:30,Sim,2024-11-16 20:15,Cartão de Crédito
Maria Santos,maria@email.com,Meia Entrada,20.00,2024-11-08 09:00,Sim,2024-11-16 21:00,PIX
...
```

**`packages/api/src/fixtures/bar-sample.csv`**
```csv
Produto,Categoria,Quantidade,Preço Unitário,Total,Horário,Forma de Pagamento
Cerveja Artesanal,Cerveja,3,18.00,54.00,21:30,PIX
Vinho Tinto,Vinho,2,35.00,70.00,22:00,Cartão
...
```

---

## 11. Próximas Versões (pós-MVP)

| Versão | O Que Adicionar |
|--------|----------------|
| 1.1 | Comparativo entre eventos (gráfico de evolução) |
| 1.2 | Exportar PDF/PNG do dashboard de um evento |
| 2.0 | Site público do evento (countdown + local secreto + ingressos) |
| 3.0 | CRM: perfis de compradores frequentes |
| 4.0 | Financeiro CNPJ + controle de equipe |

---

## Referências

- Logos: `/mnt/c/Users/User/Documents/GitHub/music-connect/public/brand/`
- Boilerplate base: `~/.hermes/sarau-boilerplate/`
- Arquitetura detalhada anterior: `/home/ser/sarau-secreto-arquitetura.md`
