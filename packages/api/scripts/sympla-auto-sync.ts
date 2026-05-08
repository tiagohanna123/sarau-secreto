/**
 * Sympla Auto-Sync Script
 *
 * Sincroniza dados da Sympla API direto no banco,
 * sem depender do servidor HTTP.
 *
 * Uso:
 *   cd /home/ser/sistema-sarau-secreto/app/packages/api
 *   DATABASE_URL="file:$(pwd)/prisma/dev.db" npx tsx scripts/sympla-auto-sync.ts
 */
import { PrismaClient } from '@prisma/client'
import {
  getEvents,
  getEventOrders,
  getEventParticipants,
  SymplaAuthError,
} from '../src/lib/sympla-api.js'

async function main() {
  const prisma = new PrismaClient()

  const batch = await prisma.importBatch.create({
    data: {
      source: 'sympla-api',
      recordsCount: 0,
      status: 'processing',
      metadata: JSON.stringify({ startedAt: new Date().toISOString() }),
    },
  })

  let totalOrders = 0
  let totalEvents = 0

  try {
    const symplaEvents = await getEvents()
    console.log(`[sympla-sync] Eventos encontrados: ${symplaEvents.length}`)

    for (const se of symplaEvents) {
      const refId = String(se.reference_id)
      const slug =
        se.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') +
        '-' +
        refId

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

      const orders = await getEventOrders(se.id)
      for (const order of orders) {
        const buyerName =
          `${order.buyer_first_name || ''} ${order.buyer_last_name || ''}`.trim() ||
          'Desconhecido'
        const totalPaid = parseFloat(order.order_total_sale_price || '0')
        const fee = order.order_total_net_value
          ? totalPaid - parseFloat(order.order_total_net_value)
          : null

        const existing = await prisma.ticket.findFirst({
          where: { externalId: String(order.id), eventId: event.id },
        })

        const ticketData = {
          eventId: event.id,
          buyerName,
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

        if (existing) {
          await prisma.ticket.update({ where: { id: existing.id }, data: ticketData })
        } else {
          await prisma.ticket.create({ data: ticketData })
        }
        totalOrders++
      }

      // Participants for check-in data
      try {
        const participants = await getEventParticipants(se.id)
        for (const p of participants) {
          const t = await prisma.ticket.findFirst({
            where: { externalId: String(p.order_id), eventId: event.id },
          })
          if (t && p.participant_checkin) {
            await prisma.ticket.update({
              where: { id: t.id },
              data: {
                checkedIn: true,
                checkInTime: p.participant_checkin_date
                  ? new Date(p.participant_checkin_date)
                  : null,
              },
            })
          }
        }
      } catch {
        // Participants endpoint may not be available for all events
      }
    }

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

    console.log(`[sympla-sync] OK: ${totalEvents} eventos, ${totalOrders} pedidos`)
  } catch (err) {
    const msg = err instanceof SymplaAuthError
      ? `SYMPLA_TOKEN inválido ou expirado: ${err.message}`
      : String(err)

    await prisma.importBatch
      .update({
        where: { id: batch.id },
        data: {
          status: 'failed',
          errorLog: msg.slice(0, 2000),
          completedAt: new Date(),
        },
      })
      .catch(() => {})

    console.error(`[sympla-sync] FAILED: ${msg}`)
    process.exit(1)
  }

  await prisma.$disconnect()
}

main()
