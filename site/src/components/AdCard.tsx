import type { Anuncio } from '@/data/ads'
import { Zap, Monitor, Gift, Mail } from 'lucide-react'

const tipoIcons: Record<string, typeof Zap> = {
  patrocinio: Zap,
  espaco: Monitor,
  midia: Mail,
}

const tipoLabels: Record<string, string> = {
  patrocinio: 'Patrocínio',
  espaco: 'Espaço Físico',
  midia: 'Mídia Digital',
}

export function AdCard({ anuncio, index }: { anuncio: Anuncio; index: number }) {
  const Icon = tipoIcons[anuncio.tipo] ?? Gift

  return (
    <div className={`glass-card p-5 animate-fade-up animate-fade-up-${Math.min(index + 1, 6)}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-gold-glow border border-gold/15 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-display font-light text-foreground">
            {anuncio.nome}
          </h3>
          <span className="text-[0.55rem] tracking-wider uppercase text-muted-foreground/60">
            {tipoLabels[anuncio.tipo]}
          </span>
        </div>
        <span className="text-sm font-medium text-gold shrink-0">{anuncio.valor}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {anuncio.descricao}
      </p>
      {anuncio.disponivel && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <a
            href="mailto:comercial@osarausecreto.com"
            className="inline-flex items-center gap-1.5 text-[0.6rem] tracking-wider uppercase text-violet hover:text-violet-dim transition-colors"
          >
            <Mail size={11} />
            comercial@osarausecreto.com
          </a>
        </div>
      )}
    </div>
  )
}
