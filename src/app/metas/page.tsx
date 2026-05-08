import { useState, useEffect } from 'react'
import { useToast } from '../../lib/toast'
import { useData } from '../../lib/data-context'

interface Metas {
  ingressos: number
  receitaBar: number
  penetracaoBar: number
  noShowMax: number
}

interface InsightEvent {
  id: string
  name: string
  date: string
  ticketsSold: number
  checkedIn: number
  ticketRevenue: number
  barRevenue: number
  barTransactions: number
  totalRevenue: number
  perCapitaBar: number
  noShowRate: number
}

interface OverviewData {
  aggregates: {
    totalEvents: number
    totalTickets: number
    totalCheckedIn: number
    averagePerEvent: number
    totalTicketRevenue: number
    totalBarRevenue: number
    totalRevenue: number
    perCapitaBar: number
    overallNoShowRate: number
  }
  events: InsightEvent[]
}

interface Historico {
  melhorIngressos: { valor: number; evento: string }
  melhorBar: { valor: number; evento: string }
  melhorPenetracao: { valor: number; evento: string }
  melhorNoShow: { valor: number; evento: string }
  mediaIngressos: number
  mediaBar: number
  mediaPenetracao: number
  mediaNoShow: number
}

// Custos operacionais fixos (percentuais externos, não vêm da API)
const CUSTO_SYMPLA = 0.093
const CMV_BAR = 0.42

function formatDate(d: string) {
  if (!d) return ''
  const [y, m] = d.split('-')
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[parseInt(m, 10) - 1]}/${y.slice(2)}`
}

function computeHistorico(data: OverviewData): Historico {
  const { aggregates, events } = data
  const total = aggregates.totalEvents

  // Médias gerais
  const mediaIngressos = total > 0 ? Math.round(aggregates.totalTickets / total) : 0
  const mediaBar = total > 0 ? Math.round(aggregates.totalBarRevenue / total) : 0
  const mediaNoShow = aggregates.overallNoShowRate * 100

  // Penetração estimada por evento: barTransactions / checkedIn (proxy de clientes únicos no bar)
  let melhorPenetracao = { valor: 0, evento: '' }
  let melhorIngressos = { valor: 0, evento: '' }
  let melhorBar = { valor: 0, evento: '' }
  let melhorNoShow = { valor: 100, evento: '' }
  let somaPenetracao = 0
  let countPenetracao = 0

  for (const ev of events) {
    const label = formatDate(ev.date) || ev.name

    // Ingressos
    if (ev.ticketsSold > melhorIngressos.valor) {
      melhorIngressos = { valor: ev.ticketsSold, evento: label }
    }

    // Bar
    if (ev.barRevenue > melhorBar.valor) {
      melhorBar = { valor: ev.barRevenue, evento: label }
    }

    // Penetração estimada
    const pctPen = ev.checkedIn > 0 && ev.barTransactions > 0
      ? Math.round((ev.barTransactions / ev.checkedIn) * 100)
      : 0
    if (pctPen > melhorPenetracao.valor) {
      melhorPenetracao = { valor: pctPen, evento: label }
    }
    if (pctPen > 0) {
      somaPenetracao += pctPen
      countPenetracao++
    }

    // No-show (menor = melhor)
    const ns = ev.noShowRate * 100
    if (ns < melhorNoShow.valor && ns >= 0) {
      melhorNoShow = { valor: ns, evento: label }
    }
  }

  const mediaPenetracao = countPenetracao > 0
    ? Math.round((somaPenetracao / countPenetracao) * 10) / 10
    : 50

  return {
    melhorIngressos,
    melhorBar,
    melhorPenetracao,
    melhorNoShow,
    mediaIngressos,
    mediaBar,
    mediaPenetracao,
    mediaNoShow: Math.round(mediaNoShow * 10) / 10,
  }
}

function computeDefaultMetas(data: OverviewData, historico: Historico): Metas {
  const { aggregates } = data
  const total = aggregates.totalEvents

  // Defaults = médias históricas arredondadas
  const ingressos = total > 0 ? Math.round(aggregates.totalTickets / total) : 900
  const receitaBar = total > 0 ? Math.round(aggregates.totalBarRevenue / total) : 12000
  const penetracaoBar = historico.mediaPenetracao > 0 ? historico.mediaPenetracao : 58
  // No-show máximo = média histórica (tolerância)
  const noShowMax = historico.mediaNoShow > 0 ? historico.mediaNoShow : 18

  return { ingressos, receitaBar, penetracaoBar, noShowMax }
}

/** Ticket médio da bilheteria (da API) */
function computeTicketMedio(data: OverviewData): number {
  const { aggregates } = data
  if (aggregates.totalTickets > 0) {
    return Math.round((aggregates.totalTicketRevenue / aggregates.totalTickets) * 100) / 100
  }
  return 46.70 // fallback
}

function ProgressBar({ value, max, color, reverse }: { value: number; max: number; color: string; reverse?: boolean }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const displayPct = reverse ? (value <= max ? 100 : Math.round((max / value) * 100)) : pct
  return (
    <div className="h-2 w-full bg-[#1f1f1f] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${displayPct}%`, background: color }}
      />
    </div>
  )
}

