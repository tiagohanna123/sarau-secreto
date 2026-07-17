import type { Artista } from '@/data/artists'
import { Music, Instagram, Headphones } from 'lucide-react'

export function ArtistCard({ artista, index }: { artista: Artista; index: number }) {
  return (
    <div className={`glass-card p-5 animate-fade-up animate-fade-up-${Math.min(index + 1, 6)} ${artista.destaque ? 'ring-1 ring-gold/15' : ''}`}>
      {/* Avatar placeholder */}
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/10 to-violet/10 border border-border mb-4 flex items-center justify-center">
        {artista.foto ? (
          <img src={artista.foto} alt={artista.nome} className="w-full h-full rounded-full object-cover" />
        ) : (
          <Music size={20} className="text-gold-dim/40" />
        )}
      </div>

      <h3 className="text-sm font-display font-light text-foreground mb-0.5">
        {artista.nome}
      </h3>
      <p className="text-[0.6rem] tracking-wider uppercase text-gold-dim mb-3">
        {artista.estilo}
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
        {artista.bio}
      </p>

      {artista.redes && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
          {artista.redes.instagram && (
            <span className="flex items-center gap-1 text-[0.55rem] text-muted-foreground">
              <Instagram size={10} className="text-violet-dim" />
              {artista.redes.instagram}
            </span>
          )}
          {artista.redes.soundcloud && (
            <span className="flex items-center gap-1 text-[0.55rem] text-muted-foreground">
              <Headphones size={10} className="text-violet-dim" />
              {artista.redes.soundcloud}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
