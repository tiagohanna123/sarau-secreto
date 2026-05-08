import { usePeriod, type PeriodPreset } from './period-context'
import { cn } from './cn'

/* ─── Preset definitions ─── */
const PRESETS: { id: PeriodPreset; label: string }[] = [
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: '12m', label: '12m' },
  { id: 'all', label: 'Todas' },
]

/* ─── Pill‑style horizontal selector ─── */
export function PeriodFilter({ className }: { className?: string }) {
  const { period, setPeriod } = usePeriod()

  return (
    <div
      className={cn(
        'inline-flex gap-1 bg-muted border border-border rounded-lg p-0.5',
        className,
      )}
    >
      {PRESETS.map(p => {
        const active = period === p.id
        return (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={cn(
              'px-3 py-1.5 text-[11px] font-medium rounded-md transition-all select-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dim',
              active
                ? 'bg-gold text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]',
            )}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
