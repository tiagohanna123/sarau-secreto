/**
 * GET /api/insights/revenue-expense-convergence
 *
 * Relatório de convergência receita/despesa por evento.
 *
 * Associacão:
 *   - Tickets: usa symplaEventId como ground truth; se ausente, usa purchaseDate + CostAllocation
 *   - BarSales: usa saleTime + CostAllocation (sem alterar eventId no banco)
 *   - Aceita override manual via query string (?override=ticket:ID:eventId,...)
 *
 * Retorna:
 *   - Receita total por evento (ticket + bar)
 *   - Alocação temporária (sem mudar datas de lançamento)
 *   - Discrepâncias não alocáveis
 */

import { FastifyInstance } from 'fastify'
import { ConvergenceEngine, ManualOverride, ConvEvent, ConvTicket, ConvBarSale } from '../lib/convergence-engine.js'

function fmt(n: number) {
  return Math.round(n * 100) / 100
}

export default async function (app: FastifyInstance) {
  app.get('/revenue-expense-convergence', { preHandler: [app.authenticate] }, async (req: any, reply: any) => {
    const prisma = (app as any).prisma

    // ── Parse overrides manuais da query string ──
    // Formato: override=ticket:abc123:evt456&override=bar:xyz789:evt789
    const overrideParams: string[] = req.query?.override
      ? Array.isArray(req.query.override)
        ? req.query.override
        : [req.query.override]
      : []

    const overrides: ManualOverride[] = []
    for (const param of overrideParams) {
      const parts = param.split(':')
      if (parts.length === 3) {
        const [type, itemId, overrideEventId] = parts
        if (type === 'ticket' || type === 'bar') {
          overrides.push({ type, itemId, overrideEventId })
        }
      }
    }

    // ── Buscar dados ──
    const eventRows = await prisma.$queryRawUnsafe(`
      SELECT id, title, date, symplaEventId FROM Event ORDER BY date ASC
    `) as any[]

    const ticketRows = await prisma.$queryRawUnsafe(`
      SELECT id, eventId, totalPaid, purchaseDate, quantity FROM Ticket
    `) as any[]

    const barRows = await prisma.$queryRawUnsafe(`
      SELECT id, eventId, total, saleTime, productName, quantity FROM BarSale
    `) as any[]

    // ── Converter para tipos da engine ──
    const events: ConvEvent[] = eventRows.map((e: any) => ({
      id: e.id,
      title: e.title,
      date: new Date(e.date),
      symplaEventId: e.symplaEventId ?? null,
    }))

    const tickets: ConvTicket[] = ticketRows.map((t: any) => ({
      id: t.id,
      eventId: t.eventId,
      totalPaid: Number(t.totalPaid),
      purchaseDate: new Date(t.purchaseDate),
      quantity: Number(t.quantity),
    }))

    const barSales: ConvBarSale[] = barRows.map((b: any) => ({
      id: b.id,
      eventId: b.eventId,
      total: Number(b.total),
      saleTime: b.saleTime ? new Date(b.saleTime) : null,
      productName: b.productName,
      quantity: Number(b.quantity),
    }))

    // ── Executar engine ──
    const engine = new ConvergenceEngine(events, tickets, barSales, {
      overrides,
    })

    const report = engine.generate()

    // ── Sumário executivo ──
    const totalCurrentRevenue = report.events.reduce((s, e) => s + e.currentTotal, 0)
    const totalSuggestedRevenue = report.events.reduce((s, e) => s + e.suggestedTotal, 0)
    const totalDiscrepancies = report.discrepancies.length
    const totalDiscrepancyValue = report.discrepancies.reduce((s, d) => s + d.amount, 0)
    const totalUnallocated = report.unallocated.reduce((s, u) => s + u.amount, 0)

    return {
      ...report,
      summary: {
        totalCurrentRevenue: fmt(totalCurrentRevenue),
        totalSuggestedRevenue: fmt(totalSuggestedRevenue),
        totalDiscrepancies,
        totalDiscrepancyValue: fmt(totalDiscrepancyValue),
        totalUnallocatedValue: fmt(totalUnallocated),
        totalEvents: report.events.length,
      },
    }
  })
}
