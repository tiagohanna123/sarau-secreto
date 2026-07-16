/**
 * Sympla API client.
 * Fetches events and orders from https://api.sympla.com.br/public/v1
 * with simple in-memory caching (60s TTL).
 *
 * Auth: s_token header
 * Pagination: page_size max 200, page starts at 1
 *
 * Known limitation: the public API does NOT return events after ~2024.
 * Events from 2025–2026 must be imported via CSV (POST /api/import/sympla).
 */
const BASE = process.env.SYMPLA_API_BASE || 'https://api.sympla.com.br/public/v1'
const TOKEN = process.env.SYMPLA_TOKEN || ''

// ── Auth ──
export function getToken(): string {
  if (!TOKEN) throw new Error('SYMPLA_TOKEN not configured in .env')
  return TOKEN
}

export class SymplaAuthError extends Error {
  status: number
  constructor(status: number, msg: string) {
    super(msg)
    this.status = status
  }
}

// ── Generic fetch ──
export async function symplaFetch<T = any>(
  path: string,
  init: RequestInit & { query?: Record<string, any> } = {},
): Promise<T> {
  const token = getToken()
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
      s_token: token,
      ...(rest.headers || {}),
    },
  })
  if (res.status === 401 || res.status === 403) {
    throw new SymplaAuthError(res.status, 'Sympla token expired or invalid')
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Sympla ${res.status}: ${body.slice(0, 300)}`)
  }
  return res.json() as Promise<T>
}

// ── Tiny TTL cache (same pattern as yuzer.ts) ──
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

// ── Response types ──

export interface SymplaEvent {
  id: number
  name: string
  start_date: string
  end_date: string
  detail: string | null
  private_event: number
  published: number
  cancelled: number
  image: string | null
  address: Record<string, any> | null
  host: Record<string, any> | null
  category_prim: Record<string, any> | null
  category_sec: Record<string, any> | null
  url: string
}

export interface SymplaEventListResponse {
  data: SymplaEvent[]
  pagination: {
    page: number
    page_size: number
    total: number
    has_next: boolean
    number_of_pages: number
  }
  sort: Record<string, any>
}

export interface SymplaOrder {
  id: number
  event_id: number
  order_date: string
  order_status: string
  transaction_type: string | null
  order_total_sale_price: string
  order_total_net_value: string | null
  buyer_first_name: string
  buyer_last_name: string
  buyer_email: string
  discount_code: string | null
  invoice_info: Record<string, any> | null
  utm: Record<string, any> | null
  approved_date: string | null
}

export interface SymplaOrdersListResponse {
  data: SymplaOrder[]
  pagination: {
    page: number
    page_size: number
    total: number
    has_next: boolean
    number_of_pages: number
  }
  sort: Record<string, any>
}

export interface SymplaParticipant {
  id: number
  order_id: number
  event_id: number
  participant_name: string
  participant_email: string
  participant_ticket_type_name: string
  participant_value: string
  participant_checkin: boolean
  participant_checkin_date: string | null
  participant_ticket_number: string | null
}

export interface SymplaParticipantsListResponse {
  data: SymplaParticipant[]
  pagination: {
    page: number
    page_size: number
    total: number
    has_next: boolean
    number_of_pages: number
  }
  sort: Record<string, any>
}

// ── API Methods ──

/**
 * Fetch ALL events from Sympla, handling pagination automatically.
 * page_size is capped at 200 (Sympla max).
 */
export async function fetchAllEvents(
  token?: string,
  page_size = 200,
): Promise<SymplaEvent[]> {
  const qToken = token || getToken()
  let page = 1
  let hasNext = true
  const all: SymplaEvent[] = []

  while (hasNext) {
    const res = await symplaFetch<SymplaEventListResponse>('/events', {
      query: { page, page_size },
    })
    all.push(...res.data)
    hasNext = res.pagination.has_next
    page++
  }

  return all
}

/**
 * Fetch ALL orders for a specific event, handling pagination automatically.
 * page_size is capped at 200.
 */
export async function fetchEventOrders(
  eventId: number | string,
  token?: string,
  page_size = 200,
): Promise<SymplaOrder[]> {
  getToken() // validate token
  let page = 1
  let hasNext = true
  const all: SymplaOrder[] = []

  while (hasNext) {
    const res = await symplaFetch<SymplaOrdersListResponse>(
      `/events/${eventId}/orders`,
      { query: { page, page_size } },
    )
    all.push(...res.data)
    hasNext = res.pagination.has_next
    page++
  }

  return all
}

/**
 * Fetch ALL participants for a specific event, handling pagination.
 */
export async function fetchEventParticipants(
  eventId: number | string,
  token?: string,
  page_size = 200,
): Promise<SymplaParticipant[]> {
  getToken() // validate token
  let page = 1
  let hasNext = true
  const all: SymplaParticipant[] = []

  while (hasNext) {
    const res = await symplaFetch<SymplaParticipantsListResponse>(
      `/events/${eventId}/participants`,
      { query: { page, page_size } },
    )
    all.push(...res.data)
    hasNext = res.pagination.has_next
    page++
  }

  return all
}

// ── Known events with only UI access (no API) ──
// These events from 2025–2026 are NOT returned by the public API.
// They must be imported manually via CSV (POST /api/import/sympla).
export const UI_ONLY_EVENTS: { name: string; year: number; note: string }[] = [
  { name: 'Sarau Secreto — Edição Verão 2025',        year: 2025, note: 'CSV export needed from Sympla UI' },
  { name: 'Sarau Secreto — Edição Outono 2025',       year: 2025, note: 'CSV export needed from Sympla UI' },
  { name: 'Sarau Secreto — Edição Inverno 2025',      year: 2025, note: 'CSV export needed from Sympla UI' },
  { name: 'Sarau Secreto — Edição Primavera 2025',    year: 2025, note: 'CSV export needed from Sympla UI' },
  { name: 'Sarau Secreto — Edição Verão 2026',        year: 2026, note: 'CSV export needed from Sympla UI' },
  { name: 'Sarau Secreto — Edição Outono 2026',       year: 2026, note: 'CSV export needed from Sympla UI' },
  { name: 'Sarau Secreto — Edição Inverno 2026',      year: 2026, note: 'CSV export needed from Sympla UI' },
]

/**
 * Helper: slugify an event name for creating database slugs.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
