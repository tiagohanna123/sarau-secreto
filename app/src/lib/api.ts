import { EMBEDDED_DB, type EmbeddedEvent } from './db-embed'
import { BAR_EMBED, type EventBarRevenue } from './bar-embed'
import { CHECKIN_EMBED, type CheckinData } from './checkin-embed'

export interface ArtistEventSummary {
  id: string
  title: string
  date: string
  ticketsSold: number
  ticketRevenue: number
  checkedIn: number
}

export interface ArtistDetailData {
  id: string
  name: string
  genre?: string
  contact?: string
  instagram?: string
  bio?: string
  eventCount: number
  totalAudience: number
  totalTicketRevenue: number
  events: ArtistEventSummary[]
}

const BASE = '/api'
const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost')

// --- Helper: look up bar revenue for an event from embedded data ---
function barDataForEvent(eventId: string, symplaEventId?: string | null): EventBarRevenue | null {
  const map = (BAR_EMBED as any)?.eventBarRevenue as Record<string, EventBarRevenue | null> | undefined
  if (!map) return null
  // Try exact ID first, then sympla- prefixed ID (for events with auto-generated IDs)
  return map[eventId] ?? (symplaEventId ? map[`sympla-${symplaEventId}`] : null) ?? null
}

function checkinForEvent(eventId: string): CheckinData | null {
  return CHECKIN_EMBED[eventId] ?? null
}

