import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { subDays, subMonths, startOfDay, endOfDay } from 'date-fns'

/* ─── Types ─── */
export type PeriodPreset = '30d' | '90d' | '12m' | 'all'

export interface DateRange {
  start: Date
  end: Date
}

interface PeriodContextValue {
  /** Current selected period preset */
  period: PeriodPreset
  /** Update the selected period */
  setPeriod: (p: PeriodPreset) => void
  /**
   * Computed date range based on the selected period.
   * - `30d`, `90d`, `12m` → `{ start, end }` with start at 00:00 and end at 23:59
   * - `'all'` → `null` (no date filtering)
   */
  dateRange: DateRange | null
}

/* ─── Context ─── */
const PeriodContext = createContext<PeriodContextValue | null>(null)

/* ─── Provider ─── */
export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<PeriodPreset>('all')

  const dateRange = useMemo<DateRange | null>(() => {
    const now = new Date()
    const end = endOfDay(now)

    switch (period) {
      case '30d':
        return { start: startOfDay(subDays(now, 30)), end }
      case '90d':
        return { start: startOfDay(subDays(now, 90)), end }
      case '12m':
        return { start: startOfDay(subMonths(now, 12)), end }
      case 'all':
        return null
    }
  }, [period])

  return (
    <PeriodContext.Provider value={{ period, setPeriod, dateRange }}>
      {children}
    </PeriodContext.Provider>
  )
}

/* ─── Hook ─── */
export function usePeriod() {
  const ctx = useContext(PeriodContext)
  if (!ctx) {
    throw new Error('usePeriod() must be used within a <PeriodProvider>')
  }
  return ctx
}
