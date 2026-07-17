<<<<<<< Updated upstream
import { FadeUp, SectionTitle } from '@/components/Shared'

const EVENTS = [
  {
    id: 1,
    edition: '2025',
    title: 'Sarau Secreto — Edição 2025',
    dates: '11, 12 e 13 de Julho',
    location: 'Yuzer Bar, Brasília',
    status: 'encerrado' as const,
    lineup: [
      'Sex (11/07): Cida Oliveira, Banda Vira Lata, Sorriso Dela',
      'Sáb (12/07): Tchello, Sandu Áudio e Jadsa, Samuca EletroAcústico',
      'Dom (13/07): Fim de tarde, som autoral, jam session',
    ],
    perks: ['Open bar cerveja/refri', 'Estacionamento grátis', 'Local fechado'],
    sympla: 'https://www.sympla.com.br/produtor/sarausecreto',
  },
  {
    id: 2,
    edition: '2026',
    title: 'Sarau Secreto 2026',
    dates: 'Em breve',
    location: 'A revelar',
    status: 'disponivel' as const,
    lineup: [],
    perks: [],
    sympla: 'https://www.sympla.com.br/produtor/sarausecreto',
  },
  {
    id: 3,
    edition: 'Rio',
    title: 'Sarau Secreto — Rio de Janeiro',
    dates: 'Em breve',
    location: 'A revelar',
    status: 'breve' as const,
    lineup: [],
    perks: [],
    sympla: '',
  },
  {
    id: 4,
    edition: 'Lisboa',
    title: 'Sarau Secreto — Lisboa',
    dates: 'Em breve',
    location: 'A revelar',
    status: 'breve' as const,
    lineup: [],
    perks: [],
    sympla: '',
  },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    disponivel: { label: 'Disponível', color: 'bg-success/10 text-success border-success/20' },
    encerrado: { label: 'Encerrado', color: 'bg-muted text-muted-foreground border-border' },
    breve: { label: 'Em Breve', color: 'bg-warning/10 text-warning border-warning/20' },
  }
  const s = map[status] || map.breve
  return <span className={`badge border ${s.color}`}>{s.label}</span>
}

