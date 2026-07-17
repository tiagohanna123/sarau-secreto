import { motion } from 'framer-motion'
import type { Evento } from '@/data/events'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'

const statusLabels: Record<string, { label: string; class: string }> = {
  disponivel: { label: 'Disponivel', class: 'bg-success/8 text-success border-success/15' },
  breve:      { label: 'Em Breve', class: 'bg-crimson-glow text-crimson border-crimson/15' },
  esgotado:   { label: 'Esgotado', class: 'bg-danger/8 text-danger border-danger/15' },
  encerrado:  { label: 'Encerrado', class: 'bg-card text-muted-foreground border-border' },
}

export function EventCard({ evento, index }: { evento: Evento; index: number }) {
  const st = statusLabels[evento.status] ?? statusLabels.breve
  const isLeft = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: isLeft ? 4 : -4 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.9,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="glass-premium p-6 sm:p-8 group relative overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-crimson/0 via-crimson/[0.02] to-wine/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-[0.55rem] font-mono text-crimson-dim/50 font-light">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <h3 className="text-lg sm:text-xl font-display font-light text-foreground leading-snug">
              {evento.titulo}
            </h3>
          </div>
          <span className={`shrink-0 badge border ${st.class}`}>
            {st.label}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {evento.descricao}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
          {evento.data && (
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-crimson-dim/60" />
              {new Date(evento.data + 'T20:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric'
              })}
            </span>
          )}
          {evento.local && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="text-crimson-dim/60" />
              {evento.local}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {evento.tags.map(tag => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>

        {evento.symplaUrl && (
          <div className="pt-4 border-t border-border/30">
            <a href={evento.symplaUrl} target="_blank" rel="noopener noreferrer"
              className="sympla-btn inline-flex items-center gap-1.5 text-[0.55rem]">
              <ArrowRight size={12} />
              {evento.status === 'disponivel' ? 'Garantir Ingresso' : 'Ver no Sympla'}
            </a>
          </div>
        )}
      </div>
    </motion.div>
  )
}
