/**
 * /api/yuzer/* — Live integration with Yuzer Eagle.
 *
 * Strategy: thin proxy to Yuzer's API with auth + small TTL cache.
 * - /status                    → token health + identifiers
 * - /summary?range=today|7d|30d → consolidated KPIs (orders count, gross, payments mix)
 * - /orders                    → paged live orders
 * - /payments                  → payment-method breakdown
 * - /card-brands               → card brand breakdown
 * - /ranking                   → product/seller ranking
 * - /earnings-day              → daily earnings/sales series
 *
 * All routes require app JWT (req.jwtVerify via authenticate decorator).
 */
import type { FastifyInstance } from 'fastify'
import {
  yuzerFetch,
  cached,
  searchOrders,
  ordersStatistics,
  dashboardEarningsAndSells,
  dashboardPayments,
  dashboardCardBrands,
  dashboardRanking,
  dashboardProducts,
  MASTER_COMPANY_ID,
  SALES_PANELS,
  YuzerAuthError,
} from '../lib/yuzer.js'
import { fetchBarHistory } from '../lib/yuzer-history.js'

type Range = 'today' | '7d' | '30d' | '90d'

function rangeToDates(range: Range): { from: string; to: string } {
  const end = new Date()
  const start = new Date()
  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      break
    case '90d':
      start.setDate(start.getDate() - 90)
      break
  }
  return { from: start.toISOString(), to: end.toISOString() }
}

export default async function yuzerRoutes(app: FastifyInstance) {
  // All routes require auth
  app.addHook('preHandler', (app as any).authenticate)

  // Translate Yuzer auth errors into a clear 502 with a hint.
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof YuzerAuthError) {
      return reply.status(502).send({
        error: 'yuzer_token_expired',
        hint: 'Refresh JWT in YUZER_TOKEN_FILE',
      })
    }
    app.log.error((err as Error).message)
    return reply.status(500).send({ error: (err as Error).message || 'yuzer_error' })
  })

  app.get('/status', async () => {
    try {
      const me = await cached('yuzer:me', 30_000, () => yuzerFetch('/users/me'))
      return {
        ok: true,
        masterCompanyId: MASTER_COMPANY_ID,
        salesPanels: SALES_PANELS,
        user: {
          id: (me as any)?.id,
          name: (me as any)?.name,
          email: (me as any)?.email,
        },
      }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  })

  app.get('/summary', async (req) => {
    const range = ((req.query as any)?.range || 'today') as Range
    const { from, to } = rangeToDates(range)
    const cacheKey = `yuzer:summary:${range}`
    return cached(cacheKey, 20_000, async () => {
      const [stats, payments] = await Promise.all([
        ordersStatistics({ from, to }),
        dashboardPayments({ from, to, companiesIds: [parseInt(MASTER_COMPANY_ID, 10)] }),
      ])
      return { range, from, to, stats, payments }
    })
  })

  app.get('/orders', async (req) => {
    const q = req.query as any
    const range = (q.range || 'today') as Range
    const perPage = Math.min(parseInt(q.perPage || '50', 10), 200)
    const page = Math.max(parseInt(q.page || '1', 10), 1)
    const { from, to } = rangeToDates(range)
    return searchOrders({
      from,
      to,
      status: q.status || 'PAID',
      page,
      perPage,
      sort: q.sort || 'desc',
      sortColumn: q.sortColumn || 'createdAt',
    })
  })

  app.get('/payments', async (req) => {
    const range = (((req.query as any)?.range as Range) || '7d')
    const { from, to } = rangeToDates(range)
    return cached(`yuzer:pay:${range}`, 30_000, () =>
      dashboardPayments({ from, to, companiesIds: [parseInt(MASTER_COMPANY_ID, 10)] }),
    )
  })

  app.get('/card-brands', async (req) => {
    const range = (((req.query as any)?.range as Range) || '7d')
    const { from, to } = rangeToDates(range)
    return cached(`yuzer:brands:${range}`, 30_000, () =>
      dashboardCardBrands({ from, to, companiesIds: [parseInt(MASTER_COMPANY_ID, 10)] }),
    )
  })

  app.get('/ranking', async (req) => {
    const range = (((req.query as any)?.range as Range) || '7d')
    const { from, to } = rangeToDates(range)
    return cached(`yuzer:rank:${range}`, 30_000, () =>
      dashboardRanking({ from, to, companiesIds: [parseInt(MASTER_COMPANY_ID, 10)] }),
    )
  })

  app.get('/earnings-day', async (req) => {
    const range = (((req.query as any)?.range as Range) || '30d')
    const { from, to } = rangeToDates(range)
    return cached(`yuzer:earn:${range}`, 60_000, () =>
      dashboardEarningsAndSells({ from, to, companiesIds: [parseInt(MASTER_COMPANY_ID, 10)] }),
    )
  })

  app.get('/products-stats', async (req) => {
    const q = req.query as any
    const range = ((q?.range as Range) || '30d')
    const limit = Math.min(parseInt(q?.limit || '100', 10), 500)
    const page = Math.max(parseInt(q?.page || '1', 10), 1)
    const { from, to } = rangeToDates(range)
    return cached(`yuzer:prods:${range}:${page}:${limit}`, 60_000, () =>
      dashboardProducts({ from, to, companiesIds: [parseInt(MASTER_COMPANY_ID, 10)] }, page, limit),
    )
  })

  // ── History endpoint: live-first, backup-fallback ──
  app.get('/history', async (req, reply) => {
    const data = await fetchBarHistory()
    if (data.source === 'error') {
      return reply.status(502).send({ error: 'Yuzer indisponível (live + backup falharam)' })
    }
    return data
  })
}