export function EventosPage() {
  return (
    <section id="eventos" className="section relative">
      <div className="max-w-7xl mx-auto px-5">
        <SectionTitle
          label="Eventos"
          title="Edições"
          description="O Sarau Secreto já passou por Brasília, Rio de Janeiro e Lisboa. Cada edição é única."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {EVENTS.map((event, i) => (
            <FadeUp key={event.id} delay={i * 0.1}>
              <div className="card p-5 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[0.45rem] tracking-[0.2em] uppercase text-crimson font-semibold">SS {event.edition}</span>
                  <StatusBadge status={event.status} />
                </div>
                <h3 className="text-sm font-heading text-foreground mb-2 leading-snug">{event.title}</h3>
                <div className="space-y-1 mb-3">
                  <p className="text-[0.6rem] text-muted-foreground">{event.dates}</p>
                  <p className="text-[0.6rem] text-muted-foreground">{event.location}</p>
                </div>

                {event.lineup.length > 0 && (
                  <div className="space-y-1 mb-3 flex-1">
                    {event.lineup.map((l, j) => (
                      <p key={j} className="text-[0.55rem] text-foreground/70 leading-relaxed">{l}</p>
                    ))}
                  </div>
                )}

                {event.perks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {event.perks.map((p, j) => (
                      <span key={j} className="tag text-[0.4rem]">{p}</span>
                    ))}
                  </div>
                )}

                {event.sympla && (
                  <a href={event.sympla} target="_blank" rel="noopener noreferrer"
                    className="btn-sympla text-[0.55rem] self-start mt-auto">
                    Ver no Sympla
                  </a>
                )}
                {!event.sympla && (
                  <span className="text-[0.5rem] text-muted-foreground mt-auto italic">Em breve</span>
                )}
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Como funciona */}
        <FadeUp delay={0.3}>
          <div className="max-w-3xl mx-auto mt-12 card p-6">
            <h3 className="text-base font-display text-foreground mb-6 text-center">Como Funciona</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: '01', title: 'A data chega', desc: 'O Sarau anuncia a edição. Você garante seu ingresso no Sympla.' },
                { step: '02', title: 'O segredo', desc: 'Poucos dias antes, o local é revelado. Endereço secreto.' },
                { step: '03', title: 'Acontece', desc: '25+ artistas, banda ao vivo, poesia, encontros. Uma noite única.' },
              ].map((s, i) => (
                <div key={i} className="text-center p-4">
                  <span className="text-lg font-display text-crimson">{s.step}</span>
                  <h4 className="text-[0.65rem] font-heading text-foreground mt-2">{s.title}</h4>
                  <p className="text-[0.55rem] text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* FAQ compact */}
        <FadeUp delay={0.5}>
          <div className="max-w-3xl mx-auto mt-6">
            <details className="card p-5 cursor-pointer group">
              <summary className="text-[0.65rem] font-heading text-muted-foreground group-open:text-foreground transition-colors">
                Dúvidas Frequentes
              </summary>
              <div className="mt-4 space-y-3">
                {[
                  { q: 'Como sei a data e local?', a: 'Siga @osarausecreto no Instagram. Data e local são revelados dias antes.' },
                  { q: 'Preciso pagar?', a: 'Sim, ingressos pelo Sympla. Preços acessíveis — o Sarau é democrático.' },
                  { q: 'Sou artista. Como participar?', a: 'Siga @osarausecreto no Instagram. Chamadas abertas são anunciadas por lá.' },
                  { q: 'E se chover?', a: 'Local fechado. Chuva não é problema.' },
                ].map((faq, i) => (
                  <div key={i}>
                    <p className="text-[0.6rem] text-foreground font-medium">{faq.q}</p>
                    <p className="text-[0.55rem] text-muted-foreground mt-0.5">{faq.a}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </FadeUp>

        {/* CTA final */}
        <FadeUp delay={0.65}>
          <div className="text-center mt-8">
            <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
              className="btn-sympla text-xs px-8 py-3">
              Ver todos os ingressos no Sympla
            </a>
          </div>
        </FadeUp>
=======
import { motion } from 'framer-motion'
import { SectionTitle } from '@/components/SectionTitle'
import { ScrollReveal } from '@/components/ScrollReveal'
import { EventCard } from '@/components/EventCard'
import { eventos } from '@/data/events'
import { ExternalLink, Music } from 'lucide-react'

const steps = [
  {
    num: '01',
    titulo: 'A data chega',
    desc: 'O Sarau anuncia a edicao. Voce corre e garante seu ingresso no Sympla antes de esgotar.',
    icon: '♫',
  },
  {
    num: '02',
    titulo: 'O segredo e revelado',
    desc: 'Poucos dias antes, o local exato e divulgado. Endereco secreto, surpresa garantida.',
    icon: '♪',
  },
  {
    num: '03',
    titulo: 'Acontece',
    desc: '25+ artistas, banda sem ensaio, musica ao vivo, poesia, encontros. Uma noite que nao se repete.',
    icon: '♩',
  },
]

export function EventosPage() {
  return (
    <section id="eventos" className="section-chapter">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionTitle
          label="Eventos"
          title="Edicoes"
          subtitle="O Sarau Secreto ja passou por Brasilia, Rio de Janeiro e Lisboa. Cada edicao e unica — data, local e lineup sao surpresa ate o dia."
        />

        <div className="space-y-6">
          {eventos.map((evento, i) => (
            <EventCard key={evento.id} evento={evento} index={i} />
          ))}
        </div>

        {/* Sympla CTA */}
        <ScrollReveal mode="scale-in" delay={0.2} className="mt-12">
          <div className="glass-premium p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.02] to-transparent pointer-events-none" />
            <div className="relative">
              <Music size={22} className="text-gold-dim/20 mx-auto mb-4" />
              <h3 className="text-lg font-display font-light text-foreground mb-2">
                Ingressos via Sympla
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                Todas as vendas oficiais sao pelo Sympla. Compra segura, ingresso nominal e suporte direto.
              </p>
              <a href="https://www.sympla.com.br/produtor/sarausecreto"
                target="_blank" rel="noopener noreferrer"
                className="sympla-btn inline-flex items-center gap-2">
                <ExternalLink size={14} />
                Ver todos no Sympla
              </a>
            </div>
          </div>
        </ScrollReveal>

        {/* Como funciona */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((item, i) => (
            <ScrollReveal key={item.num} mode="perspective" delay={i * 0.1} margin="-30px">
              <div className="glass-premium p-6 text-center group h-full">
                <motion.span
                  className="text-2xl block mb-3"
                  whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {item.icon}
                </motion.span>
                <h3 className="text-sm font-display font-light text-foreground mb-2 group-hover:text-gold transition-colors duration-300">
                  {item.num} — {item.titulo}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* FAQ */}
        <ScrollReveal mode="clip-left" delay={0.2} className="mt-12">
          <div className="glass-premium p-6 sm:p-8">
            <h3 className="text-sm font-display font-light text-foreground mb-6 text-center">Duvidas Frequentes</h3>
            <div className="max-w-lg mx-auto space-y-4 text-sm text-muted-foreground">
              {[
                { q: 'Como sei a data e local?', a: 'Acompanhe o @osarausecreto no Instagram. A data e anunciada dias antes, e o local e revelado pouco antes do evento.' },
                { q: 'Preciso pagar para participar?', a: 'Sim, os ingressos sao vendidos pelo Sympla. Precos acessiveis — o Sarau e democratico.' },
                { q: 'Sou artista. Como me candidato?', a: 'Siga o @osarausecreto no Instagram. Chamadas abertas sao anunciadas por la.' },
                { q: 'O evento acontece com chuva?', a: 'Sim! Local fechado. Chuva, nao e problema.' },
              ].map((faq, i) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="border-b border-border/15 pb-3 last:border-0 last:pb-0"
                >
                  <p className="text-foreground font-medium mb-1 text-xs tracking-wide">{faq.q}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
>>>>>>> Stashed changes
      </div>
    </section>
  )
}
