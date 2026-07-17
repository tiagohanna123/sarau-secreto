import { SectionTitle } from '@/components/SectionTitle'
import { ArtistCard } from '@/components/ArtistCard'
import { artistas, curadoriaAreas } from '@/data/artists'
import { Music, Palette, UtensilsCrossed, BookOpen } from 'lucide-react'

const areaIcons: Record<string, typeof Music> = {
  music: Music,
  palette: Palette,
  utensils: UtensilsCrossed,
  book: BookOpen,
}

export function CuradoriaPage() {
  return (
    <section id="curadoria" className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionTitle
          label="Curadoria"
          title="Quem Faz a Noite Acontecer"
          subtitle="Artistas selecionados a dedo. Cada edição do Sarau Secreto é construída por um conselho rotativo de curadores que escolhem música, artes, gastronomia e literatura."
        />

        {/* Areas de curadoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {curadoriaAreas.map((area, i) => {
            const Icon = areaIcons[area.icone] ?? Music
            return (
              <div key={area.titulo} className={`glass-card p-5 text-center animate-fade-up animate-fade-up-${Math.min(i + 1, 6)}`}>
                <div className="w-10 h-10 rounded-lg bg-gold-glow border border-gold/15 flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-gold" />
                </div>
                <h3 className="text-sm font-display font-light text-foreground mb-2">{area.titulo}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{area.descricao}</p>
              </div>
            )
          })}
        </div>

        {/* Artistas em destaque */}
        <h3 className="text-center text-sm tracking-[0.2em] uppercase text-muted-foreground mb-8">
          Artistas em Destaque
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {artistas.filter(a => a.destaque).map((artista, i) => (
            <ArtistCard key={artista.id} artista={artista} index={i} />
          ))}
        </div>

        {/* Todos os artistas */}
        <div className="mt-16">
          <div className="gold-line max-w-[60px] mx-auto mb-8" />
          <h3 className="text-center text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
            Todos os Artistas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {artistas.filter(a => !a.destaque).map((artista, i) => (
              <ArtistCard key={artista.id} artista={artista} index={i} />
            ))}
          </div>
        </div>

        {/* Chamada para artistas */}
        <div className="mt-16 glass-card p-8 text-center">
          <h3 className="text-lg font-display font-light text-foreground mb-2">
            Quer participar?
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
            Artistas, músicos, poetas, chefs e performers: o Sarau Secreto tem chamada aberta para novas edições.
          </p>
          <a
            href="mailto:curadoria@osarausecreto.com"
            className="inline-block text-xs text-violet hover:text-violet-dim transition-colors px-4 py-2 border border-violet/20 rounded-lg hover:bg-violet-glow"
          >
            Envie seu portfólio → curadoria@osarausecreto.com
          </a>
        </div>
      </div>
    </section>
  )
}
