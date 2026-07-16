import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const createArtistSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  genre: z.string().optional(),
  contact: z.string().optional(),
  instagram: z.string().optional(),
  bio: z.string().optional(),
})

export default async function (app: FastifyInstance) {
  // List all artists
  app.get('/', { preHandler: [(app as any).authenticate] }, async () => {
    const artists = await (app as any).prisma.artist.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { eventJoins: true } },
        eventJoins: {
          include: {
            event: {
              include: { tickets: true },
            },
          },
        },
      },
    })

    return artists.map((artist: any) => {
      const events = artist.eventJoins.map((join: any) => join.event)
      const totalAudience = events.reduce(
        (sum: number, e: any) =>
          sum +
          (e.soldCount ??
            e.tickets.reduce((s: number, t: any) => s + t.quantity, 0)),
        0
      )

      return {
        id: artist.id,
        name: artist.name,
        genre: artist.genre,
        contact: artist.contact,
        instagram: artist.instagram,
        bio: artist.bio,
        eventCount: artist._count.eventJoins,
        totalAudience,
      }
    })
  })

  // Get single artist
  app.get(
    '/:id',
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply: any) => {
      const artist = await (app as any).prisma.artist.findUnique({
        where: { id: req.params.id },
        include: {
          _count: { select: { eventJoins: true } },
          eventJoins: {
            include: {
              event: {
                include: { tickets: true },
              },
            },
          },
        },
      })

      if (!artist)
        return reply.status(404).send({ error: 'Artista não encontrado' })

      const events = artist.eventJoins.map((join: any) => join.event)

      const totalAudience = events.reduce(
        (sum: number, e: any) =>
          sum + e.tickets.reduce((s: number, t: any) => s + t.quantity, 0),
        0
      )

      const totalTicketRevenue = events.reduce(
        (sum: number, e: any) =>
          sum + e.tickets.reduce((s: number, t: any) => s + t.totalPaid, 0),
        0
      )

      return {
        id: artist.id,
        name: artist.name,
        genre: artist.genre,
        contact: artist.contact,
        instagram: artist.instagram,
        bio: artist.bio,
        eventCount: artist._count.eventJoins,
        totalAudience,
        totalTicketRevenue,
        events: events.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: event.date.toISOString(),
          ticketsSold: event.tickets.reduce(
            (s: number, t: any) => s + t.quantity,
            0
          ),
          ticketRevenue: event.tickets.reduce(
            (s: number, t: any) => s + t.totalPaid,
            0
          ),
          checkedIn: event.tickets.reduce(
            (s: number, t: any) => s + (t.checkedIn ? t.quantity : 0),
            0
          ),
        })),
      }
    }
  )

  // Create artist
  app.post(
    '/',
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply: any) => {
      const body = createArtistSchema.parse(req.body)
      const existing = await (app as any).prisma.artist.findFirst({
        where: { name: body.name },
      })
      if (existing) {
        return reply.status(409).send({ error: 'Artista já cadastrado' })
      }
      const artist = await (app as any).prisma.artist.create({ data: body })
      return artist
    }
  )

  // Update artist
  app.patch(
    '/:id',
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const { id } = req.params
      const body = req.body as any
      const artist = await (app as any).prisma.artist.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.genre !== undefined && { genre: body.genre }),
          ...(body.contact !== undefined && { contact: body.contact }),
          ...(body.instagram !== undefined && { instagram: body.instagram }),
          ...(body.bio !== undefined && { bio: body.bio }),
        },
      })
      return artist
    }
  )

  // Delete artist
  app.delete(
    '/:id',
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply: any) => {
      try {
        await (app as any).prisma.artist.delete({
          where: { id: req.params.id },
        })
        return { ok: true }
      } catch {
        return reply.status(404).send({ error: 'Artista não encontrado' })
      }
    }
  )

  // ── Artist detail with events + ticket data ──
  app.get(
    '/:id/detail',
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply: any) => {
      const prisma = (app as any).prisma

      const artist = await prisma.artist.findUnique({
        where: { id: req.params.id },
        include: {
          _count: { select: { eventJoins: true } },
          eventJoins: {
            include: {
              event: {
                include: { tickets: true },
              },
            },
          },
        },
      })

      if (!artist)
        return reply.status(404).send({ error: 'Artista não encontrado' })

      const events = artist.eventJoins.map((join: any) => join.event)

      const totalAudience = events.reduce(
        (sum: number, e: any) =>
          sum + e.tickets.reduce((s: number, t: any) => s + t.quantity, 0),
        0
      )

      const totalTicketRevenue = events.reduce(
        (sum: number, e: any) =>
          sum + e.tickets.reduce((s: number, t: any) => s + t.totalPaid, 0),
        0
      )

      return {
        id: artist.id,
        name: artist.name,
        genre: artist.genre,
        contact: artist.contact,
        instagram: artist.instagram,
        bio: artist.bio,
        eventCount: artist._count.eventJoins,
        totalAudience,
        totalTicketRevenue,
        events: events.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: event.date.toISOString(),
          ticketsSold: event.tickets.reduce(
            (s: number, t: any) => s + t.quantity,
            0
          ),
          ticketRevenue: event.tickets.reduce(
            (s: number, t: any) => s + t.totalPaid,
            0
          ),
          checkedIn: event.tickets.reduce(
            (s: number, t: any) => s + (t.checkedIn ? t.quantity : 0),
            0
          ),
        })),
      }
    }
  )

  // ── Link artist to event (optional) ──
  app.post(
    '/:id/link/:eventId',
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply: any) => {
      const { id: artistId, eventId } = req.params as {
        id: string
        eventId: string
      }
      const prisma = (app as any).prisma

      const [artist, event] = await Promise.all([
        prisma.artist.findUnique({ where: { id: artistId } }),
        prisma.event.findUnique({ where: { id: eventId } }),
      ])
      if (!artist)
        return reply.status(404).send({ error: 'Artista não encontrado' })
      if (!event)
        return reply.status(404).send({ error: 'Evento não encontrado' })

      const existing = await prisma.eventArtistJoin.findUnique({
        where: { eventId_artistId: { eventId, artistId } },
      })
      if (existing)
        return reply.status(409).send({ error: 'Artista já vinculado a este evento' })

      const link = await prisma.eventArtistJoin.create({
        data: { eventId, artistId },
      })
      return reply.status(201).send(link)
    }
  )
}
