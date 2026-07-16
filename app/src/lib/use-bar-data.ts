/**
 * Hook compartilhado: dados do Sarau (bar + eventos reais).
 *
 * Cascata honesta de fontes:
 *   1. api.yuzer.history() — Yuzer ao vivo
 *   2. api.insights.overview() — dados reais do banco de eventos
 *   3. BAR_EMBED — backup real do Yuzer (dados de bar historicos)
 *   4. null — estado vazio (backend offline sem backup)
 *
 * Nao ha mais fallback mock. Paginas que recebem null exibem
 * "sem dados" / "Backend offline — dados indisponiveis".
 */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { BAR_EMBED } from '@/lib/bar-embed'

export interface BarEvent {
  start: string; end: string; days: number; orders: number; revenue: number
  ticketMedio: number; itensVendidos: number
  produtos: { name: string; qty: number; total: number; pct: number }[]
  metodosPagamento: { method: string; total: number; pct: number }[]
}

export interface WineAnalysis {
  genericLabel: string
  genericRevenue: number
  genericUnits: number
  specificWineRevenue: number
  specificWineUnits: number
  note: string
}

export interface BarHistoryData {
  source: 'live' | 'backup' | 'insights' | 'empty'
  totalEvents: number
  totalRevenue: number
  totalOrders: number
  totalItens: number
  ticketMedioBar: number
  ticketMedioGeral: number
  eventos: BarEvent[]
  eventBarRevenue: Record<string, { revenue: number; transactions: number; perCapita: number } | null>
  mensais: { mes: string; label: string; eventos: number; orders: number; revenue: number; ticketMedio: number }[]
  produtoMix: { name: string; qty: number; total: number; pct: number }[]
  metodosPagamento: { method: string; total: number; pct: number }[]
  categorias: { name: string; total: number; qty: number; pct: number }[]
  wineAnalysis?: WineAnalysis
}

function fmt(n: number) { return Math.round(n * 100) / 100 }

/**
 * Transforma a resposta da API /api/insights/overview no formato BarHistoryData.
 *
 * Eventos reais do banco viram eventos[], mensais[].
 * Dados exclusivos de bar (produtoMix, categorias, metodosPagamento) viram arrays vazios.
 * As paginas toleram arrays vazios (mostram "sem dados" em vez de mock falso).
 */
