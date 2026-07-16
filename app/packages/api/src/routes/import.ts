import { FastifyInstance } from 'fastify'
import Papa from 'papaparse'
import { exec } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Regenera os embeds (db-embed.ts + bar-embed.ts) apos importacao.
 * Dispara em background — nao bloqueia a resposta da API.
 */
function triggerPostSync() {
  const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))
  const root = path.resolve(dirname, '../../..')
  const script = path.join(root, 'scripts', 'post-sync.sh')
  exec(`bash "${script}"`, {
    cwd: root,
    env: { ...process.env, ROOT: root },
  }, (err, stdout, stderr) => {
    if (err) console.error('[post-sync] ERROR:', err.message)
    else console.log('[post-sync] OK:', stdout.slice(0, 200))
    if (stderr) console.error('[post-sync] STDERR:', stderr.slice(0, 200))
  })
}

// ── Column auto-detect maps ──
const SYMPLA_FIELD_MAP: Record<string, string[]> = {
  buyerName:     ['nome', 'name', 'comprador', 'participant name'],
  buyerEmail:    ['email', 'e-mail', 'e mail'],
  buyerPhone:    ['telefone', 'phone', 'celular'],
  ticketType:    ['tipo de ingresso', 'ticket type', 'tipo', 'ticket'],
  quantity:      ['quantidade', 'qty', 'qtd', 'quantity'],
  unitPrice:     ['valor unitário', 'preço', 'unit price', 'valor unit'],
  totalPaid:     ['valor total', 'total', 'total paid', 'valor'],
  purchaseDate:  ['data de compra', 'purchase date', 'data', 'created at'],
  checkedIn:     ['check-in', 'checked in', 'presença', 'presente'],
  checkInTime:   ['horário check-in', 'check-in time', 'hora check-in'],
  externalId:    ['código', 'id', 'order id', 'pedido'],
}

const BAR_FIELD_MAP: Record<string, string[]> = {
  productName:   ['produto', 'item', 'descrição', 'product', 'name', 'description'],
  category:      ['categoria', 'category', 'grupo', 'group'],
  quantity:      ['quantidade', 'qty', 'qtd', 'amount', 'quantity'],
  unitPrice:     ['preço unitário', 'valor unit', 'unit price', 'preço', 'price'],
  total:         ['total', 'subtotal', 'valor total', 'amount total'],
  saleTime:      ['horário', 'hora', 'time', 'datetime', 'data hora', 'date time'],
  paymentMethod: ['pagamento', 'payment', 'forma', 'method', 'forma de pagamento'],
}

function detectColumns(headers: string[], fieldMap: Record<string, string[]>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [field, candidates] of Object.entries(fieldMap)) {
    for (const col of headers) {
      const normalized = col.toLowerCase().trim()
      if (candidates.some(c => normalized.includes(c))) {
        result[field] = col
        break
      }
    }
  }
  return result
}

function mapRow(row: any, colMap: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [field, col] of Object.entries(colMap)) {
    result[field] = row[col] ?? ''
  }
  return result
}