async function request(path: string, options?: RequestInit) {
  const token = sessionStorage.getItem('sarau_token')
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// --- Embed helpers para fallback offline ---

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function formatDate(iso: string) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

/**
 * Merge EMBEDDED_DB + BAR_EMBED num único array de eventos unificados.
 * Cada evento carrega dados de bilheteria (DB) + bar (BAR).
 * BAR events sem match no DB viram eventos sintéticos com dados de bar.
 * Isso garante que TODAS as seções vejam o MESMO conjunto de eventos.
 */
function buildMergedEvents(): any[] {
  const { events: dbEvents, tickets } = EMBEDDED_DB
  const barEvents = (BAR_EMBED as any)?.eventos || []
  const barRevMap = (BAR_EMBED as any)?.eventBarRevenue || {}

  // Helpers
  function parseDate(iso: string) {
    if (!iso) return ''
    // ISO string or timestamp
    if (iso.length === 13 && !iso.includes('-')) {
      return new Date(Number(iso)).toISOString().slice(0, 10)
    }
    return iso.slice(0, 10)
  }

  function daysBetween(a: string, b: string) {
    const da = new Date(a).getTime()
    const db = new Date(b).getTime()
    return Math.abs((da - db) / (1000 * 60 * 60 * 24))
  }

  // Index bar events by date (start) for matching
  const barByDate = new Map<string, any>()
  for (const be of barEvents) {
    const d = be.start ? be.start.slice(0, 10) : ''
    if (d) barByDate.set(d, be)
  }

  // Track matched dates
  const matchedDates = new Set<string>()
  const merged: any[] = []

  // Pass 1: DB events — try to merge bar data, first by ID (exact), then by date (fuzzy ±2 days)
  for (const ev of dbEvents) {
    const evDate = parseDate(ev.date)
    let barMatch: any = null
    let bestDist = 999

    // Try exact ID match via barRevMap first (most reliable)
    // Also try symplaEventId as fallback (auto-generated IDs like cm... don't match sympla-N)
    const barRevEntry = ev.id ? (barRevMap[ev.id] ?? (ev.symplaEventId ? barRevMap[`sympla-${ev.symplaEventId}`] : undefined)) : undefined
    if (barRevEntry !== undefined) {
      if (barRevEntry !== null) {
        // ID match found — use barRevenue data directly from barRevMap
        barMatch = {
          date: evDate,
          event: { revenue: barRevEntry.revenue, orders: barRevEntry.transactions || 0 },
        }
        bestDist = 0
      }
      // else: explicitly null in barRevMap — no bar data for this event, keep barMatch = null
    } else {
      // Fallback: fuzzy date matching against bar events (±2 days)
      for (const [bd, be] of barByDate) {
        const dist = daysBetween(evDate, bd)
        if (dist < bestDist) {
          bestDist = dist
          barMatch = { date: bd, event: be }
        }
      }
    }

    if (barMatch && bestDist <= 2) {
      matchedDates.add(barMatch.date)
    }

    const barRev = (barMatch && bestDist <= 2) ? (barMatch.event.revenue || 0) : 0
    const sold = tickets[ev.id]?.count ?? ev.soldCount ?? 0
    const barData = {
      barRevenue: barRev,
      barTransactions: (barMatch && bestDist <= 2) ? (barMatch.event.orders || 0) : 0,
      perCapitaBar: sold > 0 && barRev > 0 ? Math.round((barRev / sold) * 100) / 100 : 0,
    }

    const ticketRev = tickets[ev.id]?.revenue ?? ev.totalRevenue ?? 0
    merged.push({
      id: ev.id,
      title: ev.title,
      slug: slugify(ev.title),
      date: evDate,
      location: '',
      capacity: ev.capacity,
      status: ev.status || 'completed',
      ticketsSold: tickets[ev.id]?.count ?? ev.soldCount ?? 0,
      checkedIn: checkinForEvent(ev.id)?.checkedIn ?? 0,
      ticketRevenue: ticketRev,
      totalRevenue: ticketRev + barRev,
      ...barData,
      produtos: (barMatch && bestDist <= 2) ? (barMatch.event.produtos || []) : [],
    })
  }

  // Pass 2: BAR events without DB match — create synthetic events
  // Only create if bar date NOT within ±2 days of any DB event (prevents ghost rows)
  const allDbDates = dbEvents.map(ev => parseDate(ev.date))
  for (const [bd, be] of barByDate) {
    if (matchedDates.has(bd)) continue
    // Double-check against ALL DB events (±2 days)
    const nearDbEvent = allDbDates.some(dd => daysBetween(bd, dd) <= 2)
    if (nearDbEvent) continue
    const rev = be.revenue || 0
    merged.push({
      id: `bar-${bd}`,
      title: `Sarau Secreto (${bd})`,
      slug: `sarau-secreto-${bd}`,
      date: bd,
      location: '',
      capacity: null,
      status: 'completed',
      ticketsSold: 0,
      checkedIn: 0,
      ticketRevenue: 0,
      totalRevenue: rev,
      barRevenue: rev,
      barTransactions: be.orders || 0,
      perCapitaBar: 0,
      produtos: be.produtos || [],
    })
  }

  // Sort by date descending (most recent first)
  merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return merged
}

/**
 * Enriquece uma lista de eventos da API com dados do BAR_EMBED.
 * 1. Adiciona barRevenue/barTransactions a eventos existentes (match por data ±2 dias)
 * 2. Cria eventos sintéticos para datas que só existem no BAR_EMBED
 * Usado TANTO no fallback embed QUANTO no caminho feliz da API.
 */
function enrichWithBarEvents(apiEvents: any[]): any[] {
  const barEvents = (BAR_EMBED as any)?.eventos || []
  const barRevMap = (BAR_EMBED as any)?.eventBarRevenue || {}

  function parseDate(iso: string) {
    if (!iso) return ''
    if (iso.length === 13 && !iso.includes('-')) {
      return new Date(Number(iso)).toISOString().slice(0, 10)
    }
    return iso.slice(0, 10)
  }

  function daysBetween(a: string, b: string) {
    return Math.abs((new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24))
  }

  // Track which bar events have been matched (by unique index)
  const matchedBarEvents = new Set<number>()

  const enriched = apiEvents.map((ev: any) => {
    const evDate = parseDate(ev.date || ev.start || '')
    let bestBarIdx = -1
    let bestDist = 999
    let bestBar: any = null

    // Try exact ID match via barRevMap first (most reliable)
    // Also try symplaEventId as fallback
    const barRevEntry = ev.id ? (barRevMap[ev.id] ?? (ev.symplaEventId ? barRevMap[`sympla-${ev.symplaEventId}`] : undefined)) : undefined
    if (barRevEntry !== undefined && barRevEntry !== null) {
      // Matched by ID — use barRevEntry revenue data but still try to find
      // the matching bar event for its full data (revenue already known)
      bestBar = {
        revenue: barRevEntry.revenue,
        orders: barRevEntry.transactions || 0,
      }
      bestDist = 0
      // Also try to find which barEvent this corresponds to by fuzzy date
      for (let i = 0; i < barEvents.length; i++) {
        const be = barEvents[i]
        const bd = be.start ? be.start.slice(0, 10) : ''
        if (!bd) continue
        const dist = daysBetween(evDate, bd)
        if (dist <= 2 && dist < bestDist) {
          bestDist = dist
          bestBarIdx = i
          bestBar = be
        }
      }
    } else {
      // Fallback: fuzzy date matching against all bar events (±2 days)
      for (let i = 0; i < barEvents.length; i++) {
        const be = barEvents[i]
        const bd = be.start ? be.start.slice(0, 10) : ''
        if (!bd) continue
        const dist = daysBetween(evDate, bd)
        if (dist < bestDist) {
          bestDist = dist
          bestBarIdx = i
          bestBar = be
        }
      }
    }

    // Mark the best matching bar event as matched (if within threshold)
    if (bestBarIdx >= 0 && bestDist <= 2) {
      matchedBarEvents.add(bestBarIdx)
    }

    const barRev2 = (bestBar && bestDist <= 2) ? (bestBar.revenue || 0) : 0
    const sold2 = ev.ticketsSold || ev.soldCount || 0
    const barData = {
      barRevenue: barRev2,
      barTransactions: (bestBar && bestDist <= 2) ? (bestBar.orders || 0) : 0,
      perCapitaBar: sold2 > 0 && barRev2 > 0 ? Math.round((barRev2 / sold2) * 100) / 100 : 0,
    }

    const tRev = ev.ticketRevenue || ev.totalTicketRevenue || 0
    // Só usa barRevenue do embed se a API não tiver dados de bar (ev.barRevenue é 0 ou undefined)
    const mergedBarRev = (ev.barRevenue && ev.barRevenue > 0) ? ev.barRevenue : barData.barRevenue
    return {
      ...ev,
      barRevenue: mergedBarRev,
      barTransactions: barData.barTransactions,
      perCapitaBar: barData.perCapitaBar,
      totalRevenue: tRev + mergedBarRev,
      produtos: (bestBar && bestDist <= 2) ? (bestBar.produtos || []) : (ev.produtos || []),
    }
  })

  // Add synthetic events for each unmatched bar event (individual, not grouped by date)
  // Only if bar date NOT within ±2 days of any API event
  const allApiDates = apiEvents.map((ev: any) => parseDate(ev.date || ev.start || ''))
  for (let i = 0; i < barEvents.length; i++) {
    if (matchedBarEvents.has(i)) continue
    const be = barEvents[i]
    const bd = be.start ? be.start.slice(0, 10) : ''
    if (!bd) continue
    // Skip if bar date is within ±2 days of any API event (already linked above)
    const nearApiDate = allApiDates.some((dd: string) => dd && daysBetween(bd, dd) <= 2)
    if (nearApiDate) continue
    const rev = be.revenue || 0
    enriched.push({
      id: `bar-${bd}-${i}`,
      title: `Sarau Secreto (${bd})`,
      date: bd,
      ticketsSold: 0,
      checkedIn: 0,
      ticketRevenue: 0,
      totalRevenue: rev,
      barRevenue: rev,
      barTransactions: be.orders || 0,
      perCapitaBar: 0,
      produtos: be.produtos || [],
    })
  }

  enriched.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return enriched
}

function computeFromEmbed(path: string): any {
  const mergedEvents = buildMergedEvents()

  // GET /events
  if (path === '/events') {
    return mergedEvents
  }

  // GET /events/:id
  const eventMatch = path.match(/^\/events\/(.+)$/)
  if (eventMatch) {
    const ev = mergedEvents?.find((e: any) => e.id === eventMatch[1])
    if (!ev) throw new Error('Evento não encontrado')
    return {
      ...ev,
      description: '',
      totalRevenue: (ev.ticketRevenue || 0) + (ev.barRevenue || 0),
    }
  }

  // GET /insights/overview
  if (path === '/insights/overview') {
    const all = mergedEvents!
    const totalEvents = all.length
    const totalTickets = all.reduce((s: number, e: any) => s + (e.ticketsSold || 0), 0)
    const totalTicketRev = all.reduce((s: number, e: any) => s + (e.ticketRevenue || 0), 0)
    const totalBarRev = all.reduce((s: number, e: any) => s + (e.barRevenue || 0), 0)
    const totalCheckedIn = all.reduce((s: number, e: any) => s + (e.checkedIn || 0), 0)

    const mapped = all.map((ev: any) => ({
      id: ev.id,
      name: ev.title,
      date: ev.date,
      ticketsSold: ev.ticketsSold || 0,
      checkedIn: ev.checkedIn || 0,
      ticketRevenue: ev.ticketRevenue || 0,
      barRevenue: ev.barRevenue || 0,
      barTransactions: ev.barTransactions || 0,
      totalRevenue: (ev.ticketRevenue || 0) + (ev.barRevenue || 0),
      perCapitaBar: (ev.ticketsSold || 0) > 0 && (ev.barRevenue || 0) > 0 ? Math.round(((ev.barRevenue || 0) / (ev.ticketsSold || 0)) * 100) / 100 : 0,
      noShowRate: (ev.ticketsSold || 0) > 0 && (ev.checkedIn || 0) > 0
        ? Math.round((((ev.ticketsSold || 0) - (ev.checkedIn || 0)) / (ev.ticketsSold || 0)) * 100 * 10) / 10
        : 0,
    }))

    return {
      aggregates: {
        totalEvents,
        totalTickets,
        totalCheckedIn,
        averagePerEvent: totalEvents > 0 ? totalCheckedIn / totalEvents : 0,
        totalTicketRevenue: totalTicketRev,
        totalBarRevenue: totalBarRev,
        totalRevenue: totalTicketRev + totalBarRev,
        perCapitaBar: totalTickets > 0 ? Math.round((totalBarRev / totalTickets) * 100) / 100 : 0,
        overallNoShowRate: totalTickets > 0 && totalCheckedIn > 0
          ? Math.round(((totalTickets - totalCheckedIn) / totalTickets) * 100 * 10) / 10
          : 0,
      },
      events: mapped,
    }
  }

  // GET /insights/comparison
  if (path === '/insights/comparison') {
    return mergedEvents!
      .map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        date: ev.date,
        ticketsSold: ev.ticketsSold || 0,
        checkedIn: ev.checkedIn || 0,
        noShow: (ev.ticketsSold || 0) - (ev.checkedIn || 0),
        ticketRevenue: ev.ticketRevenue || 0,
        barRevenue: ev.barRevenue || 0,
        barTransactions: ev.barTransactions || 0,
        totalRevenue: (ev.ticketRevenue || 0) + (ev.barRevenue || 0),
        perCapitaBar: ev.ticketsSold > 0 && ev.barRevenue > 0 ? Math.round((ev.barRevenue / ev.ticketsSold) * 100) / 100 : 0,
      }))
      .filter((e: any) => e.ticketsSold > 0 || e.ticketRevenue > 0 || e.barRevenue > 0)
  }

  // GET /insights/event/:id
  const insightMatch = path.match(/^\/insights\/event\/(.+)$/)
  if (insightMatch) {
    const ev = mergedEvents?.find((e: any) => e.id === insightMatch[1])
    if (!ev) throw new Error('Evento não encontrado')
    const ts = ev.ticketsSold || 0
    const rev = ev.ticketRevenue || 0
    const barRev = ev.barRevenue || 0
    const checkedIn = ev.checkedIn || 0
    const noShow = ts > 0 ? ts - checkedIn : 0
    return {
      event: {
        id: ev.id,
        title: ev.title,
        date: ev.date,
        ticketsSold: ts,
        checkedIn,
        ticketRevenue: rev,
        barRevenue: barRev,
        barTransactions: ev.barTransactions || 0,
        totalRevenue: rev + barRev,
        perCapitaBar: barRev > 0 && ts > 0 ? Math.round((barRev / ts) * 100) / 100 : 0,
      },
      kpis: {
        totalRevenue: rev + barRev,
        ticketRevenue: rev,
        barRevenue: barRev,
        barTransactions: ev.barTransactions || 0,
        ticketsSold: ts,
        checkedIn,
        noShow,
        noShowRate: ts > 0 ? Math.round((noShow / ts) * 100 * 10) / 10 : 0,
        perCapitaBar: barRev > 0 && ts > 0 ? Math.round((barRev / ts) * 100) / 100 : 0,
      },
      ticketTimeline: [],
      hourlyBarSales: [],
      topProducts: [],
      revenueMix: [],
      ticketsByType: [],
      paymentMethods: [],
    }
  }

  // GET /artists
  if (path === '/artists') {
    throw new Error('Dados de artistas offline indisponíveis')
  }

  // GET /artists/:id
  const artistMatch = path.match(/^\/artists\/(.+)$/)
  if (artistMatch) {
    throw new Error('Dados de artista offline indisponíveis')
  }

  throw new Error('Embed fallback não implementado para: ' + path)
}