function transformInsightsToBarData(insights: any): BarHistoryData {
  const agg = insights.aggregates
  const events = insights.events || []

  // Agrupa por mes para mensais[]
  const monthMap = new Map<string, { eventos: number; orders: number; revenue: number }>()
  for (const ev of events) {
    const month = ev.date ? ev.date.slice(0, 7) : 'unknown'
    const prev = monthMap.get(month) || { eventos: 0, orders: 0, revenue: 0 }
    prev.eventos++
    prev.orders += ev.ticketsSold || 0
    prev.revenue += ev.totalRevenue || 0
    monthMap.set(month, prev)
  }
  const mensais = [...monthMap.entries()]
    .map(([mes, d]) => ({
      mes,
      label: mes,
      eventos: d.eventos,
      orders: d.orders,
      revenue: fmt(d.revenue),
      ticketMedio: d.orders > 0 ? fmt(d.revenue / d.orders) : 0,
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes))

  // Mapeia eventos do banco pro formato BarEvent
  const eventos: BarEvent[] = events.map((ev: any) => ({
    start: ev.date || '',
    end: ev.date || '',
    days: 1,
    orders: ev.ticketsSold || 0,
    revenue: ev.totalRevenue || 0,
    ticketMedio: (ev.ticketsSold || 0) > 0 ? fmt((ev.totalRevenue || 0) / (ev.ticketsSold || 1)) : 0,
    itensVendidos: ev.ticketsSold || 0,
    produtos: [],
    metodosPagamento: [],
  }))

  // Recalcula totais considerando todos os eventos (já enriquecidos via api.ts)
  const totalEvents = eventos.length
  const totalRevenue = fmt(eventos.reduce((sum, e) => sum + e.revenue, 0))
  const totalOrders = eventos.reduce((sum, e) => sum + e.orders, 0)

  return {
    source: 'insights',
    totalEvents,
    totalRevenue,
    totalOrders,
    totalItens: totalOrders,
    ticketMedioBar: agg.perCapitaBar || 0,
    ticketMedioGeral: agg.totalCheckedIn > 0
      ? fmt((agg.totalTicketRevenue || 0) / agg.totalCheckedIn)
      : 0,
    eventos,
    eventBarRevenue: {},
    mensais,
    produtoMix: [],
    metodosPagamento: [],
    categorias: [],
  }
}

/**
 * Converte BarHistoryData (Yuzer ou BAR_EMBED) pro formato rawInsights
 * que o DataContext espera pra derivar events[] e overview.
 * Usado nos fallbacks quando api.insights.overview() falha.
 */
function barDataToRawInsights(data: BarHistoryData): { aggregates: any; events: any[] } {
  return {
    aggregates: {
      totalEvents: data.totalEvents,
      totalTickets: data.totalOrders,
      totalCheckedIn: 0,
      averagePerEvent: data.totalEvents > 0 ? data.totalOrders / data.totalEvents : 0,
      totalTicketRevenue: 0,
      totalBarRevenue: data.totalRevenue,
      totalRevenue: data.totalRevenue,
      perCapitaBar: data.ticketMedioBar,
      overallNoShowRate: 1,
    },
    events: data.eventos.map((ev, i) => ({
      id: `bar-${ev.start}`,
      name: `Sarau Secreto (${ev.start})`,
      date: ev.start || '',
      ticketsSold: ev.orders || 0,
      checkedIn: 0,
      ticketRevenue: 0,
      barRevenue: ev.revenue || 0,
      barTransactions: ev.orders || 0,
      totalRevenue: ev.revenue || 0,
      perCapitaBar: (ev.orders || 0) > 0 && (ev.revenue || 0) > 0 ? Math.round(((ev.revenue || 0) / (ev.orders || 0)) * 100) / 100 : 0,
      noShowRate: 0,
    })),
  }
}

export function useBarData(): { data: BarHistoryData | null; loading: boolean; refresh: () => void; rawInsights: { aggregates: any; events: any[] } | null } {
  const [data, setData] = useState<BarHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const [rawInsights, setRawInsights] = useState<{ aggregates: any; events: any[] } | null>(null)

  useEffect(() => {
    let dead = false
    setLoading(true)

    // Busca Yuzer + insights EM PARALELO para SEMPRE ter eventos do banco como base
    Promise.all([
      api.yuzer.history().catch(() => null as BarHistoryData | null),
      api.insights.overview().catch(() => null),
    ]).then(([yuzerData, insightsData]) => {
      if (dead) return

      if (insightsData) {
        setRawInsights(insightsData)
        // Eventos do banco SEMPRE como base
        const barData = transformInsightsToBarData(insightsData)

        if (yuzerData) {
          // Yuzer online: mescla dados ricos de bar em cima dos eventos do banco
          barData.source = 'live'
          barData.produtoMix = yuzerData.produtoMix || []
          barData.metodosPagamento = yuzerData.metodosPagamento || []
          barData.categorias = yuzerData.categorias || []
          barData.ticketMedioBar = yuzerData.ticketMedioBar
          barData.ticketMedioGeral = yuzerData.ticketMedioGeral
          if (yuzerData.wineAnalysis) barData.wineAnalysis = yuzerData.wineAnalysis

          // Enriquece cada evento com dados de bar do Yuzer (produtos, pagamentos)
          const yuzerEventMap = new Map(yuzerData.eventos.map((ev: any) => [ev.start, ev]))
          for (const ev of barData.eventos) {
            const match: any = yuzerEventMap.get(ev.start)
            if (match) {
              (ev as any).produtos = match.produtos || []
              ;(ev as any).metodosPagamento = match.metodosPagamento || []
            }
          }
        } else if (BAR_EMBED) {
          // Yuzer offline: usa BAR_EMBED para dados de bar
          barData.source = 'insights'
          barData.produtoMix = BAR_EMBED.produtoMix || []
          barData.metodosPagamento = BAR_EMBED.metodosPagamento || []
          barData.categorias = BAR_EMBED.categorias || []
          barData.ticketMedioBar = BAR_EMBED.ticketMedioBar
          barData.ticketMedioGeral = BAR_EMBED.ticketMedioGeral

          // Enriquece cada evento com dados de bar do BAR_EMBED
          const barEmbedEventMap = new Map(BAR_EMBED.eventos.map((ev: any) => [ev.start, ev]))
          for (const ev of barData.eventos) {
            const match: any = barEmbedEventMap.get(ev.start)
            if (match) {
              (ev as any).produtos = match.produtos || []
              ;(ev as any).metodosPagamento = match.metodosPagamento || []
            }
          }
        }
        setData(barData)
      } else if (yuzerData) {
        // Insights offline mas Yuzer online — caso raro, usa Yuzer direto
        setData({ ...yuzerData, source: 'live' })
        // Seta rawInsights pra DataContext.events/overview nao ficarem vazios
        setRawInsights(barDataToRawInsights(yuzerData))
      } else if (BAR_EMBED) {
        // Tudo offline — último fallback
        setData({ ...BAR_EMBED, source: 'backup' })
        // Seta rawInsights pra DataContext.events/overview nao ficarem vazios
        setRawInsights(barDataToRawInsights(BAR_EMBED))
      }
      /* else: data permanece null */
    }).finally(() => {
      if (!dead) setLoading(false)
    })

    return () => { dead = true }
  }, [tick])

  return { data, loading, refresh: () => setTick(t => t + 1), rawInsights }
}
