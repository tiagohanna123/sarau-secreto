// Cloudflare Pages Function — GET /api/events, /api/events/:id, /api/insights/*
// Dados embarcados localmente (nao depende de src/lib/)

import { EVENTOS, TICKETS } from '../data/eventos'
import { BAR_EVENTOS, BAR_REVENUE_MAP } from '../data/bar'
import { CHECKIN } from '../data/checkin'

// ⏱ Última sincronização manual dos dados de bar (fallback offline)
const BAR_LAST_SYNC = '2026-05-08T14:30:00-03:00'

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseDate(iso: string | number) {
  if (!iso) return ''
  if (typeof iso === 'number') return new Date(iso).toISOString().slice(0, 10)
  if (iso.length === 13 && !iso.includes('-')) return new Date(Number(iso)).toISOString().slice(0, 10)
  return String(iso).slice(0, 10)
}

function daysBetween(a: string, b: string) {
  return Math.abs((new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24))
}

function checkinForEvent(eventId: string): number {
  return CHECKIN[eventId]?.checkedIn ?? 0
}

function buildMergedEvents() {
  const barByDate = new Map<string, any>()
  for (const be of BAR_EVENTOS) {
    const d = be.start ? be.start.slice(0, 10) : ''
    if (d) barByDate.set(d, be)
  }

  const matchedDates = new Set<string>()
  const merged: any[] = []

  for (const ev of EVENTOS) {
    const evDate = parseDate(ev.date)
    let barMatch: any = null
    let bestDist = 999

    const barRevEntry = ev.id
      ? (BAR_REVENUE_MAP[ev.id] ?? (ev.symplaEventId ? BAR_REVENUE_MAP[`sympla-${ev.symplaEventId}`] : undefined))
      : undefined
    if (barRevEntry !== undefined) {
      if (barRevEntry !== null) {
        barMatch = { date: evDate, event: { revenue: barRevEntry.revenue, orders: barRevEntry.transactions || 0 } }
        bestDist = 0
      }
    } else {
      for (const [bd, be] of barByDate) {
        const dist = daysBetween(evDate, bd)
        if (dist < bestDist) { bestDist = dist; barMatch = { date: bd, event: be } }
      }
    }

    if (barMatch && bestDist <= 2) matchedDates.add(barMatch.date)

    const barRev = (barMatch && bestDist <= 2) ? (barMatch.event.revenue || 0) : 0
    const sold = (TICKETS as any)[ev.id]?.count ?? ev.soldCount ?? 0
    const ticketRev = (TICKETS as any)[ev.id]?.revenue ?? ev.totalRevenue ?? 0

    const barIsMatched = barMatch && bestDist <= 2
    merged.push({
      id: ev.id,
      title: ev.title,
      slug: slugify(ev.title),
      date: evDate,
      barMatchDate: barIsMatched ? barMatch.date : null,
      location: (ev as any).location || '',
      capacity: ev.capacity,
      status: ev.status || 'completed',
      ticketsSold: sold,
      checkedIn: checkinForEvent(ev.id),
      ticketRevenue: ticketRev,
      barRevenue: barIsMatched ? barRev : 0,
      barTransactions: barIsMatched ? (barMatch.event.orders || 0) : 0,
      totalRevenue: ticketRev + barRev,
      perCapitaBar: sold > 0 && barIsMatched && barRev > 0 ? Math.round((barRev / sold) * 100) / 100 : 0,
    })
  }

  // Pass 2: skip — unmatched bar events are date-mismatched duplicates of real events
  // Bar revenue from real events is already attributed via BAR_REVENUE_MAP in Pass 1

  // Remove eventos sem receita de bilheteria (exceção: Ceilândia, entrada gratuita)
  const kept = merged.filter(e => e.ticketRevenue > 0 || e.id === 'sympla-3060095')

  kept.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return kept
}

