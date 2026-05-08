/**
 * Yuzer history processor — versão final.
 *
 * Live-first, backup-fallback.
 * Serve dados processados: eventos, mensais, categorias, métodos de pagamento,
 * top produtos, ticket médio por evento, etc.
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { yuzerFetch } from './yuzer.js'

const BACKUP_PATH = process.env.YUZER_BACKUP_PATH || '/home/ser/sarau-yuzer-backup'

// ── Types ──

export interface EventDetail {
  start: string
  end: string
  days: number
  orders: number
  revenue: number
  ticketMedio: number
  itensVendidos: number
  produtos: ProdutoRow[]
  metodosPagamento: { method: string; total: number; pct: number }[]
}

export interface ProdutoRow {
  name: string
  qty: number
  total: number
  pct: number
}

export interface MonthlyRow {
  mes: string        // "2025-09"
  label: string      // "Set/25"
  eventos: number
  orders: number
  revenue: number
  ticketMedio: number
}

export interface PaymentMethodSummary {
  method: string
  total: number
  orders: number
  pct: number
}

export interface CategorySummary {
  name: string
  total: number
  qty: number
  pct: number
}

export interface BarHistory {
  source: 'live' | 'backup' | 'error'
  totalEvents: number
  totalRevenue: number
  totalOrders: number
  totalItens: number
  revenueBar: number
  ticketMedioBar: number
  ticketMedioGeral: number
  eventos: EventDetail[]
  mensais: MonthlyRow[]
  produtoMix: ProdutoRow[]
  metodosPagamento: PaymentMethodSummary[]
  categorias: CategorySummary[]
}

// ── Cache do backup ──

let cachedBackup: { orders: any[]; loadedAt: number } | null = null

async function loadBackupOrders(): Promise<any[]> {
  const now = Date.now()
  if (cachedBackup && now - cachedBackup.loadedAt < 300_000) return cachedBackup.orders
  const raw = await readFile(join(BACKUP_PATH, 'orders.json'), 'utf8')
  const orders = JSON.parse(raw)
  cachedBackup = { orders, loadedAt: now }
  return orders
}

// ── Cluster de eventos (datas consecutivas = mesmo evento) ──

function clusterEvents(orders: any[]): string[][] {
  const dateSet = new Set<string>()
  for (const o of orders) {
    if (o.createdAt) dateSet.add(o.createdAt.slice(0, 10))
  }
  const dates = Array.from(dateSet).sort()
  const clusters: string[][] = []
  let current: string[] = []
  for (let i = 0; i < dates.length; i++) {
    if (current.length === 0) {
      current = [dates[i]]
    } else {
      const prev = new Date(current[current.length - 1])
      const diff = (new Date(dates[i]).getTime() - prev.getTime()) / 86400000
      if (diff <= 2) {
        current.push(dates[i])
      } else {
        clusters.push(current)
        current = [dates[i]]
      }
    }
  }
  if (current.length) clusters.push(current)
  return clusters
}

function processEvent(evDates: string[], allOrders: any[]): EventDetail {
  const evOrders = allOrders.filter(o => o.createdAt && evDates.includes(o.createdAt.slice(0, 10)))
  const paid = evOrders.filter(o => o.paymentStatus === 'PAID')
  const revenue = paid.reduce((s, o) => s + ((o.cart?.total ?? o.total ?? 0) || 0), 0)
  const itensVendidos = paid.reduce((s, o) => {
    const prods = o.cart?.products || []
    return s + prods.reduce((sp, p) => sp + (p.quantity || 0), 0)
  }, 0)
  const ticketMedio = paid.length > 0 ? +(revenue / paid.length).toFixed(2) : 0

  // Produtos
  const prodMap = new Map<string, { qty: number; total: number }>()
  for (const o of paid) {
    for (const p of (o.cart?.products || [])) {
      const e = prodMap.get(p.name) || { qty: 0, total: 0 }
      e.qty += p.quantity || 0
      e.total += (p.total ?? p.grossTotal ?? 0)
      prodMap.set(p.name, e)
    }
  }
  const produtos: ProdutoRow[] = Array.from(prodMap.entries())
    .map(([name, v]) => ({ name, qty: v.qty, total: v.total, pct: revenue > 0 ? +(v.total / revenue * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.total - a.total)

  // Métodos de pagamento
  const payMap = new Map<string, number>()
  for (const o of paid) {
    for (const m of (o.onlinePaymentMethods || [])) {
      payMap.set(m, (payMap.get(m) || 0) + (o.cart?.total ?? 0))
    }
  }
  const metodosPagamento = Array.from(payMap.entries())
    .map(([method, total]) => ({ method, total, pct: revenue > 0 ? +(total / revenue * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.total - a.total)

  return {
    start: evDates[0],
    end: evDates[evDates.length - 1],
    days: evDates.length,
    orders: paid.length,
    revenue,
    ticketMedio,
    itensVendidos,
    produtos,
    metodosPagamento,
  }
}

// ── Categorias de produto ──

const CATEGORIA_RULES: [RegExp, string][] = [
  [/UVITA|VINHO|SANTA ANG|BODEGA|VIEIRA|CASA VAL|TERRAS|VALE DOS|DONA|CARMEN|ALMAC|CORDILLO|INTIMO|QUINTA|CABEÇA|CANCION|RESERVA|CATEDRAL|GRAN CRU|LAPOSTOLLE|NAVARRO|PASO|PERRO|PORTILLO|SANTA MA|SANTO|TRAPICHE|VIUVA/i, 'Vinho'],
  [/HEINEKEN|STELLA|BUDWEISER|SKOL|BRAHMA|CERVEJA|LONG NECK|AMSTEL|ANTARCTICA|BOHEMIA|EISENBAHN|ERDINGER|IMPÉRIO|ITAIPAVA|KIRIN|LEFFE|ORIGINAL|PATAGÔNIA|PURIFY|REDHEAD/i, 'Cerveja'],
  [/ÁGUA|AGUA|REFIG|COCA|COCA-COLA|FANTA|GUARANÁ|SPRITE|H2O|GATORADE|PEPSI|SUCO|ÁGUA/i, 'Não Alcoólico'],
  [/ESPUMANTE|CHAMP|PROSECCO|MARTINI|CIDRA/i, 'Espumante'],
  [/VODKA|WHISKY|GIN|RUN|DRINK|LICOR|CAIPIRINHA|DOSADOR|ENERGÉTICO|RED BULL|MONSTER|TEQUILA|CONHAQUE|BARTENDER/i, 'Destilados'],
  [/CAFÉ|PÃO|BROWNIE|PETISCO|BATATA|AMENDOIM|CHOCOLATE|SNACK|SALGADO|TORRESMO/i, 'Comida'],
]

function categorizar(name: string): string {
  for (const [regex, cat] of CATEGORIA_RULES) {
    if (regex.test(name)) return cat
  }
  return 'Outros'
}

function buildCategorias(produtos: ProdutoRow[]): CategorySummary[] {
  const map = new Map<string, { total: number; qty: number }>()
  for (const p of produtos) {
    const cat = categorizar(p.name)
    const e = map.get(cat) || { total: 0, qty: 0 }
    e.total += p.total
    e.qty += p.qty
    map.set(cat, e)
  }
  const all = Array.from(map.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total)
  const grandTotal = all.reduce((s, c) => s + c.total, 0)
  return all.map(c => ({ ...c, pct: grandTotal > 0 ? +(c.total / grandTotal * 100).toFixed(1) : 0 }))
}

// ── Mensais ──

function buildMensais(events: EventDetail[]): MonthlyRow[] {
  const map = new Map<string, { eventos: Set<string>; orders: number; revenue: number }>()
  for (const ev of events) {
    const mes = ev.start.slice(0, 7) // "2025-09"
    const e = map.get(mes) || { eventos: new Set(), orders: 0, revenue: 0 }
    e.eventos.add(ev.start)
    e.orders += ev.orders
    e.revenue += ev.revenue
    map.set(mes, e)
  }
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, v]) => {
      const [, m] = mes.split('-')
      return {
        mes,
        label: `${meses[parseInt(m) - 1]}/${mes.slice(2)}`,
        eventos: v.eventos.size,
        orders: v.orders,
        revenue: v.revenue,
        ticketMedio: v.orders > 0 ? +(v.revenue / v.orders).toFixed(2) : 0,
      }
    })
}

// ── Mix geral de produtos ──

function buildProdutoMix(events: EventDetail[]): ProdutoRow[] {
  const map = new Map<string, { qty: number; total: number }>()
  for (const ev of events) {
    for (const p of ev.produtos) {
      const e = map.get(p.name) || { qty: 0, total: 0 }
      e.qty += p.qty
      e.total += p.total
      map.set(p.name, e)
    }
  }
  const all = Array.from(map.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total)
  const grandTotal = all.reduce((s, p) => s + p.total, 0)
  return all.map(p => ({ ...p, pct: grandTotal > 0 ? +(p.total / grandTotal * 100).toFixed(1) : 0 }))
}

// ── Métodos de pagamento (agregado geral) ──

function buildMetodosPagamento(events: EventDetail[]): PaymentMethodSummary[] {
  const map = new Map<string, { total: number; orders: number }>()
  for (const ev of events) {
    for (const m of ev.metodosPagamento) {
      const e = map.get(m.method) || { total: 0, orders: 0 }
      e.total += m.total
      e.orders += 1
      map.set(m.method, e)
    }
  }
  const all = Array.from(map.entries()).map(([method, v]) => ({ method, ...v })).sort((a, b) => b.total - a.total)
  const grandTotal = all.reduce((s, m) => s + m.total, 0)
  return all.map(m => ({ ...m, pct: grandTotal > 0 ? +(m.total / grandTotal * 100).toFixed(1) : 0 }))
}

// ── Fetch: live first, backup fallback ──

async function fetchOrdersLive(): Promise<any[]> {
  const all: any[] = []
  let page = 1
  let hasMore = true
  while (hasMore) {
    const res = await yuzerFetch('/orders/search', {
      method: 'POST',
      body: JSON.stringify({
        from: '2023-11-01T00:00:00.000Z',
        to: new Date().toISOString(),
        page,
        perPage: 5000,
        sort: 'desc',
        sortColumn: 'createdAt',
        status: 'ALL',
      }),
    })
    const items = res.content || res.data || []
    all.push(...items)
    hasMore = items.length === 5000 && page < 10
    page++
  }
  return all
}

export async function fetchBarHistory(): Promise<BarHistory> {
  let orders: any[]
  let source: BarHistory['source']

  try {
    orders = await fetchOrdersLive()
    source = 'live'
  } catch {
    try {
      orders = await loadBackupOrders()
      source = 'backup'
    } catch (e: any) {
      return {
        source: 'error',
        totalEvents: 0, totalRevenue: 0, totalOrders: 0, totalItens: 0,
        revenueBar: 0, ticketMedioBar: 0, ticketMedioGeral: 0,
        eventos: [], mensais: [], produtoMix: [],
        metodosPagamento: [], categorias: [],
      }
    }
  }

  const dateClusters = clusterEvents(orders)
  const eventos = dateClusters.map(ev => processEvent(ev, orders))
    .sort((a, b) => b.start.localeCompare(a.start))

  const totalRevenue = eventos.reduce((s, e) => s + e.revenue, 0)
  const totalOrders = eventos.reduce((s, e) => s + e.orders, 0)
  const totalItens = eventos.reduce((s, e) => s + e.itensVendidos, 0)

  const mensais = buildMensais(eventos)
  const produtoMix = buildProdutoMix(eventos)
  const metodosPagamento = buildMetodosPagamento(eventos)
  const categorias = buildCategorias(produtoMix)

  return {
    source,
    totalEvents: eventos.length,
    totalRevenue,
    totalOrders,
    totalItens,
    revenueBar: totalRevenue,
    ticketMedioBar: totalOrders > 0 ? +(totalRevenue / totalOrders).toFixed(2) : 0,
    ticketMedioGeral: totalItens > 0 ? +(totalRevenue / totalItens).toFixed(2) : 0,
    eventos,
    mensais,
    produtoMix: produtoMix.slice(0, 50),
    metodosPagamento,
    categorias,
  }
}
