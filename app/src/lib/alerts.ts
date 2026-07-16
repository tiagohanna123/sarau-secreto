// ─── Sistema de Alertas Automáticos — Sarau Secreto ───
// Lógica baseada em dados reais: 9 eventos set/2025–abr/2026

export type AlertSeverity = 'red' | 'yellow' | 'blue'

export interface SarauAlert {
  id: string
  severity: AlertSeverity
  emoji: string
  title: string
  body: string
  /** Valor atual que disparou o alerta */
  currentValue: string
  /** Limiar configurado */
  threshold: string
}

// ─── Dados reais consolidados ───
const DATA = {
  ingressos: 6896,
  checkins: 5572,
  receitaBar: 91469,
  receitaBilheteria: 322415,
  /** Estimativa de clientes únicos que compraram no bar (com base em 3352 itens e ticket ~R$27) */
  clientesBar: Math.round(91469 / 27.29),
  /** Distribuição de tipos de ingresso: Inteira ~60%, Meia ~22%, Aniversário ~18% */
  tipoMaisVendido_pct: 60,
  noShowRate: 19.2,
  /** Penetração bar = clientes bar / check-ins */
  barPenetracao: Math.round((91469 / 27.29) / 5572 * 100),
}

// ─── Limiares configuráveis ───
const THRESHOLDS = {
  noShowMax: 20,          // acima: alerta vermelho
  barPenetrMin: 40,       // abaixo: alerta amarelo
  concentracaoMax: 80,    // acima: alerta de diversificação
}

// ─── Avaliação dos alertas ───
export function computeAlerts(): SarauAlert[] {
  const alerts: SarauAlert[] = []

  // 1. No-show > 20% → vermelho
  if (DATA.noShowRate >= THRESHOLDS.noShowMax) {
    alerts.push({
      id: 'no-show-alto',
      severity: 'red',
      emoji: '⚠️',
      title: 'No-show acima do limiar',
      body: `Taxa de no-show em ${DATA.noShowRate}% — ${THRESHOLDS.noShowMax - DATA.noShowRate >= 0 ? 'dentro' : `${(DATA.noShowRate - THRESHOLDS.noShowMax).toFixed(1)}pp acima`} do limite de ${THRESHOLDS.noShowMax}%. Estratégia recomendada: lembretes D-3 e D-1 via WhatsApp podem reduzir até 30%.`,
      currentValue: `${DATA.noShowRate}%`,
      threshold: `> ${THRESHOLDS.noShowMax}%`,
    })
  }

  // 2. Penetração bar < 40% → amarelo
  if (DATA.barPenetracao < THRESHOLDS.barPenetrMin) {
    alerts.push({
      id: 'bar-penetracao-baixa',
      severity: 'yellow',
      emoji: '🍷',
      title: 'Penetração do bar abaixo da meta',
      body: `Apenas ${DATA.barPenetracao}% dos presentes consumiram no bar (meta: ${THRESHOLDS.barPenetrMin}%). Voucher de boas-vindas R$15 e cardápio visível na entrada podem ativar mais clientes.`,
      currentValue: `${DATA.barPenetracao}%`,
      threshold: `< ${THRESHOLDS.barPenetrMin}%`,
    })
  }

  // 3. Concentração > 80% em um tipo de ingresso → azul (diversificação)
  if (DATA.tipoMaisVendido_pct > THRESHOLDS.concentracaoMax) {
    alerts.push({
      id: 'concentracao-tipo-ingresso',
      severity: 'blue',
      emoji: '🎫',
      title: 'Vendas concentradas em um tipo de ingresso',
      body: `${DATA.tipoMaisVendido_pct}% das vendas são Inteira. Lotes diferenciados (VIP, Early Bird, Casal) distribuem receita e criam urgência de compra antecipada.`,
      currentValue: `${DATA.tipoMaisVendido_pct}%`,
      threshold: `> ${THRESHOLDS.concentracaoMax}%`,
    })
  }

  return alerts
}

// ─── Banner: retorna alertas no formato display ───
export function getActiveAlerts() {
  return computeAlerts()
}

export const ALERT_COLORS: Record<AlertSeverity, { bg: string; border: string; text: string; badge: string }> = {
  red:    { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.35)',   text: '#ef4444', badge: 'bg-red-500/20 text-red-400' },
  yellow: { bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.35)',   text: '#eab308', badge: 'bg-yellow-500/20 text-yellow-400' },
  blue:   { bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.35)',  text: '#22d3ee', badge: 'bg-cyan-500/20 text-cyan-400' },
}
