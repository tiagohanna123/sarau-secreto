import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useData } from '@/lib/data-context'
import { GOLD, VIOLET, GREEN, BLUE, PINK, CMV_BAR, TAXA_SYMPLA, CUSTO_PRODUCAO, fmt, fmtNum } from '@/lib/ui'

function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function Card({ label, value, sub, badge }: { label: string; value: string; sub?: string; badge?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
        {badge && <span className="ml-1.5 text-[8px] px-1 py-0.5 rounded bg-gold/10 text-gold">{badge}</span>}
      </p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground/80 mt-0.5">{sub}</p>}
    </div>
  )
}

function CT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-[11px] shadow-lg">
      <p className="text-gold font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-foreground">{p.name}: {typeof p.value === 'number' ? fmt(p.value) : p.value}</p>
      ))}
    </div>
  )
}

export function FinanceiroPage() {
  const { events, loading } = useData()

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-white/5 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-3">{[1,2].map(i => <div key={i} className="h-64 bg-white/5 rounded-xl" />)}</div>
      </div>
    )
  }

  // Cálculos reais
  const totalTicket = events.reduce((s, e) => s + (e.ticketRevenue || 0), 0)
  const totalBar = events.reduce((s, e) => s + (e.barRevenue || 0), 0)
  const totalGeral = totalTicket + totalBar
  const totalIngressos = events.reduce((s, e) => s + (e.ticketsSold || 0), 0)
  const totalEventos = events.length
  const eventosComBar = events.filter(e => (e.barRevenue || 0) > 0).length
  const ticketMedioBar = totalIngressos > 0 ? totalBar / totalIngressos : 0
  const ticketMedioEvento = totalGeral > 0 ? totalGeral / totalEventos : 0

  // Constantes de custo — importadas de @/lib/ui

  const custoBar = totalBar * CMV_BAR
  const custoSympla = totalTicket * TAXA_SYMPLA
  const custoProducao = totalEventos * CUSTO_PRODUCAO
  const custoTotal = custoBar + custoSympla + custoProducao
  const resultadoLiquido = totalGeral - custoTotal
  const margemLiquida = totalGeral > 0 ? (resultadoLiquido / totalGeral) * 100 : 0

  // Dados por período (mensal)
  const monthMap = new Map<string, { qtd: number; ticket: number; bar: number; ingressos: number }>()
  for (const ev of events) {
    const m = ev.date ? ev.date.slice(0, 7) : 'unknown'
    const p = monthMap.get(m) || { qtd: 0, ticket: 0, bar: 0, ingressos: 0 }
    p.qtd++
    p.ticket += ev.ticketRevenue || 0
    p.bar += ev.barRevenue || 0
    p.ingressos += ev.ticketsSold || 0
    monthMap.set(m, p)
  }
  const mensais = [...monthMap.entries()]
    .map(([mes, d]) => ({ mes, label: mes, receita: d.ticket + d.bar, bar: d.bar, ticket: d.ticket, ingressos: d.ingressos, eventos: d.qtd }))
    .sort((a, b) => a.mes.localeCompare(b.mes))

  // Últimos 10 eventos para tabela
  const recentes = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  // Resumo por ano
  const yearMap = new Map<string, { qtd: number; ticket: number; bar: number }>()
  for (const ev of events) {
    const y = ev.date ? ev.date.slice(0, 4) : '?'
    const p = yearMap.get(y) || { qtd: 0, ticket: 0, bar: 0 }
    p.qtd++
    p.ticket += ev.ticketRevenue || 0
    p.bar += ev.barRevenue || 0
    yearMap.set(y, p)
  }
  const anos = [...yearMap.entries()].map(([ano, d]) => ({
    ano, qtd: d.qtd,
    receita: d.ticket + d.bar,
    bar: d.bar,
    ticket: d.ticket,
    custo: (d.bar * CMV_BAR) + (d.ticket * TAXA_SYMPLA) + (d.qtd * CUSTO_PRODUCAO),
  })).sort((a, b) => a.ano.localeCompare(b.ano))

  const mixData = [
    { name: 'Bilheteria', value: totalTicket },
    { name: 'Bar', value: totalBar },
  ]
  const custosData = [
    { name: 'Produção', value: custoProducao },
    { name: 'Bar (CMV)', value: custoBar },
    { name: 'Sympla', value: custoSympla },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">Financeiro</h1>
            <p className="text-[11px] text-muted-foreground mt-1">{totalEventos} eventos · {eventosComBar} com dados de bar · {totalIngressos.toLocaleString('pt-BR')} ingressos</p>
          </div>
          <button
            onClick={() => {
              const rows = [['Data','Evento','Bilheteria','Bar','Total','Ingressos','Ticket Médio','Bar/Pessoa','%Bar','Lucro Est.','Margem']]
              for (const ev of events) {
                const total = (ev.ticketRevenue || 0) + (ev.barRevenue || 0)
                const bpc = ev.ticketsSold > 0 && ev.barRevenue > 0 ? (ev.barRevenue / ev.ticketsSold).toFixed(2) : '0'
                const barPct = total > 0 ? ((ev.barRevenue || 0) / total * 100).toFixed(0) : '0'
                const ticketMedio = ev.ticketsSold > 0 ? ((ev.ticketRevenue || 0) / ev.ticketsSold).toFixed(2) : '0'
                const lucro = total - CUSTO_PRODUCAO - (ev.barRevenue || 0) * CMV_BAR - (ev.ticketRevenue || 0) * TAXA_SYMPLA
                const margem = total > 0 ? ((lucro / total) * 100).toFixed(1) : '0'
                rows.push([
                  ev.date || '', ev.title,
                  String(ev.ticketRevenue || 0), String(ev.barRevenue || 0), String(total),
                  String(ev.ticketsSold || 0), ticketMedio, bpc, barPct + '%',
                  String(Math.round(lucro)), margem + '%',
                ])
              }
              const csv = rows.map(r => r.map(c => `"${c.replace(/"/g,'""')}"`).join(',')).join('\n')
              downloadCSV('\uFEFF' + csv, `sarau-financeiro-${new Date().toISOString().slice(0,10)}.csv`)
            }}
            className="text-[10px] font-medium px-3 py-2 rounded-lg bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors shrink-0"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs — Receita */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Card label="Receita Total" value={fmt(totalGeral)} sub="bilheteria + bar" />
        <Card label="Bilheteria" value={fmt(totalTicket)} sub={`${(totalTicket/totalGeral*100).toFixed(0)}% do total`} badge="real" />
        <Card label="Bar" value={fmt(totalBar)} sub={`${(totalBar/totalGeral*100).toFixed(0)}% do total`} badge="real" />
        <Card label="Receita/Evento" value={fmt(ticketMedioEvento)} sub="média geral" />
      </div>

      {/* KPIs — Custos e Resultado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Card label="Custo Produção" value={fmt(custoProducao)} sub={`${fmt(CUSTO_PRODUCAO)}/evento`} badge="estimado" />
        <Card label="Custo Bar (CMV)" value={fmt(custoBar)} sub={`${(CMV_BAR*100).toFixed(0)}% da receita bar`} badge="estimado" />
        <Card label="Taxa Sympla" value={fmt(custoSympla)} sub={`${(TAXA_SYMPLA*100).toFixed(0)}% da bilheteria`} badge="estimado" />
        <Card label="Resultado Líquido" value={fmt(resultadoLiquido)} sub={`${margemLiquida.toFixed(1)}% de margem`} badge="estimado" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Mix Receita */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold text-foreground mb-4">Mix de Receita</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={mixData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={2}>
                  {mixData.map((_, i) => <Cell key={i} fill={[GOLD, VIOLET][i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:GOLD}} /> Bilheteria <span className="text-foreground font-medium ml-auto">{fmt(totalTicket)}</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:VIOLET}} /> Bar <span className="text-foreground font-medium ml-auto">{fmt(totalBar)}</span></div>
            </div>
          </div>
        </div>

        {/* Custos */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold text-foreground mb-4">Composição de Custos</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={custosData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={2}>
                  {custosData.map((_, i) => <Cell key={i} fill={[BLUE, GREEN, PINK][i % 4]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:BLUE}} /> Produção <span className="text-foreground font-medium ml-auto">{fmt(custoProducao)}</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:GREEN}} /> Bar (CMV) <span className="text-foreground font-medium ml-auto">{fmt(custoBar)}</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:PINK}} /> Sympla <span className="text-foreground font-medium ml-auto">{fmt(custoSympla)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Receita Mensal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold text-foreground mb-4">Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mensais}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CT />} cursor={{ fill: 'var(--color-gold-glow)' }} />
              <Bar dataKey="receita" name="Receita" fill={GOLD} radius={[4,4,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Métodos de Pagamento (vindo do bar data — puxa de useBarData ou fica vazio) */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold text-foreground mb-4">Receita por Ano</h3>
          <div className="space-y-3">
            {anos.map(a => (
              <div key={a.ano}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground font-medium">{a.ano}</span>
                  <span className="text-muted-foreground">{a.qtd} eventos · {fmt(a.receita)}</span>
                </div>
                <div className="flex gap-2 text-[10px] text-muted-foreground/80">
                  <span>Bar: {fmt(a.bar)}</span>
                  <span>·</span>
                  <span>Bilheteria: {fmt(a.ticket)}</span>
                  <span>·</span>
                  <span>Custo: {fmt(a.custo)}</span>
                </div>
                {/* Barra de split bar/bilheteria */}
                <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                  {a.receita > 0 && (
                    <>
                      <div className="h-full bg-gold" style={{ width: `${(a.bar/a.receita)*100}%` }} />
                      <div className="h-full bg-muted-foreground/40" style={{ width: `${(a.ticket/a.receita)*100}%` }} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Últimos Eventos */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-xs font-semibold text-foreground mb-4">Últimos 10 Eventos · KPIs por evento</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-2">Data</th>
                <th className="text-left py-2 pr-2">Evento</th>
                <th className="text-right py-2 pr-2">Bilheteria</th>
                <th className="text-right py-2 pr-2">Bar</th>
                <th className="text-right py-2 pr-2">Total</th>
                <th className="text-right py-2 pr-2">Ingressos</th>
                <th className="text-right py-2 pr-2">Ticket</th>
                <th className="text-right py-2 pr-2">Bar/pessoa</th>
                <th className="text-right py-2 pr-2">% Bar</th>
                <th className="text-right py-2 pr-2">Lucro</th>
                <th className="text-right py-2">Margem</th>
              </tr>
            </thead>
            <tbody>
              {recentes.map(ev => {
                const total = (ev.ticketRevenue || 0) + (ev.barRevenue || 0)
                const bpc = ev.ticketsSold > 0 && ev.barRevenue > 0 ? (ev.barRevenue / ev.ticketsSold) : 0
                const barPct = total > 0 ? (ev.barRevenue || 0) / total * 100 : 0
                const ticketMedio = ev.ticketsSold > 0 ? (ev.ticketRevenue || 0) / ev.ticketsSold : 0
                const lucro = total - CUSTO_PRODUCAO - (ev.barRevenue || 0) * CMV_BAR - (ev.ticketRevenue || 0) * TAXA_SYMPLA
                const margem = total > 0 ? (lucro / total) * 100 : 0
                return (
                  <tr key={ev.id} className="border-b border-border/50 hover:bg-white/[0.03]">
                    <td className="py-2 pr-2 text-muted-foreground whitespace-nowrap">{ev.date ? new Date(ev.date).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="py-2 pr-2 text-foreground max-w-[140px] truncate">{ev.title}</td>
                    <td className="py-2 pr-2 text-right text-foreground">{fmt(ev.ticketRevenue || 0)}</td>
                    <td className="py-2 pr-2 text-right text-gold">{ev.barRevenue ? fmt(ev.barRevenue) : '—'}</td>
                    <td className="py-2 pr-2 text-right text-foreground font-medium">{fmt(total)}</td>
                    <td className="py-2 pr-2 text-right text-muted-foreground">{ev.ticketsSold || 0}</td>
                    <td className="py-2 pr-2 text-right text-muted-foreground">{ticketMedio > 0 ? fmt(ticketMedio) : '—'}</td>
                    <td className="py-2 pr-2 text-right text-muted-foreground">{bpc > 0 ? fmt(bpc) : '—'}</td>
                    <td className="py-2 pr-2 text-right text-muted-foreground">{barPct > 0 ? `${barPct.toFixed(0)}%` : '—'}</td>
                    <td className={`py-2 pr-2 text-right font-medium ${lucro >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(lucro)}</td>
                    <td className={`py-2 text-right font-medium ${margem >= 0 ? 'text-success' : 'text-danger'}`}>{margem !== 0 ? `${margem.toFixed(1)}%` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota de transparência */}
      <div className="text-[10px] text-muted-foreground/80 space-y-1">
        <p>📊 Receita: dados reais do Sympla (bilheteria) + Yuzer (bar).</p>
        <p>📐 Custos: estimativas baseadas em benchmarks de mercado. Produção: R$ 12k/evento (artista, espaço, equipe). CMV bar: 42%. Taxa Sympla: 8%.</p>
        <p>🎯 Para custos reais por evento, cadastre as despesas no sistema (futuro: módulo de custos).</p>
      </div>
    </div>
  )
}
