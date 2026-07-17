# Design Tokens: Sarau Secreto v2

## Sistema de Tokens

O Sarau Secreto usa `@theme` do Tailwind CSS v4 para definir tokens como CSS custom properties. Abaixo os tokens atuais + os que serao adicionados.

## Color Tokens (Atuais)

```css
--color-background: oklch(0.08 0 0);            /* #0a0a0a — fundo */
--color-foreground: oklch(0.95 0.01 80);        /* texto principal */
--color-muted: oklch(0.12 0.005 75);            /* superficie sutil */
--color-muted-foreground: oklch(0.50 0.03 80);  /* texto secundario */

--color-gold: oklch(0.72 0.10 75);              /* #c8a96e — acento principal */
--color-gold-dim: oklch(0.65 0.08 75);           /* gold hover/borda */
--color-gold-glow: oklch(0.72 0.10 75 / 0.15);  /* gold glow fundo */

--color-violet: oklch(0.55 0.22 290);           /* #8b5cf6 — acento secundario */
--color-violet-dim: oklch(0.45 0.18 290);        /* violet hover/borda */
--color-violet-glow: oklch(0.55 0.22 290 / 0.15); /* violet glow fundo */

--color-accent: oklch(0.72 0.10 75);            /* alias para gold */
--color-secondary: oklch(0.55 0.22 290);         /* alias para violet */

--color-border: oklch(0.72 0.10 75 / 0.12);     /* bordas */
--color-card: oklch(0.11 0.01 75);              /* fundo card */
--color-card-hover: oklch(0.14 0.015 75);        /* card hover */

--color-success: oklch(0.70 0.18 145);           /* verde */
--color-warning: oklch(0.75 0.15 85);            /* amarelo */
--color-danger: oklch(0.65 0.22 25);             /* vermelho */
```

## Font Tokens (Atuais)

```css
--font-display: 'Butik Display', 'Bodoni Moda', Georgia, serif;
--font-heading: 'Anisette', 'Fredoka', system-ui, sans-serif;
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

## Tokens a Adicionar

```css
/* Elevacao / Sombras */
--shadow-card: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
--shadow-card-hover: 0 4px 12px rgba(0,0,0,0.4);
--shadow-glow-gold: 0 0 20px rgba(200, 169, 110, 0.08);
--shadow-glow-violet: 0 0 20px rgba(139, 92, 246, 0.08);

/* Borda */
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 20px;
--radius-full: 9999px;

/* Transicao */
--transition-fast: 150ms;
--transition-normal: 250ms;
--transition-slow: 400ms;
--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
--easing-smooth: cubic-bezier(0.22, 1, 0.36, 1);
--easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Espacamento (escala Tailwind padrao herdada — nao precisa custom) */

/* Scrollbar */
--scrollbar-width: 6px;
--scrollbar-track: transparent;
--scrollbar-thumb: oklch(0.72 0.10 75 / 0.2);
--scrollbar-thumb-hover: oklch(0.72 0.10 75 / 0.4);
```

## Semantic Token Mapping

| Token Semantic | Token Base | Uso |
|---------------|-----------|-----|
| bg-primary | --color-background | Fundo pagina |
| bg-surface | --color-card | Fundo card/section |
| bg-surface-hover | --color-card-hover | Card hover |
| text-primary | --color-foreground | Texto principal |
| text-secondary | --color-muted-foreground | Texto secundario |
| text-accent | --color-gold | Numeros, destaque |
| text-danger | --color-danger | Erro |
| text-success | --color-success | Positivo |
| border-default | --color-border | Bordas |
| accent-primary | --color-gold | Botoes primary, acentos |
| accent-secondary | --color-violet | Botoes violet, badges |

## Notas

- O sistema nao tem **light mode** e nao precisa — Sarau e noturno por identidade
- Fallback Safari < 15 existe no index.css com valores hex aproximados
- `--color-accent` e alias de gold, `--color-secondary` e alias de violet — manter ambos para clareza semantica
