// Cloudflare Pages Function — GET /api/events/[[path]]
// Serve dados de eventos + analytics usando os embeds TS.
// Fallback para o cliente: se essa function falhar, api.ts usa computeFromEmbed.

import { EMBEDDED_DB } from '../../src/lib/db-embed'
import { BAR_EMBED } from '../../src/lib/bar-embed'
import { CHECKIN_EMBED } from '../../src/lib/checkin-embed'

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseDate(iso: string) {
  if (!iso) return ''
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

function checkinForEvent(eventId: string): { checkedIn: number } | null {
  return (CHECKIN_EMBED as any)[eventId] ?? null
}

function buildMergedEvents() {
  const { events: dbEvents, tickets } = EMBEDDED_DB
  const barEvents = (BAR_EMBED as any)?.eventos || []
  const barRevMap = (BAR_EMBED as any)?.eventBarRevenue || {}

  const barByDate = new Map<string, any>()
  for (const be of barEvents) {
    const d = be.start ? be.start.slice(0, 10) : ''
    if (d) barByDate.set(d, be)
  }

  const matchedDates = new Set<string>()
  const merged: any[] = []

  for (const ev of dbEvents) {
    const evDate = parseDate(ev.date)
    let barMatch: any = null
    let bestDist = 999

    const barRevEntry = ev.id ? (barRevMap[ev.id] ?? (ev.symplaEventId ? barRevMap[`sympla-${ev.symplaEventId}`] : undefined)) : undefined
    if (barRevEntry !== undefined) {
      if (barRevEntry !== null) {
        barMatch = {
          date: evDate,
          event: { revenue: barRevEntry.revenue, orders: barRevEntry.transactions || 0 },
        }
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
    const sold = tickets[ev.id]?.count ?? ev.soldCount ?? 0
    const ticketRev = tickets[ev.id]?.revenue ?? ev.totalRevenue ?? 0

    merged.push({
      id: ev.id,
      title: ev.title,
      slug: slugify(ev.title),
      date: evDate,
      location: (ev as any).location || '',
      capacity: ev.capacity,
      status: ev.status || 'completed',
      ticketsSold: sold,
      checkedIn: checkinForEvent(ev.id)?.checkedIn ?? 0,
      ticketRevenue: ticketRev,
      barRevenue: barRev,
      barTransactions: (barMatch && bestDist <= 2) ? (barMatch.event.orders || 0) : 0,
      totalRevenue: ticketRev + barRev,
      perCapitaBar: sold > 0 && barRev > 0 ? Math.round((barRev / sold) * 100) / 100 : 0,
    })
  }

  const allDbDates = dbEvents.map(ev => parseDate(ev.date))
  for (const [bd, be] of barByDate) {
    if (matchedDates.has(bd)) continue
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
      barRevenue: rev,
      barTransactions: be.orders || 0,
      totalRevenue: rev,
      perCapitaBar: 0,
    })
  }

  merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return merged
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

export async function onRequest(context: { request: Request; env: any; params: { path?: string } }) {
  const url = new URL(context.request.url)
  const path = url.pathname.replace(/^\/api\//, '') // 'events', 'events/xxx', 'insights/overview', etc

  const mergedEvents = buildMergedEvents()

  // GET /api/events
  if (path === 'events') {
    return new Response(JSON.stringify(mergedEvents), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  // GET /api/events/:id
  const eventMatch = path.match(/^events\/(.+)$/)
  if (eventMatch) {
    const ev = mergedEvents.find((e: any) => e.id === eventMatch[1])
    if (!ev) {
      return new Response(JSON.stringify({ error: 'Evento não encontrado' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      })
    }
    return new Response(JSON.stringify(ev), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  // GET /api/insights/overview
  if (path === 'insights/overview') {
    const mapped = mergedEvents.map((ev: any) => ({
      id: ev.id, name: ev.title, date: ev.date,
      ticketsSold: ev.ticketsSold || 0,
      checkedIn: ev.checkedIn || 0,
      ticketRevenue: ev.ticketRevenue || 0,
      barRevenue: ev.barRevenue || 0,
      barTransactions: ev.barTransactions || 0,
      totalRevenue: (ev.ticketRevenue || 0) + (ev.barRevenue || 0),
      perCapitaBar: (ev.ticketsSold || 0) > 0 && (ev.barRevenue || 0) > 0
        ? Math.round(((ev.barRevenue || 0) / (ev.ticketsSold || 0)) * 100) / 100 : 0,
      noShowRate: (ev.ticketsSold || 0) > 0 && (ev.checkedIn || 0) > 0
        ? Math.round((((ev.ticketsSold || 0) - (ev.checkedIn || 0)) / (ev.ticketsSold || 0)) * 100 * 10) / 10 : 0,
    }))
    return new Response(JSON.stringify({
      aggregates: recomputeAggregates(mergedEvents),
      events: mapped,
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  // GET /api/insights/comparison
  if (path === 'insights/comparison') {
    const data = mergedEvents
      .map((ev: any) => ({
        id: ev.id, title: ev.title, date: ev.date,
        ticketsSold: ev.ticketsSold || 0,
        checkedIn: ev.checkedIn || 0,
        noShow: (ev.ticketsSold || 0) - (ev.checkedIn || 0),
        ticketRevenue: ev.ticketRevenue || 0,
        barRevenue: ev.barRevenue || 0,
        barTransactions: ev.barTransactions || 0,
        totalRevenue: (ev.ticketRevenue || 0) + (ev.barRevenue || 0),
        perCapitaBar: ev.ticketsSold > 0 && ev.barRevenue > 0
          ? Math.round((ev.barRevenue / ev.ticketsSold) * 100) / 100 : 0,
      }))
      .filter((e: any) => e.ticketsSold > 0 || e.ticketRevenue > 0 || e.barRevenue > 0)
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  // GET /api/insights/event/:id
  const insightMatch = path.match(/^insights\/event\/(.+)$/)
  if (insightMatch) {
    const ev = mergedEvents.find((e: any) => e.id === insightMatch[1])
    if (!ev) {
      return new Response(JSON.stringify({ error: 'Evento não encontrado' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      })
    }
    const ts = ev.ticketsSold || 0
    const rev = ev.ticketRevenue || 0
    const barRev = ev.barRevenue || 0
    const checkedIn = ev.checkedIn || 0
    const noShow = ts > 0 ? ts - checkedIn : 0
    return new Response(JSON.stringify({
      event: {
        id: ev.id, title: ev.title, date: ev.date,
        ticketsSold: ts, checkedIn,
        ticketRevenue: rev, barRevenue: barRev,
        barTransactions: ev.barTransactions || 0,
        totalRevenue: rev + barRev,
        perCapitaBar: barRev > 0 && ts > 0 ? Math.round((barRev / ts) * 100) / 100 : 0,
      },
      kpis: {
        totalRevenue: rev + barRev, ticketRevenue: rev, barRevenue: barRev,
        barTransactions: ev.barTransactions || 0,
        ticketsSold: ts, checkedIn, noShow,
        noShowRate: ts > 0 ? Math.round((noShow / ts) * 100 * 10) / 10 : 0,
        perCapitaBar: barRev > 0 && ts > 0 ? Math.round((barRev / ts) * 100) / 100 : 0,
      },
      ticketTimeline: [], hourlyBarSales: [], topProducts: [],
      revenueMix: [], ticketsByType: [], paymentMethods: [],
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  return new Response(JSON.stringify({ error: 'Route not found' }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  })
}
