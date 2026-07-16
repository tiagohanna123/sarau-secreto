/**
 * Convergence Engine — Engine de convergência receita/despesa por evento
 *
 * Estratégia:
 *   1. Tickets: associa ao Event pelo symplaEventId (ground truth);
 *      se não houver symplaEventId, usa purchaseDate + CostAllocation.
 *   2. BarSales: associa ao Event pela saleTime + CostAllocation,
 *      sem alterar a data de lançamento (eventId corrente é preservado).
 *   3. Override manual aceito via parâmetro.
 *   4. Gera relatório de alocação com discrepâncias.
 *
 * Reusa CostAllocation (lib/cost-allocation.ts) para a lógica de janelas.
 */

import { CostAllocation, AllocEvent } from './cost-allocation.js'

// ── Tipos de entrada ──

export interface ConvEvent {
  id: string
  title: string
  date: Date
  symplaEventId: string | null
}

export interface ConvTicket {
  id: string
  eventId: string
  totalPaid: number
  purchaseDate: Date
  quantity: number
}

export interface ConvBarSale {
  id: string
  eventId: string
  total: number
  saleTime: Date | null
  productName: string
  quantity: number
}

// ── Tipos de saída (relatório) ──

export interface ConvergenceReport {
  /** Metadados da execução */
  meta: {
    generatedAt: string
    strategy: string
    prepWindowDays: number
    totalEvents: number
    totalTickets: number
    totalBarSales: number
  }

  /** Receita total consolidada por evento */
  events: ConvergenceEventRow[]

  /** Itens (tickets/bar) cuja alocação sugerida difere da atual */
  discrepancies: ConvergenceDiscrepancy[]

  /** Itens que não puderam ser alocados a nenhum evento */
  unallocated: ConvergenceUnallocated[]

  /** Tabela de janelas de alocação (do CostAllocation) */
  allocationWindows: ConvergenceWindow[]
}

export interface ConvergenceEventRow {
  eventId: string
  eventName: string
  eventDate: string
  symplaEventId: string | null

  /** Receita de tickets atualmente alocados a este evento */
  currentTicketRevenue: number

  /** Receita de tickets que a engine sugere para este evento */
  suggestedTicketRevenue: number

  /** Receita de bar atualmente alocada a este evento */
  currentBarRevenue: number

  /** Receita de bar que a engine sugere para este evento */
  suggestedBarRevenue: number

  /** Receita total atual */
  currentTotal: number

  /** Receita total sugerida */
  suggestedTotal: number

  /** Variação (sugerido - atual) */
  delta: number

  /** Número de tickets com alocação divergente */
  ticketDiscrepancies: number

  /** Número de bar sales com alocação divergente */
  barDiscrepancies: number
}

export interface ConvergenceDiscrepancy {
  type: 'ticket' | 'bar'
  itemId: string
  productName?: string
  amount: number
  date: string
  currentEventId: string
  currentEventName: string
  suggestedEventId: string | null
  suggestedEventName: string | null
  reason: string
}

export interface ConvergenceUnallocated {
  type: 'ticket' | 'bar'
  itemId: string
  productName?: string
  amount: number
  date: string
  currentEventId: string
  currentEventName: string
  reason: string
}

export interface ConvergenceWindow {
  eventId: string
  eventName: string
  windowStart: string
  windowEnd: string
}

// ── Override manual ──

export interface ManualOverride {
  /** ID do item (ticket ou bar sale) */
  itemId: string
  /** Tipo do item */
  type: 'ticket' | 'bar'
  /** Evento manualmente designado (null = desalocar) */
  overrideEventId: string | null
}

// ── Engine ──

export class ConvergenceEngine {
  private events: ConvEvent[]
  private tickets: ConvTicket[]
  private barSales: ConvBarSale[]
  private allocEvents: AllocEvent[]
  private prepWindowDays: number
  private overrides: Map<string, ManualOverride> = new Map()

