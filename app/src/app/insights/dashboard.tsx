import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import { usePeriod } from '@/lib/period-context'
import { PeriodFilter } from '@/lib/period-filter'
import { useData } from '@/lib/data-context'
import {
  Skel, fmt, fmtNum, GOLD, PALETA, PageHeader, SarauSection, SarauKPI, EmptyState, pct, pctAbs,
} from '@/lib/ui'
import {
  DollarSign, TrendingUp, TrendingDown, Wine, Sparkles, CalendarDays, UserMinus,
} from 'lucide-react'
import { parseISO, isWithinInterval } from 'date-fns'

/* ── Tooltip Theme ── */
const TT = { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 9, fontSize: 12, color: '#e5e7eb' }
const TT_LABEL = { color: '#c8a96e', fontWeight: 600 }
const TT_ITEM = { color: '#e5e7eb' }

/* ── Helpers ─────────────────────────────────────────── */

/** Filtra eventos por um intervalo de datas. */
function filterEventos(eventos: any[], start: Date | null, end: Date | null) {
  if (!start || !end) return eventos
  return eventos.filter(ev => {
    const dateStr = ev.start || ev.date
    if (!dateStr) return false
    try {
      const d = parseISO(dateStr)
      return isWithinInterval(d, { start, end })
    } catch {
      return false
    }
  })
}

/** Calcula o range do período anterior (mesma duração, imediatamente anterior). */
function getPrevRange(dateRange: { start: Date; end: Date } | null): { start: Date; end: Date } | null {
  if (!dateRange) return null
  const span = dateRange.end.getTime() - dateRange.start.getTime()
  return {
    start: new Date(dateRange.start.getTime() - span - 1),
    end: new Date(dateRange.start.getTime() - 1),
  }
}

/** Tenta extrair no-show rate dos eventos (algumas fontes têm checkedIn por evento). */
function computeNoShowRate(eventos: any[]): number | null {
  let totalOrders = 0, totalCheckedIn = 0, hasData = false
  for (const ev of eventos) {
    totalOrders += ev.orders || 0
    if (ev.checkedIn !== undefined) {
      totalCheckedIn += ev.checkedIn
      hasData = true
    }
  }
  if (!hasData || totalOrders === 0) return null
  return ((totalOrders - totalCheckedIn) / totalOrders) * 100
}

