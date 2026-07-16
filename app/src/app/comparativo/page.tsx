import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '@/lib/data-context'
import { Card, Skel, fmt, fmtNum, GOLD, PURPLE, ChartTip } from '@/lib/ui'

export function ComparativoPage() {
  const { barData: data, loading } = useData()
  const [a, setA] = useState(0)
  const [b, setB] = useState(1)

  if (loading) return <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">{[1,2].map(i => <Skel key={i}/>)}</div>
  if (!data) return <div className="p-4 sm:p-6 max-w-7xl mx-auto text-center py-20 text-[#6b7280] text-sm">Dados indisponíveis</div>

  const eventos = data.eventos.sort((a: any, b: any) => a.start.localeCompare(b.start))
  const evA = eventos[a]
  const evB = eventos[b]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-lg font-semibold text-white tracking-tight mb-1">Comparativo</h1>
      <p className="text-[11px] text-[#6b7280] mb-6">Compare dois eventos lado a lado · <span className={data.source === 'live' ? 'text-[#34d399]' : 'text-[#c8a96e]'}>{data.source === 'live' ? 'ao vivo' : 'backup'}</span></p>

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
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-white mb-3">Top Produtos — Evento A</h3>
              <div className="space-y-1">
                {evA.produtos.length > 0 ? evA.produtos.slice(0, 8).map((p: any, i: number) => (
                  <div key={p.name} className="flex items-center gap-2 text-[11px]">
                    <span className="text-[#4b5563] w-3 font-mono">{i+1}</span>
                    <span className="text-[#9ca3af] flex-1 truncate">{p.name}</span>
                    <span className="text-white font-medium">{fmt(p.total)}</span>
                  </div>
                )) : <p className="text-[10px] text-[#4b5563] py-4 text-center">Indisponível para esta fonte</p>}
              </div>
            </div>
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-white mb-3">Top Produtos — Evento B</h3>
              <div className="space-y-1">
                {evB.produtos.length > 0 ? evB.produtos.slice(0, 8).map((p: any, i: number) => (
                  <div key={p.name} className="flex items-center gap-2 text-[11px]">
                    <span className="text-[#4b5563] w-3 font-mono">{i+1}</span>
                    <span className="text-[#9ca3af] flex-1 truncate">{p.name}</span>
                    <span className="text-white font-medium">{fmt(p.total)}</span>
                  </div>
                )) : <p className="text-[10px] text-[#4b5563] py-4 text-center">Indisponível para esta fonte</p>}
              </div>
            </div>
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-white mb-3">Pagamentos A</h3>
              <div className="space-y-1.5">
                {evA.metodosPagamento.length > 0 ? evA.metodosPagamento.map((m: any) => (
                  <div key={m.method} className="flex justify-between text-[11px]">
                    <span className="text-[#9ca3af]">{m.method}</span>
                    <span className="text-white font-medium">{fmt(m.total)}</span>
                    <span className="text-[#c8a96e]">{m.pct}%</span>
                  </div>
                )) : <p className="text-[10px] text-[#4b5563] py-4 text-center">Indisponível para esta fonte</p>}
              </div>
            </div>
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-white mb-3">Pagamentos B</h3>
              <div className="space-y-1.5">
                {evB.metodosPagamento.length > 0 ? evB.metodosPagamento.map((m: any) => (
                  <div key={m.method} className="flex justify-between text-[11px]">
                    <span className="text-[#9ca3af]">{m.method}</span>
                    <span className="text-white font-medium">{fmt(m.total)}</span>
                    <span className="text-[#c8a96e]">{m.pct}%</span>
                  </div>
                )) : <p className="text-[10px] text-[#4b5563] py-4 text-center">Indisponível para esta fonte</p>}
              </div>
            </div>
          </div>
        </>
      )}
      <div className="mt-6 text-[10px] text-[#4b5563]">Fonte: {data.source === 'live' ? 'Yuzer ao vivo' : 'Backup Yuzer'}</div>
    </div>
  )
}

function SelectEvent({ eventos, value, onChange, label }: { eventos: any[]; value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div>
      <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">{label}</p>
      <select value={value} onChange={e => onChange(parseInt(e.target.value))}
        className="w-full bg-[#141414] border border-[#1e1e1e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c8a96e]">
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
    <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
      <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div><p className="text-[10px] text-[#4b5563]">A</p><p className="text-sm font-bold text-white">{a}</p></div>
        <div><p className="text-[10px] text-[#4b5563]">B</p><p className="text-sm font-bold text-white">{b}</p></div>
      </div>
      <div className={`text-center mt-1.5 text-[11px] font-medium ${isUp ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
        {isUp ? '↑' : '↓'} {diffStr}
      </div>
    </div>
  )
}
