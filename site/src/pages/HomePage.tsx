import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { FadeUp, SectionTitle } from '@/components/Shared'
import { HeroSpotlight } from '@/components/HeroSpotlight'

const REAL_PHOTOS = [
  { src: 'https://gpsbrasilia.com.br/wp-content/uploads/2023/09/Na_Praia_BS_Fotografias_cf08e4034c.jpg', alt: 'Plateia Sarau Secreto' },
  { src: 'https://images.metroimg.com/2023/09/07175650/Sarau-Secreto-3.jpeg', alt: 'Apresentação Sarau Secreto' },
  { src: 'https://images.metroimg.com/2023/09/07175647/Sarau-Secreto-2.jpeg', alt: 'Artistas no palco' },
  { src: 'https://midias.correiobraziliense.com.br/_midias/jpg/2023/07/05/675x450/1__mg_6785_2-28437321.jpg', alt: 'Momento do Sarau Secreto' },
]

export function HomePage({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.05])

  return (
    <>
      {/* ─── HERO ─── */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          {/* Hero background photo — real Sarau Secreto photo */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
            style={{
              backgroundImage: `url('https://images.metroimg.com/2023/09/07175650/Sarau-Secreto-3.jpeg?w=1920&q=85')`,
              filter: 'grayscale(30%)',
            }}
          />

          {/* Deep gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-crimson-dark/8 via-transparent to-black/90" />

          {/* Warm ambient glow */}
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse 70% 40% at 50% 35%, rgba(220,38,38,0.07), transparent),
              radial-gradient(ellipse 40% 30% at 20% 60%, rgba(127,29,29,0.03), transparent),
              radial-gradient(ellipse 40% 30% at 80% 60%, rgba(153,27,27,0.03), transparent)
            `,
          }} />

          {/* Geometrical grid pattern */}
          <div className="absolute inset-0 opacity-[0.012]" style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(220,38,38,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220,38,38,0.4) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />

          {/* Decorative floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-crimson/3 blur-[80px] animate-float" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-wine/3 blur-[100px] animate-float" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-crimson/2 blur-[60px] animate-float" style={{ animationDuration: '12s', animationDelay: '4s' }} />

          {/* Mouse-follow spotlight */}
          <HeroSpotlight />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-5 max-w-4xl mx-auto">
          <FadeUp>
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/assets/sarau/sarau-logo-white.png"
                alt="Sarau Secreto"
                className="w-10 h-11 object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.15)] hover:drop-shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-500"
              />
              <span className="text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground">2026 · No Caminho da Arte</span>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-normal leading-[1.06] text-foreground mb-4 tracking-[-0.03em]">
              A experiência musical<br />
              <span className="text-gradient">mais exclusiva</span><br />
              do Brasil
            </h1>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              Música ao vivo, gastronomia e conexão humana. Local secreto, revelado dias antes. Brasília, Rio de Janeiro, Lisboa.
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <div className="flex items-center justify-center gap-3">
              <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                className="btn-sympla text-sm px-7 py-3.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                Garantir Ingresso
              </a>
              <button onClick={() => onScrollTo('sobre')} className="btn-ghost text-sm px-7 py-3.5">Conhecer</button>
            </div>
          </FadeUp>

          {/* Stats */}
          <FadeUp delay={0.6}>
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
              {[
                { num: '700+', label: 'por edição' },
                { num: '25+', label: 'artistas' },
                { num: '3', label: 'cidades' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="stat-num">{s.num}</div>
                  <div className="text-sm tracking-[0.2em] uppercase text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* ─── SOBRE: COMO NASCEU — SINGLE COLUMN ─── */}
      <section id="sobre" className="section relative">
        {/* Logo watermark at section background */}
        <div className="absolute top-0 right-0 w-64 h-auto opacity-[0.06] pointer-events-none select-none overflow-hidden">
          <img src="/site/sarau-logo-white.png" alt="" className="w-full h-auto" />
        </div>

        <div className="max-w-4xl mx-auto px-5">
          <SectionTitle label="2022 · Brasília" title="Como Nasceu" description="O Sarau Secreto nasceu em 2022, nas casas dos próprios organizadores em Brasília." />

          {/* Timeline - single column, full width */}
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical timeline line */}
            <div className="absolute left-[1.125rem] md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-crimson/20 via-crimson/10 to-transparent" />

            {[
              {
                year: '2022',
                title: 'A Primeira Edição',
                desc: 'Idealizado por Marvyn, JM e Thiago Jamelão. Nasceu nas casas dos organizadores em Brasília — um encontro intimista que virou movimento.',
                img: 'https://images.metroimg.com/2023/09/07175647/Sarau-Secreto-2.jpeg',
              },
              {
                year: '2023',
                title: 'O Segredo se Espalha',
                desc: 'Informações mantidas em segredo até dias antes para evitar superlotação. Nasce o nome "Secreto". A mídia começa a cobrir: Metrópoles, Correio Braziliense, GPS Brasília.',
                img: 'https://midias.correiobraziliense.com.br/_midias/jpg/2023/07/05/675x450/1__mg_6785_2-28437321.jpg',
              },
              {
                year: '2024',
                title: 'Formato Consolidado',
                desc: '25+ artistas por edição, banda sem ensaio, direção musical de Todd Henrique. O formato espontâneo se consolida como fenômeno cultural da capital.',
                img: 'https://gpsbrasilia.com.br/wp-content/uploads/2023/09/Na_Praia_BS_Fotografias_cf08e4034c.jpg',
              },
              {
                year: '2025',
                title: 'Expansão Nacional',
                desc: 'Rio de Janeiro e Lisboa. 700+ pessoas por edição. O Sarau cruza fronteiras e leva a experiência única para além de Brasília.',
                img: 'https://images.metroimg.com/2023/09/07175650/Sarau-Secreto-3.jpeg',
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="relative pl-10 md:pl-16 pb-12 last:pb-0">
                  {/* Timeline dot */}
                  <div className="absolute left-[0.6rem] md:left-[1.65rem] top-1.5 w-2.5 h-2.5 rounded-full bg-crimson shadow-[0_0_8px_rgba(220,38,38,0.3)] z-10" />

                  {/* Year badge */}
                  <div className="text-crimson font-display text-lg md:text-xl font-normal mb-2 tracking-wide">
                    {item.year}
                  </div>

                  {/* Content card */}
                  <div className="card overflow-hidden">
                    <div className="md:flex">
                      {/* Image */}
                      <div className="md:w-48 md:flex-shrink-0 h-48 md:h-auto overflow-hidden">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-full object-cover md:h-48"
                          loading="lazy"
                        />
                      </div>
                      {/* Text */}
                      <div className="p-5 md:p-6">
                        <h3 className="text-lg font-heading text-foreground mb-2">{item.title}</h3>
                        <p className="text-[0.9375rem] text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Quote block - separated from timeline */}
          <FadeUp delay={0.5}>
            <div className="max-w-3xl mx-auto mt-8 card p-6 md:p-8">
              <div className="border-l-2 border-crimson/20 pl-4 md:pl-6">
                <p className="text-base md:text-lg text-muted-foreground italic leading-relaxed">
                  "O Sarau Secreto nasceu da necessidade que a gente tinha de tocar nossa música, num espaço que a gente não se via contemplado."
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-crimson/20 to-wine/20 flex items-center justify-center text-crimson font-heading text-sm">JM</div>
                  <div>
                    <p className="text-sm text-foreground font-heading">JM</p>
                    <p className="text-xs text-muted-foreground tracking-wider">Idealizador do Sarau Secreto</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Bottom stats row with logo */}
          <FadeUp delay={0.6}>
            <div className="max-w-3xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { num: '2022', label: 'Ano de Fundação' },
                { num: '700+', label: 'Público por Edição' },
                { num: '3', label: 'Cidades' },
                { num: '25+', label: 'Artistas' },
                ].map((s, i) => (
                  <div key={i} className="card p-4 text-center">
                    <div className="stat-num text-3xl md:text-4xl">{s.num}</div>
                    <div className="text-[0.8rem] tracking-[0.2em] uppercase text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
            </div>
          </FadeUp>

          {/* Na Mídia + Logos */}
          <FadeUp delay={0.7}>
            <div className="max-w-3xl mx-auto mt-6 card p-5 flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground font-semibold">Na Mídia</span>
              <div className="flex flex-wrap gap-3">
                {['Metrópoles', 'Correio Braziliense', 'GPS Brasília'].map(m => (
                  <span key={m} className="tag">{m}</span>
                ))}
              </div>
              <div className="hidden md:block w-px h-6 bg-border" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <img src="/site/sarau-logo-white.png" alt="" className="h-8 w-auto opacity-50" />
                <span className="text-sm tracking-[0.15em] uppercase">Sarau Secreto</span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── A EXPERIÊNCIA ─── */}
      <section className="section relative">
        {/* Logo watermark */}
        <div className="absolute top-0 left-0 w-56 h-auto opacity-[0.02] pointer-events-none select-none overflow-hidden">
          <img src="/site/sarau-logo-white.png" alt="" className="w-full h-auto" />
        </div>
        <div className="max-w-7xl mx-auto px-5">
          <SectionTitle
            label="A Experiência"
            title="O Que Torna o Sarau Único"
            description="Cada edição é irrepetível. Música ao vivo sem ensaio, repertório autoral e clássicos revisitados."
          />

          <div className="max-w-5xl mx-auto">
            {/* Pilars grid */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: '♪', label: 'Música real', sub: 'Zero ensaio, tudo ao vivo. A magia está na espontaneidade.' },
                { icon: '✧', label: 'Curadoria', sub: 'Diversidade e representatividade no centro do palco.' },
                { icon: '◈', label: 'Única', sub: 'Nenhuma edição se repete. Cada sarau é uma obra efêmera.' },
                { icon: '⊜', label: 'Democrático', sub: 'Preços acessíveis. Arte para todos, sem barreiras.' },
              ].map((p, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <div className="card p-5 h-full text-center hover:translate-y-[-2px] transition-all duration-300">
                    <span className="text-crimson text-3xl block mb-3">{p.icon}</span>
                    <h4 className="text-base font-heading text-foreground mb-1">{p.label}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.sub}</p>
                  </div>
                </FadeUp>
              ))}
            </div>

            {/* Sonoridade tags */}
            <FadeUp delay={0.4}>
              <div className="mt-8 card p-5">
                <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground font-semibold">A Sonoridade</span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['NeoSoul', 'R&B', 'MPB', 'Samba', 'Jazz', 'Gospel', 'Samba-Rock', 'Pop'].map(g => (
                    <span key={g} className="tag">{g}</span>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Cidades */}
            <FadeUp delay={0.5}>
              <div className="mt-6 card p-5">
                <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground font-semibold">Onde Já Aconteceu</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  {[
                    { city: 'Brasília', flag: '🇧🇷', desc: 'Berço do Sarau. Onde tudo começou em 2022.' },
                    { city: 'Rio de Janeiro', flag: '🇧🇷', desc: 'Edição Especial no Centro do Rio.' },
                    { city: 'Lisboa', flag: '🇵🇹', desc: 'Primeira edição internacional.' },
                  ].map((c, i) => (
                    <div key={i} className="p-4 rounded-lg border border-border/50 bg-black/40 hover:bg-black/60 transition-colors duration-300 text-center">
                      <span className="text-3xl block mb-2">{c.flag}</span>
                      <span className="text-base font-heading text-foreground">{c.city}</span>
                      <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ─── DIVISOR COM LOGO ─── */}
      <div className="py-8 md:py-12 flex items-center justify-center gap-6">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-crimson/20" />
        <div className="flex items-center gap-3">
          <img src="/site/sarau-logo-white.png" alt="SS" className="h-12 w-auto opacity-40" />
          <span className="text-sm tracking-[0.3em] uppercase text-muted-foreground/50">No Caminho da Arte</span>
        </div>
        <div className="h-px w-16 bg-gradient-to-r from-crimson/20 to-transparent" />
      </div>

      {/* ─── FOTOS ─── */}
      <section className="section relative">
        {/* Logo watermark */}
        <div className="absolute bottom-0 left-0 w-48 h-auto opacity-[0.04] pointer-events-none select-none overflow-hidden">
          <img src="/site/sarau-logo-white.png" alt="" className="w-full h-auto" />
        </div>

        <div className="max-w-7xl mx-auto px-5">
          <SectionTitle
            label="Galeria"
            title="Momentos do Sarau"
            description="Imagens reais que contam a história do festival cultural mais exclusivo do Brasil."
          />

          <FadeUp>
            <div className="max-w-6xl mx-auto">
              {/* Hero image - full width */}
              <div className="card overflow-hidden group mb-4">
                <img
                  src={REAL_PHOTOS[0].src}
                  alt={REAL_PHOTOS[0].alt}
                  className="w-full h-72 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">{REAL_PHOTOS[0].alt}</p>
                </div>
              </div>

              {/* Thumbnail grid */}
              <div className="grid md:grid-cols-3 gap-4">
                {REAL_PHOTOS.slice(1).map((photo, i) => (
                  <FadeUp key={i} delay={i * 0.1}>
                    <div className="card overflow-hidden group">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="p-3">
                        <p className="text-sm text-muted-foreground">{photo.alt}</p>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── ARTISTAS QUEM JÁ PASSOU ─── */}
      <section className="section relative">
        {/* Logo watermark */}
        <div className="absolute top-0 right-0 w-52 h-auto opacity-[0.015] pointer-events-none select-none overflow-hidden -scale-x-100">
          <img src="/site/sarau-logo-white.png" alt="" className="w-full h-auto" />
        </div>
        <div className="max-w-7xl mx-auto px-5">
          <SectionTitle
            label="Artistas"
            title="Quem Já Passou Pelo Palco"
            description="O sarau já reuniu nomes consagrados e talentos emergentes da cena independente brasileira."
          />

          <FadeUp>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap justify-center gap-3">
                {['Sandra de Sá', 'Luedji Luna', 'Jotapê', 'Fat Family', 'Os Garotin', 'Jean Tassy', 'Marvyn', 'Israel Paixão', 'Bell Lins', 'Laady B', 'Cecília Marcos', 'Gabi Blue', 'Nat Telles', 'Vitu Voz'].map((name, i) => (
                  <span key={i} className="tag text-sm px-4 py-2">{name}</span>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
