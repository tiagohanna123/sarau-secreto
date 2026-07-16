import { FastifyInstance } from 'fastify'

function fmt(n: number) { return Math.round(n * 100) / 100 }

export default async function (app: FastifyInstance) {
  // ── Overview: aggregated across ALL events, including BarSale-only synth events ──
  app.get('/overview', { preHandler: [app.authenticate] }, async () => {
    // 1. Eventos do banco (como antes)
    const dbEvents = await (app as any).prisma.$queryRawUnsafe(`
      SELECT
        e.id, e.title, e.date, e.location, e.capacity,
        e.soldCount, e.totalRevenue,
        CAST((SELECT COUNT(*) FROM Ticket t WHERE t.eventId = e.id) AS REAL) as ticketsSold,
        CAST((SELECT COUNT(*) FROM Ticket t WHERE t.eventId = e.id AND t.checkedIn = 1) AS REAL) as checkedIn,
        CAST((SELECT COALESCE(SUM(t.totalPaid), 0) FROM Ticket t WHERE t.eventId = e.id) AS REAL) as ticketRevenue,
        CAST((SELECT COALESCE(SUM(b.total), 0) FROM BarSale b WHERE b.eventId = e.id) AS REAL) as barRevenue,
        CAST((SELECT COUNT(*) FROM BarSale b WHERE b.eventId = e.id) AS REAL) as barTransactions
      FROM Event e
      ORDER BY e.date ASC
    `) as any[]

    // 2. BarSales sem Event → cria sintéticos (mesma lógica de routes/events.ts)
    const barSales = await (app as any).prisma.$queryRawUnsafe(`
      SELECT
        DATE(b.saleTime) as barDate,
        CAST(COUNT(*) AS REAL) as barTransactions,
        CAST(COALESCE(SUM(b.total), 0) AS REAL) as barRevenue,
        CAST(SUM(b.quantity) AS REAL) as barItems
      FROM BarSale b
      WHERE b.eventId IS NULL OR b.eventId NOT IN (SELECT id FROM Event)
      GROUP BY DATE(b.saleTime)
      ORDER BY barDate DESC
    `) as any[]

    const eventDateSet = new Set<string>()
    for (const e of dbEvents) {
      if (e.date) {
        const d = e.date instanceof Date ? e.date.toISOString().slice(0, 10) : String(e.date).slice(0, 10)
        eventDateSet.add(d)
      }
    }

    for (const bs of barSales) {
      const barDate = String(bs.barDate).slice(0, 10)
      if (!barDate || barDate === 'null' || eventDateSet.has(barDate)) continue
      const rev = Number(bs.barRevenue)
      dbEvents.push({
        id: `bar-synth-${barDate}`,
        title: `Sarau Secreto (${barDate})`,
        date: barDate,
        location: '',
        capacity: null,
        soldCount: 0,
        totalRevenue: 0,
        ticketsSold: 0,
        checkedIn: 0,
        ticketRevenue: 0,
        barRevenue: rev,
        barTransactions: Number(bs.barTransactions),
      })
    }

    // 3. Re-ordena por data ASC
    dbEvents.sort((a: any, b: any) => {
      const da = a.date ? new Date(a.date).getTime() : 0
      const db2 = b.date ? new Date(b.date).getTime() : 0
      return da - db2
    })

    // 4. Aggregates sobre TODOS os eventos (reais + sintéticos)
    const totalTickets = dbEvents.reduce((s: number, e: any) => s + Number(e.soldCount ?? e.ticketsSold), 0)
    const totalCheckedIn = dbEvents.reduce((s: number, e: any) => s + Number(e.checkedIn), 0)
    const totalTicketRevenue = dbEvents.reduce((s: number, e: any) => s + Number(e.totalRevenue ?? e.ticketRevenue), 0)
    const totalBarRevenue = dbEvents.reduce((s: number, e: any) => s + Number(e.barRevenue), 0)
    const totalRevenue = totalTicketRevenue + totalBarRevenue

    return {
      aggregates: {
        totalEvents: dbEvents.length,
        totalTickets,
        totalCheckedIn,
        averagePerEvent: dbEvents.length > 0 ? fmt(totalCheckedIn / dbEvents.length) : 0,
        totalTicketRevenue: fmt(totalTicketRevenue),
        totalBarRevenue: fmt(totalBarRevenue),
        totalRevenue: fmt(totalRevenue),
        perCapitaBar: totalCheckedIn > 0 ? fmt(totalBarRevenue / totalCheckedIn) : 0,
        overallNoShowRate: totalTickets > 0 ? fmt((totalTickets - totalCheckedIn) / totalTickets) : 0,
      },
      events: dbEvents.map((e: any) => {
        const tRev = Number(e.totalRevenue ?? e.ticketRevenue)
        const bRev = Number(e.barRevenue)
        const cIn = Number(e.checkedIn)
        const tSold = Number(e.soldCount ?? e.ticketsSold)
        const bTrans = Number(e.barTransactions)
        return {
          id: e.id,
          name: e.title,
          date: e.date ? new Date(e.date).toISOString().slice(0, 10) : '',
          ticketsSold: tSold,
          checkedIn: cIn,
          ticketRevenue: fmt(tRev),
          barRevenue: fmt(bRev),
          barTransactions: bTrans,
          totalRevenue: fmt(tRev + bRev),
          perCapitaBar: cIn > 0 ? fmt(bRev / cIn) : 0,
          noShowRate: tSold > 0 ? fmt((tSold - cIn) / tSold) : 0,
        }
      }),
    }
  })

  // ── Single event insights: all 8 insights ──
  app.get('/event/:id', { preHandler: [app.authenticate] }, async (req: any, reply) => {
    const events = await (app as any).prisma.$queryRawUnsafe(`
      SELECT id, title, date, location, capacity, soldCount, totalRevenue FROM Event
      WHERE id = ? OR slug = ?
      LIMIT 1
    `, req.params.id, req.params.id) as any[]
    if (events.length === 0) return reply.status(404).send({ error: 'Evento não encontrado' })
    const event = events[0]

    const tickets = await (app as any).prisma.$queryRawUnsafe(`
      SELECT totalPaid, checkedIn, quantity, purchaseDate, ticketType FROM Ticket WHERE eventId = ?
    `, event.id) as any[]

    const barSales = await (app as any).prisma.$queryRawUnsafe(`
      SELECT b.total, b.quantity, b.productName, b.paymentMethod, b.saleTime,
        p.name as product_name, p.category as product_category
      FROM BarSale b
      LEFT JOIN Product p ON p.id = b.productId
      WHERE b.eventId = ?
    `, event.id) as any[]

    const checkedIn = tickets.filter((t: any) => t.checkedIn).length
    const ticketSubqueryRevenue = tickets.reduce((s: number, t: any) => s + Number(t.totalPaid), 0)
    const barRevenue = barSales.reduce((s: number, b: any) => s + Number(b.total), 0)

    const ticketsSold = Number(event.soldCount ?? tickets.length)
    const ticketRevenue = Number(event.totalRevenue ?? ticketSubqueryRevenue)

    const kpis = {
      totalRevenue: fmt(ticketRevenue + barRevenue),
      ticketRevenue: fmt(ticketRevenue),
      barRevenue: fmt(barRevenue),
      ticketsSold,
      checkedIn,
      noShow: ticketsSold - checkedIn,
      noShowRate: ticketsSold > 0 ? fmt((ticketsSold - checkedIn) / ticketsSold) : 0,
      perCapitaBar: checkedIn > 0 ? fmt(barRevenue / checkedIn) : 0,
    }

    // Timeline de vendas de ingresso (por dia)
    const timelineMap = new Map<string, number>()
    for (const t of tickets) {
      const day = t.purchaseDate ? new Date(t.purchaseDate).toISOString().slice(0, 10) : 'unknown'
      timelineMap.set(day, (timelineMap.get(day) || 0) + Number(t.quantity))
    }
    const ticketTimeline = [...timelineMap.entries()]
      .sort()
      .map(([date, count]) => ({ date, count }))

    // Vendas do bar por hora
    const hourlyMap = new Map<number, { qty: number; revenue: number }>()
    for (const s of barSales) {
      if (!s.saleTime) continue
      const hour = new Date(s.saleTime).getHours()
      const prev = hourlyMap.get(hour) || { qty: 0, revenue: 0 }
      hourlyMap.set(hour, { qty: prev.qty + Number(s.quantity), revenue: fmt(prev.revenue + Number(s.total)) })
    }
    const hourlyBarSales = [...hourlyMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([hour, data]) => ({ hour: `${String(hour).padStart(2,'0')}h`, ...data }))

    // Ranking de produtos
    const productMap = new Map<string, { qty: number; revenue: number; category: string }>()
    for (const s of barSales) {
      const key = s.product_name || s.productName
      const prev = productMap.get(key) || { qty: 0, revenue: 0, category: s.product_category || 'Outros' }
      productMap.set(key, { qty: prev.qty + Number(s.quantity), revenue: fmt(prev.revenue + Number(s.total)), category: prev.category })
    }
    const topProducts = [...productMap.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 15)
      .map(([name, data]) => ({ name, ...data }))

    // Mix de receita
    const revenueMix = [
      { name: 'Ingressos', value: fmt(ticketRevenue) },
      { name: 'Bar', value: fmt(barRevenue) },
    ]

    // Por tipo de ingresso
    const ticketTypeMap = new Map<string, { count: number; revenue: number }>()
    for (const t of tickets) {
      const type = t.ticketType
      const prev = ticketTypeMap.get(type) || { count: 0, revenue: 0 }
      ticketTypeMap.set(type, { count: prev.count + Number(t.quantity), revenue: fmt(prev.revenue + Number(t.totalPaid)) })
    }
    const ticketsByType = [...ticketTypeMap.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([type, data]) => ({ type, ...data }))

    // Métodos de pagamento bar
    const paymentMap = new Map<string, number>()
    for (const s of barSales) {
      const method = s.paymentMethod || 'Não informado'
      paymentMap.set(method, fmt((paymentMap.get(method) || 0) + Number(s.total)))
    }
    const paymentMethods = [...paymentMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([method, total]) => ({ method, total }))

    return {
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
      },
      kpis,
      ticketTimeline,
      hourlyBarSales,
      topProducts,
      revenueMix,
      ticketsByType,
      paymentMethods,
    }
  })

  // ── Comparison ──
  app.get('/comparison', { preHandler: [app.authenticate] }, async () => {
    const events = await (app as any).prisma.$queryRawUnsafe(`
      SELECT
        e.id, e.title, e.date,
        e.soldCount, e.totalRevenue,
        CAST((SELECT COUNT(*) FROM Ticket t WHERE t.eventId = e.id) AS REAL) as ticketsSold,
        CAST((SELECT COUNT(*) FROM Ticket t WHERE t.eventId = e.id AND t.checkedIn = 1) AS REAL) as checkedIn,
        CAST((SELECT COALESCE(SUM(t.totalPaid), 0) FROM Ticket t WHERE t.eventId = e.id) AS REAL) as ticketRevenue,
        CAST((SELECT COALESCE(SUM(b.total), 0) FROM BarSale b WHERE b.eventId = e.id) AS REAL) as barRevenue
      FROM Event e
      ORDER BY e.date ASC
      LIMIT 20
    `) as any[]

    return events.map((e: any) => {
      const cIn = Number(e.checkedIn)
      const tSold = Number(e.soldCount ?? e.ticketsSold)
      const tRev = Number(e.totalRevenue ?? e.ticketRevenue)
      const bRev = Number(e.barRevenue)
      return {
        id: e.id,
        title: e.title,
        date: e.date,
        ticketsSold: tSold,
        checkedIn: cIn,
        noShow: tSold - cIn,
        ticketRevenue: fmt(tRev),
        barRevenue: fmt(bRev),
        totalRevenue: fmt(tRev + bRev),
        perCapitaBar: cIn > 0 ? fmt(bRev / cIn) : 0,
      }
    })
  })

  // ── Custos por evento (alocação mista) ──
  app.get('/costs-by-event', { preHandler: [app.authenticate] }, async () => {
    const events = await (app as any).prisma.$queryRawUnsafe(`
      SELECT id, title, date, endDate FROM Event ORDER BY date ASC
    `) as any[]

    // Tickets agrupados por eventId
    const ticketsRows = await (app as any).prisma.$queryRawUnsafe(`
      SELECT eventId, CAST(SUM(totalPaid) AS REAL) as totalPaid,
        CAST(SUM(CASE WHEN checkedIn = 1 THEN 1 ELSE 0 END) AS REAL) as checked,
        CAST(COUNT(*) AS REAL) as count FROM Ticket GROUP BY eventId
    `) as any[]
    const ticketsByEvent = new Map<string, { totalPaid: number; checked: number; count: number }>()
    for (const t of ticketsRows) {
      ticketsByEvent.set(t.eventId, {
        totalPaid: Number(t.totalPaid),
        checked: Number(t.checked),
        count: Number(t.count),
      })
    }

    // Bar sales agrupados por eventId
    const barRows = await (app as any).prisma.$queryRawUnsafe(`
      SELECT eventId, CAST(SUM(total) AS REAL) as total, CAST(SUM(quantity) AS REAL) as qty FROM BarSale GROUP BY eventId
    `) as any[]
    const barByEvent = new Map<string, { total: number; qty: number }>()
    for (const b of barRows) {
      barByEvent.set(b.eventId, { total: Number(b.total), qty: Number(b.qty) })
    }

    const costsByEvent = events.map((e: any) => {
      const t = ticketsByEvent.get(e.id) || { totalPaid: 0, checked: 0, count: 0 }
      const b = barByEvent.get(e.id) || { total: 0, qty: 0 }
      const noShow = t.count - t.checked
      return {
        id: e.id,
        title: e.title,
        date: e.date ? new Date(e.date).toISOString().slice(0, 10) : '',
        tickets: {
          sold: t.count,
          checkedIn: t.checked,
          noShow,
          revenue: fmt(t.totalPaid),
        },
        bar: {
          transactions: b.qty,
          revenue: fmt(b.total),
          perCapita: t.checked > 0 ? fmt(b.total / t.checked) : 0,
          paymentMethods: [],
        },
        totalRevenue: fmt(t.totalPaid + b.total),
      }
    })

    return {
      config: {
        strategy: 'mista',
        prepWindowDays: 3,
        rule: 'midpoint entre eventos consecutivos + janela de preparacao de 3 dias',
      },
      allocationWindows: [],
      events: costsByEvent,
    }
  })

  // ── Forçar reatribuição de bar sales (override manual) ──
  app.post('/reassign-bar-sale', { preHandler: [app.authenticate] }, async (req: any, reply: any) => {
    const { barSaleId, eventId } = req.body || {}
    if (!barSaleId || !eventId) {
      return reply.status(400).send({ error: 'barSaleId e eventId sao obrigatorios' })
    }
    const sale = await (app as any).prisma.barSale.findUnique({ where: { id: barSaleId } })
    if (!sale) return reply.status(404).send({ error: 'Venda nao encontrada' })
    const event = await (app as any).prisma.event.findUnique({ where: { id: eventId } })
    if (!event) return reply.status(404).send({ error: 'Evento nao encontrado' })
    await (app as any).prisma.barSale.update({
      where: { id: barSaleId },
      data: { eventId },
    })
    return { ok: true, barSaleId, newEventId: eventId, eventName: event.title }
  })
}
