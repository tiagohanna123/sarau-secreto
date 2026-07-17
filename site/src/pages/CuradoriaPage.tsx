import { motion } from 'framer-motion'
import { SectionTitle } from '@/components/SectionTitle'
import { ScrollReveal } from '@/components/ScrollReveal'
import { ArtistCard } from '@/components/ArtistCard'
import { artistas, curadoriaAreas } from '@/data/artists'
import { Music, Palette, Sparkles, Heart, Instagram, ArrowUpRight } from 'lucide-react'

const areaIcons: Record<string, typeof Music> = {
  music: Music,
  palette: Palette,
  sparkles: Sparkles,
  heart: Heart,
}

export function CuradoriaPage() {
  return (
    <section id="artistas" className="section-chapter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionTitle
          label="Artistas"
          title="Quem Ja Passou pelo Palco"
          subtitle="O Sarau ja reuniu nomes consagrados e talentos emergentes da cena independente brasileira e internacional. Sandra de Sa, Luedji Luna, Fat Family e muitos outros."
        />

        {/* Areas de curadoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {curadoriaAreas.map((area, i) => {
            const Icon = areaIcons[area.icone] ?? Music
            return (
              <ScrollReveal key={area.titulo} mode="scale-in" delay={i * 0.08} margin="-30px">
                <div className="glass-premium p-5 text-center group h-full">
                  <div className="w-10 h-10 rounded-xl bg-gold-subtle border border-gold/8 flex items-center justify-center mx-auto mb-3 group-hover:bg-gold-glow group-hover:border-gold/15 transition-all duration-500">
                    <Icon size={18} className="text-gold-dim group-hover:text-gold transition-colors" />
                  </div>
                  <h3 className="text-sm font-display font-light text-foreground mb-2 group-hover:text-gold transition-colors duration-300">{area.titulo}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{area.descricao}</p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Artistas grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {artistas.map((artista, i) => (
            <ArtistCard key={artista.id} artista={artista} index={i} />
          ))}
        </div>

        {/* Chamada para artistas */}
        <ScrollReveal mode="perspective" delay={0.3} className="mt-16">
          <div className="glass-premium p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-violet/[0.02] to-transparent pointer-events-none" />
            <div className="relative">
              <h3 className="text-lg font-display font-light text-foreground mb-2">
                Quer subir no palco?
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
                Artistas, musicos, poetas: o Sarau Secreto tem chamada aberta. Siga @osarausecreto no Instagram e fique de olho nos anuncios.
              </p>
              <a href="https://instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-gold border border-gold/20 rounded-xl px-5 py-2.5 hover:bg-gold-glow hover:border-gold/30 transition-all duration-300">
                <Instagram size={14} />
                @osarausecreto
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
