import { useState, useMemo } from 'react'
import { useData } from '@/lib/data-context'
import type { FlatEvent } from '@/lib/data-context'

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
  const { events: dataEvents, loading, source } = useData()
  const [hovered, setHovered] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'revenue' | 'bar' | 'perCapita'>('date')

  // Transforma FlatEvent[] → EventData[] + ordena
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

    return [...mapped].sort((a, b) => {
      if (sortBy === 'revenue') return b.total - a.total
      if (sortBy === 'bar') return b.barRevenue - a.barRevenue
      if (sortBy === 'perCapita') return b.perCapitaBar - a.perCapitaBar
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [dataEvents, sortBy])

  // KPIs
  const totalTickets = dataEvents.reduce((s, e) => s + e.ticketsSold, 0)
  const totalRevenue = dataEvents.reduce((s, e) => s + e.ticketRevenue, 0)
  const totalBar = dataEvents.reduce((s, e) => s + e.barRevenue, 0)
  const totalGeral = totalRevenue + totalBar
  const barPerCapitaGeral = totalTickets > 0 ? totalBar / totalTickets : 0
  const barPctKPI = totalGeral > 0 ? Math.round(totalBar / totalGeral * 100) : 0
  const receitaPorIngresso = totalTickets > 0 ? totalGeral / totalTickets : 0

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
            {(['date', 'revenue', 'bar', 'perCapita'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-2 py-1 rounded transition-colors ${sortBy === s ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:text-foreground'}`}>
                {s === 'date' ? 'Data' : s === 'revenue' ? 'Receita' : s === 'bar' ? 'Bar' : 'Per Capita'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* KPIs estratégicos */}
      <div className="mb-6 grid grid-cols-5 gap-3">
        {[
          { label: 'Receita Total', value: fmtBRL(totalGeral), sub: '' },
          { label: 'Bar Total', value: fmtBRL(totalBar), sub: `${barPctKPI}%` },
          { label: 'Ingressos', value: totalTickets.toLocaleString('pt-BR'), sub: `ingressos vendidos` },
          { label: 'Receita/Ingresso', value: fmtBRLc(receitaPorIngresso), sub: `total por ingresso` },
          { label: 'Gasto Médio', value: fmtBRLc(barPerCapitaGeral), sub: `por ingresso` },
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
                  <p className="mt-0.5 text-sm font-bold">{fmtBRL(ev.total)}</p>
                </div>

                {/* Per capita bar */}
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Gasto/ingresso</p>
                  <p className="mt-0.5 text-sm font-bold">{ev.barRevenue > 0 ? fmtBRLc(ev.perCapitaBar) : '—'}</p>
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

              {/* Barra receita split */}
              <div className="mt-2 flex items-center gap-2">
                {/* Ticket médio */}
                <div className="flex-1 text-[9px] text-muted-foreground">
                  Ticket médio: {ev.tickets > 0 ? fmtBRLc(ev.revenue / ev.tickets) : '—'}
                </div>
                {/* Bar split visual */}
                {ev.total > 0 && (
                  <div className="flex items-center gap-1.5">
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
              </div>
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
