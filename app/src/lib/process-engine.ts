// ProcessEngine — Modulo de sugestao e automacao de processos do Sarau Secreto
// Proposito: definir, sugerir e rastrear processos operacionais (coleta de dados,
// scraping, sync, validacao) baseado no estado atual do sistema.
//
// Proximo passo apos refinamento dos dados: implementar os executores
// (browser scraper, API sync, CSV import) e o orquestrador.

export type ProcessType =
  | 'scrape'         // Browser automation para dados nao expostos via API
  | 'sync'           // Sincronizacao via API publica (Sympla, etc)
  | 'import'         // Importacao de arquivo (CSV, JSON)
  | 'validate'       // Validacao de integridade dos dados
  | 'transform'      // Transformacao/limpeza de dados (ex: agregar VINHO generico)
  | 'report'         // Geracao de relatorio ou exportacao

export type ProcessStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'

export type DataSourceType =
  | 'sympla-api'       // API publica do Sympla (v1.5.1)
  | 'sympla-browser'   // Painel do organizador via browser
  | 'yuzer-backup'     // Backup Yuzer (orders.json)
  | 'yuzer-live'       // API ao vivo do Yuzer
  | 'manual-csv'       // CSV exportado manualmente
  | 'embedded'         // Dados embutidos no build (db-embed, bar-embed)

export interface DataSource {
  id: string
  type: DataSourceType
  label: string
  healthy: boolean
  lastSync: string | null
  errorCount: number
  notes: string
}

// Qual processo rodar, quando, e por que
export interface ProcessSuggestion {
  processId: string
  type: ProcessType
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  reason: string        // Por que esta sendo sugerido AGORA
  dataSources: string[] // IDs dos DataSources envolvidos
  estimatedDuration: string
  automated: boolean    // Pode rodar sem intervencao humana?
}

// Execucao unica de um processo
export interface ProcessRun {
  id: string
  processId: string
  type: ProcessType
  status: ProcessStatus
  startedAt: string | null
  completedAt: string | null
  duration: number | null     // segundos
  result: string | null       // resumo do resultado
  error: string | null        // mensagem de erro se failed
  dataSources: string[]
  triggeredBy: 'auto' | 'manual' | 'scheduled'
}

// Estado atual de todas as fontes de dados e processos
export interface ProcessState {
  dataSources: DataSource[]
  suggestions: ProcessSuggestion[]
  recentRuns: ProcessRun[]
  lastUpdated: string
}

// ─── Sugestoes baseadas no estado atual ───

export function generateSuggestions(state: Pick<ProcessState, 'dataSources' | 'recentRuns'>): ProcessSuggestion[] {
  const suggestions: ProcessSuggestion[] = []

  // 1. Verificar se check-in esta desatualizado
  const sympaBrowser = state.dataSources.find(d => d.type === 'sympla-browser')
  if (!sympaBrowser || !sympaBrowser.healthy) {
    suggestions.push({
      processId: 'scrape-checkin-all',
      type: 'scrape',
      title: 'Extrair check-in de todos os eventos',
      description: 'Navegar no painel do Sympla e extrair check-in de cada evento para calcular no-show rate real.',
      priority: 'high',
      reason: 'Nenhum dado de check-in disponivel. No-show rate atual: N/D.',
      dataSources: ['sympla-browser'],
      estimatedDuration: '~3 minutos (40 eventos)',
      automated: true,
    })
  }

  // 2. Verificar se existem eventos sem dados de bar
  // (quando tivermos contagem de eventos com/sem bar, habilitar)
  // TODO: contar eventosEmbed com vs sem barRevenue > 0

  // 3. Verificar se o sync Sympla esta saudavel
  const symplaApi = state.dataSources.find(d => d.type === 'sympla-api')
  if (symplaApi && symplaApi.errorCount > 3) {
    suggestions.push({
      processId: 'fix-sympla-sync',
      type: 'sync',
      title: 'Verificar sync Sympla',
      description: 'A API do Sympla esta com erros recorrentes. Verificar token e reconectar.',
      priority: 'critical',
      reason: `${symplaApi.errorCount} erros consecutivos no sync.`,
      dataSources: ['sympla-api'],
      estimatedDuration: '~2 minutos',
      automated: false,
    })
  }

  // 4. Sugerir transformacao de dados se ha dados brutos nao processados
  // TODO: verificar se ha raw data sem processar

  // 5. Sugerir validacao periodica
  const lastValidate = state.recentRuns
    .filter(r => r.type === 'validate' && r.status === 'completed')
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))[0]

  if (!lastValidate || !lastValidate.completedAt || daysSince(lastValidate.completedAt!) > 7) {
    suggestions.push({
      processId: 'validate-data-integrity',
      type: 'validate',
      title: 'Validar integridade dos dados',
      description: 'Conferir se total de eventos, receita e ingressos estao consistentes entre fontes (Sympla, Yuzer, embed).',
      priority: 'medium',
      reason: lastValidate
        ? `Ultima validacao ha ${daysSince(lastValidate.completedAt)} dias.`
        : 'Nenhuma validacao registrada.',
      dataSources: ['sympla-api', 'yuzer-backup', 'embedded'],
      estimatedDuration: '~30 segundos',
      automated: true,
    })
  }

  // 6. Sugerir deploy se ha changes
  // TODO: verificar git diff

  return suggestions.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.priority] - order[b.priority]
  })
}

function daysSince(isoDate: string | null): number {
  if (!isoDate) return 999
  const then = new Date(isoDate).getTime()
  const now = Date.now()
  return Math.floor((now - then) / 86400000)
}

// ─── Estado inicial do sistema ───

export const INITIAL_PROCESS_STATE: ProcessState = {
  dataSources: [
    {
      id: 'sympla-api',
      type: 'sympla-api',
      label: 'Sympla API (v1.5.1)',
      healthy: false,
      lastSync: null,
      errorCount: 0,
      notes: 'Token: 4bfc1d92... (com escopo limitado — so eventos 2023-2024)',
    },
    {
      id: 'sympla-browser',
      type: 'sympla-browser',
      label: 'Sympla Organizador (Browser)',
      healthy: true,
      lastSync: '2026-05-05T03:00:00Z',
      errorCount: 0,
      notes: 'Sessao autenticada via browser. Check-in extraido para 1/40 eventos.',
    },
    {
      id: 'yuzer-backup',
      type: 'yuzer-backup',
      label: 'Yuzer Backup (orders.json)',
      healthy: true,
      lastSync: '2026-05-04T00:00:00Z',
      errorCount: 0,
      notes: '17.939 pedidos, R$733.206, 33/40 eventos com dados de bar.',
    },
    {
      id: 'embedded',
      type: 'embedded',
      label: 'Dados Embutidos (build)',
      healthy: true,
      lastSync: '2026-05-05T03:30:00Z',
      errorCount: 0,
      notes: 'Embedded no build: 40 eventos (db-embed), 34 eventos bar (bar-embed), 1 check-in (checkin-embed).',
    },
  ],
  suggestions: [], // gerado por generateSuggestions()
  recentRuns: [],
  lastUpdated: new Date().toISOString(),
}
