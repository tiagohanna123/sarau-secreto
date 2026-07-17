import { motion } from 'framer-motion'
import type { Anuncio } from '@/data/ads'
import { Zap, Monitor, Mail, Gift } from 'lucide-react'

const tipoIcons: Record<string, typeof Zap> = {
  patrocinio: Zap,
  espaco: Monitor,
  midia: Mail,
}
const tipoLabels: Record<string, string> = {
  patrocinio: 'Patrocinio',
  espaco: 'Espaco Fisico',
  midia: 'Midia Digital',
}

export function AdCard({ anuncio, index }: { anuncio: Anuncio; index: number }) {
  const Icon = tipoIcons[anuncio.tipo] ?? Gift

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="glass-premium p-5 group relative"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-crimson-subtle border border-crimson/8 flex items-center justify-center shrink-0 group-hover:bg-crimson-glow group-hover:border-crimson/15 transition-all duration-500">
          <Icon size={16} className="text-crimson-dim group-hover:text-crimson transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-display font-light text-foreground group-hover:text-crimson transition-colors duration-300">
            {anuncio.nome}
          </h3>
          <span className="text-[0.45rem] tracking-[0.15em] uppercase text-muted-foreground/50">
            {tipoLabels[anuncio.tipo]}
          </span>
        </div>
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
          className="text-sm font-medium text-crimson shrink-0 tracking-wide"
        >
          {anuncio.valor}
        </motion.span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {anuncio.descricao}
      </p>
      {anuncio.disponivel && (
        <div className="mt-3 pt-3 border-t border-border/20">
          <a href="mailto:comercial@osarausecreto.com"
            className="inline-flex items-center gap-1.5 text-[0.5rem] tracking-wider uppercase text-crimson hover:text-crimson-dim transition-colors group-hover:opacity-100 opacity-70">
            <Mail size={11} />
            comercial@osarausecreto.com
          </a>
        </div>
      )}
    </motion.div>
  )
}
