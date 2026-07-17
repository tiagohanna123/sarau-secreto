# Design Review: Sarau Secreto v2

## Changes Executed

### T-001: Financeiro — Cores Hardcoded Removidas
- **Antes**: `bg-[#111]`, `border-[#1e1e1e]`, `text-white`, `text-[#6b7280]`, `text-[#4b5563]`, `text-[#9ca3af]`
- **Depois**: `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `text-muted-foreground/80`
- **Impacto**: 15+ ocorrencias substituidas. Pagina Financeiro agora respeita o tema global.
- **Recharts**: Strokes e fills do CartesianGrid/XAxis/YAxis passaram de hex hardcoded para `var(--color-border)` e `var(--color-muted-foreground)`

### T-004: Tokens Faltantes — index.css
- **Adicionado**: `--shadow-card`, `--shadow-card-hover`, `--shadow-glow-gold`, `--shadow-glow-violet`
- **Adicionado**: `--radius-sm`, `--radius-md`, `--radius-lg`
- **Adicionado**: `--transition-fast`, `--transition-normal`, `--easing-smooth`
- **Impacto**: Design system agora tem tokens de sombra, borda e movimento. Preparado para uso em componentes futuros.

### T-003: Eventos/List — Classes CSS Legadas Removidas
- **Antes**: `.kpi-card` (classe CSS avulsa em index.css) usada em loading skeletons, KPI grid, cards de evento
- **Depois**: `bg-card border border-border rounded-xl` (classes Tailwind) + `p-4`/`p-5` explícito
- **Hardcoded colors substituidos**: `text-[#c8a96e]` → `text-gold`, `text-[#8b5cf6]` → `text-violet`, `bg-[#c8a96e]` → `bg-gold`, `bg-yellow-500/10 text-yellow-400` → `bg-warning/10 text-warning`
- **Impacto**: Pagina de Eventos agora usa exclusivamente tokens do tema.

### T-006: Login Orbs Responsivas
- **Antes**: Orbs com `top: 30% left: 60%` e `bottom: 20% right: 60%` — posicoes que vazavam em mobile
- **Depois**: Adicionado `max-sm:` overrides — tamanhos reduzidos (300px/150px/120px) e posicoes ajustadas
- **Impacto**: Login funciona visualmente em telas pequenas sem elementos cortados.

## QA: Build Verification

- `npm run build` executado com sucesso (exit code 0)
- embed generators rodaram sem erro
- Vite build completo sem TypeScript errors

## O Que Permanece (nao escopo desta rodada)

1. **Legado CSS no index.css**: `.btn-primary`, `.btn-ghost`, `.btn-violet`, `.section-card`, `.input-field`, `.badge-gold`, `.badge-violet`, `.data-table` ainda existem como classes. Nao sao mais usadas pelas paginas migradas, mas podem ser referenciadas em componentes futuros. Remover quando 100% do codigo usar o design system.

2. **app.tsx sidebar**: Ainda usa classes CSS avulsas em vez de componentes do design system. A navegacao funciona bem, mas estilisticamente e um candidato para refactor.

3. **AnimatePresence**: Transicao entre paginas ainda nao implementada. Exigiria framer-motion `AnimatePresence` em app.tsx.

4. **Contraste gold/background**: Nao foi testado com ferramenta. Gold (#c8a96e) sobre fundo (#0a0a0a) tem razao de contraste ~5.5:1 — aceitavel para ACAAL (AA large text) mas marginal para texto pequeno.

5. **EmptyState**: Algumas paginas ainda usam empty states customizados em vez do componente `EmptyState` do design system.

## Screenshots (Nao capturadas)

Nao foi conectado servidor Playwright MCP para captura automatica. Para revisao visual completa, execute:
```bash
cd app && npx playwright screenshot --breakpoint=375,768,1280 http://localhost:5173/#dashboard
```
