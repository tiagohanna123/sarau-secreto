import { FadeUp, SectionTitle } from '@/components/Shared'

const REAL_PHOTOS = [
  'https://images.metroimg.com/2023/09/07175650/Sarau-Secreto-3.jpeg',
  'https://images.metroimg.com/2023/09/07175647/Sarau-Secreto-2.jpeg',
  'https://midias.correiobraziliense.com.br/_midias/jpg/2023/07/05/675x450/1__mg_6785_2-28437321.jpg',
  'https://gpsbrasilia.com.br/wp-content/uploads/2023/09/Na_Praia_BS_Fotografias_cf08e4034c.jpg',
]

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

function ArtistPhoto({ name, index }: { name: string; index: number }) {
  const photo = REAL_PHOTOS[index % REAL_PHOTOS.length]
  return (
    <div className="w-full aspect-square rounded-xl mb-2.5 relative overflow-hidden group">
      <img
        src={photo}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-xs text-white/70">{name}</span>
      </div>
    </div>
  )
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
                <ArtistPhoto name={artist.name} index={i} />
                <h3 className="text-sm font-heading text-foreground leading-tight">{artist.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{artist.role}</p>
                <span className="inline-block mt-1 tag">{artist.genre}</span>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Destaque call */}
        <FadeUp delay={0.4}>
          <div className="max-w-xl mx-auto mt-10 text-center card p-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-crimson/3 blur-[50px]" />
            <span className="text-lg font-display text-crimson">♫</span>
            <h3 className="text-sm font-heading text-foreground mt-2">Quer se apresentar?</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Siga @osarausecreto no Instagram. Chamadas abertas são anunciadas por lá.
            </p>
            <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
              className="btn-ghost text-xs mt-4 inline-flex">
              Seguir no Instagram
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
