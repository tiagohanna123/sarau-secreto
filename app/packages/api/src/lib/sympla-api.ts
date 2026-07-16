/**
 * Sympla API Client v1.5.1
 *
 * HTTP client for https://api.sympla.com.br/public/v1.5.1/
 * with automatic pagination, typed responses, and error handling.
 *
 * Auth: s_token header
 * Pagination: page_size max 200, page starts at 1
 */

const BASE =
  process.env.SYMPLA_API_BASE?.replace(/\/+$/, '') ||
  'https://api.sympla.com.br/public/v1.5.1'

const TOKEN = process.env.SYMPLA_TOKEN || ''

// ── Types ──

export interface SymplaPagination {
  page: number
  page_size: number
  total: number
  has_next: boolean
  number_of_pages: number
}

export interface SymplaEvent {
  id: number
  reference_id: number
  name: string
  detail: string | null
  start_date: string
  end_date: string | null
  private_event: number
  published: number
  cancelled: number
  image: string | null
  url: string | null
  address: Record<string, any> | null
  host: Record<string, any> | null
  category_prim: Record<string, any> | null
  category_sec: Record<string, any> | null
}

export interface SymplaEventListResponse {
  data: SymplaEvent[]
  pagination: SymplaPagination
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
  pagination: SymplaPagination
  sort: Record<string, any>
}

export interface SymplaParticipant {
  participant_id: number
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
  pagination: SymplaPagination
  sort: Record<string, any>
}

// ── Custom error classes ──

export class SymplaAuthError extends Error {
  status: number
  constructor(status: number, msg: string) {
    super(msg)
    this.name = 'SymplaAuthError'
    this.status = status
  }
}

export class SymplaRateLimitError extends Error {
  retryAfter: number
  constructor(retryAfter: number) {
    super(`Sympla rate limited. Retry after ${retryAfter}s`)
    this.name = 'SymplaRateLimitError'
    this.retryAfter = retryAfter
  }
}

export class SymplaApiError extends Error {
  status: number
  body: string
  constructor(status: number, body: string) {
    super(`Sympla API ${status}: ${body.slice(0, 300)}`)
    this.name = 'SymplaApiError'
    this.status = status
    this.body = body
  }
}

// ── Generic fetch with retry + error handling ──

async function symplaFetch<T = any>(
  path: string,
  init: RequestInit & { query?: Record<string, any> } = {},
  retries = 3,
): Promise<T> {
  if (!TOKEN) {
    throw new Error('SYMPLA_TOKEN not configured in environment')
  }

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

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        s_token: TOKEN,
        ...(rest.headers || {}),
      },
    })

    // 401/403 → auth error (no retry)
    if (res.status === 401 || res.status === 403) {
      throw new SymplaAuthError(res.status, 'Sympla token expired or invalid')
    }

    // 429 → rate limit (retry with backoff)
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('retry-after') || '5', 10)
      if (attempt < retries) {
        const delay = retryAfter * 1000 + Math.random() * 1000
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      throw new SymplaRateLimitError(retryAfter)
    }

    // Other errors
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new SymplaApiError(res.status, body)
    }

    return res.json() as Promise<T>
  }

  // Should never reach here
  throw new Error('Unexpected error in symplaFetch')
}

// ── Pagination helper ──

async function fetchAllPaginated<TItem, TResponse extends { data: TItem[]; pagination: SymplaPagination }>(
  path: string,
  query: Record<string, any> = {},
  pageSize = 200,
): Promise<TItem[]> {
  let page = 1
  let hasNext = true
  const all: TItem[] = []

  while (hasNext) {
    const res = await symplaFetch<TResponse>(path, {
      query: { ...query, page, page_size: pageSize },
    })
    all.push(...res.data)
    hasNext = res.pagination.has_next
    page++
  }

  return all
}

// ── Public API methods ──

/**
 * Fetch ALL events from Sympla with automatic pagination.
 */
export async function getEvents(): Promise<SymplaEvent[]> {
  return fetchAllPaginated<SymplaEvent, SymplaEventListResponse>('/events')
}

/**
 * Fetch ALL orders for a specific event with automatic pagination.
 */
export async function getEventOrders(eventId: number | string): Promise<SymplaOrder[]> {
  return fetchAllPaginated<SymplaOrder, SymplaOrdersListResponse>(
    `/events/${eventId}/orders`,
  )
}

/**
 * Fetch ALL participants for a specific event with automatic pagination.
 */
export async function getEventParticipants(eventId: number | string): Promise<SymplaParticipant[]> {
  return fetchAllPaginated<SymplaParticipant, SymplaParticipantsListResponse>(
    `/events/${eventId}/participants`,
  )
}
