import type { Evento } from '@/data/events'
import { Calendar, MapPin, Clock } from 'lucide-react'

const statusLabels: Record<string, { label: string; class: string }> = {
  disponivel: { label: 'Disponível', class: 'text-success border-success/20 bg-success/5' },
  breve:      { label: 'Em Breve', class: 'text-gold border-gold/20 bg-gold-glow' },
  esgotado:   { label: 'Esgotado', class: 'text-danger border-danger/20 bg-danger/5' },
  encerrado:  { label: 'Encerrado', class: 'text-muted-foreground border-border bg-card' },
}

export function EventCard({ evento, index }: { evento: Evento; index: number }) {
  const st = statusLabels[evento.status] ?? statusLabels.breve

  return (
    <div className={`glass-card p-6 sm:p-8 animate-fade-up animate-fade-up-${Math.min(index + 1, 6)} ${evento.destaque ? 'ring-1 ring-gold/20' : ''}`}>
      {evento.destaque && (
        <span className="text-[0.55rem] tracking-[0.2em] uppercase text-gold font-medium mb-2 block">
          Destaque
        </span>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-lg sm:text-xl font-display font-light text-foreground leading-snug">
          {evento.titulo}
        </h3>
        <span className={`shrink-0 text-[0.6rem] tracking-wider uppercase px-2.5 py-1 rounded border ${st.class}`}>
          {st.label}
        </span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">
        {evento.descricao}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-5">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} className="text-gold-dim" />
          {new Date(evento.data + 'T20:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={13} className="text-gold-dim" />
          {evento.local}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {evento.tags.map(tag => (
            <span key={tag} className="text-[0.55rem] tracking-wider uppercase px-2 py-0.5 rounded bg-violet-glow text-violet border border-violet/15">
              {tag}
            </span>
          ))}
        </div>

        {evento.symplaUrl && evento.status === 'disponivel' && (
          <a
            href={evento.symplaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sympla-btn text-xs shrink-0"
          >
            Garantir Ingresso
          </a>
        )}
      </div>
    </div>
  )
}
