import { useState, useMemo } from 'react'
import { useData } from '@/lib/data-context'
import type { FlatEvent } from '@/lib/data-context'
import { RefreshCw } from 'lucide-react'

const CUSTO_PRODUCAO_FIXO = 12_000
const CMV_BAR_RATE = 0.42
const TAXA_SYMPLA_RATE = 0.08

const calcProfit = (revenue: number, barRevenue: number, ticketRevenue: number) => {
  const custoCMV = barRevenue * CMV_BAR_RATE
  const custoSympla = ticketRevenue * TAXA_SYMPLA_RATE
  return revenue - (CUSTO_PRODUCAO_FIXO + custoCMV + custoSympla)
}

const profitEvent = (ev: { revenue: number; barRevenue: number; total: number }) =>
  calcProfit(ev.total, ev.barRevenue, ev.revenue)

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const fmtBRLc = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })

const fmtDateLabel = (iso: string) => {
  const d = new Date(iso)
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[d.getMonth()]}/${d.getFullYear()}`
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-pulse">
      <header className="mb-6">
        <div className="mb-3 h-3 w-16 rounded bg-white/10" />
        <div className="h-6 w-32 rounded bg-white/10" />
        <div className="mt-2 h-3 w-64 rounded bg-white/10" />
      </header>
      <div className="mb-6 grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card border border-border rounded-xl h-20" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card border border-border rounded-xl h-36" />
        ))}
      </div>
    </div>
  )
}

export function EventsPage({
  onBack,
  onSelect,
}: {
  onBack: () => void
  onSelect: (id: string) => void
}) {
  const { events: dataEvents, loading, source, refresh } = useData()
  const [hovered, setHovered] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'revenue' | 'bar' | 'profit'>('date')
  const [searchQuery, setSearchQuery] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')

  // Transforma FlatEvent[] → EventData[] + ordena + filtra
  const sorted = useMemo(() => {
    const mapped = (dataEvents || []).map((ev: FlatEvent) => ({
      id: ev.id,
      title: ev.title,
      date: ev.date,
      dateLabel: fmtDateLabel(ev.date),
      tickets: ev.ticketsSold,
      capacity: ev.capacity ?? null,
      revenue: ev.ticketRevenue,
      barRevenue: ev.barRevenue,
      barTransactions: ev.barTransactions,
      perCapitaBar: ev.perCapitaBar,
      total: ev.totalRevenue,
      checkedIn: ev.checkedIn,
      noShow: ev.noShowRate,
      status: ev.status ?? 'completed',
    }))

    let result = [...mapped].sort((a, b) => {
      if (sortBy === 'revenue') return b.total - a.total
      if (sortBy === 'bar') return b.barRevenue - a.barRevenue
      if (sortBy === 'profit') {
        const profitA = profitEvent(a)
        const profitB = profitEvent(b)
        return profitB - profitA
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    // Filtro por busca textual
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(ev => ev.title.toLowerCase().includes(q))
    }

    // Filtro por mês/ano
    if (monthFilter) {
      result = result.filter(ev => ev.dateLabel === monthFilter)
    }

    // Filtro por ano
    if (yearFilter) {
      result = result.filter(ev => ev.date.startsWith(yearFilter) || ev.dateLabel.includes(yearFilter))
    }

    return result
  }, [dataEvents, sortBy, searchQuery, monthFilter])

  // KPIs
  const totalTickets = dataEvents.reduce((s, e) => s + e.ticketsSold, 0)
  const totalRevenue = dataEvents.reduce((s, e) => s + e.ticketRevenue, 0)
  const totalBar = dataEvents.reduce((s, e) => s + e.barRevenue, 0)
  const totalGeral = totalRevenue + totalBar
  const barPerCapitaGeral = totalTickets > 0 ? totalBar / totalTickets : 0
  const barPctKPI = totalGeral > 0 ? Math.round(totalBar / totalGeral * 100) : 0
  const receitaPorIngresso = totalTickets > 0 ? totalGeral / totalTickets : 0
  const ingressoPerCapitaGeral = totalTickets > 0 ? totalRevenue / totalTickets : 0
  // Médias para os indicadores de tendência
  const avgRevenue = sorted.length > 0 ? sorted.reduce((s, e) => s + e.total, 0) / sorted.length : 0

  // Opções para o filtro de ano
  const yearOptions = useMemo(() => {
    const set = new Set<string>()
    ;(dataEvents || []).forEach(ev => {
      const y = ev.date?.slice(0, 4)
      if (y) set.add(y)
    })
    return Array.from(set).sort().reverse()
  }, [dataEvents])

  // Opções para o filtro de mês
  const monthOptions = useMemo(() => {
    const set = new Set<string>()
    ;(dataEvents || []).forEach(ev => {
      set.add(fmtDateLabel(ev.date))
    })
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return Array.from(set).sort((a, b) => {
      const [mA, yA] = a.split('/')
      const [mB, yB] = b.split('/')
      if (yA !== yB) return Number(yB) - Number(yA)
      return meses.indexOf(mB) - meses.indexOf(mA)
    })
  }, [dataEvents])

  // Exporta os eventos filtrados como CSV
  const exportCSV = () => {
    if (sorted.length === 0) return
    const headers = ['Data', 'Evento', 'Ingressos', 'Check-in', 'Bilheteria', 'Bar', 'Total', 'Ingresso/pessoa', 'Bar/pessoa', 'Total/pessoa', 'No-Show%']
    const rows = sorted.map(ev => [
      ev.dateLabel,
      `"${ev.title.replace(/"/g, '""')}"`,
      ev.tickets,
      ev.checkedIn ?? 0,
      fmtBRL(ev.revenue),
      fmtBRL(ev.barRevenue),
      fmtBRL(ev.total),
      ev.tickets > 0 ? fmtBRLc(ev.revenue / ev.tickets) : '—',
      ev.tickets > 0 && ev.barRevenue > 0 ? fmtBRLc(ev.barRevenue / ev.tickets) : '—',
      ev.tickets > 0 ? fmtBRLc(ev.total / ev.tickets) : '—',
      ev.noShow != null ? `${ev.noShow}%` : '—',
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eventos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <LoadingSkeleton />

  if (!dataEvents || dataEvents.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <button onClick={onBack}
            className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar
          </button>
          <h1 className="text-xl font-bold tracking-tight">Eventos</h1>
        </header>
        <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhum evento disponível.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <header className="mb-6">
        <button onClick={onBack}
          className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          ← Voltar
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Eventos</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {sorted.length} edições · {totalTickets.toLocaleString('pt-BR')} ingressos · {fmtBRL(totalGeral)} receita total
            </p>
          </div>
          {/* Sort controls */}
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-muted-foreground">Ordenar:</span>
            {(['date', 'revenue', 'bar', 'profit'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-2 py-1 rounded transition-colors ${sortBy === s ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:text-foreground'}`}>
                {s === 'date' ? 'Data' : s === 'revenue' ? 'Receita' : s === 'bar' ? 'Bar' : 'Lucro'}
              </button>
            ))}
            <span className="mx-1 text-muted-foreground/30">|</span>
            <button onClick={exportCSV}
              className="px-2 py-1 rounded transition-colors text-muted-foreground hover:text-foreground">
              ⬇ CSV
            </button>
            <span className="mx-1 text-muted-foreground/30">|</span>
            <button onClick={() => refresh()}
              className="px-2 py-1 rounded transition-colors text-muted-foreground hover:text-foreground flex items-center gap-1"
              title="Recarregar dados">
              <RefreshCw size={12} /> Recarregar
            </button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar evento…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[180px] rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-gold/50 transition-colors"
        />
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-gold/50 transition-colors"
        >
          <option value="">Todos os anos</option>
          {yearOptions.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-gold/50 transition-colors"
        >
          <option value="">Todos os meses</option>
          {monthOptions.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* KPIs estratégicos */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Receita Total', value: fmtBRL(totalGeral), sub: '' },
          { label: 'Bar Total', value: fmtBRL(totalBar), sub: `${barPctKPI}%` },
          { label: 'Ingressos', value: totalTickets.toLocaleString('pt-BR'), sub: `ingressos vendidos` },
          { label: 'Ingresso/pessoa', value: fmtBRLc(ingressoPerCapitaGeral), sub: `por pessoa` },
          { label: 'Bar/pessoa', value: fmtBRLc(barPerCapitaGeral), sub: `por pessoa` },
          { label: 'Total/pessoa', value: fmtBRLc(receitaPorIngresso), sub: `ticket médio` },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-lg font-bold text-gold">{kpi.value}</p>
            {kpi.sub && <p className="text-[9px] text-muted-foreground mt-0.5">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* Lista de eventos */}
      <div className="space-y-3">
        {sorted.length === 0 && (
          <div className="kpi-card py-12 text-center">
            <p className="text-sm text-muted-foreground">Nenhum evento encontrado.</p>
          </div>
        )}

        {sorted.map((ev) => {
          const ocupacao = ev.capacity && ev.capacity > 0
            ? Math.round((ev.tickets / ev.capacity) * 100) : null
          const barPct = ev.total > 0 ? Math.round(ev.barRevenue / ev.total * 100) : 0

          return (
            <button
              key={ev.id}
              onClick={() => onSelect(ev.id)}
              onMouseEnter={() => setHovered(ev.id)}
              onMouseLeave={() => setHovered(null)}
              className={`bg-card border border-border rounded-xl p-5 w-full text-left transition-all duration-200 ${
                hovered === ev.id ? 'border-gold/40 bg-white/5' : ''
              }`}
            >
              {/* Linha 1: data + status + nome */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-violet">
                      {ev.dateLabel}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider ${
                      ev.status === 'draft'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-success/10 text-success'
                    }`}>
                      {ev.status === 'draft' ? 'rascunho' : 'concluído'}
                    </span>
                    <span className="text-[9px] text-muted-foreground ml-auto">
                      {ev.tickets} ingressos {ev.capacity ? `· ${ocupacao}% ocupação` : ''}
                    </span>
                  </div>
                  <h2 className="mt-0.5 text-sm font-semibold leading-tight">{ev.title}</h2>
                </div>
              </div>

              {/* Grid de métricas */}
              <div className="grid grid-cols-4 gap-3">
                {/* Bilheteria */}
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Bilheteria</p>
                  <p className="mt-0.5 text-sm font-bold">{fmtBRL(ev.revenue)}</p>
                </div>

                {/* Bar */}
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Bar {barPct > 0 && <span className="text-gold">({barPct}%)</span>}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-gold">{fmtBRL(ev.barRevenue)}</p>
                </div>

                {/* Total */}
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Total</p>
                  <p className="mt-0.5 text-sm font-bold flex items-center gap-1">
                    {fmtBRL(ev.total)}
                    <span className={`text-[9px] ${ev.total >= avgRevenue ? 'text-success' : 'text-red-400'}`}>
                      {ev.total >= avgRevenue ? '↑' : '↓'}
                    </span>
                  </p>
                </div>

                {/* Lucro (estimado) */}
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Lucro
                    <span className="ml-1 rounded bg-warning/15 px-1 py-[1px] text-[7px] uppercase tracking-widest text-warning">estimado</span>
                  </p>
                  <p className="mt-0.5 text-sm font-bold" style={{ color: profitEvent(ev) >= 0 ? undefined : '#f87171' }}>
                    {fmtBRL(profitEvent(ev))}
                  </p>
                </div>
              </div>

              {/* Barra de ocupação + ticket médio */}
              {ev.capacity && ev.capacity > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
                    <span>Ocupação {ocupacao}%</span>
                    <span>Capacidade: {ev.capacity} pessoas</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gold transition-all"
                      style={{ width: `${Math.min(ocupacao!, 100)}%` }} />
                  </div>
                </div>
              )}

              {/* Bar split visual */}
              {ev.total > 0 && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex h-2 w-20 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-l-full bg-foreground/60 transition-all"
                      style={{ width: `${100 - barPct}%` }} />
                    <div className="h-full rounded-r-full bg-gold transition-all"
                      style={{ width: `${barPct}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">
                    {barPct}% bar
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Fonte dos dados */}
      <div className="mt-6 text-[10px] text-muted-foreground">
        <p>📊 Fonte: {source === 'live' ? 'Yuzer ao vivo' : source === 'insights' ? 'banco de eventos' : 'backup'}.</p>
      </div>
    </div>
  )
}
