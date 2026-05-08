import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'
import type { ChartSpec } from '@/lib/llm'

const GOLD    = '#c8a96e'
const VIOLET  = '#8b5cf6'
const COLORS  = ['#c8a96e','#8b5cf6','#60a5fa','#34d399','#f87171','#fbbf24','#a78bfa','#38bdf8']
const TT      = { background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12, color: '#e5e7eb' }
const TT_L    = { color: GOLD, fontWeight: 600 }
const TT_I    = { color: '#e5e7eb' }
const AXIS    = { fill: '#6b7280', fontSize: 11 }

interface Props { spec: ChartSpec }

export function ChartRenderer({ spec }: Props) {
  const { type, title, data, xKey = 'name', yKey = 'value', lines } = spec

  return (
    <div style={{ marginTop: 12 }}>
      {title && <p style={{ color: GOLD, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey={xKey} tick={AXIS} />
            <YAxis tick={AXIS} width={50} />
            <Tooltip contentStyle={TT} labelStyle={TT_L} itemStyle={TT_I} />
            <Bar dataKey={yKey} fill={GOLD} radius={[4,4,0,0]} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey={xKey} tick={AXIS} />
            <YAxis tick={AXIS} width={50} />
            <Tooltip contentStyle={TT} labelStyle={TT_L} itemStyle={TT_I} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            {lines
              ? lines.map((k, i) => <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3, fill: COLORS[i] }} />)
              : <Line type="monotone" dataKey={yKey} stroke={GOLD} strokeWidth={2} dot={{ r: 3, fill: GOLD }} />
            }
          </LineChart>
        ) : type === 'area' ? (
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey={xKey} tick={AXIS} />
            <YAxis tick={AXIS} width={50} />
            <Tooltip contentStyle={TT} labelStyle={TT_L} itemStyle={TT_I} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            {lines
              ? lines.map((k, i) => (
                  <Area key={k} type="monotone" dataKey={k} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                ))
              : <Area type="monotone" dataKey={yKey} stroke={GOLD} fill={GOLD} fillOpacity={0.15} strokeWidth={2} />
            }
          </AreaChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={TT} labelStyle={TT_L} itemStyle={TT_I} />
          </PieChart>
        ) : type === 'scatter' ? (
          <ScatterChart margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="x" tick={AXIS} name={xKey} />
            <YAxis dataKey="y" tick={AXIS} width={50} name={yKey} />
            <Tooltip contentStyle={TT} labelStyle={TT_L} itemStyle={TT_I} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill={VIOLET} />
          </ScatterChart>
        ) : <div />}
      </ResponsiveContainer>
    </div>
  )
}
