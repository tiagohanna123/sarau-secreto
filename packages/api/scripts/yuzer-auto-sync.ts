/**
 * Yuzer Auto-Sync Script
 *
 * Sincroniza vendas do Yuzer Eagle para o banco (BarSale + Event sintético).
 *
 * Uso:
 *   cd packages/api
 *   DATABASE_URL="file:$(pwd)/prisma/dev.db" npx tsx scripts/yuzer-auto-sync.ts
 */
import { PrismaClient } from '@prisma/client'
import { fetchBarHistory, type EventDetail } from '../src/lib/yuzer-history.js'

const PREP_WINDOW_DAYS = 3

async function main() {
  const prisma = new PrismaClient()

  const batch = await prisma.importBatch.create({
    data: {
      source: 'yuzer-api',
      recordsCount: 0,
      status: 'processing',
      metadata: JSON.stringify({ startedAt: new Date().toISOString() }),
    },
  })

  try {
    // 1. Fetch Yuzer data (live, fallback to backup)
    const data = await fetchBarHistory()
    if (data.source === 'error') {
      throw new Error('Yuzer indisponível (live + backup falharam)')
    }

    console.log(`[yuzer-sync] Fonte: ${data.source}, ${data.totalEvents} eventos, ${data.totalOrders} pedidos`)

    // 2. Load existing events for matching
    const existingEvents = await prisma.event.findMany({
      select: { id: true, title: true, date: true },
    })
    const existingDates = new Map<string, string[]>() // date -> eventIds
    for (const ev of existingEvents) {
      const d = ev.date.toISOString().slice(0, 10)
      if (!existingDates.has(d)) existingDates.set(d, [])
      existingDates.get(d)!.push(ev.id)
    }

    // 3. Process each Yuzer event
    let totalBarSales = 0
    let totalSynthEvents = 0

    for (const yev of data.eventos) {
      const startDate = yev.start
      const endDate = yev.end
      const eventTitle = `Sarau Secreto (${startDate})`
      const slug = `sarau-secreto-${startDate}`

      // Find an existing event by date (±2 days) or create synthetic
      let eventId: string | null = null

      // Try exact date match first
      const exactMatch = existingDates.get(startDate)
      if (exactMatch && exactMatch.length > 0) {
        eventId = exactMatch[0]
      } else {
        // Try fuzzy date match
        const startMs = new Date(startDate).getTime()
        for (const [edate, eids] of existingDates) {
          const eMs = new Date(edate).getTime()
          const diff = Math.abs(startMs - eMs) / 86400000
          if (diff <= PREP_WINDOW_DAYS) {
            eventId = eids[0]
            break
          }
        }
      }

      // No existing event found → create synthetic
      if (!eventId) {
        const synthEvent = await prisma.event.create({
          data: {
            title: eventTitle,
            slug,
            date: new Date(startDate),
            endDate: new Date(endDate),
            status: 'completed',
          },
        })
        eventId = synthEvent.id
        existingDates.set(startDate, [synthEvent.id])
        totalSynthEvents++
        console.log(`[yuzer-sync] Evento sintético criado: ${eventTitle}`)
      }

      // 4. Persist bar sales for this event (aggregated by product)
      // Check if sales already exist for this event from ANY yuzer-api batch
      // (using importBatch: batch.id was WRONG — each run creates a new batch)
      const yuzerBatches = await prisma.importBatch.findMany({
        where: { source: 'yuzer-api', status: 'completed' },
        select: { id: true },
      })
      const yuzerBatchIds = yuzerBatches.map(b => b.id)
      const existingCount = yuzerBatchIds.length > 0
        ? await prisma.barSale.count({
            where: { eventId, importBatch: { in: yuzerBatchIds } },
          })
        : 0

      if (existingCount > 0) {
        console.log(`[yuzer-sync] BarSales já existem p/ ${eventTitle} (${existingCount}), pulando`)
        continue
      }

      // Persist each product as a BarSale record
      for (const prod of yev.produtos) {
        const unitPrice = prod.qty > 0 ? prod.total / prod.qty : 0
        await prisma.barSale.createMany({
          data: Array.from({ length: Math.min(prod.qty, 100) }, (_, i) => ({
            eventId: eventId!,
            productName: prod.name,
            quantity: 1,
            unitPrice: Math.round(unitPrice * 100) / 100,
            total: Math.round((prod.total / Math.min(prod.qty, 100)) * 100) / 100,
            saleTime: new Date(`${startDate}T${18 + (i % 6)}:00:00`),
            paymentMethod: 'yuzer-auto',
            importBatch: batch.id,
          })),
        })
        totalBarSales += Math.min(prod.qty, 100)
      }
    }

    // 5. Update batch record
    await prisma.importBatch.update({
      where: { id: batch.id },
      data: {
        recordsCount: totalBarSales,
        status: 'completed',
        completedAt: new Date(),
        metadata: JSON.stringify({
          source: data.source,
          totalEvents: data.totalEvents,
          totalOrders: data.totalOrders,
          totalBarSales,
          totalSynthEvents,
          completedAt: new Date().toISOString(),
        }),
      },
    })

    console.log(`[yuzer-sync] OK: ${totalBarSales} vendas, ${totalSynthEvents} eventos sintéticos`)

    // 6. Update SymplaSync record
    await prisma.symplaSync.upsert({
      where: { id: 'yuzer-main' },
      update: {
        lastSyncAt: new Date(),
        eventsCount: totalSynthEvents,
        ordersCount: totalBarSales,
        status: 'completed',
      },
      create: {
        id: 'yuzer-main',
        lastSyncAt: new Date(),
        eventsCount: totalSynthEvents,
        ordersCount: totalBarSales,
        status: 'completed',
      },
    })

  } catch (err) {
    const msg = String(err)
    await prisma.importBatch.update({
      where: { id: batch.id },
      data: {
        status: 'failed',
        errorLog: msg.slice(0, 2000),
        completedAt: new Date(),
      },
    }).catch(() => {})
    console.error(`[yuzer-sync] FAILED: ${msg}`)
    process.exit(1)
  }

  await prisma.$disconnect()
}

main()