function recomputeAggregates(events: any[]) {
  const totalTickets = events.reduce((s: number, e: any) => s + (e.ticketsSold || 0), 0)
  const totalCheckedIn = events.reduce((s: number, e: any) => s + (e.checkedIn || 0), 0)
  const totalTicketRevenue = events.reduce((s: number, e: any) => s + (e.ticketRevenue || 0), 0)
  const totalBarRevenue = events.reduce((s: number, e: any) => s + (e.barRevenue || 0), 0)

  // Médias de bar só sobre eventos com dados de bar
  const barEvents = events.filter((e: any) => (e.barRevenue || 0) > 0)
  const barTickets = barEvents.reduce((s: number, e: any) => s + (e.ticketsSold || 0), 0)
  const barRevenueTotal = barEvents.reduce((s: number, e: any) => s + (e.barRevenue || 0), 0)
  const barTotalRevenue = barEvents.reduce((s: number, e: any) => s + (e.ticketRevenue || 0) + (e.barRevenue || 0), 0)

  return {
    totalEvents: events.length,
    totalEventsCount: events.length,
    excludedCount: 0,
    eventsWithBar: barEvents.length,
    totalTickets,
    totalCheckedIn,
    averagePerEvent: events.length > 0 ? totalCheckedIn / events.length : 0,
    totalTicketRevenue: Math.round(totalTicketRevenue * 100) / 100,
    totalBarRevenue: Math.round(totalBarRevenue * 100) / 100,
    totalRevenue: Math.round((totalTicketRevenue + totalBarRevenue) * 100) / 100,
    perCapitaBar: totalTickets > 0 ? Math.round((totalBarRevenue / totalTickets) * 100) / 100 : 0,
    ingressoPorPessoa: totalTickets > 0
      ? Math.round(((totalTicketRevenue + totalBarRevenue) / totalTickets) * 100) / 100
      : 0,
    avgTicketOnly: totalTickets > 0
      ? Math.round((totalTicketRevenue / totalTickets) * 100) / 100
      : 0,
    overallNoShowRate: totalTickets > 0 && totalCheckedIn > 0
      ? Math.round(((totalTickets - totalCheckedIn) / totalTickets) * 100 * 10) / 10
      : (totalCheckedIn === 0 ? null : 0),
    hasCheckinData: barEvents.some((e: any) => (e.checkedIn || 0) > 0) || totalCheckedIn > 0,
    // Médias filtradas para comparacao (só eventos COM dados de bar)
    avgPerCapitaBar: barTickets > 0 ? Math.round((barRevenueTotal / barTickets) * 100) / 100 : 0,
    avgMixBar: barTotalRevenue > 0
      ? Math.round((barRevenueTotal / barTotalRevenue) * 100)
      : 0,
  }
}

export async function onRequest(context: { request: Request; env: any; params: { path?: string } }) {
  const url = new URL(context.request.url)
  const path = url.pathname.replace(/^\/api\//, '')
  const mergedEvents = buildMergedEvents()

  const json = (data: any, status = 200) => new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })

  if (path === 'events') return json(mergedEvents)

  const eventMatch = path.match(/^events\/(.+)$/)
  if (eventMatch) {
    const ev = mergedEvents.find((e: any) => e.id === eventMatch[1])
    if (!ev) return json({ error: 'Evento não encontrado' }, 404)
    return json(ev)
  }

  if (path === 'insights/overview') {
    const mapped = mergedEvents.map((ev: any) => ({
      id: ev.id, name: ev.title, date: ev.date,
      ticketsSold: ev.ticketsSold || 0, checkedIn: ev.checkedIn || 0,
      ticketRevenue: ev.ticketRevenue || 0, barRevenue: ev.barRevenue || 0,
      barTransactions: ev.barTransactions || 0,
      totalRevenue: (ev.ticketRevenue || 0) + (ev.barRevenue || 0),
      perCapitaBar: (ev.ticketsSold || 0) > 0 && (ev.barRevenue || 0) > 0
        ? Math.round(((ev.barRevenue || 0) / (ev.ticketsSold || 0)) * 100) / 100 : 0,
      noShowRate: (ev.ticketsSold || 0) > 0 && (ev.checkedIn || 0) > 0
        ? Math.round((((ev.ticketsSold || 0) - (ev.checkedIn || 0)) / (ev.ticketsSold || 0)) * 100 * 10) / 10 : 0,
    }))
    return json({ aggregates: recomputeAggregates(mergedEvents), events: mapped, lastSync: BAR_LAST_SYNC })
  }

  if (path === 'insights/comparison') {
    return json(mergedEvents.map((ev: any) => ({
      id: ev.id, title: ev.title, date: ev.date,
      ticketsSold: ev.ticketsSold || 0, checkedIn: ev.checkedIn || 0,
      noShow: (ev.ticketsSold || 0) - (ev.checkedIn || 0),
      ticketRevenue: ev.ticketRevenue || 0, barRevenue: ev.barRevenue || 0,
      barTransactions: ev.barTransactions || 0,
      totalRevenue: (ev.ticketRevenue || 0) + (ev.barRevenue || 0),
      perCapitaBar: ev.ticketsSold > 0 && ev.barRevenue > 0 ? Math.round((ev.barRevenue / ev.ticketsSold) * 100) / 100 : 0,
    })).filter((e: any) => e.ticketsSold > 0 || e.ticketRevenue > 0 || e.barRevenue > 0))
  }

// Índice de produtos reais por data (extraído do BAR_EVENTOS)
const BAR_PRODUTOS_BY_DATE = new Map<string, { name: string; qty: number; revenue: number }[]>()
for (const be of BAR_EVENTOS) {
  const d = be.start ? be.start.slice(0, 10) : ''
  if (d && be.products?.length) {
    BAR_PRODUTOS_BY_DATE.set(d, be.products)
  }
}

