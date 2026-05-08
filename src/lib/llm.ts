import { getConfirmedInsights, getLLMConfig } from './chat-memory'

// ── Contexto dos dados reais do Sarau ─────────────────────────────────────

const SARAU_CONTEXT = `
DADOS REAIS DO SARAU SECRETO (9 eventos, set/2025 – abr/2026):

## KPIs Gerais
- Ingressos vendidos: 6.896
- Receita bilheteria: R$322.415
- Receita bar: R$91.469
- Receita total: R$413.884
- Ticket médio ingresso: R$46,75
- Ticket médio bar (por consumidor): R$27,29
- Bar/comparecente (todos): R$16,42
- Clientes únicos: 3.347
- Check-ins: 5.572 (80,8%)
- No-show: 1.324 (19,2%)
- Custo Sympla: R$29.870 (9,3%)
- Penetração bar: 48,6%
- Receita/comparecente: R$74,28
- ~265 heavy users = ~42% da receita total
- Taxa recompra estimada: 62%
- CMV bar estimado: ~42%

## Eventos (cronológico)
1. set/2025 — "No caminho da Arte" — menor evento do período
2. out/2025 — crescimento estável
3. nov/2025 — bom desempenho
4. dez/2025 — PICO (maior receita ~R$74k) — natal + fim de ano
5. jan/2026 — queda típica pós-natal
6. fev/2026 — "Convida Leticia Fialho" — retomada
7. mar/2026 — estável
8. abr/2026 A — crescimento
9. abr/2026 B — "3 anos" — segundo maior evento, aniversário

## Bar — Top 10 por Receita
1. UVITA BLEND TINTO — ~R$13.800
2. VINHO (genérico) — ~R$12.100
3. SANTA ANGELA ROSÉ — ~R$10.400
4. HEINEKEN LONGNECK — ~R$9.200
5. VIEIRA CAMPOS VINHO VERDE — ~R$8.700
6. BODEGA PRIVADA BRANCO — ~R$7.900
7. STELLA PURE GOLD — ~R$6.800
8. MONTANHA DO VALE TINTO — ~R$5.600
9. ÁGUA SEM GÁS — ~R$4.200
10. TAÇA (avulsa) — ~R$3.800
Vinhos: ~70% do faturamento bar. Mix: 99% bebida.

## Comportamento
- Pico de compra de ingressos: 18h, sextas e quintas
- Pico de consumo bar: ~22h, sextas
- Sazonalidade: Dez=pico, Jan=queda, Apr/26 B=aniversário

## CRM
- 2.650 clientes ativos
- LTV médio: R$92,16
- Top cliente: 12 ingressos, R$745
- 51,4% nunca consumiram no bar (oportunidade de ativação)

## Estimativas de Custo (sinalizadas como 📊 estimado)
- CMV bar: ~R$38.417 (42% da receita bar)
- Margem bruta bar: 58%
- Custo Sympla já deduzido na receita líquida
- Vinhos: CMV ~45%, Cervejas: ~32%, Água: ~15%

## Lotes
- Sala Secreta (1º lote): menor preço, comprado com mais antecedência
- Lotes intermediários: volume principal
- Convidados: maior penetração no bar
`

function buildSystemPrompt(confirmedInsights: { insight: string }[]): string {
  const memoryStr = confirmedInsights.length > 0
    ? `\n## Insights confirmados pelos sócios (SEMPRE respeitar):\n${confirmedInsights.map(i => `- ${i.insight}`).join('\n')}`
    : ''

  return `Você é o assistente de dados do Sarau Secreto — um festival sociocultural em Brasília.
Você fala diretamente com os sócios do evento: Marvyn, Thiago Jamelão, Marcelo JM, Todd Henrique.

${SARAU_CONTEXT}${memoryStr}

## REGRAS OBRIGATÓRIAS:
1. Responda em português, tom direto e objetivo — sócios são empreendedores, não analistas
2. Use os dados reais acima. Quando estimar algo sem dado confirmado, escreva 📊 estimado
3. Seja conciso: máximo 4 parágrafos. Prefira bullet points com números reais
4. Quando fizer sentido gerar um gráfico para ilustrar a resposta, inclua EXATAMENTE ao final:
   CHART_SPEC:{"type":"bar","title":"Título","data":[{"name":"X","value":Y}],"xKey":"name","yKey":"value"}
   Tipos disponíveis: bar, line, pie, area, scatter
   Para line/area com múltiplas séries: {"type":"line","title":"","data":[{"name":"","s1":0,"s2":0}],"lines":["s1","s2"]}
   Para scatter: {"type":"scatter","title":"","data":[{"x":0,"y":0,"name":""}]}
5. Se o sócio confirmar um insight importante, mencione "💾 vou lembrar disso" no final
6. Nunca invente dados de outros eventos ou benchmarks externos sem deixar claro que é hipotético
7. Foco no que é acionável: o que fazer com essa informação`
}

// ── Providers ─────────────────────────────────────────────────────────────

async function callDeepSeek(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    })
  })
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await res.text()}`)
  const j = await res.json()
  return j.choices[0].message.content
}

async function callOpenAI(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    })
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  const j = await res.json()
  return j.choices[0].message.content
}

async function callGroq(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    })
  })
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`)
  const j = await res.json()
  return j.choices[0].message.content
}

// ── Main export ───────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function sendMessage(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const cfg = getLLMConfig()
  const confirmed = getConfirmedInsights()

  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(confirmed) },
    ...history.slice(-10), // últimas 10 trocas para context
    { role: 'user', content: userMessage }
  ]

  switch (cfg.provider) {
    case 'openai':   return callOpenAI(cfg.apiKey, messages)
    case 'groq':     return callGroq(cfg.apiKey, messages)
    case 'deepseek':
    default:         return callDeepSeek(cfg.apiKey, messages)
  }
}

// ── Chart spec parser ──────────────────────────────────────────────────────

export interface ChartSpec {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  title: string
  data: Record<string, string | number>[]
  xKey?: string
  yKey?: string
  lines?: string[]
}

export function parseChartSpec(text: string): { clean: string; chart: ChartSpec | null } {
  const match = text.match(/CHART_SPEC:(\{[\s\S]*?\})(?:\n|$)/)
  if (!match) return { clean: text, chart: null }
  try {
    const chart = JSON.parse(match[1]) as ChartSpec
    const clean = text.replace(match[0], '').trim()
    return { clean, chart }
  } catch {
    return { clean: text.replace(match[0], '').trim(), chart: null }
  }
}
