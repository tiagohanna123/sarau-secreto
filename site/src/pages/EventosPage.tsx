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
      </div>
    </section>
  )
}