  constructor(
    events: ConvEvent[],
    tickets: ConvTicket[],
    barSales: ConvBarSale[],
    config?: { prepWindowDays?: number; overrides?: ManualOverride[] }
  ) {
    this.events = events
    this.tickets = tickets
    this.barSales = barSales
    this.prepWindowDays = config?.prepWindowDays ?? 3

    // Converte para o formato AllocEvent (que CostAllocation espera)
    this.allocEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      endDate: null,
    }))

    // Carrega overrides manuais
    if (config?.overrides) {
      for (const o of config.overrides) {
        this.overrides.set(`${o.type}:${o.itemId}`, o)
      }
    }
  }

  // ── Build do relatório ──

  generate(): ConvergenceReport {
    const alloc = new CostAllocation(this.allocEvents, { prepWindowDays: this.prepWindowDays })

    // 1. Alocar tickets
    const ticketAlloc = this.allocateTickets(alloc)
    // 2. Alocar bar sales
    const barAlloc = this.allocateBarSales(alloc)

    // 3. Montar linhas por evento
    const eventMap = new Map(this.events.map(e => [e.id, e]))
    const events: ConvergenceEventRow[] = []
    const discrepancies: ConvergenceDiscrepancy[] = []
    const unallocated: ConvergenceUnallocated[] = []

    for (const ev of this.events) {
      const ticketsCurrent = ticketAlloc.currentByEvent.get(ev.id) ?? 0
      const ticketsSuggested = ticketAlloc.suggestedByEvent.get(ev.id) ?? 0
      const barCurrent = barAlloc.currentByEvent.get(ev.id) ?? 0
      const barSuggested = barAlloc.suggestedByEvent.get(ev.id) ?? 0

      const tDiscs = ticketAlloc.discrepancies.filter(d => d.currentEventId === ev.id).length
      const bDiscs = barAlloc.discrepancies.filter(d => d.currentEventId === ev.id).length

      events.push({
        eventId: ev.id,
        eventName: ev.title,
        eventDate: ev.date.toISOString().slice(0, 10),
        symplaEventId: ev.symplaEventId,
        currentTicketRevenue: round2(ticketsCurrent),
        suggestedTicketRevenue: round2(ticketsSuggested),
        currentBarRevenue: round2(barCurrent),
        suggestedBarRevenue: round2(barSuggested),
        currentTotal: round2(ticketsCurrent + barCurrent),
        suggestedTotal: round2(ticketsSuggested + barSuggested),
        delta: round2((ticketsSuggested + barSuggested) - (ticketsCurrent + barCurrent)),
        ticketDiscrepancies: tDiscs,
        barDiscrepancies: bDiscs,
      })
    }

    discrepancies.push(...ticketAlloc.discrepancies, ...barAlloc.discrepancies)
    unallocated.push(...ticketAlloc.unallocated, ...barAlloc.unallocated)

    // Tabela de janelas
    const allocTable = alloc.getAllocationTable()
    const allocationWindows: ConvergenceWindow[] = allocTable.map(t => ({
      eventId: t.eventId,
      eventName: t.eventName,
      windowStart: t.windowStart,
      windowEnd: t.windowEnd,
    }))

    return {
      meta: {
        generatedAt: new Date().toISOString(),
        strategy: `mista (symplaEventId + midpointCostAllocation)`,
        prepWindowDays: this.prepWindowDays,
        totalEvents: this.events.length,
        totalTickets: this.tickets.length,
        totalBarSales: this.barSales.length,
      },
      events,
      discrepancies,
      unallocated,
      allocationWindows,
    }
  }

  // ── Alocação de Tickets ──

  private allocateTickets(alloc: CostAllocation) {
    const currentByEvent = new Map<string, number>()
    const suggestedByEvent = new Map<string, number>()
    const discrepancies: ConvergenceDiscrepancy[] = []
    const unallocated: ConvergenceUnallocated[] = []

    const eventMap = new Map(this.events.map(e => [e.id, e]))

    for (const t of this.tickets) {
      // Total atual
      currentByEvent.set(t.eventId, (currentByEvent.get(t.eventId) ?? 0) + t.totalPaid)

      // Verifica override manual
      const override = this.overrides.get(`ticket:${t.id}`)

      // Determina evento sugerido
      let suggestedId: string | null

      if (override) {
        suggestedId = override.overrideEventId
      } else {
        suggestedId = this.resolveTicketEvent(t, eventMap, alloc)
      }

      // Acumula sugerido
      if (suggestedId) {
        suggestedByEvent.set(suggestedId, (suggestedByEvent.get(suggestedId) ?? 0) + t.totalPaid)
      }

      // Discrepância?
      if (suggestedId !== t.eventId) {
        const curEvent = eventMap.get(t.eventId)
        const sugEvent = suggestedId ? eventMap.get(suggestedId) : null
        discrepancies.push({
          type: 'ticket',
          itemId: t.id,
          amount: t.totalPaid,
          date: t.purchaseDate.toISOString().slice(0, 10),
          currentEventId: t.eventId,
          currentEventName: curEvent?.title ?? '(desconhecido)',
          suggestedEventId: suggestedId,
          suggestedEventName: sugEvent?.title ?? null,
          reason: suggestedId === null
            ? 'Data de compra fora de qualquer janela de evento'
            : override
              ? 'Override manual aplicado'
              : 'Alocação por data difere da alocação atual',
        })
      }
    }

    // Itens não alocáveis: tickets sem evento sugerido
    for (const t of this.tickets) {
      const suggested = this.resolveTicketEvent(t, eventMap, alloc)
      if (!suggested) {
        const curEvent = eventMap.get(t.eventId)
        unallocated.push({
          type: 'ticket',
          itemId: t.id,
          amount: t.totalPaid,
          date: t.purchaseDate.toISOString().slice(0, 10),
          currentEventId: t.eventId,
          currentEventName: curEvent?.title ?? '(desconhecido)',
          reason: 'Data de compra fora de qualquer janela de evento',
        })
      }
    }

    return { currentByEvent, suggestedByEvent, discrepancies, unallocated }
  }

  /**
   * Resolve o evento correto para um ticket:
   * 1. Se o evento atual tem symplaEventId, confia nele (ground truth)
   * 2. Caso contrário, usa purchaseDate + CostAllocation
   */
  private resolveTicketEvent(
    ticket: ConvTicket,
    eventMap: Map<string, ConvEvent>,
    alloc: CostAllocation
  ): string | null {
    const curEvent = eventMap.get(ticket.eventId)

    // Se o evento atual tem symplaEventId, o ticket já está no lugar certo
    if (curEvent?.symplaEventId) {
      return ticket.eventId
    }

    // Caso contrário, tenta alocar por data de compra
    return alloc.assign(ticket.purchaseDate)
  }

  // ── Alocação de Bar Sales ──

  private allocateBarSales(alloc: CostAllocation) {
    const currentByEvent = new Map<string, number>()
    const suggestedByEvent = new Map<string, number>()
    const discrepancies: ConvergenceDiscrepancy[] = []
    const unallocated: ConvergenceUnallocated[] = []

    const eventMap = new Map(this.events.map(e => [e.id, e]))

    for (const b of this.barSales) {
      // Total atual
      currentByEvent.set(b.eventId, (currentByEvent.get(b.eventId) ?? 0) + b.total)

      // Verifica override manual
      const override = this.overrides.get(`bar:${b.id}`)

      let suggestedId: string | null

      if (override) {
        suggestedId = override.overrideEventId
      } else if (b.saleTime) {
        // Usa saleTime com CostAllocation (sem alterar eventId no banco)
        suggestedId = alloc.assign(b.saleTime)
      } else {
        // Sem saleTime, mantém o atual
        suggestedId = b.eventId
      }

      if (suggestedId) {
        suggestedByEvent.set(suggestedId, (suggestedByEvent.get(suggestedId) ?? 0) + b.total)
      }

      // Discrepância?
      if (suggestedId !== b.eventId) {
        const curEvent = eventMap.get(b.eventId)
        const sugEvent = suggestedId ? eventMap.get(suggestedId) : null
        discrepancies.push({
          type: 'bar',
          itemId: b.id,
          productName: b.productName,
          amount: b.total,
          date: b.saleTime ? b.saleTime.toISOString().slice(0, 10) : '(sem data)',
          currentEventId: b.eventId,
          currentEventName: curEvent?.title ?? '(desconhecido)',
          suggestedEventId: suggestedId,
          suggestedEventName: sugEvent?.title ?? null,
          reason: suggestedId === null
            ? 'Data da venda fora de qualquer janela de evento'
            : !b.saleTime
              ? 'Sem saleTime — mantido no evento atual'
              : override
                ? 'Override manual aplicado'
                : 'Alocação por data difere da alocação atual',
        })
      }
    }

    // Unallocated: bar sales sem evento sugerido
    for (const b of this.barSales) {
      let suggested: string | null = b.eventId
      if (b.saleTime) {
        const override = this.overrides.get(`bar:${b.id}`)
        suggested = override ? override.overrideEventId : alloc.assign(b.saleTime)
      }
      if (!suggested) {
        const curEvent = eventMap.get(b.eventId)
        unallocated.push({
          type: 'bar',
          itemId: b.id,
          productName: b.productName,
          amount: b.total,
          date: b.saleTime ? b.saleTime.toISOString().slice(0, 10) : '(sem data)',
          currentEventId: b.eventId,
          currentEventName: curEvent?.title ?? '(desconhecido)',
          reason: 'Data da venda fora de qualquer janela de evento',
        })
      }
    }

    return { currentByEvent, suggestedByEvent, discrepancies, unallocated }
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
