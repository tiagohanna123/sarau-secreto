import { SectionTitle } from '@/components/SectionTitle'
import { EventCard } from '@/components/EventCard'
import { eventos } from '@/data/events'

export function EventosPage() {
  return (
    <section id="eventos" className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionTitle
          label="Eventos"
          title="Próximas Edições"
          subtitle="Cada edição do Sarau Secreto é uma experiência única. Locais secretos, curadoria dedicada, ingressos limitados."
        />

        <div className="space-y-5">
          {eventos.map((evento, i) => (
            <EventCard key={evento.id} evento={evento} index={i} />
          ))}
        </div>

        {/* Sympla integration */}
        <div className="mt-12 glass-card p-6 sm:p-8 text-center" id="sympla">
          <h3 className="text-lg font-display font-light text-foreground mb-2">
            Todas as vendas via Sympla
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Ingressos seguros, compra facilitada e suporte direto.
          </p>
          <a
            href="https://www.sympla.com.br/produtor/sarausecreto"
            target="_blank"
            rel="noopener noreferrer"
            className="sympla-btn text-sm inline-flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            Ver todos no Sympla
          </a>
        </div>

        {/* Como funciona */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '01', titulo: 'Escolha a Edição', desc: 'Veja a programação e selecione o evento que mais combina com você.' },
            { step: '02', titulo: 'Compre pelo Sympla', desc: 'Pagamento seguro e confirmado. Ingresso nominal e intransferível.' },
            { step: '03', titulo: 'Receba o Local', desc: '48 horas antes, o endereço secreto é revelado no seu email.' },
          ].map((item, i) => (
            <div key={item.step} className={`glass-card p-6 text-center animate-fade-up animate-fade-up-${Math.min(i + 1, 6)}`}>
              <span className="text-2xl font-display font-light text-gold block mb-2">{item.step}</span>
              <h3 className="text-sm font-display font-light text-foreground mb-1">{item.titulo}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
