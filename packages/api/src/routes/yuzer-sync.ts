/**
 * /api/yuzer/sync — Trigger Yuzer data persistence
 *
 * Calls the Yuzer auto-sync logic via the server's Prisma instance.
 * Can be triggered manually (button) or via cron (HTTP POST).
 */
import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { fetchBarHistory } from '../lib/yuzer-history.js'

const PREP_WINDOW_DAYS = 3

export default async function yuzerSyncRoute(app: FastifyInstance) {
  app.post('/sync', { preHandler: [app.authenticate] }, async (req, reply) => {
    const prisma = (app as any).prisma as PrismaClient

    const batch = await prisma.importBatch.create({
      data: {
        source: 'yuzer-api',
        recordsCount: 0,
        status: 'processing',
        metadata: JSON.stringify({ startedAt: new Date().toISOString() }),
      },
    })

    try {
      const data = await fetchBarHistory()
      if (data.source === 'error') {
        throw new Error('Yuzer indisponível (live + backup falharam)')
      }

      const existingEvents = await prisma.event.findMany({
        select: { id: true, title: true, date: true },
      })
      const existingDates = new Map<string, string[]>()
      for (const ev of existingEvents) {
        const d = ev.date.toISOString().slice(0, 10)
        if (!existingDates.has(d)) existingDates.set(d, [])
        existingDates.get(d)!.push(ev.id)
      }

      let totalBarSales = 0
      let totalSynthEvents = 0

      for (const yev of data.eventos) {
        const startDate = yev.start
        const eventTitle = `Sarau Secreto (${startDate})`
        const slug = `sarau-secreto-${startDate}`

        let eventId: string | null = null

        const exactMatch = existingDates.get(startDate)
        if (exactMatch && exactMatch.length > 0) {
          eventId = exactMatch[0]
        } else {
          const startMs = new Date(startDate).getTime()
          for (const [edate, eids] of existingDates) {
            const diff = Math.abs(startMs - new Date(edate).getTime()) / 86400000
            if (diff <= PREP_WINDOW_DAYS) {
              eventId = eids[0]
              break
            }
          }
        }

        if (!eventId) {
          const synthEvent = await prisma.event.create({
            data: {
              title: eventTitle,
              slug,
              date: new Date(startDate),
              endDate: new Date(yev.end),
              status: 'completed',
            },
          })
          eventId = synthEvent.id
          existingDates.set(startDate, [synthEvent.id])
          totalSynthEvents++
        }

        const existingCount = await prisma.barSale.count({
          where: { eventId, importBatch: batch.id },
        })
        if (existingCount > 0) continue

        for (const prod of yev.produtos) {
          const qty = Math.min(prod.qty, 100)
          const unitPrice = prod.qty > 0 ? +(prod.total / prod.qty).toFixed(2) : 0
          await prisma.barSale.createMany({
            data: Array.from({ length: qty }, (_, i) => ({
              eventId: eventId!,
              productName: prod.name,
              quantity: 1,
              unitPrice,
              total: +(prod.total / qty).toFixed(2),
              saleTime: new Date(`${startDate}T${18 + (i % 6)}:00:00`),
              paymentMethod: 'yuzer-auto',
              importBatch: batch.id,
            })),
          })
          totalBarSales += qty
        }
      }

      await prisma.importBatch.update({
        where: { id: batch.id },
        data: {
          recordsCount: totalBarSales,
          status: 'completed',
          completedAt: new Date(),
          metadata: JSON.stringify({
            source: data.source,
            totalBarSales,
            totalSynthEvents,
            completedAt: new Date().toISOString(),
          }),
        },
      })

      await prisma.symplaSync.upsert({
        where: { id: 'yuzer-main' },
        update: { lastSyncAt: new Date(), eventsCount: totalSynthEvents, ordersCount: totalBarSales, status: 'completed' },
        create: { id: 'yuzer-main', lastSyncAt: new Date(), eventsCount: totalSynthEvents, ordersCount: totalBarSales, status: 'completed' },
      })

      return { ok: true, totalBarSales, totalSynthEvents, source: data.source }

    } catch (err: any) {
      await prisma.importBatch.update({
        where: { id: batch.id },
        data: { status: 'failed', errorLog: String(err).slice(0, 2000), completedAt: new Date() },
      }).catch(() => {})

      return reply.status(502).send({ error: String(err) })
    }
  })
}
