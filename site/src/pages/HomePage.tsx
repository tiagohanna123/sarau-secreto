<<<<<<< Updated upstream
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
=======
import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ExternalLink, Quote, ArrowDown } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'

const pilares = [
  { titulo: 'Musica real, sem filtro', desc: '25+ artistas, uma banda, zero ensaio. A direcao musical de Todd Henrique resolve tudo ao vivo.' },
  { titulo: 'Curadoria de artistas', desc: 'Diversidade, representatividade e inclusao no centro do palco. Espaco para quem a cena sempre negligenciou.' },
  { titulo: 'Experiencia unica', desc: 'Nenhuma edicao se repete. Data, local e lineup sao surpresa. Cada sarau e uma obra efemera.' },
  { titulo: 'Acesso democratico', desc: 'Precos acessiveis e espacos que acolhem. Arte nao tem preco minimo pra existir.' },
]

export function HomePage({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroParallax1 = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroParallax2 = useTransform(scrollYProgress, [0, 1], [0, -80])
  const heroParallax3 = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4, 0.7], [1, 0.8, 0])
  const springParallax1 = useSpring(heroParallax1, { stiffness: 50, damping: 20 })
  const springParallax2 = useSpring(heroParallax2, { stiffness: 50, damping: 20 })
  const springParallax3 = useSpring(heroParallax3, { stiffness: 50, damping: 20 })

  return (
    <>
      {/* ════════════════════════════════════════
           HERO — Cinematic scroll parallax
         ════════════════════════════════════════ */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ perspective: '1200px' }}>

        {/* Background depth layers — each moves at different speed */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ y: springParallax1 }}
        >
          <div className="absolute w-[1000px] h-[1000px] rounded-full bg-violet/[0.02] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animation: 'orb-drift 20s ease-in-out infinite' }} />
          <div className="absolute w-[700px] h-[700px] rounded-full bg-gold/[0.03] top-[20%] left-[60%] -translate-x-1/2 -translate-y-1/2" style={{ animation: 'orb-drift 25s ease-in-out infinite reverse' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-violet/[0.015] bottom-[15%] right-[60%] -translate-x-1/2 -translate-y-1/2" style={{ animation: 'orb-drift 30s ease-in-out infinite' }} />
        </motion.div>

        {/* Light particles */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: springParallax3 }}>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold/20"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${5 + Math.random() * 90}%`,
                animation: `pulse-soft ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
              }}
            />
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-3xl mx-auto"
          style={{ scale: heroScale, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[0.5rem] tracking-[0.35em] uppercase text-gold-dim font-medium inline-block"
              style={{ textShadow: '0 0 20px rgba(201,155,90,0.15)' }}>
              SS 2026 · No Caminho da Arte
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[0.55rem] tracking-[0.25em] text-muted-foreground block mt-3">
              ACONTECE QUANDO MENOS SE ESPERA
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, clipPath: 'inset(0 100% 0 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-3xl sm:text-5xl lg:text-[4.5rem] font-display font-light text-foreground leading-[1.05] tracking-tight"
          >
            A experiencia musical
            <br />
            <span className="text-gold" style={{ textShadow: '0 0 40px rgba(201,155,90,0.08)' }}>
              mais exclusiva do Brasil
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Festival sociocultural nascido em Brasilia. Artistas locais, nacionais e internacionais em
            apresentacoes intimistas. Diversidade, representatividade e grandes vozes em destaque.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
              className="sympla-btn text-sm flex items-center gap-2">
              <ExternalLink size={14} />
              Garantir Ingresso
            </a>
            <button onClick={() => onScrollTo('sobre')}
              className="btn-secondary text-sm">
              Conhecer o Sarau
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            {[
              { value: '700+', label: 'por edicao' },
              { value: '25+', label: 'artistas' },
              { value: '3', label: 'cidades' },
            ].map((s, i) => (
              <div key={s.label} className="text-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="stat-num block"
                >
                  {s.value}
                </motion.span>
                <span className="text-[0.5rem] tracking-[0.2em] uppercase text-muted-foreground mt-1 block">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="text-[0.45rem] tracking-[0.3em] uppercase text-muted-foreground/40 mt-2"
          >
            Brasilia · Rio · Lisboa
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ y: springParallax2 }}
        >
          <span className="text-[0.4rem] tracking-[0.3em] uppercase text-muted-foreground/30">Role</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={14} className="text-muted-foreground/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
           CHAPTER 1 — Como Nasceu (Sobre)
         ════════════════════════════════════════ */}
      <section id="sobre" className="section-chapter relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <span className="text-[0.5rem] tracking-[0.3em] uppercase text-gold-dim font-medium block text-center">
              2022 · Brasilia
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-light text-foreground text-center mt-3 mb-16">
              Como Nasceu
            </h2>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto space-y-7 text-sm sm:text-base text-muted-foreground leading-[1.8]">
            <ScrollReveal mode="clip-left" delay={0.1}>
              <p>
                O Sarau Secreto nasceu em 2022, nas casas dos proprios organizadores em Brasilia.
                Idealizado por <strong className="text-foreground font-medium">Marvyn</strong> (cantor e compositor),
                <strong className="text-foreground font-medium"> JM</strong> (cantor, musico e produtor) e
                <strong className="text-foreground font-medium"> Thiago Jamelao</strong> (cantor e compositor),
                o evento surgiu da necessidade de criar um espaco para artistas independentes que nao
                se viam contemplados na cena musical da capital.
              </p>
            </ScrollReveal>
            <ScrollReveal mode="clip-right" delay={0.15}>
              <p>
                Desde o inicio, a proposta foi muito bem recebida — tanto que as informacoes precisavam
                ser mantidas em segredo ate pouco antes do evento, para evitar superlotacao. Dai vem o
                nome: <strong className="text-foreground font-medium">Secreto</strong>. Data, hora e local sao
                revelados poucos dias antes, e as atracoes so sao anunciadas na hora.
              </p>
            </ScrollReveal>
            <ScrollReveal mode="clip-left" delay={0.2}>
              <p>
                O formato e unico: cerca de 25 artistas se apresentam com uma banda sem ensaio previo.
                Tudo e resolvido ali, na hora, atraves da direcao musical de{' '}
                <strong className="text-foreground font-medium">Todd Henrique</strong>. Alguns sao convidados,
                outros aparecem para compor o lineup — e essa espontaneidade e justamente a magica do sarau.
              </p>
            </ScrollReveal>
            <ScrollReveal mode="clip-right" delay={0.25}>
              <p>
                Hoje o Sarau Secreto atrai em media 700 pessoas por edicao, podendo ultrapassar 1.200 em
                eventos maiores. De Brasilia, o movimento ja se expandiu para o Rio de Janeiro e Lisboa,
                em Portugal — consolidando-se como um fenomeno cultural que vai muito alem do palco.
              </p>
            </ScrollReveal>
          </div>

          {/* Quote */}
          <ScrollReveal mode="perspective" delay={0.3} className="mt-12">
            <div className="glass-premium p-8 sm:p-10 max-w-2xl mx-auto text-center relative">
              <Quote size={20} className="text-gold-dim/20 mx-auto mb-4" />
              <blockquote className="text-sm sm:text-base text-foreground/80 font-display font-light leading-relaxed italic">
                &ldquo;O Sarau Secreto nasceu da necessidade que a gente tinha de tocar nossa musica,
                num espaco que a gente nao se via contemplado.&rdquo;
              </blockquote>
              <p className="text-xs text-muted-foreground mt-4">— JM, idealizador do Sarau Secreto</p>
              <div className="absolute inset-0 rounded-[inherit] pointer-events-none"
                style={{
                  background: 'radial-gradient(800px circle at 50% 50%, var(--color-gold-glow), transparent 60%)',
                  opacity: 0.15,
                }}
              />
            </div>
          </ScrollReveal>

          {/* Midia */}
          <ScrollReveal delay={0.4} className="mt-12 text-center">
            <p className="text-[0.45rem] tracking-[0.35em] uppercase text-muted-foreground mb-4">NA MIDIA</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['Metropoles', 'Correio Braziliense', 'GPS Brasilia'].map(m => (
                <span key={m} className="text-[0.5rem] tracking-wider uppercase px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-border-hover transition-all duration-300">
                  {m}
                </span>
              ))}
            </div>
          </ScrollReveal>

          {/* Pilares */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pilares.map((p, i) => (
              <ScrollReveal key={p.titulo} mode="scale-in" delay={i * 0.08} margin="-30px">
                <div className="glass-premium p-6 text-center group h-full">
                  <div className="w-11 h-11 rounded-xl bg-gold-subtle border border-gold/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-glow group-hover:border-gold/20 transition-all duration-500">
                    <span className="text-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500">&#9835;</span>
                  </div>
                  <h3 className="text-sm font-display font-light text-foreground mb-2 group-hover:text-gold transition-colors duration-300">{p.titulo}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Generos */}
          <ScrollReveal delay={0.45} className="mt-16 text-center">
            <p className="text-[0.45rem] tracking-[0.35em] uppercase text-gold-dim mb-5">A SONORIDADE</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['NeoSoul', 'R&B', 'MPB', 'Samba', 'Jazz', 'Gospel', 'Samba-Rock', 'Pop'].map((g, i) => (
                <motion.span
                  key={g}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="text-xs px-3 py-1.5 rounded-full border border-gold/12 text-gold-dim bg-gold-subtle hover:bg-gold-glow hover:border-gold/25 transition-all duration-200"
                >
                  {g}
                </motion.span>
              ))}
            </div>
          </ScrollReveal>

          {/* Locais */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { flag: '🇧🇷', cidade: 'Brasilia', desc: 'Berc-o do Sarau. Onde tudo comecou em 2022, nas casas dos idealizadores.' },
              { flag: '🇧🇷', cidade: 'Rio de Janeiro', desc: 'Edicao especial no Centro do Rio, reunindo artistas cariocas e convidados internacionais.' },
              { flag: '🇵🇹', cidade: 'Lisboa', desc: 'Primeira edicao internacional, levando a experiencia para a Europa.' },
            ].map((l, i) => (
              <ScrollReveal key={l.cidade} mode="perspective" delay={i * 0.1} margin="-30px">
                <div className="glass-premium p-5 text-center group">
                  <motion.span
                    className="text-3xl block mb-3"
                    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {l.flag}
                  </motion.span>
                  <h3 className="text-sm font-display font-light text-foreground group-hover:text-gold transition-colors duration-300 mb-1">{l.cidade}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{l.desc}</p>
                </div>
              </ScrollReveal>
>>>>>>> Stashed changes
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