function MetaCard({
  label,
  icon,
  metaKey,
  metas,
  setMetas,
  formatVal,
  suffix,
  melhor,
  melhorEvento,
  media,
  reverse,
  description,
  totalEventos,
}: {
  label: string
  icon: string
  metaKey: keyof Metas
  metas: Metas
  setMetas: (m: Metas) => void
  formatVal: (v: number) => string
  suffix: string
    melhor: number
    melhorEvento: string
    media: number
    reverse?: boolean
    description: string
    totalEventos: number
}) {
  const meta = metas[metaKey]
  const [editing, setEditing] = useState(false)
  const [tempVal, setTempVal] = useState(String(meta))

  const pctVsMelhor = reverse
    ? melhor <= meta ? 100 : Math.round((meta / melhor) * 100)
    : Math.min(100, Math.round((meta / melhor) * 100))

  const statusColor = pctVsMelhor >= 100 ? '#22c55e' : pctVsMelhor >= 70 ? '#c8a96e' : '#ef4444'
  const barColor = reverse ? (meta <= melhor ? '#22c55e' : '#ef4444') : '#c8a96e'

  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xl mb-1">{icon}</div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="text-xs text-[#6b7280] mt-0.5">{description}</div>
        </div>
        <button
          onClick={() => { setEditing(true); setTempVal(String(meta)) }}
          className="text-xs text-[#c8a96e] hover:underline px-2 py-1 border border-[#c8a96e]/30 rounded-lg transition-colors hover:bg-[#c8a96e]/10"
        >
          Editar
        </button>
      </div>

      {editing ? (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={tempVal}
            onChange={e => setTempVal(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-[#c8a96e]/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c8a96e]"
          />
          <button
            onClick={() => {
              const v = parseFloat(tempVal)
              if (!isNaN(v) && v > 0) setMetas({ ...metas, [metaKey]: v })
              setEditing(false)
            }}
            className="bg-[#c8a96e] text-black text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#d4b87a] transition-colors"
          >
            OK
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-[#6b7280] text-xs px-2 py-2 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="text-2xl font-bold text-white">
          {formatVal(meta)}<span className="text-sm text-[#6b7280] ml-1">{suffix}</span>
        </div>
      )}

      <div className="space-y-1">
        <ProgressBar value={meta} max={melhor} color={barColor} reverse={reverse} />
        <div className="flex justify-between text-xs text-[#6b7280]">
          <span>Meta</span>
          <span style={{ color: statusColor }}>{pctVsMelhor}% do melhor histórico</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#0a0a0a] rounded-lg p-2.5">
          <div className="text-[#6b7280] mb-0.5">🏆 Melhor</div>
          <div className="text-white font-semibold">{formatVal(melhor)}{suffix}</div>
          <div className="text-[#4b5563]">{melhorEvento}</div>
        </div>
        <div className="bg-[#0a0a0a] rounded-lg p-2.5">
          <div className="text-[#6b7280] mb-0.5">📊 Média</div>
          <div className="text-white font-semibold">{formatVal(media)}{suffix}</div>
          <div className="text-[#4b5563]">{totalEventos} eventos</div>
        </div>
      </div>
    </div>
  )
}

export function MetasPage({ navigate }: { navigate: (r: string) => void }) {
  const { toast } = useToast()
  const [metas, setMetas] = useState<Metas | null>(null)
  const [historico, setHistorico] = useState<Historico | null>(null)
  const [ticketMedio, setTicketMedio] = useState(46.70)
  const [totalEventos, setTotalEventos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const { overview, loading: dataLoading } = useData()

  // Carrega dados do DataContext
  useEffect(() => {
    if (!overview) return
    const data = overview as OverviewData
    const hist = computeHistorico(data)
    const defaults = computeDefaultMetas(data, hist)
    const ticketMed = computeTicketMedio(data)

    setHistorico(hist)
    setTicketMedio(ticketMed)
    setTotalEventos(data.aggregates.totalEvents)

    // Tenta carregar do localStorage primeiro, senao usa defaults da API
    try {
      const saved = localStorage.getItem('sarau_metas')
      if (saved) {
        const parsed = JSON.parse(saved)
        setMetas(parsed)
      } else {
        setMetas(defaults)
        localStorage.setItem('sarau_metas', JSON.stringify(defaults))
      }
    } catch {
      setMetas(defaults)
      localStorage.setItem('sarau_metas', JSON.stringify(defaults))
    }

    setLoading(false)
  }, [overview])

  // Persiste no localStorage sempre que metas mudar
  useEffect(() => {
    if (metas) {
      localStorage.setItem('sarau_metas', JSON.stringify(metas))
    }
  }, [metas])

  function handleSave() {
    if (!metas) return
    localStorage.setItem('sarau_metas', JSON.stringify(metas))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    toast('Metas salvas com sucesso!')
  }

  function handleReset() {
    if (!historico || !metas) return
    // Recalcula defaults atuais a partir do historico
    const defaults = {
      ingressos: historico.mediaIngressos || 900,
      receitaBar: historico.mediaBar || 12000,
      penetracaoBar: historico.mediaPenetracao || 58,
      noShowMax: historico.mediaNoShow || 18,
    }
    setMetas(defaults)
    toast('Metas restauradas para a média histórica', 'info')
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR')
  const fmtR = (v: number) => 'R$' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
  const fmtPct = (v: number) => v.toFixed(1)

  // Estados de carregamento/erro
  if (dataLoading && !overview) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-4">🎯</div>
          <div className="text-[#c8a96e] font-semibold">Carregando dados históricos...</div>
          <div className="text-xs text-[#6b7280] mt-2">Buscando dados reais dos eventos</div>
        </div>
      </div>
    )
  }

  if (error || !metas || !historico) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-4">⚠️</div>
          <div className="text-red-400 font-semibold">Erro ao carregar dados</div>
          <div className="text-xs text-[#6b7280] mt-2">{error || 'Dados indisponíveis'}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-xs text-[#c8a96e] border border-[#c8a96e]/30 rounded-lg px-3 py-2 hover:bg-[#c8a96e]/10 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-[#1f1f1f] bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">🎯 Metas do Próximo Evento</h1>
            <p className="text-sm text-[#6b7280] mt-0.5">Defina e acompanhe metas vs. histórico real</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="text-xs text-[#6b7280] border border-[#2a2a2a] rounded-lg px-3 py-2 hover:text-white hover:border-[#444] transition-colors btn-ripple"
            >
              Restaurar média
            </button>
            <button
              onClick={handleSave}
              className={[
                'text-xs font-bold px-4 py-2 rounded-lg transition-all btn-ripple',
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-[#c8a96e] text-black hover:bg-[#d4b87a]',
              ].join(' ')}
            >
              {saved ? '✓ Salvo!' : 'Salvar Metas'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Contexto */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 flex gap-3 items-start">
          <span className="text-2xl">📅</span>
          <div>
            <div className="text-sm font-semibold text-[#c8a96e]">Próximo evento: Sarau Secreto</div>
            <div className="text-xs text-[#9ca3af] mt-1">
              Baseado em {totalEventos} evento{totalEventos !== 1 ? 's' : ''} realizados. Média de {fmt(historico.mediaIngressos)} ingressos/evento.
              {historico.melhorIngressos.evento && ` ${historico.melhorIngressos.evento} foi o pico histórico (${fmt(historico.melhorIngressos.valor)} ingressos).`}
              Edite cada meta e compare com o histórico real.
            </div>
          </div>
        </div>

        {/* Cards de Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetaCard
            label="Ingressos vendidos"
            icon="🎟️"
            metaKey="ingressos"
            metas={metas}
            setMetas={setMetas}
            formatVal={fmt}
            suffix=" ing."
            melhor={historico.melhorIngressos.valor}
            melhorEvento={historico.melhorIngressos.evento}
            media={historico.mediaIngressos}
            description="Total de ingressos vendidos no evento"
            totalEventos={totalEventos}
          />
          <MetaCard
            label="Receita de Bar"
            icon="🍷"
            metaKey="receitaBar"
            metas={metas}
            setMetas={setMetas}
            formatVal={fmtR}
            suffix=""
            melhor={historico.melhorBar.valor}
            melhorEvento={historico.melhorBar.evento}
            media={historico.mediaBar}
            description="Faturamento total do bar no evento"
            totalEventos={totalEventos}
          />
          <MetaCard
            label="Penetração de Bar"
            icon="📈"
            metaKey="penetracaoBar"
            metas={metas}
            setMetas={setMetas}
            formatVal={fmtPct}
            suffix="%"
            melhor={historico.melhorPenetracao.valor}
            melhorEvento={historico.melhorPenetracao.evento}
            media={historico.mediaPenetracao}
            description="% estimada de presentes que consumiram no bar"
            totalEventos={totalEventos}
          />
          <MetaCard
            label="No-show máximo"
            icon="🚫"
            metaKey="noShowMax"
            metas={metas}
            setMetas={setMetas}
            formatVal={fmtPct}
            suffix="%"
            melhor={historico.melhorNoShow.valor}
            melhorEvento={historico.melhorNoShow.evento}
            media={historico.mediaNoShow}
            description="Limite de ausência aceitável (menor = melhor)"
            reverse
            totalEventos={totalEventos}
          />
        </div>

        {/* Projeção financeira */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#c8a96e] mb-4">💰 Projeção Financeira da Meta</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(() => {
              const bilheteria = metas.ingressos * ticketMedio
              const bar = metas.receitaBar
              const totalReceita = bilheteria + bar
              const custoSympla = bilheteria * CUSTO_SYMPLA
              const cmvBar = bar * CMV_BAR
              const margem = totalReceita - custoSympla - cmvBar
              const margemPct = (margem / totalReceita * 100).toFixed(1)

              return [
                { label: 'Bilheteria estimada', val: fmtR(Math.round(bilheteria)), sub: `${fmt(metas.ingressos)} × R$${ticketMedio.toFixed(2)}` },
                { label: 'Receita total', val: fmtR(Math.round(totalReceita)), sub: 'bilheteria + bar' },
                { label: 'Custos variáveis', val: fmtR(Math.round(custoSympla + cmvBar)), sub: 'Sympla + CMV bar' },
                { label: 'Margem estimada', val: fmtR(Math.round(margem)), sub: `${margemPct}% da receita` },
              ].map(item => (
                <div key={item.label} className="bg-[#0a0a0a] rounded-lg p-3">
                  <div className="text-xs text-[#6b7280] mb-1">{item.label}</div>
                  <div className="text-base font-bold text-white">{item.val}</div>
                  <div className="text-xs text-[#4b5563] mt-0.5">{item.sub}</div>
                </div>
              ))
            })()}
          </div>
          <p className="text-xs text-[#4b5563] mt-3">
            * Projeção usa ticket médio real R${ticketMedio.toFixed(2)} | Sympla {(CUSTO_SYMPLA * 100).toFixed(1)}% | CMV bar {(CMV_BAR * 100).toFixed(0)}%.
          </p>
        </div>

        {/* Resumo comparativo */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#c8a96e] mb-4">📊 Resumo vs. Histórico</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f1f1f]">
                  {['Métrica', 'Sua Meta', 'Média Histórica', 'Melhor Histórico', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs text-[#6b7280] pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {[
                  {
                    label: 'Ingressos',
                    meta: fmt(metas.ingressos),
                    media: fmt(historico.mediaIngressos),
                    melhor: `${fmt(historico.melhorIngressos.valor)} (${historico.melhorIngressos.evento})`,
                    ok: metas.ingressos >= historico.mediaIngressos,
                  },
                  {
                    label: 'Receita Bar',
                    meta: fmtR(metas.receitaBar),
                    media: fmtR(historico.mediaBar),
                    melhor: `${fmtR(historico.melhorBar.valor)} (${historico.melhorBar.evento})`,
                    ok: metas.receitaBar >= historico.mediaBar,
                  },
                  {
                    label: 'Penetração Bar',
                    meta: fmtPct(metas.penetracaoBar) + '%',
                    media: fmtPct(historico.mediaPenetracao) + '%',
                    melhor: `${fmtPct(historico.melhorPenetracao.valor)}% (${historico.melhorPenetracao.evento})`,
                    ok: metas.penetracaoBar >= historico.mediaPenetracao,
                  },
                  {
                    label: 'No-show',
                    meta: fmtPct(metas.noShowMax) + '%',
                    media: fmtPct(historico.mediaNoShow) + '%',
                    melhor: `${fmtPct(historico.melhorNoShow.valor)}% (${historico.melhorNoShow.evento})`,
                    ok: metas.noShowMax <= historico.mediaNoShow,
                  },
                ].map(row => (
                  <tr key={row.label}>
                    <td className="py-2.5 pr-4 text-white font-medium">{row.label}</td>
                    <td className="py-2.5 pr-4 text-[#c8a96e] font-semibold">{row.meta}</td>
                    <td className="py-2.5 pr-4 text-[#9ca3af]">{row.media}</td>
                    <td className="py-2.5 pr-4 text-[#9ca3af]">{row.melhor}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${row.ok ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                        {row.ok ? '✓ Acima da média' : '⚠ Abaixo da média'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
