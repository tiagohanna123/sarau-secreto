import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '@/lib/data-context'
import { Card, Skel, fmt, fmtNum, GOLD, PURPLE, ChartTip } from '@/lib/ui'

export function ComparativoPage() {
  const { barData: data, loading } = useData()
  const [a, setA] = useState(0)
  const [b, setB] = useState(1)

  if (loading) return <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">{[1,2].map(i => <Skel key={i}/>)}</div>
  if (!data) return <div className="p-4 sm:p-6 max-w-7xl mx-auto text-center py-20 text-muted-foreground text-sm">Dados indisponíveis</div>

  const eventos = data.eventos
    .filter((e: any) => (e.revenue || 0) > 0)
    .sort((a: any, b: any) => a.start.localeCompare(b.start))
  const evA = eventos[a]
  const evB = eventos[b]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-lg font-semibold text-foreground tracking-tight mb-1">Comparativo</h1>
      <p className="text-[11px] text-muted-foreground mb-6">Compare dois eventos lado a lado · <span className={data.source === 'live' ? 'text-success' : 'text-gold'}>{data.source === 'live' ? 'ao vivo' : 'backup'}</span></p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <SelectEvent eventos={eventos} value={a} onChange={setA} label="Evento A" />
        <SelectEvent eventos={eventos} value={b} onChange={setB} label="Evento B" />
      </div>

      {evA && evB && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <Cmp label="Receita" a={fmt(evA.revenue)} b={fmt(evB.revenue)} diff={evB.revenue - evA.revenue} unit="currency" />
            <Cmp label="Ingressos" a={fmtNum(evA.orders)} b={fmtNum(evB.orders)} diff={evB.orders - evA.orders} unit="number" />
            <Cmp label="Ticket Médio" a={fmt(evA.ticketMedio)} b={fmt(evB.ticketMedio)} diff={evB.ticketMedio - evA.ticketMedio} unit="currency" />
            <Cmp label="Itens" a={fmtNum(evA.itensVendidos)} b={fmtNum(evB.itensVendidos)} diff={evB.itensVendidos - evA.itensVendidos} unit="number" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-foreground mb-3">Top Produtos — Evento A</h3>
              <div className="space-y-1">
                {evA.produtos.length > 0 ? evA.produtos.slice(0, 8).map((p: any, i: number) => (
                  <div key={p.name} className="flex items-center gap-2 text-[11px]">
                    <span className="text-muted-foreground/40 w-3 font-mono">{i+1}</span>
                    <span className="text-muted-foreground/80 flex-1 truncate">{p.name}</span>
                    <span className="text-foreground font-medium">{fmt(p.total)}</span>
                  </div>
                )) : <p className="text-[10px] text-muted-foreground/40 py-4 text-center">Indisponível para esta fonte</p>}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-foreground mb-3">Top Produtos — Evento B</h3>
              <div className="space-y-1">
                {evB.produtos.length > 0 ? evB.produtos.slice(0, 8).map((p: any, i: number) => (
                  <div key={p.name} className="flex items-center gap-2 text-[11px]">
                    <span className="text-muted-foreground/40 w-3 font-mono">{i+1}</span>
                    <span className="text-muted-foreground/80 flex-1 truncate">{p.name}</span>
                    <span className="text-foreground font-medium">{fmt(p.total)}</span>
                  </div>
                )) : <p className="text-[10px] text-muted-foreground/40 py-4 text-center">Indisponível para esta fonte</p>}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-foreground mb-3">Pagamentos A</h3>
              <div className="space-y-1.5">
                {evA.metodosPagamento.length > 0 ? evA.metodosPagamento.map((m: any) => (
                  <div key={m.method} className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground/80">{m.method}</span>
                    <span className="text-foreground font-medium">{fmt(m.total)}</span>
                    <span className="text-gold">{m.pct}%</span>
                  </div>
                )) : <p className="text-[10px] text-muted-foreground/40 py-4 text-center">Indisponível para esta fonte</p>}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-foreground mb-3">Pagamentos B</h3>
              <div className="space-y-1.5">
                {evB.metodosPagamento.length > 0 ? evB.metodosPagamento.map((m: any) => (
                  <div key={m.method} className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground/80">{m.method}</span>
                    <span className="text-foreground font-medium">{fmt(m.total)}</span>
                    <span className="text-gold">{m.pct}%</span>
                  </div>
                )) : <p className="text-[10px] text-muted-foreground/40 py-4 text-center">Indisponível para esta fonte</p>}
              </div>
            </div>
          </div>
        </>
      )}
      <div className="mt-6 text-[10px] text-muted-foreground/50">Fonte: {data.source === 'live' ? 'Yuzer ao vivo' : 'Backup Yuzer'}</div>
    </div>
  )
}

function SelectEvent({ eventos, value, onChange, label }: { eventos: any[]; value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <select value={value} onChange={e => onChange(parseInt(e.target.value))}
        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-gold-dim">
        {eventos.map((ev, i) => (
          <option key={ev.start} value={i}>{ev.start} — {fmt(ev.revenue)} ({ev.orders} ingressos)</option>
        ))}
      </select>
    </div>
  )
}

function Cmp({ label, a, b, diff, unit }: { label: string; a: string; b: string; diff: number; unit: 'currency' | 'number' }) {
  const isUp = diff >= 0
  const diffStr = unit === 'currency'
    ? diff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
    : diff.toLocaleString('pt-BR')
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div><p className="text-[10px] text-muted-foreground/50">A</p><p className="text-sm font-bold text-foreground">{a}</p></div>
        <div><p className="text-[10px] text-muted-foreground/50">B</p><p className="text-sm font-bold text-foreground">{b}</p></div>
      </div>
      <div className={`text-center mt-1.5 text-[11px] font-medium ${isUp ? 'text-success' : 'text-danger'}`}>
        {isUp ? '↑' : '↓'} {diffStr}
      </div>
    </div>
  )
}
