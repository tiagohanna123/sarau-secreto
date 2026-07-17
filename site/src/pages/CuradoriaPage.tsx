import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FadeUp } from '@/components/Shared'

const ARTISTS = [
  { name: 'Sandra de Sá', role: 'Cantora', genre: 'MPB' },
  { name: 'Luedji Luna', role: 'Cantora', genre: 'NeoSoul' },
  { name: 'Jotapê', role: 'Cantor', genre: 'R&B' },
  { name: 'Fat Family', role: 'Grupo', genre: 'Gospel/Soul' },
  { name: 'Os Garotin', role: 'Grupo', genre: 'Samba-Rock' },
  { name: 'Jean Tassy', role: 'Cantor', genre: 'MPB' },
  { name: 'Marvyn', role: 'Cantor', genre: 'R&B' },
  { name: 'Israel Paixão', role: 'Cantor', genre: 'Gospel' },
  { name: 'Bell Lins', role: 'Cantor', genre: 'MPB' },
  { name: 'Laady B', role: 'Cantora', genre: 'Pop' },
  { name: 'Cecília Marcos', role: 'Cantora', genre: 'MPB' },
  { name: 'Gabi Blue', role: 'Cantora', genre: 'NeoSoul' },
  { name: 'Nat Telles', role: 'Cantora', genre: 'Pop' },
  { name: 'Vitu Voz', role: 'Cantor', genre: 'R&B' },
]

function ArtistGradient(name: string) {
  const hue = (name.length * 23) % 360
  return `linear-gradient(145deg, hsl(${hue}, 20%, 10%), hsl(${(hue + 40) % 360}, 15%, 6%))`
}

function ArtistInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export function CuradoriaPage() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })

  return (
    <section id="artistas" ref={sectionRef} className="section relative overflow-hidden">
      {/* Background ambient */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(220,38,38,0.08), transparent)',
      }} />

      <div className="max-w-7xl mx-auto px-5">
        <FadeUp>
          <div className="text-center mb-8">
            <span className="text-[0.5rem] tracking-[0.25em] uppercase text-crimson-dim font-semibold">Artistas</span>
            <h2 className="text-2xl md:text-4xl mt-2 text-foreground">Quem Já Passou Por Aqui</h2>
            <p className="text-[0.7rem] text-muted-foreground mt-2 max-w-xl mx-auto leading-relaxed">
              Diversidade, representatividade e inclusão no centro do palco.
            </p>
            <div className="divider" />
          </div>
        </FadeUp>

        {/* Grid vertical — responsivo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 max-w-6xl mx-auto">
          {ARTISTS.map((artist, i) => {
            const initials = ArtistInitials(artist.name)
            const gradient = ArtistGradient(artist.name)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.03, duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="card p-2.5 hover:border-crimson/15 transition-all duration-300 group cursor-default"
                >
                  {/* Photo placeholder */}
                  <div
                    className="w-full aspect-[3/4] rounded-xl relative overflow-hidden mb-2.5"
                    style={{ background: gradient }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-display text-white/[0.04] group-hover:text-crimson/[0.06] transition-colors duration-500">
                        {initials}
                      </span>
                    </div>
                    <div className="absolute inset-0" style={{
                      background: 'radial-gradient(ellipse 80% 30% at 50% 10%, rgba(255,255,255,0.03), transparent 70%)',
                    }} />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  {/* Info */}
                  <div className="px-0.5">
                    <h3 className="text-[0.6rem] font-heading text-foreground leading-tight truncate">{artist.name}</h3>
                    <p className="text-[0.45rem] text-muted-foreground mt-0.5 truncate">{artist.role}</p>
                    <span className="inline-block mt-1.5 tag text-[0.35rem]">{artist.genre}</span>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <FadeUp delay={0.3}>
          <div className="max-w-xl mx-auto mt-8 text-center card p-5">
            <span className="text-lg font-display text-crimson">♫</span>
            <h3 className="text-sm font-heading text-foreground mt-2">Quer se apresentar?</h3>
            <p className="text-[0.6rem] text-muted-foreground mt-1 leading-relaxed">
              Siga @osarausecreto no Instagram. Chamadas abertas são anunciadas por lá.
            </p>
            <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
              className="btn-ghost text-xs mt-3">
              Seguir no Instagram
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
