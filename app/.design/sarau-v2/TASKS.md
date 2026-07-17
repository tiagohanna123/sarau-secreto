# Tasks: Sarau Secreto v2

## Prioridade e Ordem

### [P0] Consertar Inconsistencias Criticas

**T-001**: Substituir cores hardcoded na pagina Financeiro por variaveis CSS
- Arquivo: `src/app/financeiro/page.tsx`
- O que: `bg-[#111]` → `bg-card`, `border-[#1e1e1e]` → `border-border`, `text-white` → `text-foreground`
- Impacto: Pagina quebrando coesao visual do sistema

**T-002**: Remover classes CSS legadas do index.css que tem equivalentes no design system
- Arquivo: `src/index.css` + `src/app/eventos/list.tsx`
- O que: `.btn-primary`, `.btn-ghost`, `.btn-violet`, `.kpi-card`, `.section-card`, `.input-field`, `.badge-gold`, `.badge-violet`, `.data-table`
- Migrar usos para componentes React equivalentes

**T-003**: Substituir classes CSS legadas em eventos/list.tsx por componentes do design system
- Arquivo: `src/app/eventos/list.tsx`
- O que: `.kpi-card` → `SarauKPI` ou `SarauSection`; botoes CSS → `SarauButton`
- Impacto: Pagina de eventos usando 2 sistemas paralelos

### [P1] Refinamentos Visuais

**T-004**: Adicionar tokens de sombra e radius no @theme do index.css
- Arquivo: `src/index.css`
- O que: Adicionar `--shadow-*`, `--radius-*`, `--transition-*`, `--easing-*`

**T-005**: Adicionar AnimatePresence para transicoes entre paginas
- Arquivo: `src/app.tsx`
- O que: Envolver conteudo com framer-motion AnimatePresence + motion.div com fade

**T-006**: Login glow orbs responsivas
- Arquivo: `src/app/login.tsx`
- O que: Substituir `top: 30%` / `right: 60%` por posicoes que nao vazem em mobile

**T-007**: PageHeader com breadcrumb em paginas aninhadas (evento > eventos)
- Arquivo: `src/app/eventos/detail.tsx`
- O que: Indicador visual "Eventos > Nome do Evento"

### [P2] Acessibilidade e Qualidade

**T-008**: Adicionar focus-visible ring em todos os botoes e inputs
- Ja existe parcialmente no btnBase. Verificar componentes que nao tem.

**T-009**: Verificar contraste gold #c8a96e sobre background #0a0a0a
- Precisaria de ferramenta externa. Provavelmente aceitavel para destaque (nao texto corrido).

**T-010**: Centralizar EmptyState — usar componente padrao em todas as paginas

## Execucao Imediata (rodada atual)

Vou executar nesta ordem:
1. T-001: Financeiro → corrigir hardcoded colors
2. T-004: index.css → adicionar tokens faltantes
3. T-002/T-003: eventos/list → migrar de classes CSS para design system
4. T-006: login → orbs responsivas
