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
      </div>
    </section>
  )
}