// --- API client com fallback embed + enriquecimento de bar ---

const ENRICH_PATHS = new Set([
  '/events', '/insights/overview', '/insights/comparison', '/insights/event/',
])

const enrichPaths = new Set(['/events', '/insights/overview', '/insights/comparison'])
const enrichPathPrefixes = ['/insights/event/', '/events/']

async function requestOrFallback(path: string, options?: RequestInit): Promise<any> {
  try {
    const data = await request(path, options)

    // Enriquece resposta da API com dados de bar do bar-embed.ts
    // A API (Fastify + Prisma) nao tem dados de BarSale na tabela,
    // entao o barRevenue vem do bar-embed.ts que tem dados reais do Yuzer.
    if (path === '/events' && Array.isArray(data)) {
      return enrichWithBarEvents(data)
    }
    if (path === '/insights/overview' && data?.events) {
      const enriched = enrichWithBarEvents(data.events)
      const totalTickets = enriched.reduce((s: number, e: any) => s + (e.ticketsSold || 0), 0)
      const totalBarRev = enriched.reduce((s: number, e: any) => s + (e.barRevenue || 0), 0)
      return {
        ...data,
        events: enriched,
        aggregates: {
          ...data.aggregates,
          totalBarRevenue: totalBarRev,
          totalRevenue: (data.aggregates?.totalTicketRevenue || 0) + totalBarRev,
          perCapitaBar: totalTickets > 0 ? Math.round((totalBarRev / totalTickets) * 100) / 100 : 0,
        },
      }
    }
    if (path === '/insights/comparison' && Array.isArray(data)) {
      return enrichWithBarEvents(data)
    }
    if (path.startsWith('/insights/event/') && data?.event && data?.kpis) {
      const enrichedArray = enrichWithBarEvents([data.event])
      if (enrichedArray.length > 0) {
        const enriched = enrichedArray[0]
        data.event.barRevenue = enriched.barRevenue
        data.event.barTransactions = enriched.barTransactions
        data.event.totalRevenue = (data.event.ticketRevenue || 0) + (enriched.barRevenue || 0)
        data.event.perCapitaBar = enriched.perCapitaBar
        data.kpis.barRevenue = enriched.barRevenue
        data.kpis.barTransactions = enriched.barTransactions
        data.kpis.totalRevenue = (data.kpis.ticketRevenue || 0) + (enriched.barRevenue || 0)
        data.kpis.perCapitaBar = enriched.perCapitaBar
      }
    }

    return data
  } catch {
    return computeFromEmbed(path)
  }
}