/** Renderiza uma sparkline inline (mini area chart). */
function Sparkline({ data, color }: { data: { label: string; revenue: number }[]; color: string }) {
  if (!data || data.length < 2) return null
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`}>
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.replace('#', '')})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ── Componente Principal ──────────────────────────── */

export function Dashboard() {
  const { barData: data, loading } = useData()
  const { period, dateRange } = usePeriod()

  /* ── Dados filtrados por período ── */
  const filtered = useMemo(() => {
    if (!data) return null

    // Eventos (filtrados por data)
    const eventos = filterEventos(data.eventos, dateRange?.start || null, dateRange?.end || null)

    // Totais do período atual
    const totalRevenue = eventos.reduce((s: number, e: any) => s + (e.revenue || 0), 0)
    const totalOrders = eventos.reduce((s: number, e: any) => s + (e.orders || 0), 0)
    const totalEvents = eventos.length
    const ticketMedio = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Período anterior (comparação)
    const prevRange = getPrevRange(dateRange)
    const prevEventos = prevRange ? filterEventos(data.eventos, prevRange.start, prevRange.end) : []
    const prevRevenue = prevEventos.reduce((s: number, e: any) => s + (e.revenue || 0), 0)
    const prevOrders = prevEventos.reduce((s: number, e: any) => s + (e.orders || 0), 0)
    const prevEvents = prevEventos.length
    const prevTicketMedio = prevOrders > 0 ? prevRevenue / prevOrders : 0

    // Variações percentuais
    const calcPct = (curr: number, prev: number) => {
      if (prev === 0 && curr === 0) return null
      if (prev === 0) return null
      return ((curr - prev) / prev) * 100
    }
    const revenueChange = calcPct(totalRevenue, prevRevenue)
    const ordersChange = calcPct(totalOrders, prevOrders)
    const ticketChange = calcPct(ticketMedio, prevTicketMedio)
    const eventsChange = calcPct(totalEvents, prevEvents)

    // Produto mais vendido (do mix geral)
    const topProduto = [...(data.produtoMix || [])].sort((a: any, b: any) => b.total - a.total)[0] || null

    // No-show rate (se disponível nos dados)
    const noShowRate = computeNoShowRate(eventos)

    // Receita média por evento
    const revenuePerEvent = totalEvents > 0 ? totalRevenue / totalEvents : 0
    const prevRevenuePerEvent = prevEvents > 0 ? prevRevenue / prevEvents : 0
    const rpeChange = calcPct(revenuePerEvent, prevRevenuePerEvent)

    // Mensais filtrados pelo período
    const mensais = (data.mensais || []).filter((m: any) => {
      if (!dateRange || !m.mes) return true
      const [yr, mo] = m.mes.split('-').map(Number)
      if (!yr || !mo) return false
      const d = new Date(yr, mo - 1, 1)
      return d >= dateRange.start && d <= dateRange.end
    })

    // Últimos 6 meses para sparkline
    const last6 = mensais.slice(-6)

    return {
      eventos, totalRevenue, totalOrders, totalEvents, ticketMedio,
      prevRevenue, prevOrders, prevEvents, prevTicketMedio,
      revenueChange, ordersChange, ticketChange, eventsChange,
      topProduto, noShowRate,
      revenuePerEvent, rpeChange,
      mensais, last6,
    }
  }, [data, dateRange])

  // --- Loading ---
  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-6 w-36 bg-card rounded animate-pulse" />
          <div className="h-3 w-48 bg-card rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map(i => <Skel key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skel key={i} />)}
        </div>
      </div>
    )
  }

  // --- Empty state ---
  if (!data) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <EmptyState
          icon={<DollarSign size={40} />}
          title="Nenhum dado disponível"
          description="Faça a importação de dados do Sympla ou do Yuzer para começar."
        />
      </div>
    )
  }

  // --- Dados preparados ---
  const f = filtered
  if (!f) return null

  const hasPrev = f.revenueChange !== null && f.revenueChange !== undefined
  const trendUp = (v: number | null) => v !== null && v > 2
  const trendDown = (v: number | null) => v !== null && v < -2

  // Mix de receita por categorias (dados reais)
  const cats = (data.categorias || []).filter((c: any) => c.total > 0).slice(0, 6)
  const hasCategories = cats.length > 0
  const mixData = hasCategories
    ? cats.map((c: any) => ({ name: c.name, value: c.total }))
    : [{ name: 'Receita Total', value: f.totalRevenue || 1 }]

  const mixColors = hasCategories ? PALETA : [GOLD]

  // Top 10 produtos
  const top10 = [...(data.produtoMix || [])].sort((a: any, b: any) => b.total - a.total).slice(0, 10)

  // Últimos eventos filtrados
  const ultimosEventos = [...f.eventos].reverse().slice(0, 6)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header + Filtro de Período */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <PageHeader
            title="Dashboard"
            subtitle={`${f.totalEvents} eventos · ${fmtNum(f.totalOrders)} ingressos · ${fmt(f.totalRevenue)}`}
            source={data.source}
          />
        </div>
        <PeriodFilter className="shrink-0" />
      </div>

      {/* ═══ KPIs Principais ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SarauKPI
          label="Receita Total"
          value={fmt(f.totalRevenue)}
          sub={hasPrev ? `${pct(f.revenueChange)} vs período anterior` : 'Período atual'}
          trend={trendUp(f.revenueChange) ? 'up' : trendDown(f.revenueChange) ? 'down' : undefined}
        />
        <SarauKPI
          label="Ingressos"
          value={fmtNum(f.totalOrders)}
          sub={hasPrev ? `${pct(f.ordersChange)} vs anterior` : 'Total de ingressos'}
          trend={trendUp(f.ordersChange) ? 'up' : trendDown(f.ordersChange) ? 'down' : undefined}
        />
        <SarauKPI
          label="Ticket Médio"
          value={fmt(f.ticketMedio)}
          sub={hasPrev ? `${pct(f.ticketChange)} vs anterior` : 'Receita / Ingresso'}
          trend={trendUp(f.ticketChange) ? 'up' : trendDown(f.ticketChange) ? 'down' : undefined}
        />
        <SarauKPI
          label="Eventos"
          value={fmtNum(f.totalEvents)}
          sub={hasPrev ? `${pct(f.eventsChange)} vs anterior` : 'Realizados'}
          trend={trendUp(f.eventsChange) ? 'up' : trendDown(f.eventsChange) ? 'down' : undefined}
        />
      </div>

      {/* ═══ KPIs Inteligentes ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Produto Mais Vendido */}
        <div className="bg-card border border-border rounded-xl p-4 transition-all hover:border-gold/35 hover:scale-[1.02]">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1">
            <Sparkles size={10} /> Produto Líder
          </p>
          {f.topProduto ? (
            <>
              <p className="text-sm font-bold text-foreground tracking-tight truncate">{f.topProduto.name}</p>
              <p className="text-[9px] text-[#4b5563] mt-0.5">
                {fmt(f.topProduto.total)} · {f.topProduto.pct?.toFixed(1) || 0}% da receita
              </p>
            </>
          ) : (
            <p className="text-xs text-[#4b5563]">Sem dados de bar</p>
          )}
        </div>

        {/* No-Show Rate */}
        <div className="bg-card border border-border rounded-xl p-4 transition-all hover:border-gold/35 hover:scale-[1.02]">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1">
            <UserMinus size={10} /> No-Show Rate
          </p>
          {f.noShowRate !== null ? (
            <>
              <p className="text-sm font-bold text-foreground tracking-tight">{pctAbs(f.noShowRate)}</p>
              <p className="text-[9px] text-[#4b5563] mt-0.5">
                {f.noShowRate < 15 ? 'Baixa · saudável' : f.noShowRate < 30 ? 'Moderada' : 'Alta'}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-[#4b5563]">N/D</p>
              <p className="text-[9px] text-[#4b5563] mt-0.5">Indisponível para esta fonte</p>
            </>
          )}
        </div>

        {/* Crescimento vs Período Anterior */}
        <div className="bg-card border border-border rounded-xl p-4 transition-all hover:border-gold/35 hover:scale-[1.02]">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1">
            {trendUp(f.revenueChange) ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            Crescimento
          </p>
          <p className={`text-sm font-bold tracking-tight ${trendUp(f.revenueChange) ? 'text-success' : trendDown(f.revenueChange) ? 'text-danger' : 'text-foreground'}`}>
            {pct(f.revenueChange)}
          </p>
          <p className="text-[9px] text-[#4b5563] mt-0.5">
            {hasPrev ? `${fmt(f.prevRevenue)} → ${fmt(f.totalRevenue)}` : 'Período único'}
          </p>
        </div>

        {/* Receita por Evento */}
        <div className="bg-card border border-border rounded-xl p-4 transition-all hover:border-gold/35 hover:scale-[1.02]">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1">
            <CalendarDays size={10} /> Receita/Evento
          </p>
          <p className="text-sm font-bold text-foreground tracking-tight">{fmt(f.revenuePerEvent)}</p>
          <p className="text-[9px] text-[#4b5563] mt-0.5">
            {hasPrev ? `${pct(f.rpeChange)} vs anterior` : 'Média por evento'}
          </p>
        </div>
      </div>

      {/* ═══ Gráficos ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Mix de Receita (categorias reais) */}
        <SarauSection title="Mix de Receita (Categorias)">
          {hasCategories ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={mixData}
                    cx="50%" cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {mixData.map((_, i) => (
                      <Cell key={i} fill={mixColors[i % mixColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TT}
                    labelStyle={TT_LABEL}
                    itemStyle={TT_ITEM}
                    formatter={(v: number) => fmt(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] mt-2">
                {cats.map((c: any, i: number) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: PALETA[i % PALETA.length] }}
                    />
                    <span className="text-muted-foreground">{c.name}</span>
                    <span className="text-foreground font-medium">{c.pct?.toFixed(0) || 0}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-muted-foreground mb-2 opacity-40">
                <Wine size={28} />
              </div>
              <p className="text-[11px] text-[#4b5563]">
                Categorias disponíveis apenas com dados do Yuzer.
              </p>
              <p className="text-[10px] text-[#4b5563] mt-1">
                Receita total no período: {fmt(f.totalRevenue)}
              </p>
            </div>
          )}
        </SarauSection>

        {/* Tendência Mensal */}
        <SarauSection title="Receita x Tempo">
          {f.mensais.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={f.mensais}>
                <defs>
                  <linearGradient id="dgD">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#6b7280', fontSize: 8 }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.max(0, Math.floor(f.mensais.length / 6) - 1)}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip contentStyle={TT} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={GOLD}
                  strokeWidth={2}
                  fill="url(#dgD)"
                  name="Receita"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[11px] text-[#4b5563]">
              Nenhum dado mensal no período selecionado.
            </div>
          )}
        </SarauSection>

        {/* Top 10 Produtos */}
        <SarauSection title="Top 10 Produtos (Receita)">
          {top10.length > 0 ? (
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {top10.map((p: any, i: number) => (
                <div key={p.name} className="flex items-center gap-2 text-[11px]">
                  <span className="w-4 text-center text-[#4b5563] font-mono text-[10px]">{i + 1}</span>
                  <div className="flex-1 truncate text-muted-foreground">{p.name}</div>
                  <span className="text-foreground font-medium w-20 text-right">{fmt(p.total)}</span>
                  <div className="w-16 h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (p.total / (top10[0]?.total || 1)) * 100)}%`,
                        background: GOLD,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[11px] text-[#4b5563]">
              Produtos disponíveis apenas com dados do Yuzer.
            </div>
          )}
        </SarauSection>

        {/* Últimos Eventos */}
        <SarauSection title="Últimos Eventos">
          {ultimosEventos.length > 0 ? (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {ultimosEventos.map((ev: any) => (
                <div
                  key={ev.start}
                  className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CalendarDays size={10} className="text-[#4b5563] shrink-0" />
                    <span className="text-muted-foreground truncate">{ev.start}</span>
                  </div>
                  <span className="text-foreground font-medium w-24 text-right">{fmt(ev.revenue)}</span>
                  <span className="text-[#4b5563] w-16 text-right">{fmtNum(ev.orders)} ingressos</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[11px] text-[#4b5563]">
              Nenhum evento no período selecionado.
            </div>
          )}
        </SarauSection>
      </div>

      {/* ═══ Rodapé: Sparkline da tendência ═══ */}
      {f.last6.length >= 2 && (
        <div className="mt-4 bg-card border border-border rounded-xl p-4">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
            <TrendingUp size={10} /> Tendência — últimos {f.last6.length} meses
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <Sparkline data={f.last6} color={GOLD} />
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground">{f.last6[0]?.label}</p>
              <p className="text-[9px] text-[#4b5563]">{fmt(f.last6[0]?.revenue)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{f.last6[f.last6.length - 1]?.label}</p>
              <p className="text-[9px] text-[#4b5563]">{fmt(f.last6[f.last6.length - 1]?.revenue)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
