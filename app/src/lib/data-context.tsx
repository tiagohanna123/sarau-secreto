import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react'
import { useBarData, type BarHistoryData } from './use-bar-data'

// --- Tipos exportados ---

export interface FlatEvent {
  id: string
  title: string
  date: string
  ticketsSold: number
  checkedIn: number
  ticketRevenue: number
  barRevenue: number
  barTransactions: number
  totalRevenue: number
  perCapitaBar: number
  capacity: number | null
  status: string
  noShowRate: number
  symplaEventId: string | null
  produtos?: { name: string; qty: number; total: number; pct: number }[]
}

export interface DataContextValue {
  barData: BarHistoryData | null
  events: FlatEvent[]
  eventsMap: Map<string, FlatEvent>
  overview: { aggregates: any; events: any[] } | null
  loading: boolean
  error: string | null
  source: string
  refresh: () => void
}

// --- Context ---

const DataContext = createContext<DataContextValue | null>(null)

// --- Provider ---

export function DataProvider({ children }: { children: ReactNode }) {
  const { data: barData, loading: barLoading, refresh: barRefresh, rawInsights } = useBarData()

  // Deriva events do rawInsights (live) OU barData (fallback offline).
  // Nada de useEffect + useState: isso criava um frame de latencia onde o Dashboard
  // ja tinha barData mas as outras secoes viam events=[] vazio.
  const events = useMemo<FlatEvent[]>(() => {
    // Caminho feliz: rawInsights da API (com dados de bilheteria + bar)
    if (rawInsights?.events?.length) {
      return (rawInsights.events || []).map((ev: any) => ({
      id: ev.id || ev.name,
      title: ev.name || ev.title || 'Evento',
      date: ev.date || '',
      ticketsSold: ev.ticketsSold || 0,
      checkedIn: ev.checkedIn || 0,
      ticketRevenue: ev.ticketRevenue || 0,
      barRevenue: ev.barRevenue || 0,
      barTransactions: ev.barTransactions || 0,
      totalRevenue: ev.totalRevenue || (ev.ticketRevenue || 0) + (ev.barRevenue || 0),
      perCapitaBar: ev.perCapitaBar || 0,
      capacity: ev.capacity ?? null,
      status: ev.status || 'completed',
      noShowRate: ev.noShowRate ?? (
        (ev.ticketsSold || 0) > 0 && (ev.checkedIn || 0) > 0
          ? Math.round(((ev.ticketsSold - ev.checkedIn) / ev.ticketsSold) * 100 * 10) / 10
          : 0
      ),
      symplaEventId: ev.symplaEventId ?? ev.id?.startsWith('bar-') ? null : (ev.symplaEventId || ev.id || null),
      produtos: ev.produtos || barData?.eventos?.find((be: any) => be.start === (ev.date || '').slice(0, 10))?.produtos,
    }))
    }

    // Fallback offline: barData (BAR_EMBED ou Yuzer backup) — só dados de bar, sem bilheteria
    if (barData?.eventos?.length) {
      return barData.eventos.map((ev: any) => ({
        id: ev.start || `bar-${Date.now()}`,
        title: `Sarau Secreto (${ev.start || ''})`,
        date: ev.start || '',
        ticketsSold: 0,
        checkedIn: 0,
        ticketRevenue: 0,
        barRevenue: ev.revenue || 0,
        barTransactions: ev.orders || 0,
        totalRevenue: ev.revenue || 0,
        perCapitaBar: 0,
        capacity: null,
        status: 'completed',
        noShowRate: 0,
        symplaEventId: null,
        produtos: ev.produtos,
      }))
    }

    return []
  }, [rawInsights, barData])

  // Mapa pra O(1) lookup no detail page — evita buscar evento individual na API
  const eventsMap = useMemo<Map<string, FlatEvent>>(() => {
    const m = new Map<string, FlatEvent>()
    for (const ev of events) {
      m.set(ev.id, ev)
    }
    return m
  }, [events])

  const overview = useMemo<{ aggregates: any; events: any[] } | null>(() => {
    if (rawInsights) return rawInsights
    // Fallback offline: deriva overview de barData
    if (barData?.eventos?.length) {
      const eventos = barData.eventos
      const totalRevenue = eventos.reduce((s: number, e: any) => s + (e.revenue || 0), 0)
      return {
        aggregates: {
          totalEvents: eventos.length,
          totalTickets: eventos.reduce((s: number, e: any) => s + (e.orders || 0), 0),
          totalCheckedIn: 0,
          averagePerEvent: 0,
          totalTicketRevenue: 0,
          totalBarRevenue: totalRevenue,
          totalRevenue,
          perCapitaBar: 0,
          overallNoShowRate: 1,
        },
        events: eventos.map((e: any) => ({
          id: e.start,
          name: `Sarau Secreto (${e.start})`,
          date: e.start,
          ticketsSold: 0,
          checkedIn: 0,
          ticketRevenue: 0,
          barRevenue: e.revenue || 0,
          barTransactions: e.orders || 0,
          totalRevenue: e.revenue || 0,
          perCapitaBar: 0,
          noShowRate: 1,
        })),
      }
    }
    return null
  }, [rawInsights, barData])

  const refresh = useCallback(() => {
    barRefresh()
  }, [barRefresh])

  const loading = barLoading
  const source = barData?.source || 'loading'
  const error = null

  return (
    <DataContext.Provider value={{ barData, events, eventsMap, overview, loading, error, source, refresh }}>
      {children}
    </DataContext.Provider>
  )
}

// --- Hook ---

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) {
    throw new Error('useData() must be used within a <DataProvider>')
  }
  return ctx
}
