# Information Architecture: Sarau Secreto v2

## Routing (Hash-based SPA)

```
#dashboard              → Dashboard (insights/dashboard.tsx)
#eventos                → Lista de Eventos
#eventos/comparativo    → Comparativo entre edicoes
#event/<id>             → Detalhe do Evento
#financeiro             → Visao Financeira
#financeiro/metas       → Metas e Acompanhamento
#inteligencia           → Insights Avancados / IA
#config                 → Configuracoes Gerais
#config/artistas        → Gerenciar Artistas
#config/import          → Importar Dados (Sympla/Yuzer)
#artist/<id>            → Detalhe do Artista
```

## Navegacao Primaria

**Sidebar (desktop) / Bottom Nav (mobile):**
1. Dashboard — Visao geral do negocio
2. Eventos — Lista, comparativo, detalhe
3. Financeiro — Receitas, custos, fluxo
4. Inteligencia — Insights, IA, recomendacoes
5. Config — Ajustes, artistas, importacao

**Sub-navegacao (dentro de cada secao):**
- Eventos: [Eventos] [Comparativo]
- Financeiro: [Financeiro] [Metas]
- Config: [Geral] [Artistas] [Importar]

## Hierarquia de Conteudo

```
Nivel 1: Dashboard (pagina de maior frequencia — 80% do tempo do usuario)
├── KPIs principais (Receita, Ingressos, Ticket Medio, Eventos)
├── KPIs inteligentes (Produto Lider, No-Show, Crescimento, Receita/Evento)
├── Graficos (Mix Receita, Tendencia Mensal)
└── Listas (Top 10 Produtos, Ultimos Eventos)

Nivel 2: Eventos
├── Lista com filtro/ordenacao
│   ├── KPI bar (totais agregados)
│   ├── Card por evento (data, status, metricas, barras de ocupacao)
│   └── Acoes: clicar para detalhe
└── Comparativo entre edicoes

Nivel 3: Financeiro
├── Resumo financeiro (receitas, custos, margem)
├── Projecoes e estimativas
└── Metas (acompanhamento de objetivos)

Nivel 4: Inteligencia
├── Insights gerados por IA
├── Recomendacoes
└── Analises preditivas

Nivel 5: Config
├── Geral (preferencias, dados)
├── Artistas (lista, detalhe, metricas por artista)
└── Import (upload CSV, sync Yuzer)
```

## Fluxo do Usuario (Primary Path)

1. Abre o app → Login (se nao autenticado)
2. Dashboard → ve KPIs do periodo
3. Se um numero chama atencao → clica em Eventos
4. Ve lista ordenada → clica num evento
5. Detalhe do evento → metricas detalhadas
6. Volta para Dashboard ou vai para Financeiro

## Padroes de URL / Estado

- Hash routing: `#eventos`, `#financeiro/metas`
- Estado preservado em navegacao: filtro de periodo global (PeriodProvider)
- Lazy loading via React.lazy + Suspense
- Nenhuma pagina tem parametros de query string

## Observacoes

1. Navegacao funciona bem para desktop (sidebar fixa) e mobile (bottom nav + drawer)
2. Sub-navegacao dentro de tabs e consistente
3. PeriodFilter (filtro global de periodo) e acessivel de qualquer pagina
4. Lazy loading com skeleton e padrao bom
5. Hash routing e simples e funcional para o escopo

## Melhorias Potenciais

1. Breadcrumb em paginas aninhadas (evento dentro de eventos)
2. Indicadores visuais de "onde estou" mais fortes na sidebar
3. Transicao suave entre paginas (framer-motion AnimatePresence)
4. PeriodFilter poderia ser sticky no topo
5. Mobile: swipe gestures entre tabs