export default async function (app: FastifyInstance) {
  // ── SYMPLA: parse + preview ──
  app.post('/sympla', { preHandler: [app.authenticate] }, async (req: any, reply) => {
    const data = await req.file()
    if (!data) return reply.status(400).send({ error: 'Nenhum arquivo enviado' })

    const buffer = await data.toBuffer()
    const csvText = buffer.toString('utf-8')
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })

    if (parsed.errors.length > 0) {
      return reply.status(400).send({ error: 'Erro ao ler CSV', details: parsed.errors.slice(0, 3) })
    }

    const rows = parsed.data as any[]
    const headers = (parsed.meta.fields || []) as string[]
    const colMap = detectColumns(headers, SYMPLA_FIELD_MAP)

    return {
      preview: rows.slice(0, 5).map(r => mapRow(r, colMap)),
      rawPreview: rows.slice(0, 5),
      totalRows: rows.length,
      columns: headers,
      colMap,
      filename: data.filename,
      // Store all rows for confirm step (we'll keep them in the response)
      allRows: rows,
    }
  })

  // ── SYMPLA: confirm import ──
  app.post('/sympla/confirm', { preHandler: [app.authenticate] }, async (req: any, reply) => {
    const { rows, eventId, colMap, filename } = req.body as any

    if (!eventId) return reply.status(400).send({ error: 'eventId obrigatório' })

    const batch = await app.prisma.importBatch.create({
      data: {
        source: 'sympla',
        eventId,
        filename,
        recordsCount: rows.length,
        status: 'processing',
        metadata: JSON.stringify({ colMap }),
        importedBy: req.user?.id,
      },
    })

    const tickets = rows.map((row: any) => {
      const get = (f: string) => row[f] || ''
      const totalPaid = parseFloat(get('totalPaid') || get('unitPrice') || '0')
      const unitPrice = parseFloat(get('unitPrice') || '0')

      return {
        eventId,
        buyerName: get('buyerName') || 'Desconhecido',
        buyerEmail: get('buyerEmail') || '',
        buyerPhone: get('buyerPhone') || '',
        ticketType: get('ticketType') || 'Inteira',
        quantity: parseInt(get('quantity') || '1'),
        unitPrice: unitPrice || totalPaid,
        totalPaid,
        purchaseDate: get('purchaseDate') ? new Date(get('purchaseDate')) : new Date(),
        checkedIn: ['sim', 'yes', 'true', '1', 's'].includes(get('checkedIn').toLowerCase()),
        checkInTime: get('checkInTime') ? new Date(get('checkInTime')) : null,
        externalId: get('externalId') || '',
        importBatch: batch.id,
      }
    })

    await app.prisma.ticket.createMany({ data: tickets })

    await app.prisma.importBatch.update({
      where: { id: batch.id },
      data: { status: 'completed', completedAt: new Date() },
    })

    // Regenera embeds em background
    triggerPostSync()

    return { ok: true, batchId: batch.id, imported: tickets.length }
  })

  // ── BAR: parse + preview ──
  app.post('/bar', { preHandler: [app.authenticate] }, async (req: any, reply) => {
    const data = await req.file()
    if (!data) return reply.status(400).send({ error: 'Nenhum arquivo enviado' })

    const buffer = await data.toBuffer()
    const csvText = buffer.toString('utf-8')
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })

    if (parsed.errors.length > 0) {
      return reply.status(400).send({ error: 'Erro ao ler CSV', details: parsed.errors.slice(0, 3) })
    }

    const rows = parsed.data as any[]
    const headers = (parsed.meta.fields || []) as string[]
    const colMap = detectColumns(headers, BAR_FIELD_MAP)

    return {
      preview: rows.slice(0, 5).map(r => mapRow(r, colMap)),
      rawPreview: rows.slice(0, 5),
      totalRows: rows.length,
      columns: headers,
      colMap,
      filename: data.filename,
      allRows: rows,
    }
  })

  // ── BAR: confirm import ──
  app.post('/bar/confirm', { preHandler: [app.authenticate] }, async (req: any, reply) => {
    const { rows, eventId, colMap, filename } = req.body as any

    if (!eventId) return reply.status(400).send({ error: 'eventId obrigatório' })

    const batch = await app.prisma.importBatch.create({
      data: {
        source: 'bar-csv',
        eventId,
        filename,
        recordsCount: rows.length,
        status: 'processing',
        importedBy: req.user?.id,
      },
    })

    const productCache = new Map<string, string>()
    let count = 0

    for (const row of rows) {
      const get = (f: string) => row[f] || ''
      const prodName = get('productName') || 'Produto sem nome'
      const qty = parseInt(get('quantity') || '1')
      const unitPrice = parseFloat(get('unitPrice') || '0')
      const total = parseFloat(get('total') || '') || qty * unitPrice

      // upsert product
      let productId = productCache.get(prodName)
      if (!productId) {
        const existing = await app.prisma.product.findFirst({ where: { eventId, name: prodName } })
        if (existing) {
          productId = existing.id
        } else {
          const created = await app.prisma.product.create({
            data: { eventId, name: prodName, unitPrice, category: get('category') || 'Outros' },
          })
          productId = created.id
        }
        productCache.set(prodName, productId)
      }

      await app.prisma.barSale.create({
        data: {
          eventId,
          productId,
          productName: prodName,
          quantity: qty,
          unitPrice,
          total,
          saleTime: get('saleTime') ? new Date(get('saleTime')) : null,
          paymentMethod: get('paymentMethod') || null,
          importBatch: batch.id,
        },
      })
      count++
    }

    await app.prisma.importBatch.update({
      where: { id: batch.id },
      data: { status: 'completed', completedAt: new Date() },
    })

    // Regenera embeds em background
    triggerPostSync()

    return { ok: true, batchId: batch.id, imported: count }
  })

  // ── Import history ──
  app.get('/', { preHandler: [app.authenticate] }, async () => {
    return app.prisma.importBatch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { event: { select: { title: true, date: true } } },
    })
  })
}
