/* ── Sarau Secreto Design System ──────────────────────────────
 * Componentes padronizados inspirados em shadcn/ui, Linear e Tailwind UI.
 * Todas as cores via variáveis CSS do tema — sem hex hardcoded.
 * ├─ Botões (primary, ghost, violet, danger, outline)
 * ├─ Inputs + Select + Textarea
 * ├─ Section Card padronizado
 * ├─ Tabs (underline style)
 * ├─ KPI Card
 * ├─ Badge (gold, violet, success, danger, warning)
 * ├─ Divider (gold line)
 * ├─ PageHeader
 * ├─ EmptyState
 * └─ Table wrapper
 */

import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react'
import { cn } from './cn'

/* ─── Botões ─── */
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'violet' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const btnBase = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 select-none disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold-dim)]'

const btnVariants: Record<string, string> = {
  primary: 'bg-gold text-black hover:opacity-85 active:scale-[0.97]',
  ghost:  'bg-transparent text-muted-foreground border border-border hover:text-foreground hover:border-gold/30 active:scale-[0.97]',
  violet: 'bg-violet text-white hover:opacity-85 active:scale-[0.97]',
  danger: 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25 active:scale-[0.97]',
  outline: 'bg-transparent text-foreground border border-white/10 hover:bg-white/[0.05] active:scale-[0.97]',
}

const btnSizes: Record<string, string> = {
  sm: 'px-2.5 py-1.5 text-[11px]',
  md: 'px-4 py-2 text-[13px]',
  lg: 'px-5 py-2.5 text-[14px]',
}

export function SarauButton({ variant = 'ghost', size = 'md', loading, children, className, disabled, ...props }: BtnProps) {
  return (
    <button className={cn(btnBase, btnVariants[variant], btnSizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <span className="h-3 w-3 rounded-full border border-current border-r-transparent animate-spin" />}
      {children}
    </button>
  )
}

/* ─── Inputs ─── */
interface InpProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function SarauInput({ label, error, className, id, ...props }: InpProps) {
  const lid = id || props.name
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={lid} className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>}
      <input id={lid}
        className={cn(
          'w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground outline-none',
          'transition-colors focus:border-gold-dim',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error && <span className="text-[10px] text-danger">{error}</span>}
    </div>
  )
}

/* ─── Select ─── */
export function SarauSelect({ label, className, children, ...props }: { label?: string; className?: string; children: ReactNode; [key: string]: any }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>}
      <select className={cn(
        'w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none',
        'transition-colors focus:border-gold-dim',
        className
      )} {...props}>
        {children}
      </select>
    </div>
  )
}

/* ─── Section Card ─── */
interface SectionProps {
  title?: string
  children: ReactNode
  className?: string
  action?: ReactNode
  noPadding?: boolean
}

export function SarauSection({ title, children, className, action, noPadding }: SectionProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl transition-colors hover:border-gold/20', className)}>
      {title && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h3 className="text-xs font-semibold text-foreground/[0.9]">{title}</h3>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  )
}

/* ─── Tabs (pill style, like Linear) ─── */
interface TabItem { id: string; label: string; icon?: ReactNode }

export function SarauTabs({ tabs, active, onChange, className }: {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn('flex gap-1 bg-muted border border-border rounded-lg p-0.5', className)}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-md transition-all',
            active === t.id ? 'bg-gold text-black shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}>
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ─── KPI Card ─── */
export function SarauKPI({ label, value, sub, className, trend }: {
  label: string
  value: string
  sub?: string
  className?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className={cn(
      'bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:bg-card-hover hover:border-gold/35 hover:scale-[1.02] cursor-default sarau-fade-up',
      className
    )}>
      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-base font-bold text-foreground tracking-tight">{value}</p>
      {sub && (
        <p className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
          {trend === 'up' && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
          )}
          {trend === 'down' && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
            </svg>
          )}
          {sub}
        </p>
      )}
    </div>
  )
}

/* ─── Badges ─── */
const badgeVariants: Record<string, string> = {
  gold:   'bg-gold/15 text-gold border border-gold/25',
  violet: 'bg-violet/15 text-violet border border-violet/25',
  success: 'bg-success/15 text-success border border-success/25',
  danger: 'bg-danger/15 text-danger border border-danger/25',
  warning: 'bg-warning/15 text-warning border border-warning/25',
  neutral: 'bg-muted text-muted-foreground border border-border',
}

export function SarauBadge({ variant = 'gold', children, className }: {
  variant?: keyof typeof badgeVariants
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
      badgeVariants[variant],
      className
    )}>
      {children}
    </span>
  )
}

/* ─── Divider ─── */
export function GoldDivider({ className }: { className?: string }) {
  return <div className={cn('h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-30 my-4', className)} />
}

/* ─── PageHeader ─── */
export function PageHeader({ title, subtitle, action, source }: {
  title: string
  subtitle?: string
  action?: ReactNode
  source?: 'live' | 'backup' | 'insights' | 'empty'
}) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {subtitle}
            {source && (
              <>
                <span className="mx-1.5">·</span>
                <span className={source === 'live' ? 'text-success' : 'text-gold'}>
                  {source === 'live' ? 'ao vivo' : 'backup'}
                </span>
              </>
            )}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* ─── Empty State ─── */
export function EmptyState({ icon, title, description }: {
  icon?: ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-muted-foreground mb-3 opacity-40">{icon}</div>}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">{description}</p>}
    </div>
  )
}

/* ─── Table wrapper ─── */
export function SarauTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full data-table">{children}</table>
    </div>
  )
}

/* ─── Source badge helpers ─── */
export function SourceBadge({ source }: { source?: 'live' | 'backup' }) {
  if (!source) return null
  return <SarauBadge variant={source === 'live' ? 'success' : 'gold'}>{source === 'live' ? 'Ao vivo' : 'Backup'}</SarauBadge>
}
