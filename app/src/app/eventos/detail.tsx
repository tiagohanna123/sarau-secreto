import { useMemo, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useData } from '@/lib/data-context'
import type { FlatEvent } from '@/lib/data-context'
import { api } from '@/lib/api'
import { GOLD, VIOLET, CUSTO_PRODUCAO as CUSTO_PRODUCAO_FIXO, CMV_BAR as CMV_BAR_RATE, TAXA_SYMPLA as TAXA_SYMPLA_RATE } from '@/lib/ui'

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
    <div className="kpi-card min-w-0">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground truncate">{label}</p>
      <p className={`mt-1 text-xl sm:text-2xl font-bold ${color || 'text-foreground'} truncate`}>{value}</p>
      {sub && <p className="mt-0.5 text-[9px] sm:text-[10px] text-muted-foreground/60 truncate">{sub}</p>}
    </div>
  )
}

function TicketMedioCard({ ticketMedio, perCapitaBar, totalMedio, ticketsSold }: {
  ticketMedio: number; perCapitaBar: number; totalMedio: number; ticketsSold: number
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 min-w-0">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground truncate">
        Ticket Médio · {ticketsSold} ingressos
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-1.5 gap-2">
          <span className="text-[11px] text-muted-foreground truncate">Total por pessoa</span>
          <span className="text-sm font-bold text-gold shrink-0">{fmtc(totalMedio)}</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/5 pb-1.5 gap-2">
          <span className="text-[11px] text-muted-foreground truncate">Ingresso por pessoa</span>
          <span className="text-sm font-bold shrink-0">{fmtc(ticketMedio)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground truncate">Bar por pessoa</span>
          <span className="text-sm font-bold text-success shrink-0">
            {perCapitaBar > 0 ? fmtc(perCapitaBar) : '—'}
          </span>
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
            <Tooltip
              formatter={(v: number) => fmt(v)}
              contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 9, fontSize: 12, color: 'var(--color-foreground)' }}
              labelStyle={{ color: 'var(--color-gold)', fontWeight: 600 }}
            />
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
      <div className="chart-box h-full">
        <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Ocupação e Capacidade</p>
        <div className="flex h-[180px] items-center justify-center">
          <p className="text-xs text-muted-foreground">Capacidade não definida para este evento</p>
        </div>
      </div>
    )
  }

  const ocupacao = Math.round((ticketsSold / capacity) * 100)

  return (
    <div className="chart-box h-full">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Ocupação e Capacidade</p>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Ocupação</span>
            <span className="text-white font-medium">{ocupacao}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${Math.min(ocupacao, 100)}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-white">{capacity}</p>
            <p className="text-[9px] text-muted-foreground">Capacidade</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gold">{ticketsSold}</p>
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

function ComparacaoMedia({ ev, overview, insightData }: { ev: EnrichedEvent; overview: any; insightData?: any }) {
  const agg = overview?.aggregates
  if (!agg || !agg.totalEvents) return null

  const avgIngressoPorPessoa = agg.ingressoPorPessoa || 0
  const avgTicketOnly = agg.avgTicketOnly || 0
  // Médias de bar filtradas — só eventos COM dados de bar
  const avgPerCapitaBar = agg.avgPerCapitaBar || 0
  const avgBarPct = agg.avgMixBar || 0

  const diff = (val: number, avg: number) =>
    avg > 0 && val > 0 ? ((val - avg) / avg) * 100 : null

  interface Row { label: string; valor: string; media: string; diffVal: number | null; dir?: '↑' | '↓' }
  const hasBarData = ev.barRevenue > 0
  const semBar = { valor: '—', media: hasBarData ? fmtc(avgPerCapitaBar) : '—', diffVal: null as number | null }
  const semMix = { valor: '—', media: hasBarData ? `${avgBarPct}%` : '—', diffVal: null as number | null }

  const rows: Row[] = [
    { label: 'Ticket Médio', valor: fmtc(ev.ingressoPorPessoa), media: fmtc(avgIngressoPorPessoa), diffVal: diff(ev.ingressoPorPessoa, avgIngressoPorPessoa) },
    { label: 'Ingresso/pessoa', valor: fmtc(ev.ticketMedio), media: fmtc(avgTicketOnly), diffVal: diff(ev.ticketMedio, avgTicketOnly) },
    { label: 'Bar/pessoa', ...(hasBarData
      ? { valor: fmtc(ev.perCapitaBar), media: fmtc(avgPerCapitaBar), diffVal: diff(ev.perCapitaBar, avgPerCapitaBar) }
      : semBar)
    },
    { label: 'Mix Bar', ...(hasBarData
      ? { valor: `${ev.barPct}%`, media: `${avgBarPct}%`, diffVal: diff(ev.barPct, avgBarPct) }
      : semMix)
    },
  ]

  // Highlight melhor/mais saudável
  const noDiff = (v: number | null) => v === null

  return (
    <div className="chart-box h-full">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Comparação com Média Geral ({agg.totalEvents} eventos)
      </p>

      {/* Cabeçalho da tabela */}
      <div className="hidden md:grid grid-cols-[1fr_90px_90px_80px] gap-2 mb-2 px-2">
        <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Indicador</span>
        <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground text-right">Este Evento</span>
        <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground text-right">Média Geral</span>
        <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground text-right">Diferença</span>
      </div>

      {/* Linhas */}
      <div className="space-y-1">
        {rows.map(r => (
          <div key={r.label} className="grid grid-cols-1 md:grid-cols-[1fr_90px_90px_80px] gap-1 md:gap-2 items-center px-2 py-2 rounded-md bg-white/[0.02]">
            {/* Label (full width no mobile) */}
            <span className="text-[11px] text-muted-foreground font-medium">{r.label}</span>

            {/* Mobile: inline row with valores */}
            <div className="flex items-center justify-between md:hidden text-xs">
              <span className="text-[10px] text-muted-foreground">Este evento</span>
              <span className="text-white font-semibold">{r.valor}</span>
            </div>
            <div className="flex items-center justify-between md:hidden text-xs">
              <span className="text-[10px] text-muted-foreground">Média geral</span>
              <span className="text-muted-foreground/80">{r.media}</span>
            </div>

            {/* Desktop: colunas */}
            <span className="hidden md:block text-[13px] text-white font-semibold text-right tabular-nums">{r.valor}</span>
            <span className="hidden md:block text-[13px] text-muted-foreground/80 text-right tabular-nums">{r.media}</span>

            {/* Diff */}
            <span className={`hidden md:block text-[13px] text-right font-semibold tabular-nums ${
              noDiff(r.diffVal) ? 'text-muted-foreground' :
              r.diffVal > 0 ? 'text-success' : 'text-red-400'
            }`}>
              {noDiff(r.diffVal) ? '—' : `${r.diffVal > 0 ? '+' : ''}${r.diffVal.toFixed(1)}%`}
            </span>

            {/* Barra de comparação visual */}
            {r.diffVal !== null && (
              <div className="col-span-1 md:col-span-4 mt-1 mb-0.5">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      r.diffVal > 0 ? 'bg-success' : r.diffVal < 0 ? 'bg-red-400' : 'bg-[#4b5563]'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.abs(r.diffVal))}%`,
                      marginLeft: r.diffVal < 0 ? '0' : 'auto',
                      // Se diff positivo, barra da direita pra esquerda
                      ...(r.diffVal < 0 ? {} : {})
                    }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
                  <span>{r.diffVal < 0 ? `${Math.abs(r.diffVal).toFixed(0)}% abaixo` : ''}</span>
                  <span>{r.diffVal > 0 ? `${r.diffVal.toFixed(0)}% acima` : ''}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rodapé da tabela - total de eventos */}
      <p className="mt-2 text-[9px] text-muted-foreground px-2">
        Baseado em {agg.totalEvents} eventos
        {agg.eventsWithBar > 0 ? ` · ${agg.eventsWithBar} com dados de bar` : ''}
      </p>
    </div>
  )
}

function NoShowCard({ checkedIn, ticketsSold }: { checkedIn: number; ticketsSold: number }) {
  const noShow = ticketsSold - checkedIn
  const noShowPct = ticketsSold > 0 ? Math.round((noShow / ticketsSold) * 100) : null

  if (checkedIn > 0) {
    return (
      <div className="chart-box h-full">
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
    <div className="chart-box h-full">
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
  ingressoPorPessoa: number
  symplaEventId: string | null
  produtos?: { name: string; qty: number; total: number; pct: number }[]
}

function enrichEvent(ev: FlatEvent): EnrichedEvent {
  const totalRev = ev.ticketRevenue + ev.barRevenue
  const ocupacao = ev.capacity && ev.capacity > 0
    ? Math.round((ev.ticketsSold / ev.capacity) * 100) : null
  const ticketMedio = ev.ticketsSold > 0 ? ev.ticketRevenue / ev.ticketsSold : 0
  const ingressoPorPessoa = ev.ticketsSold > 0 ? totalRev / ev.ticketsSold : 0
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
    perCapitaBar: ev.ticketsSold > 0 ? Math.round((ev.barRevenue / ev.ticketsSold) * 100) / 100 : 0,
    barPct,
    noShow: noShow > 0 ? noShow : null,
    noShowPct,
    ingressoPorPessoa: Math.round(ingressoPorPessoa * 100) / 100,
    symplaEventId: ev.symplaEventId,
    produtos: ev.produtos,
  }
}

// --- Top Produtos ---

function LucroCard({ ev }: { ev: EnrichedEvent }) {
  const total = ev.ticketRevenue + ev.barRevenue
  const custoSympla = ev.ticketRevenue * TAXA_SYMPLA_RATE
  const cmvBar = ev.barRevenue * CMV_BAR_RATE
  const custoTotal = custoSympla + cmvBar + CUSTO_PRODUCAO_FIXO
  const lucro = total - custoTotal
  const margem = total > 0 ? (lucro / total) * 100 : 0
  const margemOp = total > 0 ? ((total - custoSympla - cmvBar) / total) * 100 : 0

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Lucratividade Estimada
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="min-w-0">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">Receita Total</p>
          <p className="mt-0.5 text-sm font-bold text-white">{fmt(ev.totalRevenue)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">Custos Fixos</p>
          <p className="mt-0.5 text-sm font-bold text-red-400">{fmt(custoTotal)}</p>
          <p className="text-[8px] text-muted-foreground">Sympla {fmt(custoSympla)} + CMV {fmt(cmvBar)} + Produção {fmt(CUSTO_PRODUCAO_FIXO)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">Lucro Líquido</p>
          <p className={`mt-0.5 text-sm font-bold ${lucro >= 0 ? 'text-success' : 'text-red-400'}`}>{fmt(lucro)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">Margem</p>
          <p className="mt-0.5 text-sm font-bold text-success">{margem.toFixed(1)}%</p>
          <p className="text-[8px] text-muted-foreground">{margemOp.toFixed(1)}% operacional</p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${lucro >= 0 ? 'bg-success' : 'bg-red-400'}`}
          style={{ width: `${Math.min(100, Math.max(0, (lucro / ev.totalRevenue) * 100 * 2))}%` }} />
      </div>
      <p className="mt-1 text-[8px] text-muted-foreground">Barra proporcional ao lucro (200% = margem de 100%). Custos: Sympla {TAXA_SYMPLA_RATE*100}%, CMV bar {CMV_BAR_RATE*100}%, Produção R$ {CUSTO_PRODUCAO_FIXO}/evento.</p>
    </div>
  )
}

function ProdutosCard({ produtos, barRevenue }: { produtos?: { name: string; qty: number; total: number; pct: number }[]; barRevenue: number }) {
  const semDados = !produtos?.length || barRevenue <= 0
  if (semDados) {
    return (
      <div className="chart-box">
        <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Top Produtos · Sem dados disponíveis
        </p>
        <div className="flex h-[120px] items-center justify-center rounded-lg bg-white/[0.02]">
          <div className="text-center">
            <p className="text-2xl mb-1 opacity-30">📊</p>
            <p className="text-xs text-muted-foreground">Nenhum dado de produtos disponível para este evento</p>
            <p className="text-[9px] text-muted-foreground mt-1">Os dados de produtos são importados manualmente da planilha de bar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-box">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Top {Math.min(produtos.length, 10)} Produtos · R$ {barRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} em vendas
      </p>
      <div className="space-y-1">
        {produtos.slice(0, 10).map((p, i) => (
          <div key={p.name} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
            <span className="text-[10px] text-muted-foreground w-4 font-mono text-right">{i+1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground/80 truncate">{p.name}</span>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[10px] text-muted-foreground w-12 text-right">{p.qty}x</span>
                  <span className="text-xs text-white font-medium w-20 text-right">{fmt(p.total)}</span>
                  <span className="text-[10px] text-gold w-10 text-right">{p.pct.toFixed(1)}%</span>
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

// --- Discriminação de Vendas: Métodos de Pagamento ---

function PaymentMethodsCard({ methods, total }: {
  methods?: { method: string; total: number }[]; total: number
}) {
  if (!methods?.length || total <= 0) return null

  const sorted = [...methods].sort((a, b) => b.total - a.total)

  return (
    <div className="chart-box">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Formas de Pagamento - Bar · {sorted.length} métodos
      </p>
      <div className="space-y-1">
        {sorted.map((p, i) => {
          const pct = total > 0 ? (p.total / total) * 100 : 0
          return (
            <div key={p.method} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
              <span className="text-[10px] text-muted-foreground w-4 font-mono text-right">{i+1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground/80 truncate">{p.method}</span>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-xs text-white font-medium w-24 text-right">{fmt(p.total)}</span>
                    <span className="text-[10px] text-gold w-10 text-right">{pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-violet/60" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Discriminação de Vendas: Vendas por Hora ---

function HourlySalesCard({ hourlySales }: {
  hourlySales?: { hour: string; qty: number; revenue: number }[]
}) {
  if (!hourlySales?.length) return null

  const maxRevenue = Math.max(...hourlySales.map(h => h.revenue))

  return (
    <div className="chart-box">
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Vendas por Hora - Bar · {hourlySales.length} horas com movimento
      </p>
      <div className="space-y-1">
        {hourlySales.map((h) => {
          const barPct = maxRevenue > 0 ? (h.revenue / maxRevenue) * 100 : 0
          return (
            <div key={h.hour} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
              <span className="text-[10px] text-muted-foreground w-8 font-mono text-right">{h.hour}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{h.qty}x</span>
                    <span className="text-xs text-white font-medium w-20 text-right">{fmt(h.revenue)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Lucratividade Líquida ---




function LucroCardDetalhado({ totalRevenue, ticketRevenue, barRevenue }: {
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
          <div key={r.label} className="flex items-center justify-between border-b border-white/5 pb-1.5 last:border-0 gap-2">
            <span className="text-[11px] text-muted-foreground truncate">{r.label}</span>
            <span className={`text-sm font-bold ${r.color} shrink-0`}>{r.value}</span>
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
  const [insightData, setInsightData] = useState<any>(null)
  const [insightLoading, setInsightLoading] = useState(false)

  // Busca dados detalhados da API (produtos, pagamentos, vendas por hora)
  useEffect(() => {
    let cancelled = false
    setInsightLoading(true)
    api.insights.event(id)
      .then(data => {
        if (cancelled) return
        setInsightData(data)
        // Fallback silencioso: se a API devolveu topProducts vazio mas o evento tem
        // receita de bar, tenta buscar via Yuzer products-stats pela data do evento
        if (!data?.topProducts?.length && data?.kpis?.barRevenue > 0 && data?.event?.date) {
          const d = data.event.date.slice(0, 10)
          const from = `${d}T00:00:00.000Z`
          const to = `${d}T23:59:59.000Z`
          api.yuzer.productsStats('30d', 10, from, to)
            .then((yuzerData: any) => {
              if (cancelled) return
              const items = yuzerData?.data || yuzerData?.content || []
              if (!items.length) return
              const yp = items
                .map((p: any) => ({
                  name: p.productName || p.name || 'Produto',
                  qty: p.quantity || p.qty || 0,
                  revenue: p.totalEarnings || p.total || 0,
                }))
                .filter((p: any) => p.revenue > 0)
                .slice(0, 10)
              if (yp.length) {
                setInsightData((prev: any) => prev ? { ...prev, topProducts: yp } : null)
              }
            })
            .catch(() => {})
        }
      })
      .catch(() => { if (!cancelled) setInsightData(null) })
      .finally(() => { if (!cancelled) setInsightLoading(false) })
    return () => { cancelled = true }
  }, [id])

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
        <p className="text-[10px] text-muted-foreground mt-1">
          {isSynthetic
            ? 'Evento sintético do bar — pode ter sido removido após atualização dos dados.'
            : 'O evento pode ter sido removido ou a importação de dados está pendente.'}
        </p>
        <button onClick={() => { refresh(); onBack() }}
          className="mt-4 text-xs text-gold hover:underline">
          ← Voltar e recarregar
        </button>
      </div>
    )
  }

  const o = (overview || {}) as any
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
            <p className="text-[10px] uppercase tracking-widest text-violet">{ev.dateLabel}</p>
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
          color="text-gold"
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
          color="text-violet"
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

      {/* Row 2: Split + Ocupação — altura consistente */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2 lg:grid-rows-[auto_1fr]">
        {ev.totalRevenue > 0 && (
          <SplitPie
            ticketRevenue={ev.ticketRevenue}
            barRevenue={ev.barRevenue}
          />
        )}
        <OcupacaoBar capacity={ev.capacity} ticketsSold={ev.ticketsSold} />
      </div>

      {/* Row 3: Comparação + No-show — altura consistente */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2 lg:grid-rows-[auto_1fr]">
        <ComparacaoMedia ev={ev} overview={o} insightData={insightData} />
        <NoShowCard checkedIn={ev.checkedIn} ticketsSold={ev.ticketsSold} />
      </div>

      {/* Row 4: Discriminação de Vendas do Bar — produtos, pagamentos, horário */}
      {ev.barRevenue > 0 && (() => {
        // Dados reais de produtos por evento (Yuzer/barData) têm prioridade.
        // Fallback para topProducts sintéticos da API (computeBarInsights).
        const produtos = ev.produtos?.length
          ? [...ev.produtos].sort((a, b) => b.total - a.total).slice(0, 10)
          : insightData?.topProducts?.length
            ? insightData.topProducts.map((p: any) => ({
                name: p.name,
                qty: p.qty,
                total: p.revenue,
                pct: ev.barRevenue > 0 ? (p.revenue / ev.barRevenue) * 100 : 0,
              })).slice(0, 10)
            : []
        const paymentMethods = insightData?.paymentMethods || []
        const hourlySales = insightData?.hourlyBarSales || []

        return (
          <div className="mb-6 space-y-4">
            {/* Top Produtos — sempre renderizado (card mostra "Sem dados" quando vazio) */}
            <ProdutosCard produtos={produtos} barRevenue={ev.barRevenue} />

            {/* Grade: Métodos de Pagamento + Vendas por Hora */}
            <div className="grid gap-4 lg:grid-cols-2">
              <PaymentMethodsCard methods={paymentMethods} total={ev.barRevenue} />
              <HourlySalesCard hourlySales={hourlySales} />
            </div>
          </div>
        )
      })()}

      {/* Row 5: Lucratividade Líquida */}
      <div className="mb-6">
        <LucroCardDetalhado
          totalRevenue={ev.totalRevenue}
          ticketRevenue={ev.ticketRevenue}
          barRevenue={ev.barRevenue}
        />
      </div>

      {/* Footer info */}
      <div className="text-[10px] text-muted-foreground space-y-1">
        <p>📊 Dados do contexto compartilhado — consistentes com Dashboard, Eventos, Financeiro e demais seções.</p>
        <p>📐 Comparações vs média geral de {agg.totalEvents || 0} eventos
          {agg.eventsWithBar > 0 ? ` (médias de bar: ${agg.eventsWithBar} eventos com dados)` : ''}.
          {agg.excludedCount > 0 ? ` ${agg.excludedCount} eventos excluídos dos cálculos.` : ''}</p>
        {insightData && (
          <p>🍸 {insightData.topProducts?.length > 0
            ? `Top ${Math.min(insightData.topProducts?.length || 0, 10)} produtos reais do bar`
            : 'Sem dados de produtos para este evento'} —
            {insightData.paymentMethods?.length || 0} formas de pagamento.</p>
        )}
        <p>🔄 Dados atualizam automaticamente após importação.
          {o?.lastSync ? ` ⏱ Última sincronização dos dados de bar: ${new Date(o.lastSync).toLocaleString('pt-BR')}.` : ''}
          {' '}Fonte: {eventsMap.size} eventos carregados.</p>
      </div>
    </div>
  )
}
