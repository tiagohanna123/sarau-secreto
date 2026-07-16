import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  location: z.string().optional(),
  capacity: z.number().optional(),
  symplaUrl: z.string().optional(),
  description: z.string().optional(),
})

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default async function (app: FastifyInstance) {
  // List events — unifica Event + BarSale (cria sintéticos para datas sem Event)
  app.get('/', { preHandler: [app.authenticate] }, async () => {
    // 1. Busca eventos do banco (como antes)
    const dbEvents = await (app as any).prisma.$queryRawUnsafe(`
      SELECT
        e.id, e.title, e.slug, e.date, e.location, e.capacity, e.status,
        e.soldCount, e.totalRevenue,
        CAST((SELECT COUNT(*) FROM Ticket t WHERE t.eventId = e.id) AS REAL) as ticketsSold,
        CAST((SELECT COUNT(*) FROM Ticket t WHERE t.eventId = e.id AND t.checkedIn = 1) AS REAL) as checkedIn,
        CAST((SELECT COALESCE(SUM(t.totalPaid), 0) FROM Ticket t WHERE t.eventId = e.id) AS REAL) as ticketRevenue,
        CAST((SELECT COALESCE(SUM(b.total), 0) FROM BarSale b WHERE b.eventId = e.id) AS REAL) as barRevenue
      FROM Event e
      ORDER BY e.date DESC
    `) as any[]

    const mappedEvents = dbEvents.map((e: any) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      date: e.date,
      location: e.location,
      capacity: e.capacity,
      status: e.status,
      ticketsSold: Number(e.soldCount ?? e.ticketsSold),
      checkedIn: Number(e.checkedIn),
      ticketRevenue: Number(e.totalRevenue ?? e.ticketRevenue),
      barRevenue: Number(e.barRevenue),
    }))

    // 2. Busca datas de BarSale sem Event correspondente → sintéticos
    // Agrupa BarSales por data (extrai YYYY-MM-DD de saleTime)
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

    // Conjunto de IDs/datas de Event existentes para evitar duplicatas
    const eventDateSet = new Set<string>()
    for (const e of mappedEvents) {
      if (e.date) {
        const d = e.date instanceof Date ? e.date.toISOString().slice(0, 10) : String(e.date).slice(0, 10)
        eventDateSet.add(d)
      }
    }

    // 3. Cria sintéticos para datas de BarSale sem Event
    const syntheticEvents: any[] = []
    for (const bs of barSales) {
      const barDate = String(bs.barDate).slice(0, 10)
      if (!barDate || barDate === 'null' || eventDateSet.has(barDate)) continue

      const rev = Number(bs.barRevenue)
      syntheticEvents.push({
        id: `bar-synth-${barDate}`,
        title: `Sarau Secreto (${barDate})`,
        slug: `sarau-secreto-${barDate}`,
        date: barDate,
        location: '',
        capacity: null,
        status: 'completed',
        ticketsSold: 0,
        checkedIn: 0,
        ticketRevenue: 0,
        barRevenue: rev,
      })
    }

    // 4. Merge todos, ordena por data descendente
    const all = [...mappedEvents, ...syntheticEvents]
    all.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0
      const db = b.date ? new Date(b.date).getTime() : 0
      return db - da
    })

    return all
  })

  // Get single event
  app.get('/:id', { preHandler: [app.authenticate] }, async (req: any, reply) => {
    const events = await (app as any).prisma.$queryRawUnsafe(`
      SELECT
        e.id, e.title, e.slug, e.date, e.location, e.capacity, e.status,
        e.description, e.symplaUrl, e.imageUrl, e.latitude, e.longitude,
        (SELECT COUNT(*) FROM Ticket t WHERE t.eventId = e.id) as ticketsSold,
        (SELECT COUNT(*) FROM Ticket t WHERE t.eventId = e.id AND t.checkedIn = 1) as checkedIn,
        (SELECT COALESCE(SUM(t.totalPaid), 0) FROM Ticket t WHERE t.eventId = e.id) as ticketRevenue,
        (SELECT COALESCE(SUM(b.total), 0) FROM BarSale b WHERE b.eventId = e.id) as barRevenue
      FROM Event e
      WHERE e.id = ? OR e.slug = ?
      LIMIT 1
    `, req.params.id, req.params.id) as any[]

    if (events.length === 0) return reply.status(404).send({ error: 'Evento não encontrado' })
    const e = events[0]
    return {
      id: e.id,
      title: e.title,
      slug: e.slug,
      date: e.date,
      location: e.location,
      capacity: e.capacity,
      status: e.status,
      description: e.description,
      symplaUrl: e.symplaUrl,
      imageUrl: e.imageUrl,
      latitude: e.latitude,
      longitude: e.longitude,
      ticketsSold: Number(e.ticketsSold),
      checkedIn: Number(e.checkedIn),
      ticketRevenue: Number(e.ticketRevenue),
      barRevenue: Number(e.barRevenue),
    }
  })

  // Create event
  app.post('/', { preHandler: [app.authenticate] }, async (req: any, reply: any) => {
    const data = createEventSchema.parse(req.body)
    const slug = slugify(data.title) + '-' + Date.now()
    const event = await (app as any).prisma.event.create({
      data: { ...data, slug, date: new Date(data.date) },
    })
    return reply.status(201).send(event)
  })

  // Update event
  app.patch('/:id', { preHandler: [app.authenticate] }, async (req: any, reply: any) => {
    const { id } = req.params
    const data = req.body
    const event = await (app as any).prisma.event.update({
      where: { id },
      data,
    })
    return event
  })

  // Delete event
  app.delete('/:id', { preHandler: [app.authenticate] }, async (req: any, reply: any) => {
    const { id } = req.params
    await (app as any).prisma.event.delete({ where: { id } })
    return { ok: true }
  })
}
