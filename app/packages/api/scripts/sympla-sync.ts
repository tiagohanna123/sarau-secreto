#!/usr/bin/env tsx
/**
 * Sympla Sync — CLI script.
 *
 * Usage:
 *   npx tsx scripts/sympla-sync.ts              # full sync all events
 *   npx tsx scripts/sympla-sync.ts --event 1234  # sync one event by Sympla ID
 *   npx tsx scripts/sympla-sync.ts --status       # show last sync status
 *   npx tsx scripts/sympla-sync.ts --list-ui      # list UI-only events (require CSV)
 *
 * Run from the packages/api directory:
 *   cd /home/ser/sistema-sarau-secreto/app/packages/api
 *   npx tsx scripts/sympla-sync.ts
 */
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env
config({ path: resolve(import.meta.dirname, '../.env') })

import {
  fetchAllEvents,
  fetchEventOrders,
  UI_ONLY_EVENTS,
} from '../src/lib/sympla.js'

const prisma = new PrismaClient()

const args = process.argv.slice(2)

async function main() {
  // ── --list-ui ──
  if (args.includes('--list-ui')) {
    console.log('\n📋 Eventos que PRECISAM de CSV (não disponíveis via API Sympla):')
    console.log('='.repeat(70))
    for (const ev of UI_ONLY_EVENTS) {
      console.log(`  • ${ev.name} (${ev.year}) — ${ev.note}`)
    }
    console.log(`\nTotal: ${UI_ONLY_EVENTS.length} eventos`)
    console.log('\n💡 Use POST /api/import/sympla com CSV exportado da UI do Sympla.\n')
    return
  }

  // ── --status ──
  if (args.includes('--status')) {
    const latest = await prisma.symplaSync.findFirst({
      orderBy: { createdAt: 'desc' },
    })
    const totalEvents = await prisma.event.count()
    const totalTickets = await prisma.ticket.count()
    const eventsWithSympla = await prisma.event.count({
      where: { symplaEventId: { not: null } },
    })

    console.log('\n📊 Status da Sincronização Sympla')
    console.log('='.repeat(50))
    if (latest) {
      console.log(`  Última sync: ${latest.lastSyncAt.toISOString()}`)
      console.log(`  Status:      ${latest.status}`)
      console.log(`  Eventos:     ${latest.eventsCount}`)
      console.log(`  Pedidos:     ${latest.ordersCount}`)
      if (latest.errorLog) console.log(`  Erro:        ${latest.errorLog.slice(0, 200)}`)
    } else {
      console.log('  Nenhuma sincronização realizada ainda.')
    }
    console.log(`\n  Total eventos no banco:  ${totalEvents}`)
    console.log(`  Com symplaEventId:       ${eventsWithSympla}`)
    console.log(`  Total tickets:           ${totalTickets}`)
    console.log(`  UI-only (precisa CSV):   ${UI_ONLY_EVENTS.length}`)
    console.log()
    return
  }

  // ── --event <id> ──
  const eventIdx = args.indexOf('--event')
  if (eventIdx !== -1 && args[eventIdx + 1]) {
    const symplaEventId = args[eventIdx + 1]
    await syncSingleEvent(symplaEventId)
    return
  }

  // ── Full sync (default) ──
  await fullSync()
}

