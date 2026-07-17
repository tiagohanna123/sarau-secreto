import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ExternalLink, Quote, ArrowDown } from 'lucide-react'
import { ScrollReveal, ParallaxLayer } from '@/components/ScrollReveal'

const pilares = [
  { titulo: 'Música real, sem filtro', desc: '25+ artistas, uma banda, zero ensaio. A direção musical de Todd Henrique resolve tudo ao vivo.' },
  { titulo: 'Curadoria de artistas', desc: 'Diversidade, representatividade e inclusão no centro do palco. Espaço para quem a cena sempre negligenciou.' },
  { titulo: 'Experiência única', desc: 'Nenhuma edição se repete. Data, local e lineup são surpresa. Cada sarau é uma obra efêmera.' },
  { titulo: 'Acesso democrático', desc: 'Preços acessíveis e espaços que acolhem. Arte não tem preço mínimo pra existir.' },
]

export function HomePage({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroParallax1 = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroParallax2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const heroParallax3 = useTransform(scrollYProgress, [0, 1], [0, 250])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 0.7, 0])
  const springP1 = useSpring(heroParallax1, { stiffness: 50, damping: 20 })
  const springP2 = useSpring(heroParallax2, { stiffness: 50, damping: 20 })
  const springP3 = useSpring(heroParallax3, { stiffness: 50, damping: 20 })

  return (
    <>
      {/* ════════════════════════════════════════
           HERO — Cinematic blood-red parallax
         ════════════════════════════════════════ */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Background — deep red glow orbs */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: springP1 }}>
          <div className="absolute w-[900px] h-[900px] rounded-full bg-crimson/[0.015] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
          <div className="absolute w-[600px] h-[600px] rounded-full bg-wine/[0.02] top-[15%] left-[55%] -translate-x-1/2 -translate-y-1/2" style={{ animation: 'pulse-slow 8s ease-in-out infinite reverse' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-crimson/[0.01] bottom-[20%] right-[55%] -translate-x-1/2 -translate-y-1/2" />
        </motion.div>

        {/* Equalizer visualizer */}
        <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none" style={{ y: springP3 }}>
          <div className="eq-container opacity-[0.03] scale-[3]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="eq-bar" />
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-3xl mx-auto"
          style={{ scale: heroScale, opacity: heroOpacity }}
        >
          {/* SS 2026 tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[0.45rem] tracking-[0.35em] uppercase text-crimson-dim font-medium inline-block">
              SS 2026 · No Caminho da Arte
            </span>
          </motion.div>

          {/* ACONTECE QUANDO MENOS SE ESPERA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-[0.5rem] tracking-[0.25em] text-muted-foreground block mt-3">
              ACONTECE QUANDO MENOS SE ESPERA
            </span>
          </motion.div>

          {/* H1 — massive title with clip-path reveal */}
          <motion.h1
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 text-3xl sm:text-5xl lg:text-[4.5rem] font-display font-light text-foreground leading-[1.05] tracking-tight"
          >
            A experiência musical
            <br />
            <span className="text-crimson" style={{ textShadow: '0 0 40px rgba(220,38,38,0.08)' }}>
              mais exclusiva do Brasil
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Festival sociocultural nascido em Brasília. Artistas locais, nacionais e internacionais em
            apresentações intimistas. Diversidade, representatividade e grandes vozes em destaque.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
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
            transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            {[
              { value: '700+', label: 'por edição' },
              { value: '25+', label: 'artistas' },
              { value: '3', label: 'cidades' },
            ].map((s, i) => (
              <div key={s.label} className="text-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
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
            transition={{ duration: 0.6, delay: 1.7 }}
            className="text-[0.45rem] tracking-[0.3em] uppercase text-muted-foreground/40 mt-2"
          >
            Brasília · Rio · Lisboa
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ y: springP2 }}
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
           CHAPTER 1 — Como Nasceu
           Unique animation: ink-drip reveals
         ════════════════════════════════════════ */}
      <section id="sobre" className="section-chapter relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <span className="text-[0.5rem] tracking-[0.3em] uppercase text-crimson-dim font-medium block text-center">
              2022 · Brasília
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-light text-foreground text-center mt-3 mb-16">
              Como Nasceu
            </h2>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto space-y-7 text-sm sm:text-base text-muted-foreground leading-[1.8]">
            <ScrollReveal mode="ink-drip" delay={0.1}>
              <p>
                O Sarau Secreto nasceu em 2022, nas casas dos próprios organizadores em Brasília.
                Idealizado por <strong className="text-foreground font-medium">Marvyn</strong> (cantor e compositor),
                <strong className="text-foreground font-medium"> JM</strong> (cantor, músico e produtor) e
                <strong className="text-foreground font-medium"> Thiago Jamelão</strong> (cantor e compositor),
                o evento surgiu da necessidade de criar um espaço para artistas independentes que não
                se viam contemplados na cena musical da capital.
              </p>
            </ScrollReveal>
            <ScrollReveal mode="clip-right" delay={0.15}>
              <p>
                Desde o início, a proposta foi muito bem recebida — tanto que as informações precisavam
                ser mantidas em segredo até pouco antes do evento, para evitar superlotação. Daí vem o
                nome: <strong className="text-foreground font-medium">Secreto</strong>. Data, hora e local são
                revelados poucos dias antes, e as atrações só são anunciadas na hora.
              </p>
            </ScrollReveal>
            <ScrollReveal mode="ink-drip" delay={0.2}>
              <p>
                O formato é único: cerca de 25 artistas se apresentam com uma banda sem ensaio prévio.
                Tudo é resolvido ali, na hora, através da direção musical de{' '}
                <strong className="text-foreground font-medium">Todd Henrique</strong>. Alguns são convidados,
                outros aparecem para compor o lineup — e essa espontaneidade é justamente a mágica do sarau.
              </p>
            </ScrollReveal>
            <ScrollReveal mode="clip-right" delay={0.25}>
              <p>
                Hoje o Sarau Secreto atrai em média 700 pessoas por edição, podendo ultrapassar 1.200 em
                eventos maiores. De Brasília, o movimento já se expandiu para o Rio de Janeiro e Lisboa,
                em Portugal — consolidando-se como um fenômeno cultural que vai muito além do palco.
              </p>
            </ScrollReveal>
          </div>

          {/* Quote JM — perspective reveal */}
          <ScrollReveal mode="perspective" delay={0.3} className="mt-12">
            <div className="glass-premium p-8 sm:p-10 max-w-2xl mx-auto text-center relative overflow-hidden">
              {/* Red glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(600px circle at 50% 50%, var(--color-crimson-glow), transparent 60%)',
                  opacity: 0.12,
                }}
              />
              <Quote size={20} className="text-crimson-dim/20 mx-auto mb-4" />
              <blockquote className="text-sm sm:text-base text-foreground/80 font-display font-light leading-relaxed italic">
                &ldquo;O Sarau Secreto nasceu da necessidade que a gente tinha de tocar nossa música,
                num espaço que a gente não se via contemplado.&rdquo;
              </blockquote>
              <p className="text-xs text-muted-foreground mt-4">— JM, idealizador do Sarau Secreto</p>
            </div>
          </ScrollReveal>

          {/* Mídia */}
          <ScrollReveal delay={0.4} className="mt-12 text-center">
            <p className="text-[0.45rem] tracking-[0.35em] uppercase text-muted-foreground mb-4">NA MÍDIA</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['Metrópoles', 'Correio Braziliense', 'GPS Brasília'].map(m => (
                <span key={m} className="text-[0.5rem] tracking-wider uppercase px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-border-hover transition-all duration-300">
                  {m}
                </span>
              ))}
            </div>
          </ScrollReveal>

          {/* Pilares — scale-in staggered */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pilares.map((p, i) => (
              <ScrollReveal key={p.titulo} mode="scale-in" delay={i * 0.08} margin="-30px">
                <div className="glass-premium p-6 text-center group h-full">
                  <div className="w-11 h-11 rounded-xl bg-crimson-subtle border border-crimson/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-crimson-glow group-hover:border-crimson/15 transition-all duration-500">
                    <span className="text-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500">♫</span>
                  </div>
                  <h3 className="text-sm font-display font-light text-foreground mb-2 group-hover:text-crimson transition-colors duration-300">{p.titulo}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Gêneros — stagger scale */}
          <ScrollReveal delay={0.45} className="mt-16 text-center">
            <p className="text-[0.45rem] tracking-[0.35em] uppercase text-crimson-dim mb-5">A SONORIDADE</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['NeoSoul', 'R&B', 'MPB', 'Samba', 'Jazz', 'Gospel', 'Samba-Rock', 'Pop'].map((g, i) => (
                <motion.span
                  key={g}
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="text-xs px-3 py-1.5 rounded-full border border-crimson/10 text-crimson-dim bg-crimson-subtle hover:bg-crimson-glow hover:border-crimson/20 transition-all duration-200"
                >
                  {g}
                </motion.span>
              ))}
            </div>
          </ScrollReveal>

          {/* Locais — perspective stagger */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { flag: '🇧🇷', cidade: 'Brasília', desc: 'Berço do Sarau. Onde tudo começou em 2022, nas casas dos idealizadores.' },
              { flag: '🇧🇷', cidade: 'Rio de Janeiro', desc: 'Edição especial no Centro do Rio, reunindo artistas cariocas e convidados internacionais.' },
              { flag: '🇵🇹', cidade: 'Lisboa', desc: 'Primeira edição internacional, levando a experiência para a Europa.' },
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
                  <h3 className="text-sm font-display font-light text-foreground group-hover:text-crimson transition-colors duration-300 mb-1">{l.cidade}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{l.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