function recomputeAggregates(events: any[]) {
  const totalTickets = events.reduce((s: number, e: any) => s + (e.ticketsSold || 0), 0)
  const totalCheckedIn = events.reduce((s: number, e: any) => s + (e.checkedIn || 0), 0)
  const totalTicketRevenue = events.reduce((s: number, e: any) => s + (e.ticketRevenue || 0), 0)
  const totalBarRevenue = events.reduce((s: number, e: any) => s + (e.barRevenue || 0), 0)
  return {
    totalEvents: events.length,
    totalTickets,
    totalCheckedIn,
    averagePerEvent: events.length > 0 ? totalCheckedIn / events.length : 0,
    totalTicketRevenue: Math.round(totalTicketRevenue * 100) / 100,
    totalBarRevenue: Math.round(totalBarRevenue * 100) / 100,
    totalRevenue: Math.round((totalTicketRevenue + totalBarRevenue) * 100) / 100,
    perCapitaBar: totalTickets > 0 ? Math.round((totalBarRevenue / totalTickets) * 100) / 100 : 0,
    overallNoShowRate: totalTickets > 0 && totalCheckedIn > 0
      ? Math.round(((totalTickets - totalCheckedIn) / totalTickets) * 100 * 10) / 10
      : 1,
  }
}

export const api = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),

  events: {
    list: () => requestOrFallback('/events'),
    get: (id: string) => requestOrFallback(`/events/${id}`),
    create: (data: any) =>
      request('/events', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/events/${id}`, { method: 'DELETE' }),
  },

  insights: {
    overview: () => requestOrFallback('/insights/overview'),
    event: (id: string) => requestOrFallback(`/insights/event/${id}`),
    comparison: () => requestOrFallback('/insights/comparison'),
  },

  import: {
    uploadSympla: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const token = sessionStorage.getItem('sarau_token')
      const res = await fetch(`${BASE}/import/sympla`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      return res.json()
    },
    confirmSympla: (data: any) =>
      request('/import/sympla/confirm', { method: 'POST', body: JSON.stringify(data) }),
    uploadBar: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const token = sessionStorage.getItem('sarau_token')
      const res = await fetch(`${BASE}/import/bar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      return res.json()
    },
    confirmBar: (data: any) =>
      request('/import/bar/confirm', { method: 'POST', body: JSON.stringify(data) }),
    history: () => request('/import'),
  },

  yuzer: {
    status: () => request('/yuzer/status'),
    summary: (range = '30d') => request(`/yuzer/summary?range=${range}`),
    orders: (range = '30d', perPage = 50, page = 1) =>
      request(`/yuzer/orders?range=${range}&perPage=${perPage}&page=${page}`),
    payments: (range = '30d') => request(`/yuzer/payments?range=${range}`),
    earningsDay: (range = '30d') => request(`/yuzer/earnings-day?range=${range}`),
    productsStats: (range = '30d', limit = 10, from?: string, to?: string) => {
      let qs = `/yuzer/products-stats?range=${range}&limit=${limit}`
      if (from && to) qs += `&from=${from}&to=${to}`
      return request(qs)
    },
    history: () => request('/yuzer/history'),
  },

  artists: {
    list: () => requestOrFallback('/artists'),
    get: (id: string) => requestOrFallback(`/artists/${id}`),
    getDetail: (id: string) => request(`/artists/${id}/detail`),
    create: (data: any) =>
      request('/artists', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/artists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/artists/${id}`, { method: 'DELETE' }),
  },
}
