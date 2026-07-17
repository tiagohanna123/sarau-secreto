import { motion } from 'framer-motion'
import type { Artista } from '@/data/artists'
import { Music, Instagram, Sparkles } from 'lucide-react'

export function ArtistCard({ artista, index }: { artista: Artista; index: number }) {
  const isLeft = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.8,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`glass-premium p-5 group relative ${artista.destaque ? 'ring-1 ring-gold/12' : ''}`}
    >
      {/* Glow overlay */}
      <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: 'radial-gradient(600px circle at 50% 50%, var(--color-gold-glow), transparent 60%)',
        }}
      />

      <div className="relative">
        {/* Avatar */}
        <div className="relative w-14 h-14 rounded-full mb-4 overflow-hidden ring-1 ring-gold/10 group-hover:ring-gold/25 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/12 to-violet/12" />
          {artista.foto ? (
            <img src={artista.foto} alt={artista.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={18} className="text-gold-dim/30 group-hover:text-gold-dim/50 transition-colors duration-500" />
            </div>
          )}
          {artista.destaque && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold flex items-center justify-center shadow-[0_0_12px_rgba(201,155,90,0.3)]"
            >
              <Sparkles size={8} className="text-background" />
            </motion.div>
          )}
        </div>

        <h3 className="text-sm font-display font-light text-foreground group-hover:text-gold transition-colors duration-300">
          {artista.nome}
        </h3>
        <p className="text-[0.5rem] tracking-[0.15em] uppercase text-gold-dim mt-0.5 mb-2.5">
          {artista.estilo}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {artista.bio}
        </p>

        {artista.redes?.instagram && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/20">
            <Instagram size={10} className="text-violet-dim" />
            <span className="text-[0.5rem] text-muted-foreground tracking-wider">
              {artista.redes.instagram}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
