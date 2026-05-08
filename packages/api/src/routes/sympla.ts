/**
 * /api/sympla/* — Sympla integration routes.
 *
 * - POST   /api/sympla/sync             → sync ALL events & orders from Sympla API
 * - GET    /api/sympla/status           → latest sync status + counts
 * - POST   /api/sympla/sync-event/:eventId  → sync ONE event by Sympla ID
 *
 * All routes require JWT auth (app.authenticate).
 */
import type { FastifyInstance } from 'fastify'
import {
  fetchAllEvents,
  fetchEventOrders,
  cached,
  invalidate,
  SymplaAuthError,
  UI_ONLY_EVENTS,
} from '../lib/sympla.js'

// Key used to store/lookup the latest sync record
const SYNC_RECORD_KEY = 'sympla:sync:latest'

export default async function symplaRoutes(app: FastifyInstance) {
  // All routes require auth
  app.addHook('preHandler', (app as any).authenticate)

  // Translate Sympla auth errors into a clear 502
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof SymplaAuthError) {
      return reply.status(502).send({
        error: 'sympla_token_expired_or_invalid',
        hint: 'Check SYMPLA_TOKEN in .env',
      })
    }
    app.log.error((err as Error).message)
    return reply.status(500).send({ error: (err as Error).message || 'sympla_error' })
  })

  // ── GET /status ──────────────────────────────────────
  // Returns the latest sync record + known event counts.
  app.get('/status', async () => {
    // Try to read the latest sync record from cache or DB
    const latestSync = await cached(SYNC_RECORD_KEY, 10_000, async () => {
      return (app as any).prisma.symplaSync.findFirst({
        orderBy: { createdAt: 'desc' },
      })
    })

    const totalEvents = await (app as any).prisma.event.count()
    const totalOrders = await (app as any).prisma.ticket.count()
    const eventsWithSymplaId = await (app as any).prisma.event.count({
      where: { symplaEventId: { not: null } },
    })

    return {
      ok: true,
      latestSync: latestSync || null,
      totals: {
        events: totalEvents,
        eventsWithSymplaId,
        tickets: totalOrders,
      },
      uiOnlyEvents: UI_ONLY_EVENTS.length,
      note: `${UI_ONLY_EVENTS.length} eventos de 2025-2026 não são acessíveis via API pública. Use CSV em POST /api/import/sympla.`,
    }
  })

  // ── POST /sync ───────────────────────────────────────
  // Full sync: fetch all events from Sympla, then for each event fetch orders.
  app.post('/sync', async (reply: any) => {
    const prisma = (app as any).prisma

    // Create a sync record
    const syncRecord = await prisma.symplaSync.create({
      data: {
        lastSyncAt: new Date(),
        status: 'syncing',
        eventsCount: 0,
        ordersCount: 0,
      },
    })

    try {
      // 1. Fetch all events from Sympla API
      app.log.info('Fetching all events from Sympla API...')
      const symplaEvents = await fetchAllEvents()
      app.log.info(`Found ${symplaEvents.length} events via API`)

      let totalOrders = 0

      // 2. For each event, find-or-create local Event + upsert Tickets
      for (const se of symplaEvents) {
        // Map Sympla event → local Event
        const slug = se.name
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + se.id

        const eventData = {
          title: se.name,
          slug,
          description: se.detail || '',
          date: new Date(se.start_date),
          endDate: se.end_date ? new Date(se.end_date) : null,
          status: se.cancelled ? 'cancelled' : se.published ? 'published' : 'draft',
          capacity: null, // capacity not available in list endpoint
          symplaEventId: String(se.id),
          symplaUrl: se.url || null,
        }

        // Upsert event by symplaEventId
        const existing = await prisma.event.findFirst({
          where: { symplaEventId: String(se.id) },
        })

        let event
        if (existing) {
          event = await prisma.event.update({
            where: { id: existing.id },
            data: eventData,
          })
        } else {
          event = await prisma.event.create({ data: eventData })
        }

        // 3. Fetch orders for this event
        app.log.info(`  Fetching orders for event #${se.id} "${se.name}"...`)
        const orders = await fetchEventOrders(se.id)
        app.log.info(`  → ${orders.length} orders`)

        // 4. Upsert tickets using order.id as externalId
        for (const order of orders) {
          const buyerFullName = `${order.buyer_first_name || ''} ${order.buyer_last_name || ''}`.trim() || 'Desconhecido'
          const totalPaid = parseFloat(order.order_total_sale_price || '0')

          // Since Ticket has no unique constraint on externalId,
          // we use findFirst + update/create pattern
          const existingTicket = await prisma.ticket.findFirst({
            where: {
              externalId: String(order.id),
              eventId: event.id,
            },
          })

          const ticketData = {
            eventId: event.id,
            buyerName: buyerFullName,
            buyerEmail: order.buyer_email || '',
            buyerPhone: null,
            ticketType: 'Inteira', // order-level doesn't have ticket type granularity
            quantity: 1,
            unitPrice: totalPaid,
            totalPaid,
            fee: order.order_total_net_value
              ? totalPaid - parseFloat(order.order_total_net_value)
              : null,
            purchaseDate: order.approved_date
              ? new Date(order.approved_date)
              : new Date(order.order_date),
            checkedIn: false,
            checkInTime: null,
            externalId: String(order.id),
            importBatch: syncRecord.id,
          }

          if (existingTicket) {
            await prisma.ticket.update({
              where: { id: existingTicket.id },
              data: ticketData,
            })
          } else {
            await prisma.ticket.create({ data: ticketData })
          }

          totalOrders++
        }
      }

      // 5. Mark sync as completed
      await prisma.symplaSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'completed',
          eventsCount: symplaEvents.length,
          ordersCount: totalOrders,
          lastSyncAt: new Date(),
        },
      })

      // Invalidate cache so /status picks up fresh data
      invalidate('sympla:')

      return {
        ok: true,
        syncId: syncRecord.id,
        eventsSynced: symplaEvents.length,
        ordersSynced: totalOrders,
        note: `${UI_ONLY_EVENTS.length} eventos 2025-2026 não estão incluídos (apenas via CSV).`,
      }
    } catch (err: any) {
      // Mark sync as failed
      await prisma.symplaSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'failed',
          errorLog: err.message?.slice(0, 2000) || 'Unknown error',
          lastSyncAt: new Date(),
        },
      }).catch(() => {}) // ignore if update fails

      throw err
    }
  })

  // ── POST /sync-event/:symplaEventId ──────────────────
  // Sync a SINGLE event by its Sympla event ID.
  app.post('/sync-event/:symplaEventId', async (req: any, reply: any) => {
    const prisma = (app as any).prisma
    const symplaEventId = (req.params as any).symplaEventId

    if (!symplaEventId) {
      return reply.status(400).send({ error: 'symplaEventId param is required' })
    }

    app.log.info(`Syncing single event #${symplaEventId}...`)

    try {
      // 1. Fetch event info from Sympla
      const eventInfo = await cached(`sympla:event:${symplaEventId}`, 60_000, async () => {
        return (await fetchAllEvents()).find(e => String(e.id) === symplaEventId)
      })

      if (!eventInfo) {
        return reply.status(404).send({
          error: 'Event not found in Sympla API',
          note: 'Event may be from 2025-2026 (not available via public API). Use CSV import instead.',
        })
      }

      // 2. Upsert local event
      const slug = eventInfo.name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + eventInfo.id

      const existingEvent = await prisma.event.findFirst({
        where: { symplaEventId },
      })

      let event
      const eventData = {
        title: eventInfo.name,
        slug,
        description: eventInfo.detail || '',
        date: new Date(eventInfo.start_date),
        endDate: eventInfo.end_date ? new Date(eventInfo.end_date) : null,
        status: eventInfo.cancelled ? 'cancelled' : eventInfo.published ? 'published' : 'draft',
        symplaEventId: String(eventInfo.id),
        symplaUrl: eventInfo.url || null,
      }

      if (existingEvent) {
        event = await prisma.event.update({
          where: { id: existingEvent.id },
          data: eventData,
        })
      } else {
        event = await prisma.event.create({ data: eventData })
      }

      // 3. Fetch orders
      const orders = await fetchEventOrders(symplaEventId)
      let ordersSynced = 0

      for (const order of orders) {
        const buyerFullName = `${order.buyer_first_name || ''} ${order.buyer_last_name || ''}`.trim() || 'Desconhecido'
        const totalPaid = parseFloat(order.order_total_sale_price || '0')

        const existingTicket = await prisma.ticket.findFirst({
          where: {
            externalId: String(order.id),
            eventId: event.id,
          },
        })

        const ticketData = {
          eventId: event.id,
          buyerName: buyerFullName,
          buyerEmail: order.buyer_email || '',
          ticketType: 'Inteira',
          quantity: 1,
          unitPrice: totalPaid,
          totalPaid,
          fee: order.order_total_net_value
            ? totalPaid - parseFloat(order.order_total_net_value)
            : null,
          purchaseDate: order.approved_date
            ? new Date(order.approved_date)
            : new Date(order.order_date),
          checkedIn: false,
          externalId: String(order.id),
        }

        if (existingTicket) {
          await prisma.ticket.update({
            where: { id: existingTicket.id },
            data: ticketData,
          })
        } else {
          await prisma.ticket.create({ data: ticketData })
        }
        ordersSynced++
      }

      // 4. Create a mini sync record
      await prisma.symplaSync.create({
        data: {
          lastSyncAt: new Date(),
          status: 'completed',
          eventsCount: 1,
          ordersCount: ordersSynced,
        },
      })

      invalidate('sympla:')

      return {
        ok: true,
        event: {
          id: event.id,
          title: event.title,
          symplaEventId,
        },
        ordersSynced,
      }
    } catch (err: any) {
      app.log.error(`Sync failed for event #${symplaEventId}: ${err.message}`)
      throw err
    }
  })
}
