/* ── Componentes compartilhados ───────────────────────────── */
/* Re-exports do Design System + utilitários legados */

import { type ReactNode } from 'react'

export function Card({ label, value, sub, className }: { label: string; value: string; sub?: string; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-3.5 ${className || ''}`}>
      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
      {sub && <p className="text-[9px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  )
}

export function Skel() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-muted rounded w-1/3 mb-4" />
      <div className="h-40 bg-muted rounded" />
    </div>
  )
}

export const GOLD = '#c8a96e'
export const PURPLE = '#a78bfa'
export const VIOLET = '#8b5cf6'
export const BLUE = '#60a5fa'
export const GREEN = '#34d399'
export const PINK = '#f472b6'
export const ORANGE = '#fb923c'

export const PALETA = [GOLD, PURPLE, BLUE, GREEN, PINK, ORANGE]

/* ── Constantes de custo (centralizadas — usadas em financeiro, eventos, detail) ── */
export const CMV_BAR = 0.42        // 42% — custo mercadoria vendida (Yuzer)
export const TAXA_SYMPLA = 0.10    // 10% — taxa da plataforma (Sympla)
export const CUSTO_PRODUCAO = 12000 // R$ 12k/evento — produção (artista, equipe, espaço)

export const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

export const fmtNum = (n: number) => n.toLocaleString('pt-BR')

export const pct = (v: number | null) => v !== null ? `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` : '—'
export const pctAbs = (v: number | null) => v !== null ? `${v.toFixed(1)}%` : '—'

export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/* ── Tooltip de gráfico ── */
export function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const isCount = (n: string) => /pedidos|orders|itens|qty|itensVendidos/i.test(n)
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground text-[10px] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-foreground font-medium">
          {p.name}: {typeof p.value === 'number' ? (isCount(p.name) ? fmtNum(p.value) : fmt(p.value)) : p.value}
        </p>
      ))}
    </div>
  )
}

/* ── Re-export do Design System ─────────────────────────── */
export {
  SarauButton,
  SarauInput,
  SarauSelect,
  SarauSection,
  SarauTabs,
  SarauKPI,
  SarauBadge,
  GoldDivider,
  PageHeader,
  EmptyState,
  SarauTable,
  SourceBadge,
  SarauKPI as KPI,
} from './design-system'

/* ── Icon re-exports (lucide-react) ──────────────────── */
export {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  Wine,
  Brain,
  MessageSquare,
  UserCircle,
  Target,
  DollarSign,
  Activity,
  Download,
  Upload,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  GlassWater,
  Music,
  LineChart,
  PieChart,
  ScatterChart,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Sparkles,
  RefreshCw,
  ShoppingCart,
  CreditCard,
  Percent,
  Clock,
  Star,
  Zap,
  Flame,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
  Trash2,
  Edit3,
  Plus,
  Minus,
  Copy,
  ExternalLink,
} from 'lucide-react'
