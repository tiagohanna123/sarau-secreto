/**
 * Sympla Sync Routes
 *
 * POST /api/sympla/sync   — Manual full sync: pull events + orders from Sympla API
 * GET  /api/sympla/status — Latest sync status + stats
 *
 * All routes require JWT authentication (app.authenticate).
 */
import type { FastifyInstance } from 'fastify'
import {
  getEvents,
  getEventOrders,
  getEventParticipants,
  SymplaAuthError,
} from '../lib/sympla-api.js'

export default async function symplaSyncRoutes(app: FastifyInstance) {
  // ── Error handler for Sympla auth issues ──
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof SymplaAuthError) {
      return reply.status(502).send({
        error: 'sympla_token_expired_or_invalid',
        hint: 'Verifique SYMPLA_TOKEN no .env',
      })
    }
    app.log.error((err as Error).message)
    return reply.status(500).send({ error: (err as Error).message || 'Erro interno' })
  })

  // ── GET /status ──────────────────────────────────────
  // Retorna o último sync registrado + contagens atuais.
  app.get('/status', { preHandler: [app.authenticate] }, async () => {
    const [lastSync, totalEvents, totalTickets, symplaEvents] = await Promise.all([
      app.prisma.importBatch.findFirst({
        where: { source: 'sympla-api' },
        orderBy: { createdAt: 'desc' },
      }),
      app.prisma.event.count(),
      app.prisma.ticket.count(),
      app.prisma.event.count({
        where: { symplaEventId: { not: null } },
      }),
    ])

    return {
      ok: true,
      lastSync: lastSync
        ? {
            id: lastSync.id,
            status: lastSync.status,
            recordsCount: lastSync.recordsCount,
            eventId: lastSync.eventId,
            errorLog: lastSync.errorLog,
            createdAt: lastSync.createdAt,
            completedAt: lastSync.completedAt,
          }
        : null,
      totals: {
        events: totalEvents,
        eventsWithSymplaId: symplaEvents,
        tickets: totalTickets,
      },
    }
  })

  // ── POST /sync ───────────────────────────────────────
  // Sincronização manual: puxa todos os eventos da Sympla,
  // cria/atualiza Event e Ticket no banco (upsert),
  // e registra ImportBatch.
  app.post('/sync', { preHandler: [app.authenticate] }, async (req: any, reply: any) => {
    const prisma = app.prisma

    // Cria registro de ImportBatch
    const batch = await prisma.importBatch.create({
      data: {
        source: 'sympla-api',
        recordsCount: 0,
        status: 'processing',
        importedBy: req.user?.id,
        metadata: JSON.stringify({ startedAt: new Date().toISOString() }),
      },
    })

    let totalOrders = 0
    let totalEvents = 0

    try {
      // 1. Puxar todos os eventos da API Sympla
      app.log.info('🔍 Buscando eventos da Sympla API...')
      const symplaEvents = await getEvents()
      app.log.info(`✅ Encontrados ${symplaEvents.length} eventos via API`)

      // 2. Para cada evento, upsert no banco e puxar orders/participants
      for (const se of symplaEvents) {
        const refId = String(se.reference_id)
        const slug = se.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + refId

        // Upsert Event por reference_id (único estável)
        const eventData = {
          title: se.name,
          slug,
          description: se.detail || '',
          date: new Date(se.start_date),
          endDate: se.end_date ? new Date(se.end_date) : null,
          status: se.cancelled ? 'cancelled' : se.published ? 'published' : 'draft',
          symplaEventId: refId,
          symplaUrl: se.url || null,
          imageUrl: se.image || null,
        }

        const event = await prisma.event.upsert({
          where: { slug },
          update: eventData,
          create: eventData,
        })

        totalEvents++

        // 3. Puxar pedidos (orders) deste evento
        app.log.info(`  📦 Buscando pedidos do evento #${se.id} "${se.name}"...`)
        const orders = await getEventOrders(se.id)
        app.log.info(`  → ${orders.length} pedidos encontrados`)

        // 4. Upsert Tickets por externalId
        for (const order of orders) {
          const buyerFullName =
            `${order.buyer_first_name || ''} ${order.buyer_last_name || ''}`.trim() ||
            'Desconhecido'
          const totalPaid = parseFloat(order.order_total_sale_price || '0')
          const fee = order.order_total_net_value
            ? totalPaid - parseFloat(order.order_total_net_value)
            : null

          const ticketData = {
            eventId: event.id,
            buyerName: buyerFullName,
            buyerEmail: order.buyer_email || '',
            buyerPhone: null,
            ticketType: 'Inteira',
            quantity: 1,
            unitPrice: totalPaid,
            totalPaid,
            fee,
            purchaseDate: order.approved_date
              ? new Date(order.approved_date)
              : new Date(order.order_date),
            checkedIn: false,
            checkInTime: null,
            externalId: String(order.id),
            importBatch: batch.id,
          }

          // Upsert por externalId + eventId
          const existing = await prisma.ticket.findFirst({
            where: {
              externalId: String(order.id),
              eventId: event.id,
            },
          })

          if (existing) {
            await prisma.ticket.update({
              where: { id: existing.id },
              data: ticketData,
            })
          } else {
            await prisma.ticket.create({ data: ticketData })
          }

          totalOrders++
        }

        // 5. Opcional: puxar participants para dados de check-in
        try {
          const participants = await getEventParticipants(se.id)
          // Atualizar check-in baseado nos participantes
          for (const p of participants) {
            const ticketExternalId = String(p.order_id)
            const existingTicket = await prisma.ticket.findFirst({
              where: {
                externalId: ticketExternalId,
                eventId: event.id,
              },
            })
            if (existingTicket && p.participant_checkin) {
              await prisma.ticket.update({
                where: { id: existingTicket.id },
                data: {
                  checkedIn: true,
                  checkInTime: p.participant_checkin_date
                    ? new Date(p.participant_checkin_date)
                    : null,
                },
              })
            }
          }
        } catch (err: any) {
          // Participants endpoint may not be available for all events
          app.log.warn(`  ⚠️ Não foi possível buscar participantes do evento #${se.id}: ${err.message}`)
        }
      }

      // 6. Finalizar ImportBatch
      await prisma.importBatch.update({
        where: { id: batch.id },
        data: {
          recordsCount: totalOrders,
          status: 'completed',
          completedAt: new Date(),
          metadata: JSON.stringify({
            eventsCount: totalEvents,
            ordersCount: totalOrders,
            completedAt: new Date().toISOString(),
          }),
        },
      })

      app.log.info(`✅ Sync completo: ${totalEvents} eventos, ${totalOrders} pedidos`)

      return {
        ok: true,
        batchId: batch.id,
        eventsSynced: totalEvents,
        ordersSynced: totalOrders,
      }
    } catch (err: any) {
      // Marcar ImportBatch como falha
      await prisma.importBatch
        .update({
          where: { id: batch.id },
          data: {
            status: 'failed',
            errorLog: err.message?.slice(0, 2000) || 'Erro desconhecido',
            completedAt: new Date(),
          },
        })
        .catch(() => {})

      throw err
    }
  })
}
