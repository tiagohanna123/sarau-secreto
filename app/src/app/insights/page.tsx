import { useState, useMemo, type ReactNode } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ComposedChart, ScatterChart, Scatter,
} from 'recharts'
import { useData } from '@/lib/data-context'
import {
  Card, Skel, fmt, fmtNum, pct, pctAbs, MESES, GOLD, PURPLE, BLUE, GREEN, PINK, ORANGE, PALETA, ChartTip,
  PageHeader, SarauSection, SarauKPI, SarauBadge, SarauTabs, EmptyState,
} from '@/lib/ui'
import { Brain, TrendingUp, BarChart3, PieChart, Target, Sparkles } from 'lucide-react'

/* ── Tooltip Theme ── */
const TT = { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 9, fontSize: 12, color: '#e5e7eb' }
const TT_LABEL = { color: '#c8a96e', fontWeight: 600 }
const TT_ITEM = { color: '#e5e7eb' }

/* ── Motor de análise ──────────────────────────── */
function analyze(mensais: any[], eventos: any[], produtoMix: any[], categorias: any[]) {
  const last12 = mensais.slice(-12)

  /* Mês a mês + MA3 */
  const mom = mensais.map((m, i) => ({
    ...m,
    growth: i > 0 && mensais[i - 1].revenue > 0
      ? ((m.revenue - mensais[i - 1].revenue) / mensais[i - 1].revenue) * 100 : 0,
    ma3: i >= 2
      ? (mensais[i].revenue + mensais[i - 1].revenue + mensais[i - 2].revenue) / 3
      : m.revenue,
  }))

  /* Trimestres */
  const quarters: any[] = []
  for (const m of mensais) {
    const parts = m.label.split('/')
    const idx = MESES.indexOf(parts[0])
    if (idx < 0) continue
    const yr = parseInt(parts[1]) || 2000
    const q = `Q${Math.ceil((idx + 1) / 3)} ${yr}`
    const ex = quarters.find(x => x.label === q)
    if (ex) { ex.revenue += m.revenue; ex.orders += m.orders; ex.count++ }
    else { quarters.push({ label: q, revenue: m.revenue, orders: m.orders, count: 1 }) }
  }

  /* CAGR */
  const f6 = mensais.slice(0, 6).reduce((s, m) => s + m.revenue, 0)
  const l6 = mensais.slice(-6).reduce((s, m) => s + m.revenue, 0)
  const cagr = f6 > 0 ? ((l6 / f6) ** (1 / Math.max(mensais.length / 12, 0.1)) - 1) * 100 : 0

  /* Categorias */
  const sortedCats = [...categorias].sort((a, b) => b.total - a.total)
  const top3CatPct = sortedCats.slice(0, 3).reduce((s, c) => s + c.pct, 0)

  /* Pareto */
  const sortedProds = [...produtoMix].sort((a, b) => b.total - a.total)
  const totalProdRev = sortedProds.reduce((s, p) => s + p.total, 0)
  let acc = 0, topN = 0, topPct = 0
  for (const p of sortedProds) {
    acc += p.total; topN++
    if (acc / totalProdRev >= 0.8) { topPct = (acc / totalProdRev) * 100; break }
  }

  /* Produtos em alta */
  const mid = Math.floor(eventos.length / 2)
  const fh = eventos.slice(0, mid), sh = eventos.slice(mid)
  const pf: Record<string, number> = {}, ps: Record<string, number> = {}
  for (const ev of fh) for (const p of ev.produtos) pf[p.name] = (pf[p.name] || 0) + p.total
  for (const ev of sh) for (const p of ev.produtos) ps[p.name] = (ps[p.name] || 0) + p.total
  const prodGrowth = Object.keys(ps)
    .map(n => ({
      name: n,
      f: pf[n] || 0,
      s: ps[n] || 0,
      g: (pf[n] || 0) > 0 ? ((ps[n] - (pf[n] || 0)) / (pf[n] || 0)) * 100 : (ps[n] > 0 ? 100 : 0),
    }))
    .sort((a, b) => b.g - a.g)
    .slice(0, 10)

  /* Correlação Pearson */
  const cr = mensais.map(m => m.revenue), co = mensais.map(m => m.orders)
  const ar = cr.reduce((a, b) => a + b, 0) / cr.length
  const ao = co.reduce((a, b) => a + b, 0) / co.length
  const num = cr.reduce((s, r, i) => s + (r - ar) * (co[i] - ao), 0)
  const den = Math.sqrt(
    cr.reduce((s, r) => s + (r - ar) ** 2, 0) * co.reduce((s, o) => s + (o - ao) ** 2, 0),
  )
  const correlation = den > 0 ? num / den : 0

  /* Melhor / pior mês */
  const bestMonth = [...mensais].sort((a, b) => b.revenue - a.revenue)[0]
  const worstMonth = [...mensais].sort((a, b) => a.revenue - b.revenue)[0]

  /* Regressão linear + forecast */
  const xm = (last12.length - 1) / 2
  const ym = last12.reduce((s, m) => s + m.revenue, 0) / last12.length
  let sn = 0, sd = 0
  for (let i = 0; i < last12.length; i++) {
    sn += (i - xm) * (last12[i].revenue - ym)
    sd += (i - xm) ** 2
  }
  const slope = sd > 0 ? sn / sd : 0
  const intercept = ym - slope * xm
  const forecast = Array.from({ length: 3 }, (_, i) => ({
    label: ['+1m', '+2m', '+3m'][i],
    previsto: Math.max(0, intercept + slope * (last12.length + i)),
  }))

  /* Ticket growth */
  const tt = mensais.slice(-6).reduce((s, m) => s + m.ticketMedio, 0) / Math.min(6, mensais.length)
  const to = mensais.slice(0, 6).reduce((s, m) => s + m.ticketMedio, 0) / Math.min(6, mensais.length)
  const tg = to > 0 ? ((tt - to) / to) * 100 : 0

  /* Eventos normalizados */
  const bestNorm = [...eventos]
    .sort((a, b) => (b.revenue / b.days) - (a.revenue / a.days))
    .slice(0, 3)
  const worstNorm = [...eventos]
    .sort((a, b) => (a.revenue / a.days) - (b.revenue / a.days))
    .slice(0, 3)
  const scatterData = eventos.map(e => ({
    duracao: e.days, receita: e.revenue, nome: e.start,
  }))

  /* Sazonalidade */
  const byMonth: Record<number, { r: number; o: number; c: number }> = {}
  for (const m of mensais) {
    const idx = MESES.indexOf(m.label.split('/')[0]) + 1
    if (idx < 1 || idx > 12) continue
    if (!byMonth[idx]) byMonth[idx] = { r: 0, o: 0, c: 0 }
    byMonth[idx].r += m.revenue
    byMonth[idx].o += m.orders
    byMonth[idx].c++
  }
  const seasonal = Object.entries(byMonth)
    .map(([k, d]) => ({ mes: MESES[parseInt(k) - 1], media: d.r / d.c }))

  return {
    mom, quarters, cagr, bestMonth, worstMonth,
    top3CatPct, topN, topPct, prodGrowth, correlation,
    scatterData, bestNorm, worstNorm, seasonal, forecast, tg, tt, to,
    sortedCats, sortedProds,
  }
}

