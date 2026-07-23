import { FadeUp, SectionTitle } from '@/components/Shared'
import { CountdownTimer } from '@/components/CountdownTimer'

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
  const map: Record<string, { label: string; classes: string }> = {
    disponivel: {
      label: 'Disponível',
      classes: 'bg-success/10 text-success border-success/20 shadow-[0_0_8px_rgba(34,197,94,0.08)]',
    },
    encerrado: {
      label: 'Encerrado',
      classes: 'bg-muted text-muted-foreground border-border/50',
    },
    breve: {
      label: 'Em Breve',
      classes: 'bg-warning/5 text-warning/70 border-warning/10',
    },
  }
  const s = map[status] || map.breve
  return <span className={`badge border ${s.classes}`}>{s.label}</span>
}
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

        {/* Events visual banner */}
        <FadeUp delay={0.05}>
          <div className="max-w-5xl mx-auto mb-8 rounded-xl overflow-hidden h-32 sm:h-40 relative group">
            <img
              src="https://images.metroimg.com/2023/09/07175650/Sarau-Secreto-3.jpeg?w=1200&q=85"
              alt="Sarau Secreto ao vivo"
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-xl pointer-events-none" />
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2.5">
                <img src="/assets/sarau/sarau-logo-white.png" alt="" className="w-6 h-7 object-contain opacity-50" />
                <span className="text-[0.65rem] tracking-[0.2em] uppercase text-white/40">Ao Vivo · Sem Ensaio · Único</span>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Countdown to next event */}
        {(() => {
          const nextEvent = EVENTS.find(e => e.status === 'disponivel')
          if (nextEvent) {
            return (
              <FadeUp delay={0.1}>
                <div className="max-w-md mx-auto mb-10 card p-5">
                  <CountdownTimer targetDate={new Date('2026-10-10T19:00:00-03:00')} label="Próxima Edição" />
                </div>
              </FadeUp>
            )
          }
          return null
        })()}

                  {EVENTS.map((event, i) => {
                    const isHighlighted = event.status === 'disponivel'
                    return (
                      <FadeUp key={event.id} delay={i * 0.1}>
                        <div className={`card p-5 h-full flex flex-col relative transition-all duration-500 ${
                          isHighlighted ? 'border-crimson/20 bg-gradient-to-b from-crimson-subtle to-transparent' : ''
                        }`}>
                          {/* Glow line on highlighted cards */}
                          {isHighlighted && (
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson/30 to-transparent" />
                          )}

                          <div className="flex items-start justify-between mb-3">
                            <span className="text-sm tracking-[0.2em] uppercase text-crimson font-semibold">
                              SS {event.edition}
                            </span>
                            <StatusBadge status={event.status} />
                          </div>
                          <h3 className="text-base font-heading text-foreground mb-2 leading-snug">{event.title}</h3>
                          <div className="space-y-1 mb-3">
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 opacity-50"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                              {event.dates}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 opacity-50"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                              {event.location}
                            </p>
                          </div>

                          {event.lineup.length > 0 && (
                            <div className="space-y-1 mb-3 flex-1">
                              <span className="text-sm tracking-[0.15em] uppercase text-foreground/40 font-semibold">Lineup</span>
                              {event.lineup.map((l, j) => (
                                <p key={j} className="text-sm text-foreground/70 leading-relaxed">{l}</p>
                              ))}
                            </div>
                          )}

                          {event.perks.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {event.perks.map((p, j) => (
                                <span key={j} className="tag">{p}</span>
                              ))}
                            </div>
                          )}

                          {event.sympla && (
                            <a href={event.sympla} target="_blank" rel="noopener noreferrer"
                              className={`btn-sympla text-sm self-start mt-auto ${
                                event.status === 'disponivel' ? 'shadow-[0_0_16px_rgba(220,38,38,0.12)]' : ''
                              }`}>
                              Ver no Sympla
                            </a>
                          )}
                          {!event.sympla && (
                            <span className="text-sm text-muted-foreground mt-auto italic">Em breve</span>
                          )}
                        </div>
                      </FadeUp>
                    )
                  })}
                  </div>

                {event.lineup.length > 0 && (
                    <div className="space-y-1 mb-3 flex-1">
                      <span className="text-sm tracking-[0.15em] uppercase text-foreground/40 font-semibold">Lineup</span>
                      {event.lineup.map((l, j) => (
                        <p key={j} className="text-sm text-foreground/70 leading-relaxed">{l}</p>
                      ))}
                    </div>
                  )}

                  {event.perks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {event.perks.map((p, j) => (
                        <span key={j} className="tag">{p}</span>
                      ))}
                    </div>
                  )}

                  {event.sympla && (
                    <a href={event.sympla} target="_blank" rel="noopener noreferrer"
                      className={`btn-sympla text-sm self-start mt-auto ${
                        event.status === 'disponivel' ? 'shadow-[0_0_16px_rgba(220,38,38,0.12)]' : ''
                      }`}>
                      Ver no Sympla
                    </a>
                  )}
                  {!event.sympla && (
                    <span className="text-sm text-muted-foreground mt-auto italic">Em breve</span>
                  )}
                </div>
              </FadeUp>
            )
          })}
        </div>

        {/* Como funciona */}
        <FadeUp delay={0.3}>
          <div className="max-w-3xl mx-auto mt-12 card p-8">
            <h3 className="text-lg font-display text-foreground mb-6 text-center">Como Funciona</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'A data chega', desc: 'O Sarau anuncia a edição. Você garante seu ingresso no Sympla.' },
                { step: '02', title: 'O segredo', desc: 'Poucos dias antes, o local é revelado. Endereço secreto.' },
                { step: '03', title: 'Acontece', desc: '25+ artistas, banda ao vivo, encontros. Uma noite única.' },
              ].map((s, i) => (
                <div key={i} className="text-center p-4 hover:bg-black/30 rounded-xl transition-colors duration-300">
                  <span className="text-xl font-display text-crimson">{s.step}</span>
                  <h4 className="text-sm font-heading text-foreground mt-2">{s.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* FAQ compact */}
        <FadeUp delay={0.5}>
          <div className="max-w-3xl mx-auto mt-6">
            <details className="card p-5 cursor-pointer group open:border-crimson/10 transition-all duration-300">
              <summary className="text-sm font-heading text-muted-foreground group-open:text-foreground transition-colors list-none flex items-center justify-between">
                <span>Dúvidas Frequentes</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="transition-transform duration-300 group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="mt-4 space-y-4">
                {[
                  { q: 'Como sei a data e local?', a: 'Siga @osarausecreto no Instagram. Data e local são revelados dias antes.' },
                  { q: 'Preciso pagar?', a: 'Sim, ingressos pelo Sympla. Preços acessíveis — o Sarau é democrático.' },
                  { q: 'Sou artista. Como participar?', a: 'Siga @osarausecreto no Instagram. Chamadas abertas são anunciadas por lá.' },
                ].map((faq, i) => (
                  <div key={i} className="p-3 rounded-lg bg-black/30 border border-border/30 hover:border-border/50 transition-colors duration-300">
                    <p className="text-sm text-foreground font-medium">{faq.q}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{faq.a}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </FadeUp>

        {/* CTA final */}
        <FadeUp delay={0.65}>
          <div className="text-center mt-10">
            <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
              className="btn-sympla text-sm px-8 py-3">
              Ver todos os ingressos no Sympla
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
