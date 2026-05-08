/**
 * Yuzer Eagle live client.
 * Reads JWT from a local file (refreshable out-of-band) and proxies authenticated
 * calls to https://api.eagle.yuzer.com.br/api with simple in-memory caching.
 */
import { readFile } from 'node:fs/promises'

const BASE = process.env.YUZER_API_BASE || 'https://api.eagle.yuzer.com.br/api'
const TOKEN_FILE = process.env.YUZER_TOKEN_FILE || ''
export const MASTER_COMPANY_ID = process.env.YUZER_MASTER_COMPANY_ID || '305'
export const SALES_PANELS = (process.env.YUZER_SALES_PANELS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((n) => parseInt(n, 10))

let cachedToken: { value: string; loadedAt: number } | null = null

export async function getToken(): Promise<string> {
  // re-read every 60s so a manual refresh of the file is picked up
  if (cachedToken && Date.now() - cachedToken.loadedAt < 60_000) {
    return cachedToken.value
  }
  if (!TOKEN_FILE) throw new Error('YUZER_TOKEN_FILE not configured')
  const value = (await readFile(TOKEN_FILE, 'utf8')).trim()
  cachedToken = { value, loadedAt: Date.now() }
  return value
}

export class YuzerAuthError extends Error {
  status: number
  constructor(status: number, msg: string) {
    super(msg)
    this.status = status
  }
}

export async function yuzerFetch<T = any>(
  path: string,
  init: RequestInit & { query?: Record<string, any> } = {},
): Promise<T> {
  const token = await getToken()
  const { query, ...rest } = init
  let qs = ''
  if (query && Object.keys(query).length) {
    const usp = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue
      usp.append(k, String(v))
    }
    const s = usp.toString()
    if (s) qs = (path.includes('?') ? '&' : '?') + s
  }
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}${qs}`
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(rest.headers || {}),
    },
  })
  if (res.status === 401 || res.status === 403) {
    throw new YuzerAuthError(res.status, 'Yuzer token expired or invalid')
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Yuzer ${res.status}: ${body.slice(0, 300)}`)
  }
  return res.json() as Promise<T>
}

// ── Tiny TTL cache ──
type CacheEntry = { value: any; expiresAt: number }
const cache = new Map<string, CacheEntry>()

export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = cache.get(key)
  if (hit && hit.expiresAt > Date.now()) return hit.value as T
  const value = await fetcher()
  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
  return value
}

export function invalidate(prefix?: string) {
  if (!prefix) return cache.clear()
  for (const k of Array.from(cache.keys())) if (k.startsWith(prefix)) cache.delete(k)
}

// ── Convenience domain helpers ──
// orders/search: ALL params in body, no querystring.
// Field names confirmed from live browser capture (2026-05-02).
export async function searchOrders(input: {
  from: string
  to: string
  status?: string
  page?: number
  perPage?: number
  sort?: 'asc' | 'desc'
  sortColumn?: string
  companiesIds?: number[]
  channels?: string[]
  currency?: string
  q?: string
}) {
  const body = {
    status: input.status || 'ALL',
    page: input.page ?? 1,
    perPage: input.perPage ?? 50,
    from: input.from,
    to: input.to,
    companiesIds: input.companiesIds ?? [],
    channels: input.channels ?? [],
    currency: input.currency || 'BRL',
    q: input.q || '',
    sort: input.sort || 'desc',
    sortColumn: input.sortColumn || 'createdAt',
  }
  return yuzerFetch('/orders/search', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function ordersStatistics(input: {
  from: string
  to: string
  status?: string
  sort?: 'asc' | 'desc'
  sortColumn?: string
  companiesIds?: number[]
  channels?: string[]
  q?: string
}) {
  const body = {
    from: input.from,
    to: input.to,
    q: input.q || '',
    sort: input.sort || 'desc',
    sortColumn: input.sortColumn || 'createdAt',
    status: input.status || 'ALL',
    companiesIds: input.companiesIds ?? [],
    channels: input.channels ?? [],
  }
  return yuzerFetch('/orders/statistics', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function dashboardEarningsAndSells(body: Record<string, any>) {
  return yuzerFetch('/dashboards/earningsAndSells/day/v2', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function dashboardPayments(body: Record<string, any>) {
  return yuzerFetch('/dashboards/payments/statistics', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function dashboardCardBrands(body: Record<string, any>) {
  return yuzerFetch('/dashboards/cardBrandTypes/statistics', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function dashboardRanking(body: Record<string, any>) {
  return yuzerFetch('/dashboards/ranking', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function dashboardProducts(body: Record<string, any>, page = 1, limit = 100) {
  return yuzerFetch('/dashboards/products/statistics', {
    method: 'POST',
    query: { page, limit, orders: 'desc', orderBy: 'totalEarnings' },
    body: JSON.stringify(body),
  })
}