/* ── Tab: Visão Geral ── */
function TabOverview({ d, a }: { d: any; a: any }) {
  const m = a.mom
  const fh = m.slice(0, Math.floor(m.length / 2))
  const sh = m.slice(Math.floor(m.length / 2))
  const fr = fh.reduce((s: number, x: any) => s + x.revenue, 0)
  const sr = sh.reduce((s: number, x: any) => s + x.revenue, 0)
  const hg = fr > 0 ? ((sr - fr) / fr) * 100 : 0
  const recent6 = d.mensais.slice(-6)
  const lastLabels = recent6.map((x: any) => ({ ...x }))
  const combined = [...lastLabels, ...a.forecast]

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SarauKPI label="CAGR" value={`${a.cagr > 0 ? '+' : ''}${a.cagr.toFixed(1)}%`} sub="crescimento anual composto" />
        <SarauKPI label="Correlação" value={a.correlation.toFixed(3)} sub="receita × ingressos" />
        <SarauKPI label="Crescimento" value={pct(hg)} sub="2ª metade vs 1ª" />
        <SarauKPI label="Previsão 3m" value={fmt(a.forecast.reduce((s: number, f: any) => s + f.previsto, 0))} sub="receita estimada" />
      </div>

      {/* Tendência */}
      <SarauSection title="Tendência Mensal">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={a.mom}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 8 }} axisLine={false} tickLine={false} interval={3} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={TT} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
            <Bar dataKey="revenue" fill={GOLD} radius={[3, 3, 0, 0]} maxBarSize={28} opacity={0.7} name="Receita" />
            <Line type="monotone" dataKey="ma3" stroke={PURPLE} strokeWidth={2} dot={false} name="Média 3m" />
          </ComposedChart>
        </ResponsiveContainer>
      </SarauSection>

      {/* Trimestres + Previsão */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SarauSection title="Trimestres">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={a.quarters.slice(-8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 8 }} axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TT} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <Bar dataKey="revenue" fill={GOLD} radius={[3, 3, 0, 0]} name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </SarauSection>
        <SarauSection title="Previsão (Regressão Linear)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={combined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 8 }} axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TT} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <Bar dataKey="previsto" fill={PURPLE} radius={[3, 3, 0, 0]} name="Previsto" />
              <Bar dataKey="revenue" fill={GOLD} radius={[3, 3, 0, 0]} name="Real" />
            </BarChart>
          </ResponsiveContainer>
        </SarauSection>
      </div>

      {/* Melhores × Piores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SarauSection>
          <p className="text-[10px] text-success uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp size={12} /> Melhores (receita/dia)
          </p>
          {a.bestNorm.map((e: any, i: number) => (
            <div key={i} className="flex justify-between text-[11px] py-1">
              <span className="text-muted-foreground">{e.start}</span>
              <span className="text-foreground font-medium">{fmt(e.revenue)}</span>
              <span className="text-[#4b5563]">{fmt(Math.round(e.revenue / e.days))}/dia</span>
            </div>
          ))}
        </SarauSection>
        <SarauSection>
          <p className="text-[10px] text-danger uppercase tracking-wider mb-2 flex items-center gap-1.5">
            ⚠️ Piores (receita/dia)
          </p>
          {a.worstNorm.map((e: any, i: number) => (
            <div key={i} className="flex justify-between text-[11px] py-1">
              <span className="text-muted-foreground">{e.start}</span>
              <span className="text-foreground font-medium">{fmt(e.revenue)}</span>
              <span className="text-[#4b5563]">{fmt(Math.round(e.revenue / e.days))}/dia</span>
            </div>
          ))}
        </SarauSection>
      </div>
    </div>
  )
}

/* ── Tab: Mix ── */
function TabMix({ d, a }: { d: any; a: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SarauKPI label="Categoria Líder" value={a.sortedCats[0]?.name || '-'} sub={`${(a.sortedCats[0]?.pct || 0).toFixed(1)}% da receita`} />
        <SarauKPI label="Top 3 Categorias" value={pctAbs(a.top3CatPct)} sub="concentração" />
        <SarauKPI label="Evolução Ticket" value={pct(a.tg)} sub={`${fmt(a.to)} → ${fmt(a.tt)}`} />
        <SarauKPI label="Pareto 80%" value={`${a.topN} produtos`} sub={`${a.topPct.toFixed(0)}% da receita`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SarauSection title="Categorias (% Receita)">
          {a.sortedCats.map((c: any, i: number) => (
            <div key={c.name} className="mb-2.5">
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-muted-foreground">{c.name}</span>
                <span className="text-foreground font-medium">{pctAbs(c.pct)}</span>
                <span className="text-[#4b5563]">{fmt(c.total)}</span>
              </div>
              <div className="h-2 bg-[#1e1e1e] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${c.pct}%`, background: [GOLD, PURPLE, BLUE, GREEN, PINK, ORANGE][i % 6] }} />
              </div>
            </div>
          ))}
        </SarauSection>
        <SarauSection title="Produtos em Alta">
          {a.prodGrowth.filter((p: any) => p.g > 10).length > 0 ? (
            a.prodGrowth.filter((p: any) => p.g > 10).slice(0, 8).map((p: any) => (
              <div key={p.name} className="flex items-center gap-2 text-[11px] px-2 py-1.5 rounded-lg hover:bg-white/[0.03]">
                <span className={p.g > 30 ? 'text-success' : 'text-violet'}>{p.g > 30 ? '🚀' : '📈'}</span>
                <span className="text-muted-foreground flex-1 truncate">{p.name}</span>
                <span className="text-foreground font-medium w-16 text-right">{pct(p.g)}</span>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-[#4b5563] text-center py-4">Nenhum com crescimento significativo</p>
          )}
        </SarauSection>
      </div>
    </div>
  )
}

/* ── Tab: Correlações ── */
function TabCorr({ d, a }: { d: any; a: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SarauKPI label="Correlação R" value={a.correlation.toFixed(3)} sub="receita × ingressos" />
        <SarauKPI label="Ticket Atual" value={fmt(a.tt)} sub={`${pct(a.tg)} evolução`} />
        <SarauKPI label="Sazonalidade" value={a.seasonal.sort((a: any, b: any) => b.media - a.media)[0]?.mes || '-'} sub="mês de pico" />
        <SarauKPI label="Melhor Mês" value={a.bestMonth?.label || '-'} sub={fmt(a.bestMonth?.revenue || 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SarauSection title="Receita × Pedidos">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="orders" name="Pedidos" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="revenue" name="Receita" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TT} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <Scatter data={d.mensais} fill={GOLD} opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </SarauSection>
        <SarauSection title="Duração × Receita">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="duracao" name="Dias" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="receita" name="Receita" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TT} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <Scatter data={a.scatterData} fill={PURPLE} opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </SarauSection>
        <SarauSection title="Sazonalidade">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={a.seasonal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TT} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <defs>
                <linearGradient id="sg">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="media" stroke={GREEN} strokeWidth={2} fill="url(#sg)" name="Média" />
            </AreaChart>
          </ResponsiveContainer>
        </SarauSection>
        <SarauSection title="Ticket Mensal">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={d.mensais}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 8 }} axisLine={false} tickLine={false} interval={3} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip contentStyle={TT} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <Line type="monotone" dataKey="ticketMedio" stroke={PINK} strokeWidth={2} dot={{ fill: PINK, r: 2 }} name="Ticket" />
            </LineChart>
          </ResponsiveContainer>
        </SarauSection>
      </div>

      {/* Interpretation */}
      <SarauSection>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Interpretação</p>
        <p className="text-xs text-foreground/[0.8] leading-relaxed">
          {a.correlation > 0.9
            ? 'Correlação muito forte. Receita é puxada por volume. Eficiência operacional é a chave.'
            : a.correlation > 0.7
              ? 'Correlação forte. Vale investigar meses com ticket alto mas volume baixo.'
              : a.correlation > 0.5
                ? 'Correlação moderada. Eventos específicos fazem diferença no resultado.'
                : 'Correlação fraca. Cada evento tem perfil próprio.'}
        </p>
      </SarauSection>
    </div>
  )
}

/* ── Tab: Insights Inteligentes ── */
function TabInsights({ d, a }: { d: any; a: any }) {
  const m = a.mom
  const r3 = m.slice(-3).reduce((s: number, x: any) => s + x.revenue, 0)
  const p3 = m.slice(-6, -3).reduce((s: number, x: any) => s + x.revenue, 0)
  const recentGrowth = p3 > 0 ? ((r3 - p3) / p3) * 100 : 0

  const insights = [
    {
      icon: a.cagr > 15 ? '🚀' : a.cagr > 5 ? '📈' : '📊',
      title: 'Crescimento Anual',
      text: `CAGR de ${a.cagr.toFixed(1)}% ao ano. ${
        a.cagr > 20 ? 'Crescimento explosivo.'
          : a.cagr > 10 ? 'Crescimento sólido e consistente.'
            : 'Crescimento moderado. Hora de buscar novos canais.'}`,
      color: a.cagr > 15 ? '#34d399' : a.cagr > 5 ? '#c8a96e' : '#f87171',
    },
    {
      icon: a.tg > 5 ? '💎' : a.tg > -5 ? '🔶' : '⚠️',
      title: 'Ticket Médio',
      text: `Ticket ${a.tg > 0 ? 'subiu' : 'caiu'} ${pctAbs(Math.abs(a.tg))}. ${
        a.tg > 10 ? 'Público consumindo mais caro.'
          : a.tg > 0 ? 'Leve aumento.'
            : 'Queda no ticket. Possível defasagem de preços.'}`,
      color: a.tg > 5 ? '#34d399' : a.tg > -5 ? '#c8a96e' : '#f87171',
    },
    {
      icon: a.top3CatPct > 80 ? '🍷' : '🔄',
      title: 'Concentração',
      text: `Top 3 categorias: ${pctAbs(a.top3CatPct)} da receita. ${
        a.top3CatPct > 85 ? 'Alta concentração — risco.'
          : a.top3CatPct > 65 ? 'Concentração saudável.'
            : 'Mix bem distribuído.'}`,
      color: a.top3CatPct > 85 ? '#f87171' : a.top3CatPct > 65 ? '#c8a96e' : '#34d399',
    },
    {
      icon: recentGrowth > 15 ? '🔥' : recentGrowth > 0 ? '✅' : '❄️',
      title: 'Tendência Recente',
      text: `Últimos 3 meses ${recentGrowth > 0 ? 'cresceram' : 'caíram'} ${pctAbs(Math.abs(recentGrowth))} vs trimestre anterior.`,
      color: recentGrowth > 10 ? '#34d399' : recentGrowth > 0 ? '#c8a96e' : '#f87171',
    },
    {
      icon: a.correlation > 0.85 ? '🎯' : '📐',
      title: 'Alavanca',
      text: a.correlation > 0.85
        ? `R=${a.correlation.toFixed(2)}. Crescer = mais ingressos.`
        : `R=${a.correlation.toFixed(2)}. Ticket e mix importam.`,
      color: a.correlation > 0.85 ? '#a78bfa' : '#60a5fa',
    },
    {
      icon: a.topN <= 5 ? '📦' : '📋',
      title: 'Pareto',
      text: `${a.topN} produtos geram ${a.topPct.toFixed(0)}% da receita. ${
        a.topN <= 5 ? 'Risco de ruptura.'
          : a.topN <= 10 ? 'Concentração moderada.'
            : 'Distribuição saudável.'}`,
      color: a.topN <= 5 ? '#f87171' : a.topN <= 10 ? '#c8a96e' : '#34d399',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SarauKPI label="Melhor Mês" value={a.bestMonth?.label || '-'} sub={fmt(a.bestMonth?.revenue || 0)} />
        <SarauKPI label="Pior Mês" value={a.worstMonth?.label || '-'} sub={fmt(a.worstMonth?.revenue || 0)} />
        <SarauKPI label="Concentração" value={pctAbs(a.top3CatPct)} sub="top 3 categorias" />
        <SarauKPI label="Pareto" value={`${a.topN} produtos`} sub={`${a.topPct.toFixed(0)}% da receita`} />
      </div>

      {insights.map((ins, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 hover:border-gold/20 transition-colors">
          <span className="text-lg leading-none mt-0.5">{ins.icon}</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: ins.color }}>{ins.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{ins.text}</p>
          </div>
        </div>
      ))}

      {/* Recomendação */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-card border border-border rounded-xl p-5">
        <p className="text-[10px] text-gold uppercase tracking-wider mb-2">🎯 Recomendação</p>
        <p className="text-xs text-foreground/[0.8] leading-relaxed">
          {a.cagr > 15 && a.correlation > 0.85
            ? 'Momento de escala. Invista em capacidade e estoque.'
            : a.tg < -5
              ? 'Ticket em queda. Revise preços e teste produtos premium.'
              : a.top3CatPct > 85
                ? 'Concentração alta. Diversifique categorias.'
                : 'Negócio saudável. Foco em previsibilidade e calendário.'}
        </p>
      </div>
    </div>
  )
}

/* ── Tabs config ── */
const TABS: { id: string; label: string; icon: ReactNode }[] = [
  { id: 'geral',    label: 'Visão Geral', icon: <BarChart3 size={14} /> },
  { id: 'mix',      label: 'Mix',         icon: <PieChart size={14} /> },
  { id: 'corr',     label: 'Correlações', icon: <TrendingUp size={14} /> },
  { id: 'insights', label: 'IA',          icon: <Sparkles size={14} /> },
]

/* ── Componente Principal ── */
export function InsightsPage() {
  const { barData: data, loading } = useData()
  const [tab, setTab] = useState<string>('geral')
  const analytics = useMemo(
    () => data ? analyze(data.mensais, data.eventos, data.produtoMix, data.categorias) : null,
    [data],
  )

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-6 w-32 bg-card rounded animate-pulse" />
          <div className="h-3 w-48 bg-card rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map(i => <Skel key={i} />)}
        </div>
        {[1, 2].map(i => <Skel key={i} />)}
      </div>
    )
  }

  if (!data || !analytics) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <EmptyState
          icon={<Brain size={36} />}
          title="Dados insuficientes para análise"
          description="Importe dados de pelo menos 2 eventos para ativar o motor de inteligência."
        />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Inteligência"
        subtitle={`Motor de análise · ${data.totalEvents} eventos`}
        source={data.source}
        action={<SarauTabs tabs={TABS} active={tab} onChange={setTab} />}
      />
      {tab === 'geral' && <TabOverview d={data} a={analytics} />}
      {tab === 'mix' && <TabMix d={data} a={analytics} />}
      {tab === 'corr' && <TabCorr d={data} a={analytics} />}
      {tab === 'insights' && <TabInsights d={data} a={analytics} />}
    </div>
  )
}
