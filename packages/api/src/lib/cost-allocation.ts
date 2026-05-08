/**
 * Cost Allocation Engine — Alocação mista de custos por evento
 *
 * Estratégia:
 *  1. Intervalo entre eventos (midpoint) — padrão
 *  2. Janela de preparação (N dias antes do primeiro evento)
 *  3. Override manual (eventId explícito)
 *
 * Uso:
 *    const alloc = new CostAllocation(events, { prepWindowDays: 3 })
 *    const eventId = alloc.assign(saleDate)
 */

export interface AllocEvent {
  id: string
  title: string
  date: Date
  endDate: Date | null
}

export interface AllocConfig {
  /** Dias de preparação antes do primeiro evento de uma sequência */
  prepWindowDays: number
}

const DEFAULT_CONFIG: AllocConfig = { prepWindowDays: 3 }

/**
 * Calcula o midpoint entre duas datas.
 * Vendas ANTES do midpoint vão pro evento anterior.
 * Vendas DEPOIS do midpoint vão pro evento seguinte.
 */
function midpoint(a: Date, b: Date): Date {
  const ms = a.getTime() + (b.getTime() - a.getTime()) / 2
  return new Date(ms)
}

export class CostAllocation {
  private events: AllocEvent[]
  private config: AllocConfig
  private boundaries: { date: Date; leftId: string | null; rightId: string }[]

  constructor(events: AllocEvent[], config?: Partial<AllocConfig>) {
    this.events = [...events].sort((a, b) => a.date.getTime() - b.date.getTime())
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.boundaries = this.buildBoundaries()
  }

  /**
   * Constrói as fronteiras de decisão entre eventos consecutivos.
   *
   * Para cada par (A, B):
   *   - Midpoint entre A.date e B.date
   *   - Vendas em [A.date, midpoint) → A
   *   - Vendas em [midpoint, B.date) → B
   *
   * Janela de preparação:
   *   - Vendas em [A.date - prepWindowDays, A.date) → A
   *   - Vendas antes do primeiro evento - prepWindowDays → null (não alocado)
   */
  private buildBoundaries(): { date: Date; leftId: string | null; rightId: string }[] {
    const boundaries: { date: Date; leftId: string | null; rightId: string }[] = []
    const ev = this.events
    if (ev.length === 0) return boundaries

    // Janela de preparação para o primeiro evento
    const firstPrep = new Date(ev[0].date.getTime() - this.config.prepWindowDays * 24 * 60 * 60 * 1000)
    boundaries.push({
      date: firstPrep,
      leftId: null,        // antes da janela → não alocado
      rightId: ev[0].id,   // depois da janela → primeiro evento
    })

    // Midpoints entre pares consecutivos
    for (let i = 0; i < ev.length - 1; i++) {
      const mid = midpoint(ev[i].date, ev[i + 1].date)
      boundaries.push({
        date: mid,
        leftId: ev[i].id,
        rightId: ev[i + 1].id,
      })
    }

    // Depois do último evento — tudo vai pro último evento (sem limite superior)
    boundaries.push({
      date: ev[ev.length - 1].date,
      leftId: ev[ev.length - 1].id,
      rightId: ev[ev.length - 1].id,
    })

    return boundaries
  }

  /**
   * Atribui uma venda/custo a um evento com base na data.
   * @param saleDate — data da venda
   * @param overrideEventId — se fornecido, ignora a regra automática
   * @returns eventId ou null se não foi possível alocar
   */
  assign(saleDate: Date, overrideEventId?: string): string | null {
    if (overrideEventId) return overrideEventId
    if (this.boundaries.length === 0) return null

    const ts = saleDate.getTime()

    // Primeira fronteira: antes da janela de preparação
    const first = this.boundaries[0]
    if (ts < first.date.getTime()) return null // não alocado

    // Encontra a fronteira aplicável
    for (const b of this.boundaries) {
      if (ts < b.date.getTime()) {
        return b.leftId
      }
    }

    // Depois de todas as fronteiras — último evento
    return this.boundaries[this.boundaries.length - 1].rightId
  }

  /**
   * Retorna a tabela de alocação legível (para debug / relatório)
   */
  getAllocationTable(): { eventId: string; eventName: string; windowStart: string; windowEnd: string }[] {
    const table: { eventId: string; eventName: string; windowStart: string; windowEnd: string }[] = []
    const evMap = new Map(this.events.map(e => [e.id, e]))

    for (let i = 0; i < this.boundaries.length; i++) {
      const b = this.boundaries[i]
      const event = evMap.get(b.rightId)
      if (!event) continue

      const start = b.date
      const end = i < this.boundaries.length - 1 ? this.boundaries[i + 1].date : new Date(8640000000000000)

      table.push({
        eventId: event.id,
        eventName: event.title,
        windowStart: start.toISOString(),
        windowEnd: end.toISOString(),
      })
    }

    return table
  }
}
