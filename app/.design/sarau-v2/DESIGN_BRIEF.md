# Design Brief: Sarau Secreto v2 — Sistema de Gestao

## Problem

O Sarau Secreto e um festival privado de musica que precisa de um sistema de gestao rapido, confiavel e agradavel de usar. O gestor (Tiago) precisa acessar dados de eventos, receitas, bar, artistas e metas sem atrito — em qualquer dispositivo, a qualquer hora. O sistema atual funciona mas tem inconsistencias visuais, valores hardcoded em paginas soltas e falta de coesao entre componentes legados e o design system.

## Solution

Refinar o design system existente, eliminar inconsistencias (hex hardcoded, classes CSS avulsas vs design system), e elevar a identidade visual jazz club para o nivel de produto premium.

## Experience Principles (max 3)

1. **Atmosfera jazz club** — Cada tela deve evocar a experiencia de um clube noturno intimista. O dourado nao e decoracao, e sinal de qualidade. O violeta nao e cor secundaria, e o segredo.

2. **Dados como narrativa** — Numeros nao sao apenas numeros. Eles contam a historia de cada edicao. KPIs, graficos e tabelas devem convidar a exploracao, nao apenas informar.

3. **Atrito zero** — O gestor nao deve pensar em navegacao, em estados de carregamento, ou em onde esta. Mobile-first, responsivo, tudo instantaneo ou com feedback claro.

## Aesthetic Direction

- **Philosophy**: Editorial Jazz Club — tipografia como elemento central, atmosfera noturna, dados como narrativa visual.
- **Tone**: Sofisticado, intimo, direto. Nada de brilhos superficiais. Cada detalhe comunica "isso foi pensado."
- **Reference points**: Linear.app (UX clean), Pitch.com (apresentacao de dados), Dunkhi (dark mode com personalidade).
- **Anti-references**: Planilhas do Excel. Dashboards corporate cinzas. Interfaces que parecem templates Bootstrap.

## Existing Patterns

### Design System Atual (src/lib/design-system.tsx)
- `SarauButton` — 5 variantes (primary, ghost, violet, danger, outline), 3 sizes
- `SarauInput` — com label, error state, focus border gold
- `SarauSelect` — wrapper padrao
- `SarauSection` — card com titulo + borda, hover gold glow
- `SarauTabs` — pill style tipo Linear
- `SarauKPI` — card com label/value/sub/trend indicator
- `SarauBadge` — 6 variantes (gold, violet, success, danger, warning, neutral)
- `GoldDivider` — gradiente dourado
- `PageHeader` — titulo + subtitulo + source indicator
- `EmptyState` — icone + titulo + descricao
- `SarauTable` — wrapper com overflow-x

### Design System Atual (src/index.css)
- Tema `@theme` com cores oklch + fallback hex Safari
- 3 fontes: Butik Display (display), Anisette (heading), Inter (sans), JetBrains Mono (mono)
- Sidebar com classes `.sidebar`, `.nav-item`, `.sidebar-logo`
- Cards: `.kpi-card`, `.section-card`
- Botoes: `.btn-primary`, `.btn-ghost`, `.btn-violet` (redundantes com design-system.tsx)
- Input: `.input-field`
- Badges: `.badge-gold`, `.badge-violet`
- Animacoes: gold-breathe, gold-glow, violet-float, gold-shimmer, card-fade-up
- Table: `.data-table`
- Ripple effect: `.btn-ripple`
- Scrollbar customizada
- Tab fade: `.tab-fade-enter`

### Arcabouco
- React 19 + Tailwind CSS v4 + framer-motion + recharts + lucide-react + sonner
- Hash-based SPA router (useRouter custom hook)
- AuthProvider + DataProvider + PeriodProvider
- lazy loading em paginas
- Mobile: bottom nav + sidebar overlay
- Desktop: sidebar fixa + conteudo

## Issues Identified

1. **Componentes CSS legados convivem com design system** — `.btn-primary`, `.kpi-card`, `.section-card`, `.input-field`, `.badge-gold` existem como classes CSS avulsas, enquanto `SarauButton`, `SarauKPI`, `SarauSection`, `SarauInput`, `SarauBadge` existem como componentes React. Isso cria 2 caminhos para a mesma coisa.

2. **Pagina financeiro com cores hardcoded** — `src/app/financeiro/page.tsx` usa `bg-[#111]`, `border-[#1e1e1e]`, `text-white` em vez de variaveis CSS.

3. **LoginPage com orbs posicionadas em porcentagem** — glow orbs usam `top: 30%` e `right: 60%` sem fallback em mobile.

4. **EmptyState inconsistente** — `src/lib/ui.tsx` exporta `EmptyState` mas paginas como eventos tem suas proprias versoes de empty state.

5. **DataTable como classe CSS e como wrapper component** — `.data-table` e classe global, `SarauTable` e componente.

## Component Inventory

| Component | Status | Notes |
|-----------|--------|-------|
| SarauButton | Ativo | Usado em settings, import |
| CSS .btn-primary/.btn-ghost/.btn-violet | Legado | Usado em eventos/list, app.tsx sidebar |
| SarauInput | Ativo | Pouco usado, login usa input raw |
| CSS .input-field | Legado | Definido mas sem uso claro |
| SarauSection | Ativo | Dashboard usa |
| CSS .section-card | Legado | Definido mas sem uso claro |
| SarauKPI | Ativo | Dashboard usa |
| CSS .kpi-card | Legado | Usado em eventos/list |
| SarauBadge | Ativo | Dashboard usa |
| CSS .badge-gold/.badge-violet | Legado | Definido sem uso claro |
| SarauTabs | Ativo | Insights page |
| GoldDivider | Ativo | Login page |
| PageHeader | Ativo | Dashboard, eventos |
| EmptyState | Ativo | Dashboard |
| SarauTable | Ativo | Definido mas pouco usado |
| CSS .data-table | Legado | Definido sem uso claro |
| Sidebar (JSX in app.tsx) | Ativo | Navegacao principal desktop |
| BottomNav (JSX in app.tsx) | Ativo | Navegacao principal mobile |

## Responsive Behavior

- Mobile: < 1024px — bottom nav + sidebar overlay com backdrop
- Desktop: >= 1024px — sidebar fixa a esquerda
- Content area: max-w-7xl (80rem) com padding responsivo p-4 sm:p-6
- Grids: 2 col mobile, 4 col tablet, 5 col desktop
- Tipografia responsiva via Tailwind breakpoints

## Accessibility Requirements

- Contraste: paleta atual precisa ser verificada (gold #c8a96e sobre fundo #0a0a0a pode ter contraste baixo)
- Navegacao por teclado: botoes e inputs precisam de focus-visible ring
- Screen reader: icones decorativos precisam de aria-hidden
- Loading states com aria-live="polite"

## Out of Scope

- Tema claro (Sarau e noturno por natureza)
- PWA / service workers
- Testes E2E
- Backend / API
- Autenticacao OAuth
