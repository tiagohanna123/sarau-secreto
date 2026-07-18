import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { FadeUp, SectionTitle } from '@/components/Shared'

export function HomePage({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <>
      {/* ─── HERO ─── */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background treatment */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-crimson-dark/10 via-transparent to-black/80" />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(220,38,38,0.06), transparent)',
          }} />
          {/* Abstract geometric pattern */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(220,38,38,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220,38,38,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-5 max-w-4xl mx-auto">
          <FadeUp>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="ss-emblem w-10 h-10 shadow-[0_0_30px_rgba(220,38,38,0.15)]">
                <span className="text-xs">SS</span>
              </div>
              <span className="text-[0.55rem] tracking-[0.3em] uppercase text-muted-foreground">2026 · No Caminho da Arte</span>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-normal leading-[1.08] text-foreground mb-4 tracking-[-0.03em]">
              A experiência musical<br />
              <span className="text-crimson">mais exclusiva</span><br />
              do Brasil
            </h1>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="text-[0.75rem] sm:text-sm text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              Música ao vivo, poesia, gastronomia e conexão humana. Menos de 100 pessoas por noite. Brasília, Rio de Janeiro, Lisboa.
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <div className="flex items-center justify-center gap-3">
              <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                className="btn-sympla text-xs px-6 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                Garantir Ingresso
              </a>
              <button onClick={() => onScrollTo('sobre')} className="btn-ghost text-xs px-6 py-3">
                Conhecer
              </button>
            </div>
          </FadeUp>

          {/* Stats */}
          <FadeUp delay={0.6}>
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-md mx-auto">
              {[
                { num: '700+', label: 'por edição' },
                { num: '25+', label: 'artistas' },
                { num: '3', label: 'cidades' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="stat-num">{s.num}</div>
                  <div className="text-[0.45rem] tracking-[0.2em] uppercase text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
        </motion.div>
      </section>

      {/* ─── SOBRE: COMO NASCEU ─── */}
      <section id="sobre" className="section relative">
        <div className="max-w-7xl mx-auto px-5">
          <SectionTitle label="2022 · Brasília" title="Como Nasceu" description="O Sarau Secreto nasceu em 2022, nas casas dos próprios organizadores em Brasília." />

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start max-w-5xl mx-auto">
            {/* Left: Timeline visual cards */}
            <div className="space-y-4">
              {[
                { year: '2022', title: 'A Primeira Edição', desc: 'Idealizado por Marvyn, JM e Thiago Jamelão. Nas casas dos organizadores em Brasília.' },
                { year: '2023', title: 'O Segredo se Espalha', desc: 'Informações mantidas em segredo até dias antes para evitar superlotação. Nasce o nome "Secreto".' },
                { year: '2024', title: 'Formato Consolidado', desc: '25+ artistas, banda sem ensaio, direção musical de Todd Henrique. Fenômeno cultural.' },
                { year: '2025', title: 'Expansão Nacional', desc: 'Rio de Janeiro e Lisboa. 700+ pessoas por edição. Metrópoles, Correio Braziliense, GPS Brasília.' },
              ].map((item, i) => (
                <FadeUp key={i} delay={i * 0.1}>
                  <div className="card p-5 flex gap-4 items-start">
                    <div className="text-crimson font-display text-xl leading-none mt-0.5 w-10 flex-shrink-0">{item.year}</div>
                    <div>
                      <h3 className="text-sm font-heading text-foreground mb-1">{item.title}</h3>
                      <p className="text-[0.7rem] text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>

            {/* Right: Description + Quote + Media */}
            <div className="space-y-6">
              <FadeUp delay={0.2}>
                <div className="card p-6">
                  <p className="text-[0.7rem] text-foreground/80 leading-relaxed mb-4">
                    O formato é único: cada artista se apresenta com uma banda sem ensaio prévio. Tudo resolvido ali, na hora, pela direção musical de Todd Henrique. A espontaneidade é a mágica.
                  </p>
                  <div className="border-l-2 border-crimson/20 pl-4">
                    <p className="text-[0.65rem] text-muted-foreground italic leading-relaxed">
                      "O Sarau Secreto nasceu da necessidade que a gente tinha de tocar nossa música, num espaço que a gente não se via contemplado."
                    </p>
                    <p className="text-[0.5rem] text-muted-foreground mt-2 tracking-wider">— JM, idealizador</p>
                  </div>
                </div>
              </FadeUp>

              {/* Midia logos */}
              <FadeUp delay={0.35}>
                <div className="card p-5">
                  <span className="text-[0.45rem] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Na Mídia</span>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {['Metrópoles', 'Correio Braziliense', 'GPS Brasília'].map(m => (
                      <span key={m} className="tag text-[0.5rem]">{m}</span>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {/* Pilares */}
              <FadeUp delay={0.5}>
                <div className="card p-5">
                  <span className="text-[0.45rem] tracking-[0.2em] uppercase text-muted-foreground font-semibold">A Experiência</span>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[
                      { icon: '♪', label: 'Música real', sub: 'Zero ensaio, tudo ao vivo' },
                      { icon: '✧', label: 'Curadoria', sub: 'Diversidade no palco' },
                      { icon: '◈', label: 'Única', sub: 'Nenhuma edição se repete' },
                      { icon: '⊜', label: 'Democrático', sub: 'Preços acessíveis' },
                    ].map((p, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border/50 bg-black/30">
                        <span className="text-crimson text-sm">{p.icon}</span>
                        <h4 className="text-[0.6rem] font-heading text-foreground mt-1">{p.label}</h4>
                        <p className="text-[0.5rem] text-muted-foreground mt-0.5">{p.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {/* Sonoridade */}
              <FadeUp delay={0.65}>
                <div className="card p-5">
                  <span className="text-[0.45rem] tracking-[0.2em] uppercase text-muted-foreground font-semibold">A Sonoridade</span>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['NeoSoul', 'R&B', 'MPB', 'Samba', 'Jazz', 'Gospel', 'Samba-Rock', 'Pop'].map(g => (
                      <span key={g} className="tag text-[0.45rem]">{g}</span>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {/* Cidades */}
              <FadeUp delay={0.8}>
                <div className="card p-5">
                  <span className="text-[0.45rem] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Onde Já Aconteceu</span>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {[
                      { city: 'Brasília', flag: '🇧🇷', desc: 'Berço do Sarau' },
                      { city: 'Rio de Janeiro', flag: '🇧🇷', desc: 'Edição Especial' },
                      { city: 'Lisboa', flag: '🇵🇹', desc: 'Internacional' },
                    ].map((c, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border/50 bg-black/30 flex items-center gap-3">
                        <span className="text-sm">{c.flag}</span>
                        <div>
                          <span className="text-[0.6rem] font-heading text-foreground">{c.city}</span>
                          <p className="text-[0.45rem] text-muted-foreground">{c.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
