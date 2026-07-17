import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useData } from '@/lib/data-context'
import type { FlatEvent } from '@/lib/data-context'

const GOLD = '#c8a96e'
const VIOLET = '#8b5cf6'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtc = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })

function formatDateLabel(iso: string) {
  try {
    const d = new Date(iso + (iso.includes('T') ? '' : 'T00:00:00'))
    if (isNaN(d.getTime())) return iso
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[d.getMonth()]}/${d.getFullYear()}`
  } catch {
    return iso
  }
}

function formatDateFull(iso: string) {
  try {
    const d = new Date(iso + (iso.includes('T') ? '' : 'T00:00:00'))
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch {
    return iso
  }
}

// --- Subcomponentes ---

function KPICard({ label, value, sub, trend, color }: {
  label: string; value: string; sub?: string; trend?: 'up' | 'down'; color?: string
}) {
  return (
    <div className="kpi-card">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground/60">{sub}</p>}
    </div>
  )
}

function TicketMedioCard({ ticketMedio, perCapitaBar, totalMedio, ticketsSold }: {
  ticketMedio: number; perCapitaBar: number; totalMedio: number; ticketsSold: number
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Ticket Médio · {ticketsSold} ingressos
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
          <span className="text-[11px] text-muted-foreground">Total por pessoa</span>
          <span className="text-sm font-bold text-gold">{fmtc(totalMedio)}</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
          <span className="text-[11px] text-muted-foreground">Ingresso por pessoa</span>
          <span className="text-sm font-bold">{fmtc(ticketMedio)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Bar por pessoa</span>
          <span className="text-sm font-bold text-success">{fmtc(perCapitaBar)}</span>
        </div>
      </div>
    </div>
  )
}

function SplitPie({ ticketRevenue, barRevenue }: {
  ticketRevenue: number; barRevenue: number
}) {
  const total = ticketRevenue + barRevenue
  if (total <= 0) return null

  const barPct = Math.round((barRevenue / total) * 100)
  const splitData = [
    { name: 'Bilheteria', value: ticketRevenue },
    { name: 'Bar', value: barRevenue },
  ]

  return (
    <div className="chart-box">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Split Receita · {barPct}% Bar / {100 - barPct}% Bilheteria
      </p>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={splitData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={2}>
              {splitData.map((_, i) => <Cell key={i} fill={[GOLD, VIOLET][i]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background: GOLD}} />
            <span className="text-muted-foreground">Bilheteria</span>
            <span className="font-medium text-white ml-auto">{fmt(ticketRevenue)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background: VIOLET}} />
            <span className="text-muted-foreground">Bar</span>
            <span className="font-medium text-white ml-auto">{fmt(barRevenue)}</span>
          </div>
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium text-white ml-auto">{fmt(ticketRevenue + barRevenue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OcupacaoBar({ capacity, ticketsSold }: { capacity: number | null; ticketsSold: number }) {
  if (!capacity) {
    return (
      <div className="chart-box">
        <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Ocupação e Capacidade</p>
        <div className="flex h-[180px] items-center justify-center">
          <p className="text-xs text-muted-foreground">Capacidade não definida para este evento</p>
        </div>
      </div>
    )
  }

  const ocupacao = Math.round((ticketsSold / capacity) * 100)

  return (
    <div className="chart-box">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Ocupação e Capacidade</p>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Ocupação</span>
            <span className="text-white font-medium">{ocupacao}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#c8a96e] transition-all"
              style={{ width: `${Math.min(ocupacao, 100)}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-white">{capacity}</p>
            <p className="text-[9px] text-muted-foreground">Capacidade</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#c8a96e]">{ticketsSold}</p>
            <p className="text-[9px] text-muted-foreground">Vendidos</p>
          </div>
          <div>
            <p className="text-lg font-bold text-success">{capacity - ticketsSold}</p>
            <p className="text-[9px] text-muted-foreground">Disponíveis</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComparacaoMedia({ ev, overview }: { ev: EnrichedEvent; overview: any }) {
  const agg = overview?.aggregates
  if (!agg || !agg.totalEvents) return null

  const avgTicketMedio = agg.totalTicketRevenue / agg.totalTickets || 0
  const avgPerCapitaBar = agg.totalBarRevenue / agg.totalTickets || 0
  const avgBarPct = agg.totalRevenue > 0
    ? Math.round((agg.totalBarRevenue / agg.totalRevenue) * 100)
    : 0

  const diffTicketMedio = avgTicketMedio > 0 && ev.ticketMedio > 0
    ? ((ev.ticketMedio - avgTicketMedio) / avgTicketMedio) * 100 : null

  const items = [
    {
      label: 'Ticket Médio',
      valor: fmtc(ev.ticketMedio),
      media: fmtc(avgTicketMedio),
      diff: diffTicketMedio,
    },
    {
      label: 'Bar por Pessoa',
      valor: fmtc(ev.perCapitaBar),
      media: fmtc(avgPerCapitaBar),
      diff: null,
    },
    {
      label: 'Mix Bar',
      valor: `${ev.barPct}%`,
      media: `${avgBarPct}%`,
      diff: null,
    },
  ]

  return (
    <div className="chart-box">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Comparação com Média Geral ({agg.totalEvents} eventos)
      </p>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
            <span className="text-muted-foreground flex-1">{item.label}</span>
            <div className="flex gap-4 items-center">
              <span className="text-white font-medium w-20 text-right">{item.valor}</span>
              <span className="text-[#4b5563] w-20 text-right">{item.media}</span>
              {item.diff !== null && (
                <span className={`w-14 text-right font-medium ${
                  item.diff > 0 ? 'text-success' : item.diff < 0 ? 'text-red-400' : 'text-muted-foreground'
                }`}>
                  {item.diff > 0 ? '+' : ''}{item.diff.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NoShowCard({ checkedIn, ticketsSold }: { checkedIn: number; ticketsSold: number }) {
  const noShow = ticketsSold - checkedIn
  const noShowPct = ticketsSold > 0 ? Math.round((noShow / ticketsSold) * 100) : null

  if (checkedIn > 0) {
    return (
      <div className="chart-box">
        <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Check-in e No-Show</p>
        <div className="flex h-[180px] flex-col items-center justify-center text-center">
          <p className="text-3xl font-bold text-white mb-1">{checkedIn}</p>
          <p className="text-xs text-muted-foreground">check-ins confirmados</p>
          <div className="mt-3 h-2 w-full max-w-[200px] bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-success"
              style={{ width: `${(checkedIn / ticketsSold) * 100}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {noShow} no-show · {noShowPct !== null ? `${noShowPct}%` : '—'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-box">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Check-in e No-Show</p>
      <div className="flex h-[180px] flex-col items-center justify-center text-center">
        <span className="text-3xl mb-2 opacity-30">📋</span>
        <p className="text-sm text-muted-foreground mb-1">No-Show Indisponível</p>
        <p className="text-[10px] text-muted-foreground/60 max-w-xs">
          Dados de check-in não estão disponíveis no momento.
          Serão carregados quando o backend estiver sincronizado com o Sympla.
        </p>
      </div>
    </div>
  )
}

// --- Tipos internos ---

interface EnrichedEvent {
  id: string
  title: string
  date: string
  dateLabel: string
  status: string
  capacity: number | null
  ticketsSold: number
  checkedIn: number
  ticketRevenue: number
  barRevenue: number
  totalRevenue: number
  ocupacao: number | null
  ticketMedio: number
  perCapitaBar: number
  barPct: number
  noShow: number | null
  noShowPct: number | null
  symplaEventId: string | null
  produtos?: { name: string; qty: number; total: number; pct: number }[]
}

function enrichEvent(ev: FlatEvent): EnrichedEvent {
  const totalRev = ev.ticketRevenue + ev.barRevenue
  const ocupacao = ev.capacity && ev.capacity > 0
    ? Math.round((ev.ticketsSold / ev.capacity) * 100) : null
  const ticketMedio = ev.ticketsSold > 0 ? ev.ticketRevenue / ev.ticketsSold : 0
  const barPct = totalRev > 0 ? Math.round((ev.barRevenue / totalRev) * 100) : 0
  const noShow = ev.ticketsSold - ev.checkedIn
  const noShowPct = ev.ticketsSold > 0 ? Math.round((noShow / ev.ticketsSold) * 100) : null

  return {
    id: ev.id,
    title: ev.title,
    date: ev.date,
    dateLabel: formatDateLabel(ev.date),
    status: ev.status,
    capacity: ev.capacity,
    ticketsSold: ev.ticketsSold,
    checkedIn: ev.checkedIn,
    ticketRevenue: ev.ticketRevenue,
    barRevenue: ev.barRevenue,
    totalRevenue: totalRev,
    ocupacao,
    ticketMedio,
    perCapitaBar: ev.perCapitaBar,
    barPct,
    noShow: noShow > 0 ? noShow : null,
    noShowPct,
    symplaEventId: ev.symplaEventId,
    produtos: ev.produtos,
  }
}

// --- Top Produtos ---

function LucroCard({ ev }: { ev: EnrichedEvent }) {
  const CMV_BAR = 0.42
  const TAXA_SYMPLA = 0.08
  const CUSTO_PRODUCAO = 12000

  const total = ev.ticketRevenue + ev.barRevenue
  const custoSympla = ev.ticketRevenue * TAXA_SYMPLA
  const cmvBar = ev.barRevenue * CMV_BAR
  const custoTotal = custoSympla + cmvBar + CUSTO_PRODUCAO
  const lucro = total - custoTotal
  const margem = total > 0 ? (lucro / total) * 100 : 0
  const margemOp = total > 0 ? ((total - custoSympla - cmvBar) / total) * 100 : 0

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Lucratividade Estimada
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Receita Total</p>
          <p className="mt-0.5 text-sm font-bold text-white">{fmt(ev.totalRevenue)}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Custos Fixos</p>
          <p className="mt-0.5 text-sm font-bold text-red-400">{fmt(custoTotal)}</p>
          <p className="text-[8px] text-muted-foreground">Sympla {fmt(custoSympla)} + CMV {fmt(cmvBar)} + Produção {fmt(CUSTO_PRODUCAO)}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Lucro Líquido</p>
          <p className={`mt-0.5 text-sm font-bold ${lucro >= 0 ? 'text-success' : 'text-red-400'}`}>{fmt(lucro)}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Margem</p>
          <p className="mt-0.5 text-sm font-bold text-success">{margem.toFixed(1)}%</p>
          <p className="text-[8px] text-muted-foreground">{margemOp.toFixed(1)}% operacional</p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${lucro >= 0 ? 'bg-success' : 'bg-red-400'}`}
          style={{ width: `${Math.min(100, Math.max(0, (lucro / ev.totalRevenue) * 100 * 2))}%` }} />
      </div>
      <p className="mt-1 text-[8px] text-muted-foreground">Barra proporcional ao lucro (200% = margem de 100%). Custos: Sympla {TAXA_SYMPLA*100}%, CMV bar {CMV_BAR*100}%, Produção R$ {CUSTO_PRODUCAO}/evento.</p>
    </div>
  )
}

function ProdutosCard({ produtos, barRevenue }: { produtos?: { name: string; qty: number; total: number; pct: number }[]; barRevenue: number }) {
  if (!produtos?.length || barRevenue <= 0) return null

  return (
    <div className="chart-box">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Discriminação de Vendas · {produtos.length} itens
      </p>
      <div className="space-y-1">
        {produtos.slice(0, 20).map((p, i) => (
          <div key={p.name} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
            <span className="text-[10px] text-[#4b5563] w-4 font-mono text-right">{i+1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#9ca3af] truncate">{p.name}</span>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[10px] text-[#4b5563] w-12 text-right">{p.qty}x</span>
                  <span className="text-xs text-white font-medium w-20 text-right">{fmt(p.total)}</span>
                  <span className="text-[10px] text-[#c8a96e] w-10 text-right">{p.pct.toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#c8a96e]/60" style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Lucratividade Líquida ---

const CUSTO_PRODUCAO_FIXO = 12000
const CMV_BAR_RATE = 0.42
const TAXA_SYMPLA_RATE = 0.08

function LucroCard({ totalRevenue, ticketRevenue, barRevenue }: {
  totalRevenue: number; ticketRevenue: number; barRevenue: number
}) {
  const custoProducao = CUSTO_PRODUCAO_FIXO
  const custoCMV = barRevenue * CMV_BAR_RATE
  const custoSympla = ticketRevenue * TAXA_SYMPLA_RATE
  const custoTotal = custoProducao + custoCMV + custoSympla
  const lucroLiquido = totalRevenue - custoTotal
  const margemLiquida = totalRevenue > 0 ? (lucroLiquido / totalRevenue) * 100 : 0

  const isLucroPositivo = lucroLiquido >= 0

  const rows = [
    { label: 'Receita Total', value: fmt(totalRevenue), color: 'text-white' },
    { label: 'Produção (fixo)', value: `-${fmt(custoProducao)}`, color: 'text-red-400' },
    { label: 'CMV Bar (42%)', value: `-${fmt(custoCMV)}`, color: 'text-red-400' },
    { label: 'Taxa Sympla (8%)', value: `-${fmt(custoSympla)}`, color: 'text-red-400' },
    { label: 'Custo Total', value: fmt(custoTotal), color: 'text-orange-400' },
  ]

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Lucratividade Líquida Estimada
      </p>
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between border-b border-white/5 pb-1.5 last:border-0">
            <span className="text-[11px] text-muted-foreground">{r.label}</span>
            <span className={`text-sm font-bold ${r.color}`}>{r.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[11px] text-muted-foreground">Lucro Líquido</span>
          <span className={`text-sm font-bold ${isLucroPositivo ? 'text-success' : 'text-red-400'}`}>
            {fmt(lucroLiquido)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Margem Líquida</span>
          <span className={`text-sm font-bold ${margemLiquida >= 0 ? 'text-success' : 'text-red-400'}`}>
            {margemLiquida >= 0 ? '+' : ''}{margemLiquida.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// --- Componente Principal ---

export function EventDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { eventsMap, overview, loading, refresh } = useData()
  const isSynthetic = id.startsWith('bar-')

  // Obtém o evento do MAPA do contexto — SEMPRE sincronizado com o DataProvider
  const ev = useMemo<EnrichedEvent | null>(() => {
    const flat = eventsMap.get(id)
    if (!flat) return null
    return enrichEvent(flat)
  }, [eventsMap, id])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 animate-pulse">
        <div className="h-3 w-16 bg-white/5 rounded mb-3" />
        <div className="h-6 w-64 bg-white/5 rounded mb-2" />
        <div className="grid grid-cols-4 gap-3 mb-6">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="h-48 bg-white/5 rounded-xl" />)}</div>
      </div>
    )
  }

  if (!ev) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 text-center">
        <p className="text-sm text-red-400">Evento não encontrado no contexto</p>
        <p className="text-[10px] text-[#4b5563] mt-1">
          {isSynthetic
            ? 'Evento sintético do bar — pode ter sido removido após atualização dos dados.'
            : 'O evento pode ter sido removido ou a importação de dados está pendente.'}
        </p>
        <button onClick={() => { refresh(); onBack() }}
          className="mt-4 text-xs text-[#c8a96e] hover:underline">
          ← Voltar e recarregar
        </button>
      </div>
    )
  }

  const o = overview || {}
  const agg = (o as any)?.aggregates || {}

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <header className="mb-6">
        <button onClick={onBack}
          className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          ← Voltar para Eventos
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8b5cf6]">{ev.dateLabel}</p>
            <h1 className="text-xl font-bold tracking-tight">{ev.title}</h1>
            {ev.capacity && (
              <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                {formatDateFull(ev.date)}
                {' · '}ID Sympla: {ev.symplaEventId || '—'}
              </p>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[9px] uppercase tracking-wider font-medium ${
            ev.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-success/10 text-success'
          }`}>
            {ev.status === 'draft' ? 'rascunho' : 'concluído'}
          </span>
        </div>
      </header>

      {/* KPIs */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Receita Total"
          value={fmt(ev.totalRevenue)}
          sub={`${fmt(ev.ticketRevenue)} ingressos · ${fmt(ev.barRevenue)} bar`}
          color="text-[#c8a96e]"
        />
        <TicketMedioCard
          ticketMedio={ev.ticketMedio}
          perCapitaBar={ev.perCapitaBar}
          totalMedio={ev.ticketsSold > 0 ? ev.totalRevenue / ev.ticketsSold : 0}
          ticketsSold={ev.ticketsSold}
        />
        <KPICard
          label="Ocupação"
          value={ev.ocupacao !== null ? `${ev.ocupacao}%` : '—'}
          sub={ev.capacity ? `${ev.ticketsSold} de ${ev.capacity} lugares` : 'Capacidade não definida'}
          color="text-[#8b5cf6]"
        />
        <KPICard
          label="Mix de Receita"
          value={`${ev.barPct}% bar`}
          sub={`${100 - ev.barPct}% bilheteria`}
          color="text-success"
        />
      </div>

      {/* Lucratividade */}
      {(ev.ticketRevenue > 0 || ev.barRevenue > 0) && (
        <div className="mb-6">
          <LucroCard ev={ev} />
        </div>
      )}

      {/* Row 2: Split + Ocupação */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {ev.totalRevenue > 0 && (
          <SplitPie
            ticketRevenue={ev.ticketRevenue}
            barRevenue={ev.barRevenue}
          />
        )}
        <OcupacaoBar capacity={ev.capacity} ticketsSold={ev.ticketsSold} />
      </div>

      {/* Row 3: Comparação + No-show */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ComparacaoMedia ev={ev} overview={o} />
        <NoShowCard checkedIn={ev.checkedIn} ticketsSold={ev.ticketsSold} />
      </div>

      {/* Row 4: Discriminação de vendas */}
      {(ev.produtos?.length ?? 0) > 0 && ev.barRevenue > 0 && (
        <div className="mb-6">
          <ProdutosCard produtos={ev.produtos} barRevenue={ev.barRevenue} />
        </div>
      )}

      {/* Row 5: Lucratividade Líquida */}
      <div className="mb-6">
        <LucroCard
          totalRevenue={ev.totalRevenue}
          ticketRevenue={ev.ticketRevenue}
          barRevenue={ev.barRevenue}
        />
      </div>

      {/* Footer info */}
      <div className="text-[10px] text-[#4b5563] space-y-1">
        <p>📊 Dados do contexto compartilhado — consistentes com Dashboard, Eventos, Financeiro e demais seções.</p>
        <p>📐 Comparações vs média geral de {agg.totalEvents || 0} eventos do sistema.</p>
        <p>🔄 Dados atualizam automaticamente após importação. Fonte: {eventsMap.size} eventos carregados.</p>
      </div>
    </div>
  )
}
