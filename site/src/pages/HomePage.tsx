import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { FadeUp, SectionTitle } from '@/components/Shared'

export function HomePage({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <>
      {/* ─── HERO ─── */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-crimson-dark/5 via-transparent to-black/90" />
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse 60% 40% at 20% 30%, rgba(220,38,38,0.04), transparent),
              radial-gradient(ellipse 50% 30% at 80% 60%, rgba(220,38,38,0.03), transparent),
              radial-gradient(ellipse 40% 50% at 50% 80%, rgba(127,29,29,0.04), transparent)
            `,
          }} />
          <div className="absolute inset-0 opacity-[0.012]" style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(220,38,38,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220,38,38,0.4) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }} />
        </motion.div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{ top: '15%', left: '10%', background: 'radial-gradient(circle, rgba(220,38,38,0.06), transparent 70%)' }}
          />
          <motion.div
            animate={{ y: [0, 15, 0], opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{ bottom: '20%', right: '10%', background: 'radial-gradient(circle, rgba(127,29,29,0.05), transparent 70%)' }}
          />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-5 max-w-4xl mx-auto">
          <FadeUp>
            <div className="flex justify-center mb-6">
              <img src="./sarau-logo-white.png" alt="Sarau Secreto" className="h-24 md:h-32 w-auto opacity-90" />
            </div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="text-[0.6rem] md:text-xs text-muted-foreground tracking-[0.3em] uppercase max-w-lg mx-auto mb-8">
              A experiência musical mais exclusiva do Brasil
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                className="btn-sympla text-xs px-6 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                Garantir Ingresso
              </a>
              <button onClick={() => onScrollTo('experiencia')} className="btn-ghost text-xs px-6 py-3">
                Conhecer
              </button>
            </div>
          </FadeUp>
          <FadeUp delay={0.45}>
            <div className="flex items-center justify-center gap-8 md:gap-12 mt-12">
              {[
                { num: '700+', label: 'por edição' },
                { num: '25+', label: 'artistas' },
                { num: '3', label: 'cidades' },
                { num: '2022', label: 'fundação' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="stat-num">{s.num}</div>
                  <div className="text-[0.45rem] tracking-[0.2em] uppercase text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground pointer-events-none"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
        </motion.div>
      </section>

      {/* ─── COMO NASCEU ─── */}
      <section id="sobre" className="section relative">
        <div className="max-w-7xl mx-auto px-5">
          <SectionTitle label="2022 · Brasília" title="Como Nasceu" description="O Sarau Secreto nasceu em 2022, nas casas dos organizadores em Brasília. Cada artista se apresenta com banda sem ensaio prévio." />

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start max-w-5xl mx-auto">
            <div className="space-y-3">
              {[
                { year: '2022', title: 'A Primeira Edição', desc: 'Idealizado por Marvyn, JM e Thiago Jamelão. Nas casas dos organizadores em Brasília.' },
                { year: '2023', title: 'O Segredo se Espalha', desc: 'Informações mantidas em segredo até dias antes. Nasce o nome "Secreto".' },
                { year: '2024', title: 'Formato Consolidado', desc: '25+ artistas, banda sem ensaio, direção musical de Todd Henrique.' },
                { year: '2025', title: 'Expansão Nacional', desc: 'Rio de Janeiro e Lisboa. 700+ pessoas por edição. Mídia nacional.' },
              ].map((item, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <div className="card p-4 flex gap-4 items-start group hover:border-crimson/15 transition-all">
                    <div className="text-crimson font-display text-xl leading-none mt-0.5 w-10 flex-shrink-0">{item.year}</div>
                    <div>
                      <h3 className="text-sm font-heading text-foreground mb-1">{item.title}</h3>
                      <p className="text-[0.65rem] text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>

            <div className="space-y-4">
              <FadeUp delay={0.15}>
                <div className="card p-5">
                  <div className="border-l-2 border-crimson/20 pl-4">
                    <p className="text-[0.6rem] text-muted-foreground italic leading-relaxed">
                      "O Sarau Secreto nasceu da necessidade que a gente tinha de tocar nossa música, num espaço que a gente não se via contemplado."
                    </p>
                    <p className="text-[0.5rem] text-muted-foreground mt-2 tracking-wider">— JM, idealizador</p>
                  </div>
                </div>
              </FadeUp>

              <FadeUp delay={0.3}>
                <div className="card p-4">
                  <span className="text-[0.45rem] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Na Mídia</span>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['Metrópoles', 'Correio Braziliense', 'GPS Brasília'].map(m => (
                      <span key={m} className="tag text-[0.5rem]">{m}</span>
                    ))}
                  </div>
                </div>
              </FadeUp>

              <div className="grid grid-cols-2 gap-3">
                <FadeUp delay={0.55}>
                  <div className="card p-3">
                    <span className="text-[0.4rem] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Sonoridade</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['NeoSoul', 'R&B', 'MPB', 'Samba'].map(g => (
                        <span key={g} className="tag text-[0.4rem]">{g}</span>
                      ))}
                    </div>
                  </div>
                </FadeUp>
                <FadeUp delay={0.65}>
                  <div className="card p-3">
                    <span className="text-[0.4rem] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Cidades</span>
                    <div className="flex flex-col gap-1.5 mt-2">
                      {[
                        { city: 'Brasília', flag: '🇧🇷' },
                        { city: 'Rio de Janeiro', flag: '🇧🇷' },
                        { city: 'Lisboa', flag: '🇵🇹' },
                      ].map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs">{c.flag}</span>
                          <span className="text-[0.5rem] text-foreground/70">{c.city}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeUp>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── A EXPERIÊNCIA ─── */}
      <section id="experiencia" className="section relative overflow-hidden">
        {/* Background atmosférico */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 50% 30% at 30% 20%, rgba(220,38,38,0.04), transparent 60%),
            radial-gradient(ellipse 40% 40% at 70% 70%, rgba(127,29,29,0.03), transparent 50%),
            radial-gradient(ellipse 60% 20% at 50% 50%, rgba(220,38,38,0.02), transparent 70%)
          `,
        }} />

        <div className="max-w-7xl mx-auto px-5">
          <SectionTitle label="A Experiência" title="O Que Torna o Sarau Único" description="Não é só um show. É um encontro. Cada detalhe pensado para que a noite seja inesquecível." />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              {
                icon: '♪',
                title: 'Música Real',
                desc: 'Zero playback. Banda formada na hora. Cada artista sobe com os músicos sem ensaio prévio — o que acontece no palco é único e irreproduzível.',
                gradient: 'from-crimson/8 via-transparent to-transparent',
              },
              {
                icon: '✦',
                title: 'Curadoria Afetiva',
                desc: 'Diversidade no palco é regra, não exceção. NeoSoul, R&B, MPB, Samba, Gospel, Samba-Rock — o Sarau é um mapa da música preta brasileira.',
                gradient: 'from-crimson/5 via-transparent to-transparent',
              },
              {
                icon: '◈',
                title: 'Experiência Imersiva',
                desc: 'Menos de 100 pessoas por noite. Open bar incluso. Local fechado e decorado. Telão interativo com letras — você canta junto.',
                gradient: 'from-crimson/8 via-transparent to-transparent',
              },
              {
                icon: '⊜',
                title: 'Democrático',
                desc: 'Preços acessíveis. Estacionamento gratuito. Sem frescura — o Sarau é pra quem ama música de verdade, não pra quem quer status.',
                gradient: 'from-crimson/5 via-transparent to-transparent',
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="card p-6 md:p-7 h-full flex flex-col relative overflow-hidden group"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-10 h-10 rounded-full bg-crimson/10 flex items-center justify-center mb-4 group-hover:bg-crimson/15 transition-colors">
                      <span className="text-lg text-crimson">{item.icon}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-display text-foreground mb-3 leading-snug">{item.title}</h3>
                    <p className="text-[0.7rem] md:text-[0.75rem] text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>

          {/* CTA no final da seção */}
          <FadeUp delay={0.4}>
            <div className="text-center mt-10">
              <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                className="btn-sympla text-xs px-8 py-3">
                Viver essa experiência
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── FULL-WIDTH PHOTO STRIP ─── */}
      <section className="relative overflow-hidden w-full" style={{ height: '200px' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          background: `
            radial-gradient(circle at 15% 50%, rgba(220,38,38,0.1), transparent 40%),
            radial-gradient(circle at 85% 50%, rgba(127,29,29,0.08), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(220,38,38,0.04), transparent 50%)
          `,
        }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-6 md:gap-10">
            {['♪', '✦', '◈', '♫', '✧', '⊜'].map((sym, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-2xl md:text-3xl text-crimson/10"
              >
                {sym}
              </motion.span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