async function fullSync() {
  console.log('\n🔄 Iniciando sincronização completa Sympla...\n')

  const syncRecord = await prisma.symplaSync.create({
    data: {
      lastSyncAt: new Date(),
      status: 'syncing',
      eventsCount: 0,
      ordersCount: 0,
    },
  })

  try {
    // 1. Fetch events
    console.log('📡 Buscando eventos da API Sympla...')
    const symplaEvents = await fetchAllEvents()
    console.log(`   → ${symplaEvents.length} eventos encontrados`)

    let totalOrders = 0

    for (const se of symplaEvents) {
      // Upsert event
      const slug = se.name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + se.id

      const existing = await prisma.event.findFirst({
        where: { symplaEventId: String(se.id) },
      })

      const eventData = {
        title: se.name,
        slug,
        description: se.detail || '',
        date: new Date(se.start_date),
        endDate: se.end_date ? new Date(se.end_date) : null,
        status: se.cancelled ? 'cancelled' : se.published ? 'published' : 'draft',
        symplaEventId: String(se.id),
        symplaUrl: se.url || null,
      }

      let event
      if (existing) {
        event = await prisma.event.update({ where: { id: existing.id }, data: eventData })
      } else {
        event = await prisma.event.create({ data: eventData })
      }

      // Fetch orders
      process.stdout.write(`   📦 Evento #${se.id} "${se.name}" → buscando pedidos... `)
      const orders = await fetchEventOrders(se.id)
      console.log(`${orders.length} pedidos`)

      for (const order of orders) {
        const buyerFullName = `${order.buyer_first_name || ''} ${order.buyer_last_name || ''}`.trim() || 'Desconhecido'
        const totalPaid = parseFloat(order.order_total_sale_price || '0')

        const existingTicket = await prisma.ticket.findFirst({
          where: { externalId: String(order.id), eventId: event.id },
        })

        const ticketData = {
          eventId: event.id,
          buyerName: buyerFullName,
          buyerEmail: order.buyer_email || '',
          buyerPhone: null,
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
          importBatch: syncRecord.id,
        }

        if (existingTicket) {
          await prisma.ticket.update({ where: { id: existingTicket.id }, data: ticketData })
        } else {
          await prisma.ticket.create({ data: ticketData })
        }

        totalOrders++
      }
    }

    // Mark sync completed
    await prisma.symplaSync.update({
      where: { id: syncRecord.id },
      data: { status: 'completed', eventsCount: symplaEvents.length, ordersCount: totalOrders },
    })

    console.log(`\n✅ Sincronização concluída!`)
    console.log(`   Eventos sincronizados: ${symplaEvents.length}`)
    console.log(`   Pedidos sincronizados: ${totalOrders}`)
    console.log(`   ⚠️  ${UI_ONLY_EVENTS.length} eventos 2025-2026 precisam de CSV (use --list-ui)\n`)
  } catch (err: any) {
    console.error(`\n❌ Erro na sincronização: ${err.message}`)
    await prisma.symplaSync.update({
      where: { id: syncRecord.id },
      data: { status: 'failed', errorLog: err.message?.slice(0, 2000) || 'Unknown error' },
    }).catch(() => {})
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function syncSingleEvent(symplaEventId: string) {
  console.log(`\n🔄 Sincronizando evento #${symplaEventId}...\n`)

  try {
    const allEvents = await fetchAllEvents()
    const eventInfo = allEvents.find(e => String(e.id) === symplaEventId)

    if (!eventInfo) {
      console.error(`❌ Evento #${symplaEventId} não encontrado na API Sympla.`)
      console.log('   Pode ser um evento de 2025-2026 (apenas CSV).')
      process.exit(1)
    }

    const slug = eventInfo.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + eventInfo.id

    const existing = await prisma.event.findFirst({
      where: { symplaEventId },
    })

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

    let event
    if (existing) {
      event = await prisma.event.update({ where: { id: existing.id }, data: eventData })
      console.log(`   ✅ Evento atualizado: "${eventInfo.name}" (ID: ${event.id})`)
    } else {
      event = await prisma.event.create({ data: eventData })
      console.log(`   ✅ Evento criado: "${eventInfo.name}" (ID: ${event.id})`)
    }

    // Fetch orders
    const orders = await fetchEventOrders(symplaEventId)
    console.log(`   📦 ${orders.length} pedidos encontrados`)

    for (const order of orders) {
      const buyerFullName = `${order.buyer_first_name || ''} ${order.buyer_last_name || ''}`.trim() || 'Desconhecido'
      const totalPaid = parseFloat(order.order_total_sale_price || '0')

      const existingTicket = await prisma.ticket.findFirst({
        where: { externalId: String(order.id), eventId: event.id },
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
        await prisma.ticket.update({ where: { id: existingTicket.id }, data: ticketData })
      } else {
        await prisma.ticket.create({ data: ticketData })
      }
    }

    console.log(`\n✅ Evento #${symplaEventId} sincronizado com ${orders.length} pedidos.`)

    // Record sync
    await prisma.symplaSync.create({
      data: {
        lastSyncAt: new Date(),
        status: 'completed',
        eventsCount: 1,
        ordersCount: orders.length,
      },
    })
  } catch (err: any) {
    console.error(`\n❌ Erro: ${err.message}`)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
