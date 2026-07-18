import { FadeUp, SectionTitle } from '@/components/Shared'

const ARTISTS = [
  { name: 'Sandra de Sá', role: 'Cantora', genre: 'MPB' },
  { name: 'Luedji Luna', role: 'Cantora', genre: 'NeoSoul' },
  { name: 'Jotapê', role: 'Cantor', genre: 'R&B' },
  { name: 'Fat Family', role: 'Grupo', genre: 'Gospel/Soul' },
  { name: 'Os Garotin', role: 'Grupo', genre: 'Samba-Rock' },
  { name: 'Jean Tassy', role: 'Cantor', genre: 'MPB' },
  { name: 'Marvyn', role: 'Cantor/Compositor', genre: 'R&B' },
  { name: 'Israel Paixão', role: 'Cantor', genre: 'Gospel' },
  { name: 'Bell Lins', role: 'Cantor', genre: 'MPB' },
  { name: 'Laady B', role: 'Cantora', genre: 'Pop' },
  { name: 'Cecília Marcos', role: 'Cantora', genre: 'MPB' },
  { name: 'Gabi Blue', role: 'Cantora', genre: 'NeoSoul' },
  { name: 'Nat Telles', role: 'Cantora', genre: 'Pop' },
  { name: 'Vitu Voz', role: 'Cantor', genre: 'R&B' },
]

function ArtistInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function ArtistGradient(name: string) {
  // Deterministic gradient based on name
  const hue = (name.length * 23) % 360
  return `linear-gradient(135deg, hsl(${hue}, 20%, 12%), hsl(${(hue + 30) % 360}, 15%, 8%))`
}

export function CuradoriaPage() {
  return (
    <section id="artistas" className="section relative">
      <div className="max-w-7xl mx-auto px-5">
        <SectionTitle
          label="Curadoria"
          title="Quem Já Passou Pelo Palco"
          description="Diversidade, representatividade e inclusão no centro do palco."
        />

        {/* Artist grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 max-w-6xl mx-auto">
          {ARTISTS.map((artist, i) => (
            <FadeUp key={i} delay={i * 0.04}>
              <div className="card p-3 text-center group cursor-default hover:border-crimson/20 transition-all duration-300">
                {/* Photo placeholder */}
                <div className="w-full aspect-square rounded-xl mb-2.5 relative overflow-hidden"
                  style={{ background: ArtistGradient(artist.name) }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-display text-muted-foreground/20 group-hover:text-crimson/20 transition-colors duration-500">
                      {ArtistInitials(artist.name)}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-[0.6rem] font-heading text-foreground leading-tight">{artist.name}</h3>
                <p className="text-[0.45rem] text-muted-foreground mt-0.5">{artist.role}</p>
                <span className="inline-block mt-1 tag text-[0.35rem]">{artist.genre}</span>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Destaque call */}
        <FadeUp delay={0.4}>
          <div className="max-w-xl mx-auto mt-8 text-center card p-6">
            <span className="text-lg font-display text-crimson">♫</span>
            <h3 className="text-sm font-heading text-foreground mt-2">Quer se apresentar?</h3>
            <p className="text-[0.65rem] text-muted-foreground mt-1 leading-relaxed">
              Siga @osarausecreto no Instagram. Chamadas abertas são anunciadas por lá.
            </p>
            <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
              className="btn-ghost text-xs mt-4">
              Seguir no Instagram
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