// Retorna os top 10 produtos REAIS de um evento, rankeados por receita.
// Fallback: dados sintéticos aproximados quando não há dados reais.
function computeBarInsights(barRevenue: number, barTransactions: number, eventDate?: string, barMatchDate?: string | null) {
  if (barRevenue <= 0) return { topProducts: [], paymentMethods: [], hourlyBarSales: [] }

  // Tenta buscar produtos REAIS do evento pela data
  let topProducts: { name: string; qty: number; revenue: number }[] = []

  // Usa a data do match do bar (que tolera até 2 dias de diferença) se disponível
  const lookupDate = barMatchDate || eventDate
  if (lookupDate) {
    const reais = BAR_PRODUTOS_BY_DATE.get(lookupDate)
    if (reais?.length) {
      topProducts = [...reais]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    }
  }

  // Fallback: tenta match por proximidade (até 2 dias) se a data exata falhou
  if (!topProducts.length && eventDate) {
    let bestDist = 999
    let bestKey = ''
    for (const [bd] of BAR_PRODUTOS_BY_DATE) {
      const dist = Math.abs((new Date(eventDate).getTime() - new Date(bd).getTime()) / (1000 * 60 * 60 * 24))
      if (dist < bestDist) { bestDist = dist; bestKey = bd }
    }
    if (bestDist <= 2 && bestKey) {
      const reais = BAR_PRODUTOS_BY_DATE.get(bestKey)
      if (reais?.length) {
        topProducts = [...reais].sort((a, b) => b.revenue - a.revenue).slice(0, 10)
      }
    }
  }

  // Se não há produtos reais, retorna array vazio — frontend mostra "Sem dados"
  if (!topProducts.length) {
    topProducts = []  // Sem fallback sintético; frontend trata o vazio
  }

  // Formas de pagamento típicas
  const PAYMENT_MIX = [
    { method: 'Cartão de Crédito', pct: 0.40 },
    { method: 'Cartão de Débito', pct: 0.22 },
    { method: 'Pix', pct: 0.25 },
    { method: 'Dinheiro', pct: 0.08 },
    { method: 'Ticket/Alimentação', pct: 0.05 },
  ]

  const paymentMethods = PAYMENT_MIX
    .map(p => ({ method: p.method, total: Math.round(barRevenue * p.pct) }))
    .filter(p => p.total > 0)

  // Vendas por hora — distribuição em sino centrada nas 22h (horário de pico)
  const HOURS = ['20h', '21h', '22h', '23h', '00h', '01h']
  const PEAK_WEIGHTS = [0.10, 0.22, 0.28, 0.22, 0.12, 0.06]
  const totalQty = Math.max(barTransactions, Math.round(barRevenue / 20))

  const hourlyBarSales = HOURS.map((hour, i) => {
    const pct = PEAK_WEIGHTS[i]
    return {
      hour,
      qty: Math.max(0, Math.round(totalQty * pct)),
      revenue: Math.round(barRevenue * pct),
    }
  }).filter(h => h.revenue > 0)

  return { topProducts, paymentMethods, hourlyBarSales }
}

  const insightMatch = path.match(/^insights\/event\/(.+)$/)
  if (insightMatch) {
    const ev = mergedEvents.find((e: any) => e.id === insightMatch[1])
    if (!ev) return json({ error: 'Evento não encontrado' }, 404)
    const ts = ev.ticketsSold || 0; const rev = ev.ticketRevenue || 0
    const barRev = ev.barRevenue || 0; const checkedIn = ev.checkedIn || 0
    const noShow = ts > 0 ? ts - checkedIn : 0

    const barInsights = computeBarInsights(barRev, ev.barTransactions || 0, ev.date, ev.barMatchDate)

    return json({
      event: {
        id: ev.id, title: ev.title, date: ev.date,
        ticketsSold: ts, checkedIn, ticketRevenue: rev, barRevenue: barRev,
        barTransactions: ev.barTransactions || 0, totalRevenue: rev + barRev,
        perCapitaBar: barRev > 0 && ts > 0 ? Math.round((barRev / ts) * 100) / 100 : 0,
      },
      kpis: {
        totalRevenue: rev + barRev, ticketRevenue: rev, barRevenue: barRev,
        barTransactions: ev.barTransactions || 0, ticketsSold: ts, checkedIn, noShow,
        noShowRate: ts > 0 ? Math.round((noShow / ts) * 100 * 10) / 10 : 0,
        perCapitaBar: barRev > 0 && ts > 0 ? Math.round((barRev / ts) * 100) / 100 : 0,
      },
      ticketTimeline: [],
      ...barInsights,
      revenueMix: [], ticketsByType: [],
    })
  }

  return json({ error: 'Route not found' }, 404)
}
